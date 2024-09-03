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

    fps: number = 0;


    _stallRotations: number = 5;

    @property(cc.Integer)
    topSpeed: number = 10;
    @property(cc.Integer)
    bottomSpeed: number = 2;

    MAX_ANGLE: number = 0;
    FINAL_ANGLE: number = 0;

    lerpRatio: number = 0;

    accelerationFactor: number = 1;
    spinDuration: number = 5;

    decelerateDuration: number = 0;

    _timedSpinning: boolean = false;
    _isOffsetSet: boolean = false;

    currDecelarationTime: number = 0;


    get offsetFromFinalAngle(): number {
        return (this.FINAL_ANGLE - this.wheelAngle);
    }

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
                this.spinButtonNode.getComponent(cc.Button).interactable = false;

                this.lerpRatio = 0;

                this.currentSpeed = this.topSpeed;
                this.currDecelarationTime = 0;

                this.decelerateDuration = DEFAULT_GAME_PROPERTIES.DECELERATION_DURATION;


                this.MAX_ANGLE = this.wheelAngle + (this.topSpeed * this.decelerateDuration * this.fps + this.stopTargetAngle);

                let stallRotation: number = this.getAppropriateStallRotation();
                this.FINAL_ANGLE = stallRotation * 360 + this.stopTargetAngle;

                cc.log("final angle should be = " + this.FINAL_ANGLE);
                cc.log("Decelerating from " + this.wheelAngle);

                break;
            case SPIN_STATES.ACCELERATING:
                this.buttonUnpressedNode.active = false;
                this.spinButtonNode.getComponent(cc.Button).interactable = false;
                this.lerpRatio = 0;
                break;
            case SPIN_STATES.SPIN_COMPLETE:
                cc.sys.localStorage.setItem("angleDelta", this.wheelAngle - cc.sys.localStorage.getItem("angle"));
                this.currentSpeed = 0;
                this.currDecelarationTime = 0;
                break;
            default:
                break;
        }
    }


    getAppropriateStallRotation(): number {
        let finalRotationNumber = 5;
        let estimatedDistance = this.getDistanceEstimate(this.topSpeed, 0);
        finalRotationNumber = Math.round(estimatedDistance / (2 * 360));

        cc.log(`[${estimatedDistance}->${finalRotationNumber}`);

        return finalRotationNumber;
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
        let offsetToZero = (360 - Math.round(this.wheelAngle) % 360);
        return (offsetToZero + this.stopTargetAngle);
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

        this.wheelAngle += speed;
    }

    // // deceleration by tween
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
    //         .by(timeB, { angle: offset }, { easing: 'cubicOut' })
    //         .call(cb.bind(this))
    //         .start();
    // }

    getDistanceEstimate(initialSpeed: number, finalSpeed: number): number {
        let totalDistance = 0;

        for (let t = 0; t <= this.decelerateDuration; t += 1 / this.fps) {
            let timeRatio = t / this.decelerateDuration;

            let deltaDistance = this.getEasedY(timeRatio, initialSpeed, finalSpeed);
            totalDistance += deltaDistance;
        }
        return totalDistance;
    }


    getEasedY(timeRatio: number, startingSpeed: number = this.topSpeed, finalSpeed: number = 0): number {
        let delta = finalSpeed - startingSpeed;
        let x = timeRatio;
        // let y = delta * (Math.pow(x, 3)) + startingSpeed;
        let y = (delta * Math.pow(x, 5) + startingSpeed) / (Math.pow(5, Math.pow(x, 3)));
        return y;
    }

    handleDeceleration(dt: number): void {
        let offsetRatio = Math.min(this.wheelAngle / this.FINAL_ANGLE, 1);

        if (!this.isAngleWithinTargetRange()) {
            let speed = this.getEasedY(offsetRatio, this.topSpeed, 0);
            this.currentSpeed = speed;

            this.wheelAngle += speed;

            this.currDecelarationTime += dt;
            return;
        }

        cc.log("Deceleration took " + this.currDecelarationTime + " Max time = " + this.decelerateDuration);
        this.switchState(SPIN_STATES.SPIN_COMPLETE);
    }



    isAngleWithinTargetRange(): boolean {
        return (Math.ceil(this.wheelAngle + 1) >= Math.floor(this.FINAL_ANGLE));
    }

    protected onLoad(): void {
        cc.log("Loaded Spinner Script");
        this.wheelGameController = this.wheelGameControllerNode.getComponent(WheelGameController);
    }


    protected start(): void {
        this.stopTargetAngle = GameManager.getRandomIndex(0, 8);
    }


    protected update(dt: number): void {
        this.fps = 1 / dt;
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
                    this.switchState(SPIN_STATES.IDLE);
                    this.spinButtonNode.active = true;
                    this.buttonUnpressedNode.active = true;
                    cc.log("Final angle = " + this.wheelAngle);
                    const finalAngle = Math.floor(this.wheelNode.angle % 360);
                    this.wheelGameController.handlePostSpin(finalAngle);
                }
                break;
        }
    }

}