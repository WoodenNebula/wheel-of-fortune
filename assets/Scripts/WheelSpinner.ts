import AudioManager from "./AudioManager";
import DisplayResult from "./DisplayResult";

const { ccclass, property } = cc._decorator;


export enum SpinStates {
    NoSpin = 0,
    Accelerating = 1,
    CostantSpeed = 2,
    Decelerating = 3
}

@ccclass
export default class WheelSpiner extends cc.Component {
    @property(cc.Node)
    buttonNode: cc.Node = null;

    @property(cc.Node)
    buttonPressedNode: cc.Node = null;

    @property(cc.Node)
    wheelNode: cc.Node = null;

    spinState: SpinStates = SpinStates.NoSpin;

    spinComplete: boolean = false;

    currentSpeed: number = 0;
    topSpeed: number = 10;
    lerpRatio: number = 0;

    accelerationFactor: number = 1;
    initialDecelerationFactor: number = 0.5;
    decelerationFactor: number = this.initialDecelerationFactor;




    switchState(to: SpinStates): void {
        switch (to) {
            case SpinStates.NoSpin:
                this.lerpRatio = 1;
            case SpinStates.CostantSpeed:
                this.buttonNode.active = true;
                this.spinComplete = true;
            case SpinStates.Accelerating:
            case SpinStates.Decelerating:
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
        if (this.spinState == SpinStates.NoSpin) {
            AudioManager.Instance.playButtonClickAudio(true);

            this.buttonNode.active = false;
            this.switchState(SpinStates.Accelerating);
            this.spinComplete = false;
        }
        else if (this.spinState == SpinStates.CostantSpeed) {
            AudioManager.Instance.playButtonClickAudio(true);
            this.buttonNode.active = false;
            this.switchState(SpinStates.Decelerating);
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
    }

    protected start(): void {
        this.buttonNode.active = true;
        this.buttonPressedNode.active = true;
    }

    protected update(dt: number): void {
        switch (this.spinState) {
            case SpinStates.CostantSpeed:
                // const speed 
                this.wheelNode.angle = (this.wheelNode.angle + this.currentSpeed) % 360;
                break;
            case SpinStates.Accelerating:
                this.rotateLerped(0, this.topSpeed, this.accelerationFactor, dt);

                if (this.currentSpeed >= this.topSpeed || this.lerpRatio >= 1) {
                    cc.log("r = " + this.lerpRatio);
                    this.switchState(SpinStates.CostantSpeed);
                }
                break;
            case SpinStates.Decelerating:
                this.rotateLerped(this.topSpeed, 0, this.accelerationFactor, dt);

                if (this.currentSpeed <= 0 || this.lerpRatio >= 1) {
                    this.switchState(SpinStates.NoSpin);
                    cc.log("FINAL ROTATION = " + this.wheelNode.angle % 360);

                    DisplayResult.onSpinComplete(Math.floor(this.wheelNode.angle % 360));
                }
                break;
        }
    }

    protected onDestroy(): void {
        cc.log("Wheel Spiner Destroyed");
    }
}
