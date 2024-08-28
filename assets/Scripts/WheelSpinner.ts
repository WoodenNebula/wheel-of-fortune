import { SPIN_STATES } from "./GameConfig";
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

    spinComplete: boolean = false;

    currentSpeed: number = 0;
    topSpeed: number = 10;
    lerpRatio: number = 0;

    accelerationFactor: number = 1;
    initialDecelerationFactor: number = 0.5;
    decelerationFactor: number = this.initialDecelerationFactor;
    spinDuration: number = 5;


    switchState(to: SPIN_STATES): void {
        this.spinState = to;
        cc.log("Curr spin state = " + SPIN_STATES[to]);

        switch (to) {
            case SPIN_STATES.NO_SPIN:
                this.lerpRatio = 1;
                this.spinButtonNode.active = true;
                this.buttonUnpressedNode.active = true;
                this.spinComplete = true;
                break;
            case SPIN_STATES.CONSTANT_SPEED:
                this.lerpRatio = 1;
                this.spinComplete = false;
                break;
            case SPIN_STATES.ACCELERATING:
            case SPIN_STATES.DECELERATING:
                this.spinButtonNode.active = false;
                this.buttonUnpressedNode.active = false;
                this.spinComplete = false;
                this.lerpRatio = 0;
                break;
            default:
                break;
        }
    }


    startSpin(spinDuration: number): void {
        this.switchState(SPIN_STATES.ACCELERATING);
        this.spinDuration = spinDuration;

        this.spinButtonNode.active = false;
        this.spinButtonNode.active = false;

        this.spinComplete = false;
    }

    stopSpin(): void {
        cc.log("Stopping!");
        this.switchState(SPIN_STATES.DECELERATING);
        this.spinButtonNode.active = false;
        this.buttonUnpressedNode.active = false;
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
                this.spinDuration -= dt;
                if (this.spinDuration <= 0) {
                    cc.log("Spun for " + this.spinDuration + "s");
                    this.stopSpin();
                }
                break;
            case SPIN_STATES.ACCELERATING:
                this.rotateLerped(0, this.topSpeed, this.accelerationFactor, dt);

                if (this.currentSpeed >= this.topSpeed || this.lerpRatio >= 1) {
                    this.switchState(SPIN_STATES.CONSTANT_SPEED);
                }
                break;
            case SPIN_STATES.DECELERATING:
                this.rotateLerped(this.topSpeed, 0, this.accelerationFactor, dt);

                if (this.currentSpeed <= 0 || this.lerpRatio >= 1) {
                    this.switchState(SPIN_STATES.NO_SPIN);

                    this.spinButtonNode.active = true;
                    this.buttonUnpressedNode.active = true;

                    this.wheelGameController.handlePostSpin(Math.floor(this.wheelNode.angle % 360));
                }
                break;
        }
    }

    protected onDestroy(): void {
        cc.log("Wheel Spiner Destroyed");
    }
}
