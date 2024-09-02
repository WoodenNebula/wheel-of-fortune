import { DEFAULT_GAME_PROPERTIES, SPIN_STATES, WHEEL_SPECIAL_WINS } from "./GameConfig";
import GameManager from "./GameManager";
import WheelGameController from "./WheelGameController";

const { ccclass, property } = cc._decorator;


@ccclass
export default class WheelSpiner extends cc.Component {
    @property(cc.Node)
    spinButtonNode: cc.Node = null

    @property(cc.Node)
    buttonUnpressedNode: cc.Node = null;

    @property(cc.Node)
    wheelNode: cc.Node = null;

    @property(cc.Node)
    wheelGameControllerNode: cc.Node = null;

    wheelGameController: WheelGameController = null;

    spinState: SPIN_STATES = SPIN_STATES.IDLE;

    currentSpeed: number = 0;

    private _stopTargetAngle: number = 0;

    _originalAngleOffset: number = 0;

    segmentLength: number = 0;
    segmentRandomOffset: number = 0;

    offsetThreshold: number = 0;


    _stallRotations: number = 0;

    @property(cc.Integer)
    topSpeed: number = 10;
    @property(cc.Integer)
    bottomSpeed: number = 2;

    lerpRatio: number = 0;

    accelerationFactor: number = 1;
    initialDecelerationFactor: number = 0.5;
    decelerationFactor: number = this.initialDecelerationFactor;
    spinDuration: number = 5;

    curatedDecelerationDuration: number = 0;

    _timedSpinning: boolean = false;
    _isOffsetSet: boolean = false;

    currDecelarationTime: number = 0;

    switchState(to: SPIN_STATES): void {
        this.spinState = to;
        cc.log("Curr spin state = " + SPIN_STATES[to]);

        switch (to) {
            case SPIN_STATES.IDLE:
                this.lerpRatio = 1;
                this.currDecelarationTime = 0;
                this.spinButtonNode.getComponent(cc.Button).interactable = true;
                this.buttonUnpressedNode.active = true;
                break;
            case SPIN_STATES.CONSTANT_SPEED:
                this.spinButtonNode.getComponent(cc.Button).interactable = true;
                this.buttonUnpressedNode.active = true;
                this.lerpRatio = 1;
                break;
            case SPIN_STATES.DECELERATING:
                cc.sys.localStorage.setItem("angle", this.wheelAngle);
                this.lerpRatio = 0;
                let distanceTravelled = 360 * DEFAULT_GAME_PROPERTIES.DECELERATION_DURATION + 5;
                cc.log("CURRENT = " + this.wheelAngle + " Target = " + this.stopTargetAngle);
                let offset = distanceTravelled + this.angleOffset;
                cc.log("offset to cover: " + offset);
                this.curatedDecelerationDuration = (offset - 5) / 360;
                cc.log("Current duration = " + this.curatedDecelerationDuration);

            case SPIN_STATES.ACCELERATING:
                this.buttonUnpressedNode.active = false;
                this.spinButtonNode.getComponent(cc.Button).interactable = false;
                this.lerpRatio = 0;
                break;
            case SPIN_STATES.SPIN_COMPLETE:
                this.currentSpeed = 0;
                this.currDecelarationTime = 0;
                break;
            default:
                break;
        }
    }


    startSpin(spinDuration: number = 5): void {
        this.switchState(SPIN_STATES.ACCELERATING);
        this.spinDuration = spinDuration;
    }


    get wheelAngle(): number {
        this.wheelNode.angle = this.wheelNode.angle;
        return this.wheelNode.angle;
    }

    set wheelAngle(val: number) {
        this.wheelNode.angle = val;
    }

    get angleOffset(): number {
        return (360 + this.stopTargetAngle - + this.wheelAngle) % 360;
    }

    set stopTargetAngle(targetRotation: number) {
        this._stopTargetAngle = targetRotation;
        cc.log("Target set to " + this._stopTargetAngle);
    }

    get stopTargetAngle() {
        return this._stopTargetAngle;
    }


    stopSpin(): void {
        cc.log("Stopping at index " + this.stopTargetAngle);
        this.buttonUnpressedNode.active = false;
        this.switchState(SPIN_STATES.DECELERATING);
    }


