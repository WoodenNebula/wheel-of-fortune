import SceneManager from "./SceneManager";
import AudioManager from "./AudioManager";

import { COINS } from "./Coins";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WheelGameController extends cc.Component {
    @property(cc.Node)
    exitButtonNode: cc.Node = null;

    @property(cc.Label)
    coinDisplayLabel: cc.Label = null;
    @property(cc.AudioClip)
    coinWinAudio: cc.AudioClip = null;


    // Display script
    @property(cc.Label)
    displayLabel: cc.Label = null;

    @property(cc.Node)
    segmentParentNode: cc.Node = null;

    @property(cc.Node)
    wheelSpinner: cc.Node = null;

    segments: Map<number, string> = null;
    segmentCount: number = 0;
    segmentLength: number = 0;

    // controller script
    syncCoinCountDisplay(): void {
        this.coinDisplayLabel.string = `x${COINS.getCount()}`;
    }

    onSpinComplete(finalRotation: number): void {
        const result = this._retrieveDataUnderPin(finalRotation);

        const coinWinAmount = parseInt(result);
        COINS.updateBalance(coinWinAmount);
        this.syncCoinCountDisplay();
        this._displayResult(result);

        AudioManager.playClip(this.coinWinAudio);
    }


    onExitButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        SceneManager.Instance.onGameExit();
    }


    private _displayResult(resultantData: string) {
        this.displayLabel.string = resultantData;
    }

    private _populateSegments() {
        this.segments = new Map();
        this.segmentCount = this.segmentParentNode.children.length;
        this.segmentLength = Math.floor(360 / this.segmentCount);

        for (let i = 0; i < this.segmentCount; i++) {
            this.segments.set(i, this.segmentParentNode.children[i].getComponent(cc.Label).string);
        }
    }


    // Display Result script
    protected start(): void {
        cc.log("Single Wheel Game (controller) started");

        this._populateSegments();
        this.syncCoinCountDisplay();
        cc.log(this.segments);
    }


    private _testRetrival(): void {
        for (let i = 0; i < 360; i++) {
            cc.log(`(i, r) = (${i}, ${this._retrieveDataUnderPin(i)})`);
        }
    }


    private _retrieveDataUnderPin(angle: number): string {
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