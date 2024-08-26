import AudioManager from "./AudioManager";
import { SPIN_STATES } from "./GameConfig";
import WheelBase from "./WheelBase";
import WheelGameController from "./WheelGameController";

const { ccclass, property } = cc._decorator;




@ccclass
export default class WheelSpiner extends WheelBase {
    @property(cc.Node)
    wheelGameControllerNode: cc.Node = null;

    wheelGameController: WheelGameController = null;


    spinState: SPIN_STATES = SPIN_STATES.NO_SPIN;

    spinComplete: boolean = false;

    currentSpeed: number = 0;
    topSpeed: number = 10;
    lerpRatio: number = 0;

    accelerationFactor: number = 1;
    initialDecelerationFactor: number = 0.5;
    decelerationFactor: number = this.initialDecelerationFactor;


    switchState(to: SPIN_STATES): void {
        switch (to) {
            case SPIN_STATES.NO_SPIN:
                this.lerpRatio = 1;
            case SPIN_STATES.CONSTANT_SPEED:
                this.spinButtonNode.active = true;
                this.spinComplete = true;
            case SPIN_STATES.ACCELERATING:
            case SPIN_STATES.DECELERATING:
                cc.log("Spin State = " + to);

                this.spinState = to;
                this.lerpRatio = 0;
                break;
            default:
                break;
        }
    }


    onSpinButtonClick() {
        cc.log("Button Clicked!");
        if (this.spinState == SPIN_STATES.NO_SPIN) {
            AudioManager.playButtonClickAudio(true);

            this.spinButtonNode.active = false;
            this.switchState(SPIN_STATES.ACCELERATING);
            this.spinComplete = false;
        }
        else if (this.spinState == SPIN_STATES.CONSTANT_SPEED) {
            AudioManager.playButtonClickAudio(true);
            this.spinButtonNode.active = false;
            this.switchState(SPIN_STATES.DECELERATING);
        }
    }


    rotateLerped(startingSpeed: number, targetSpeed: number, ratioFactor: number, dt: number): void {
        let speed = cc.misc.lerp(startingSpeed, targetSpeed, this.lerpRatio);
        this.lerpRatio += ratioFactor * dt;
        // cc.log("lerp ratio = " + this.lerpRatio);
        this.lerpRatio = Math.min(this.lerpRatio, 1);
        this.currentSpeed = speed;

        this.wheelNode.angle = (this.wheelNode.angle + speed) % 360;
    }


    protected onLoad(): void {
        cc.log("Loaded Spinner Script");
        this.wheelGameController = this.wheelGameControllerNode.getComponent(WheelGameController);
    }



    protected update(dt: number): void {
        switch (this.spinState) {
            case SPIN_STATES.CONSTANT_SPEED:
                // const speed 
                this.wheelNode.angle = (this.wheelNode.angle + this.currentSpeed) % 360;
                break;
            case SPIN_STATES.ACCELERATING:
                this.rotateLerped(0, this.topSpeed, this.accelerationFactor, dt);

                if (this.currentSpeed >= this.topSpeed || this.lerpRatio >= 1) {
                    cc.log("r = " + this.lerpRatio);
                    this.switchState(SPIN_STATES.CONSTANT_SPEED);
                }
                break;
            case SPIN_STATES.DECELERATING:
                this.rotateLerped(this.topSpeed, 0, this.accelerationFactor, dt);

                if (this.currentSpeed <= 0 || this.lerpRatio >= 1) {
                    this.switchState(SPIN_STATES.NO_SPIN);
                    this.wheelGameController.onSpinComplete(Math.floor(this.wheelNode.angle % 360));
                }
                break;
        }
    }

    protected onDestroy(): void {
        cc.log("Wheel Spiner Destroyed");
    }
}