    rotateConstantly(): void {
        this.wheelNode.angle = (this.wheelNode.angle + this.currentSpeed) % 360;
    }


    accelerateLerped(startingSpeed: number, targetSpeed: number, ratioFactor: number, dt: number): void {
        let speed = cc.misc.lerp(startingSpeed, targetSpeed, this.lerpRatio);
        this.lerpRatio += ratioFactor * dt;
        // cc.log("lerp ratio = " + this.lerpRatio);
        this.lerpRatio = Math.min(this.lerpRatio, 1);
        this.currentSpeed = speed;

        this.wheelAngle += speed;;
    }

    // deceleration by tween
    // handleDeceleration(dt: number): void {
    //     const cb = () => {
    //         this.currentSpeed = 0;
    //         cc.log("stopping at angle: " + this.stopTargetAngle);
    //         this.wheelNode.angle %= 360;
    //     }


    //     let stallRotations = 5 * 360;
    //     let offset = 2 * 360 + this.stopTargetAngle - this.wheelNode.angle;

    //     const fps = 1 / dt;

    //     let time = stallRotations / (this.topSpeed * fps);
    //     const timeB = offset / (this.topSpeed * fps);

    //     cc.tween(this.wheelNode)
    //         .by(time, { angle: stallRotations }, { easing: "linear" })
    //         .by(timeB, { angle: offset }, { easing: 'expoOut' })
    //         .call(cb.bind(this))
    //         .start();
    // }


    getEasedY(timeRatio: number, startingSpeed: number, finalSpeed: number): number {
        let delta = finalSpeed - startingSpeed;
        let y = delta * (Math.pow(timeRatio, 3) + 1) + startingSpeed;
        return y;
    }



    handleDeceleration(dt: number): void {
        let timeRatio = this.currDecelarationTime / this.curatedDecelerationDuration - 1;
        cc.log(timeRatio);

        if (this.currDecelarationTime <= this.curatedDecelerationDuration) {
            let speed = this.getEasedY(timeRatio, this.topSpeed, 0);

            this.wheelAngle = this.wheelAngle + speed;

            this.currDecelarationTime += dt;
            return;
        }
        else {
            this.switchState(SPIN_STATES.SPIN_COMPLETE);
        }
    }


    isAngleWithinTargetRange(): boolean {
        const lowerBound = this.stopTargetAngle - this.offsetThreshold;
        const upperBound = this.stopTargetAngle + this.offsetThreshold;
        return (lowerBound <= this.wheelAngle) && (this.wheelAngle < upperBound);
    }

    protected onLoad(): void {
        cc.log("Loaded Spinner Script");
        this.wheelGameController = this.wheelGameControllerNode.getComponent(WheelGameController);
    }


    protected start(): void {
        this.stopTargetAngle = GameManager.getRandomIndex(0, 8);
    }


    protected update(dt: number): void {
        switch (this.spinState) {
            case SPIN_STATES.CONSTANT_SPEED:
                // const speed 
                this.rotateConstantly();
                if (this._timedSpinning) {
                    this.spinDuration -= dt;
                    if (this.spinDuration <= 0) {
                        cc.log("Spun for " + this.spinDuration + "s");
                        this.stopSpin();
                    }
                }
                break;
            case SPIN_STATES.ACCELERATING:
                this.accelerateLerped(0, this.topSpeed, this.accelerationFactor, dt);

                if (this.currentSpeed >= this.topSpeed || this.lerpRatio >= 1) {
                    this.switchState(SPIN_STATES.CONSTANT_SPEED);
                }
                break;
            case SPIN_STATES.DECELERATING:
                this.handleDeceleration(dt);
                break;

            case SPIN_STATES.SPIN_COMPLETE:
                if (this.currentSpeed <= 0) {

                    cc.log("SPIN COMPLETED");
                    this.switchState(SPIN_STATES.IDLE);
                    this.spinButtonNode.active = true;
                    this.buttonUnpressedNode.active = true;

                    const finalAngle = Math.floor(this.wheelNode.angle % 360);
                    cc.log("Final angle = " + finalAngle);
                    this.wheelGameController.handlePostSpin(finalAngle);
                }
                break;
        }
    }

}