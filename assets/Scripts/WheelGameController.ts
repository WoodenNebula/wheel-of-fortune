import SceneManager from "./SceneManager";
import AudioManager from "./AudioManager";

import { GAMES, SPIN_STATES, WHEEL_BET_MULTIPLIERS, WHEEL_SPECIAL_WINS } from "./GameConfig";
import WheelSpiner from "./WheelSpinner";
import ControllerBase from "./ControllerBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WheelGameController extends ControllerBase {
    @property(cc.Node)
    exitButtonNode: cc.Node = null;

    @property(cc.Label)
    displayLabel: cc.Label = null;

    @property(cc.Node)
    segmentParentNode: cc.Node = null;

    @property(cc.Node)
    jackpotBannerNode: cc.Node = null;

    @property(cc.Node)
    wheelSpinnerNode: cc.Node = null;

    @property(cc.Node)
    betMultiplierParentNode: cc.Node = null;

    @property(cc.Node)
    betMultiplierIncreaseButtonNode: cc.Node = null;

    @property(cc.Node)
    betMultiplierDecreaseButtonNode: cc.Node = null;

    @property(cc.Label)
    betMultiplierLabel: cc.Label = null;

    wheelSpinner: WheelSpiner = null;


    segments: Map<number, cc.Label> = null;
    baseSegmentValues: Array<number> = null;

    segmentCount: number = 0;
    segmentLength: number = 0;

    betMultiplier: number = null;
    betAmount: number = null;


    onSpinComplete(finalRotation: number): void {
        this.betMultiplierParentNode.active = true;

        const result = this._retrieveDataUnderPin(finalRotation);
        // const result = WHEEL_SPECIAL_WINS.REFUND;
        const betAmount = GAMES.SINGLE_WHEEL_SPIN.entryCost * this.betMultiplier
        const coinWinAmount = this._getWinAmount(result, betAmount);
        cc.log("Won " + coinWinAmount);

        this.updateCoins(coinWinAmount);

        this._displayResult(result);
    }


    onSpinButtonClicked(): void {
        cc.log("Button Clicked!");
        switch (this.wheelSpinner.currentSpinState) {
            case SPIN_STATES.NO_SPIN:
                if (this.hasBetAmount(GAMES.SINGLE_WHEEL_SPIN, this.betMultiplier)) {
                    const entryFee = GAMES.SINGLE_WHEEL_SPIN.entryCost * this.betMultiplier;

                    this.updateCoins(-entryFee);

                    AudioManager.playButtonClickAudio(true);

                    this.betMultiplierParentNode.active = false;

                    this.wheelSpinner.startSpin();

                    this.jackpotBannerNode.active = false;

                    this.displayLabel.node.active = true;
                    this.displayLabel.string = "SPINNING...";
                    this.displayLabel.node.color = cc.Color.YELLOW;
                }
                else {
                    AudioManager.playClip(this.errorAudioClip);
                    // display not enough coins feedback
                }
                break;

            case SPIN_STATES.CONSTANT_SPEED:
                AudioManager.playButtonClickAudio(true);
                this.wheelSpinner.stopSpin();



            default:
                break;
        }
    }


    onMultiplierChanged(event: cc.Event, deltaValue: string): void {
        let del: number = parseInt(deltaValue);
        // change multiplier value 
        if (del < 0)
            this.betMultiplier = Math.max(WHEEL_BET_MULTIPLIERS.MIN, this.betMultiplier + del);
        else if (del > 0)
            this.betMultiplier = Math.min(WHEEL_BET_MULTIPLIERS.MAX, this.betMultiplier + del);

        // update multiplier display
        this.betMultiplierLabel.string = "x" + this.betMultiplier + ".0";

        // disable decrease or increase button on limit bet
        if (this.betMultiplier == 1) {
            this.betMultiplierDecreaseButtonNode.active = false;
        }
        else if (this.betMultiplier == 5) {
            this.betMultiplierIncreaseButtonNode.active = false;
        }
        else {
            this.betMultiplierIncreaseButtonNode.active = true;
            this.betMultiplierDecreaseButtonNode.active = true;
        }

        // update value
        for (let i = 0; i < this.segments.size; i++) {
            if (Number.isNaN(this.baseSegmentValues[i]))
                continue;
            const newSegmentValue = this.baseSegmentValues[i] * this.betMultiplier;
            cc.log(`(old, new) = (${this.baseSegmentValues[i]}, ${newSegmentValue})`);

            this.segments.get(i).string = newSegmentValue.toString();
        }
    }


    onExitButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        SceneManager.Instance.onGameExit();
    }


    private _getWinAmount(segmentString: string, betAmount: number): number {
        // debugger
        let winAmount: number = null;

        if (segmentString == WHEEL_SPECIAL_WINS.REFUND) {
            winAmount = betAmount;
        }
        else if (segmentString == WHEEL_SPECIAL_WINS.JACKPOT) {
            winAmount = WHEEL_BET_MULTIPLIERS.JACKPOT;
        }
        else {
            winAmount = parseInt(segmentString);
        }
        return winAmount;
    }


    private _displayResult(resultantData: string) {
        const resultStringHeader = "YOU WON ";
        const resultStringFooter = " COINS";
        let displayString = resultStringHeader + resultantData;

        // handle jackpot case
        if (resultantData == WHEEL_SPECIAL_WINS.JACKPOT) {
            this.jackpotBannerNode.scaleX = 0;
            this.jackpotBannerNode.scaleY = 0;

            this.jackpotBannerNode.active = true;
            this.displayLabel.node.active = false;
            cc.tween(this.jackpotBannerNode)
                .to(0.5, { scaleX: 1, scaleY: 1 }, { easing: "expoIn" })
                .start();

            return;
        }

        // add "coins" for any normal win
        if (resultantData != WHEEL_SPECIAL_WINS.REFUND) {
            displayString += resultStringFooter;
        }


        this.displayLabel.enabled = true;
        this.displayLabel.node.active = true;
        this.displayLabel.node.color = cc.Color.GREEN;

        this.displayLabel.string = displayString;
    }


    private _populateSegmentMap() {
        this.segments = new Map();
        this.segmentCount = this.segmentParentNode.children.length;
        this.segmentLength = Math.floor(360 / this.segmentCount);

        for (let i = 0; i < this.segmentCount; i++) {
            this.segments.set(i, this.segmentParentNode.children[i].getComponent(cc.Label));
        }
    }


    private _fillSegmentWithRandomValues() {
        this.segments.forEach((segment) => {
            let r = Math.random();
            while (r < 1) {
                r *= 10;
            }
            r = Math.floor(r)

            segment.string = r.toString();
            segment.fontSize = 40;
            // segment.node.angle;
        })
    }


    private _getRandomIndex(): number {
        let index = 0;
        do {
            index = Math.random() * 10;
            while (Math.trunc(index) == 0) {
                index = index * 10;
            }

            index = Math.trunc(index);
        }
        while (index >= this.segments.size);

        cc.log("Random index  = " + index);
        return index;
    }

    private _assignSpecialWinSegment(specialWinValue: string) {
        let i: number;
        do {
            i = this._getRandomIndex();
        } while (Number.isNaN(parseInt(this.segments.get(i).string)));

        let targetLabel = this.segments.get(i);
        targetLabel.string = specialWinValue;
        targetLabel.fontSize = 20;
        // offset is taken from 3 since third segment is horizontal, subtract one as indexing starts from 0
        targetLabel.node.angle = this.segmentLength * (3 - i - 1);
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
            return this.segments.get(0).string;
        }

        //  for segment >= 0
        for (let i = 1; i <= this.segmentCount; i++) {
            rangeStart = rangeEnd;
            rangeEnd += this.segmentLength;

            if (angle >= rangeStart && angle < rangeEnd) {
                return this.segments.get(i).string;
            }
        }

        return null;
    }


    // Display Result script
    protected start(): void {
        cc.log("Single Wheel Game (controller) started");
        this.wheelSpinner = this.wheelSpinnerNode.getComponent(WheelSpiner);

        this._populateSegmentMap();
        this._fillSegmentWithRandomValues();
        this._assignSpecialWinSegment(WHEEL_SPECIAL_WINS.JACKPOT);
        this._assignSpecialWinSegment(WHEEL_SPECIAL_WINS.REFUND);

        this.baseSegmentValues = new Array<number>();

        for (let i = 0; i < this.segments.size; i++) {
            this.baseSegmentValues[i] = parseInt(this.segments.get(i).string);
        }

        this.betAmount = GAMES.SINGLE_WHEEL_SPIN.entryCost;
        this.betMultiplier = 1;
        this.betMultiplierDecreaseButtonNode.active = false;

        this.syncCoinCountDisplay();
        cc.log(this.segments);
    }
}