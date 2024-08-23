import DisplayResult from "./DisplayResult";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WheelBase extends cc.Component {
    @property(cc.Node)
    spinButtonNode: cc.Node = null

    @property(cc.Node)
    buttonPressedNode: cc.Node = null;

    @property(cc.Node)
    wheelNode: cc.Node = null;


    protected onLoad(): void {
        cc.log("Loaded Base Script");
    }


    protected start(): void {
        this.spinButtonNode.active = true;
        this.buttonPressedNode.active = true;
    }

    protected onDestroy(): void {
        cc.log("Wheel Base destroyed");
    }
}