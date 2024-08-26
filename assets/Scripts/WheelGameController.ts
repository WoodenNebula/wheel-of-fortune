import SceneManager from "./SceneManager";
import AudioManager from "./AudioManager";

import { GAMES, SPIN_STATES, WHEEL_BET_MULTIPLIERS, WHEEL_SPECIAL_WINS } from "./GameConfig";
import { COINS } from "./Coins";
import WheelSpiner from "./WheelSpinner";
import GameController from "./GameController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WheelGameController extends GameController {
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

    wheelSpinner: WheelSpiner = null;


    segments: Map<number, cc.Label> = null;
    segmentCount: number = 0;
    segmentLength: number = 0;

    betMultiplier: number = null;
    betAmount: number = null;


    onSpinComplete(finalRotation: number): void {
        const result = this._retrieveDataUnderPin(finalRotation);

        // let coinWinAmount = parseInt(result);
        const coinWinAmount = this._getWinAmount(result/* , this.betAmount, this.betMultiplier */);
        cc.log("Won " + coinWinAmount);

        COINS.updateBalance(coinWinAmount);

        this.syncCoinCountDisplay();

        this._displayResult(result);
    }


    onSpinButtonClicked(): void {
        cc.log("Button Clicked!");
        switch (this.wheelSpinner.currentSpinState) {
            case SPIN_STATES.NO_SPIN:
                const feeValidation = this.validateEntryFee(GAMES.SINGLE_WHEEL_SPIN);
                if (feeValidation) {
                    AudioManager.playButtonClickAudio(true);

                    this.wheelSpinner.startSpin();

                    this.jackpotBannerNode.active = false;

                    this.displayLabel.node.active = true;
                    this.displayLabel.string = "SPINNING...";
                    this.displayLabel.node.color = cc.Color.YELLOW;
                }
                else {
                    AudioManager.playClip(this.errorAudioClip);
                }
                break;

            case SPIN_STATES.CONSTANT_SPEED:
                AudioManager.playButtonClickAudio(true);
                this.wheelSpinner.stopSpin();

            default:
                break;
        }
    }


    onExitButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        SceneManager.Instance.onGameExit();
    }


    private _getWinAmount(segmentString: string,
        betAmount: number = GAMES.SINGLE_WHEEL_SPIN.entryCost,
        betMultiplier: number = WHEEL_BET_MULTIPLIERS.BASE): number {
        // debugger
        let winAmount: number = null;

        if (segmentString == WHEEL_SPECIAL_WINS.REFUND) {
            winAmount = betAmount * betMultiplier;
        }
        else if (segmentString == WHEEL_SPECIAL_WINS.JACKPOT) {
            winAmount = betAmount * betMultiplier * WHEEL_BET_MULTIPLIERS.JACKPOT;
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

    private _refundFee(): void {
        COINS.setCount(GAMES.SINGLE_WHEEL_SPIN.entryCost * this.betMultiplier);
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

        this.syncCoinCountDisplay();
        cc.log(this.segments);
    }
}