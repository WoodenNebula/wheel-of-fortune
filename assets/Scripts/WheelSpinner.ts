import { SPIN_STATES } from "./GameConfig";
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

    spinState: SPIN_STATES = SPIN_STATES.NO_SPIN;

    currentSpeed: number = 0;

    private _stopTargetAngle: number = 0;

    offsetAngle: number = 0;

    @property(cc.Integer)
    stallRotationNumber: number = 5;

    @property(cc.Integer)
    topSpeed: number = 10;
    lerpRatio: number = 0;

    accelerationFactor: number = 1;
    initialDecelerationFactor: number = 0.5;
    decelerationFactor: number = this.initialDecelerationFactor;
    spinDuration: number = 5;

    timedSpinning: boolean = false;


    switchState(to: SPIN_STATES): void {
        this.spinState = to;
        cc.log("Curr spin state = " + SPIN_STATES[to]);

        switch (to) {
            case SPIN_STATES.NO_SPIN:
                this.lerpRatio = 1;
                this.spinButtonNode.getComponent(cc.Button).interactable = true;
                this.buttonUnpressedNode.active = true;
                break;
            case SPIN_STATES.CONSTANT_SPEED:
                this.spinButtonNode.getComponent(cc.Button).interactable = true;
                this.buttonUnpressedNode.active = true;
                this.lerpRatio = 1;
                break;
            case SPIN_STATES.ACCELERATING:
            case SPIN_STATES.DECELERATING:
                this.buttonUnpressedNode.active = false;
                this.spinButtonNode.getComponent(cc.Button).interactable = false;
                this.lerpRatio = 0;
                break;
            default:
                break;
        }
    }


    startSpin(spinDuration: number = 5): void {
        this.switchState(SPIN_STATES.ACCELERATING);
        this.spinDuration = spinDuration;
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
        this.switchState(SPIN_STATES.DECELERATING_UNHANDLED);
    }


    accelerateLerped(startingSpeed: number, targetSpeed: number, ratioFactor: number, dt: number): void {
        let speed = cc.misc.lerp(startingSpeed, targetSpeed, this.lerpRatio);
        this.lerpRatio += ratioFactor * dt;
        // cc.log("lerp ratio = " + this.lerpRatio);
        this.lerpRatio = Math.min(this.lerpRatio, 1);
        this.currentSpeed = speed;

        this.wheelNode.angle = (this.wheelNode.angle + speed) % 360;
    }


    handleDeceleration(dt: number): void {
        const cb = () => {
            this.currentSpeed = 0;
            cc.log("stopping at angle: " + this.stopTargetAngle);
            this.wheelNode.angle %= 360;
        }


        let stallRotations = this.stallRotationNumber * 360;
        let offset = 360 + this.stopTargetAngle - this.wheelNode.angle;

        const fps = 1 / dt;
        cc.log(fps);

        const time = stallRotations / (this.topSpeed * fps);
        const timeB = offset / (this.topSpeed / 2 * fps);

        cc.log("A = " + this.stopTargetAngle + " T = " + time + " " + timeB);

        cc.tween(this.wheelNode)
            .by(time, { angle: stallRotations }, { easing: "linear" })
            .by(timeB, { angle: offset }, { easing: 'expoOut' })
            .call(cb.bind(this))
            .start();
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
                this.wheelNode.angle = (this.wheelNode.angle + this.currentSpeed) % 360;
                if (this.timedSpinning) {
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
            case SPIN_STATES.DECELERATING_UNHANDLED:
                this.handleDeceleration(dt);
                this.switchState(SPIN_STATES.DECELERATING);

                break;

            case SPIN_STATES.DECELERATING:
                if (this.currentSpeed <= 0 || this.lerpRatio >= 1) {
                    this.switchState(SPIN_STATES.NO_SPIN);

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