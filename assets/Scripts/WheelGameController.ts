import AudioManager from "./AudioManager";
import GameManager from "./GameManager";

import { BET_AMOUNTS, GameStates, WHEEL_SPECIAL_WINS, WinTypes } from "./GameConfig";

import WheelSpiner from "./WheelSpinner";
import { Coins } from "./Coins";
import SceneManager from "./SceneManager";

const { ccclass, property } = cc._decorator;



@ccclass
export default class WheelGameController extends cc.Component {
    @property(cc.Node)
    wheelSpinnerNode: cc.Node = null;


    /// TODO: move to UI
    @property(cc.Label)
    coinLabel: cc.Label = null;
    @property(cc.Label)
    coinAnimLabel: cc.Label = null;

    wheelSpinner: WheelSpiner = null;

    gameStates: GameStates = GameStates.IDLE;

    baseRewardList: string[] = [];
    multipliedRewardList: string[] = [];

    onGameStateSwitched: { (state: GameStates): void }[] = []

    segmentCount: number = 0;
    segmentArcLength: number = 0;

    spinResult: string = ""

    private _betMultiplier: number = 1;
    private _betAmount: number = BET_AMOUNTS[0];
    private _betIndex: number = 0;


    get betAmount(): number {
        this._betAmount = BET_AMOUNTS[this._betIndex];
        return this._betAmount;
    }

    get betMultiplier() {
        this._betMultiplier = BET_AMOUNTS[this._betIndex] / BET_AMOUNTS[0];
        return this._betMultiplier;
    }

    get finalRewardList(): string[] {
        this._recalculateRewardList();
        return this.multipliedRewardList;
    }


    increaseBetAmount(): void {
        cc.log("Increasing Bet");
        this._betIndex = Math.min(BET_AMOUNTS.length - 1, this._betIndex + 1);
        this._recalculateRewardList();
    }


    decreaseBetAmount(): void {
        cc.log("Decreasing Bet");
        this._betIndex = Math.max(0, this._betIndex - 1);
        this._recalculateRewardList();
    }


    startGame(): void {
        if (this.gameStates != GameStates.IDLE)
            return;

        const hasEnoughCoins = Coins.hasBetAmount(this.betAmount);

        if (hasEnoughCoins) {
            AudioManager.playButtonClickAudio(true);
            Coins.updateCoins(-this.betAmount, this.coinLabel, this.coinAnimLabel);

            this.startSpin();
        }
        else if (!hasEnoughCoins) {
            AudioManager.playClip(AudioManager.Instance.errorAudioClip);
            SceneManager.loadShop(this.coinLabel, this.coinAnimLabel);
            // display not enough coins feedback
        }
    }



    private _recalculateRewardList(): void {
        cc.log("recalculating rewards!");
        this.multipliedRewardList = [];

        for (let i = 0; i < this.baseRewardList.length; i++) {
            let rewardAmount = parseInt(this.baseRewardList[i]);
            cc.log("Base Reward in int = " + rewardAmount + " in str = " + this.baseRewardList[i]);

            if (Number.isNaN(rewardAmount)) {
                this.multipliedRewardList[i] = this.baseRewardList[i];
                continue;
            }

            this.multipliedRewardList[i] = (rewardAmount * this.betMultiplier).toString();
        }
        cc.log(this.multipliedRewardList);
    }


    handlePostSpin(finalRotation: number): void {
        this.spinResult = this._retrieveDataUnderPin(finalRotation);
        const winType = this._retrieveWinType(this.spinResult);

        switch (winType) {
            case WinTypes.RESPIN:
                this.switchGameState(GameStates.SPIN_COMPLETE);
                this.startSpin();
                this.switchGameState(GameStates.IDLE);

                break;
            case WinTypes.JACKPOT:
            case WinTypes.NORMAL:

                const coinWinAmount = this._getWinAmount(this.spinResult);

                cc.log("Won " + coinWinAmount);

                Coins.updateCoins(coinWinAmount, this.coinLabel, this.coinAnimLabel);

                this.switchGameState(GameStates.SPIN_COMPLETE);

                this.switchGameState(GameStates.IDLE);
                break;

            default:
                break;
        }
    }


    switchGameState(to: GameStates): void {
        this.gameStates = to;
        cc.log(this.spinResult);
        GameManager.onGameStateChanged(to, this.spinResult);
    }


    startSpin(): void {
        this.switchGameState(GameStates.SPINNING);
        this.wheelSpinner.startSpin(3);
        // this._testRetrival();
        cc.log("LOGGING LIST");
        cc.log(this.multipliedRewardList);
    }


    private _getWinAmount(resultData: string): number {
        // debugger
        let winAmount: number = null;

        if (resultData == WHEEL_SPECIAL_WINS.JACKPOT.name) {
            winAmount = this.betAmount + WHEEL_SPECIAL_WINS.JACKPOT.winAmount;
        }
        else {
            winAmount = parseInt(resultData);
        }
        return winAmount;
    }


    private _testRetrival(): void {
        for (let i = 0; i < 360; i++) {
            cc.log(`(i, r) = (${i}, ${this._retrieveDataUnderPin(i)})`);
        }
    }


    private _retrieveWinType(winResult: string): WinTypes {
        if (winResult == WinTypes.JACKPOT)
            return WinTypes.JACKPOT;
        else if (winResult == WinTypes.RESPIN)
            return WinTypes.RESPIN;
        else
            return WinTypes.NORMAL;
    }


    private _retrieveDataUnderPin(angle: number): string {
        // for first awkward segment
        this._recalculateRewardList();
        let rangeStart: number = 360 - Math.floor(this.segmentArcLength / 2);
        let rangeEnd: number = this.segmentArcLength / 2;

        cc.log(`[${rangeStart}, ${rangeEnd})`);

        // for 1st segment
        if (angle >= rangeStart || angle < rangeEnd) {
            return this.multipliedRewardList[0];
        }

        //  for segment >= 0
        for (let i = 1; i <= this.multipliedRewardList.length; i++) {
            rangeStart = rangeEnd;
            rangeEnd += this.segmentArcLength;

            if (angle >= rangeStart && angle < rangeEnd) {
                return this.multipliedRewardList[i];
            }
        }
        return null;
    }


    protected onLoad(): void {
        GameManager.instance.activeGameController = this;
    }

    // Display Result script
    protected start(): void {
        this._betIndex = 0;

        this.baseRewardList = GameManager.fetchSegmentData();
        this._recalculateRewardList();

        this.segmentArcLength = 360 / this.baseRewardList.length;
        this.wheelSpinner = this.wheelSpinnerNode.getComponent(WheelSpiner);
    }
}