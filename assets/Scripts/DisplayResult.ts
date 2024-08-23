// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { COINS } from "./Coins";

const { ccclass, property } = cc._decorator;

@ccclass
export default class DisplayResult extends cc.Component {
    @property(cc.Label)
    displayLabel: cc.Label = null;

    @property(cc.Node)
    labelParentNode: cc.Node = null;

    @property(cc.Node)
    wheelSpinner: cc.Node = null;


    static s_shouldDisplay: boolean = false;
    static s_finalRotation: number = null;

    segments: Map<number, string> = null;
    segmentCount: number = 0;
    segmentLength: number = 0;

    public onSpinComplete(finalRotation: number) {
        DisplayResult.s_shouldDisplay = true;
        DisplayResult.s_finalRotation = finalRotation;

        let pinValue: string = this.retrieveSegemntVal(DisplayResult.s_finalRotation);
        COINS.updateBalance(parseInt(pinValue));
        this.displayLabel.string = pinValue;
    }

    protected onLoad(): void {
        cc.log("Display Script loaded!")

    }

    protected onDestroy(): void {
        // this = null;
        cc.log("Destroyed result script");
    }


    protected start(): void {
        cc.log("Display Result start");
        this.segments = new Map();
        this.segmentCount = this.labelParentNode.children.length;
        this.segmentLength = Math.floor(360 / this.segmentCount);


        for (let i = 0; i < this.segmentCount; i++) {
            this.segments.set(i, this.labelParentNode.children[i].getComponent(cc.Label).string);
        }
        cc.log(this.segments);
    }


    testRetrival(): void {
        for (let i = 0; i < 360; i++) {
            cc.log(`(i, r) = (${i}, ${this.retrieveSegemntVal(i)})`);
        }
    }

    retrieveSegemntVal(angle: number): string {
        // for first awkward segment
        let rangeStart: number = 360 - Math.floor(this.segmentLength / 2);
        let rangeEnd: number = this.segmentLength / 2;

        cc.log(`[${rangeStart}, ${rangeEnd})`);

        // for 1st segment
        if (angle >= rangeStart || angle < rangeEnd) {
            return this.segments.get(0);
        }

        //  for segment >= 0
        for (let i = 1; i <= this.segmentCount; i++) {
            rangeStart = rangeEnd;
            rangeEnd += this.segmentLength;

            if (angle >= rangeStart && angle < rangeEnd) {
                return this.segments.get(i);
            }
        }

        return null;
    }
}