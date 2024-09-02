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

    @property(cc.Boolean)
    timedSpinning: boolean = false;

    /// TODO: move to UI
    @property(cc.Label)
    coinLabel: cc.Label = null;
    @property(cc.Label)
    coinAnimLabel: cc.Label = null;

    wheelSpinner: WheelSpiner = null;

    gameState: GameStates = GameStates.IDLE;

    baseRewardList: {
        rangeStart: number,
        rangeEnd: number,
        data: string
    }[] = [];
    multipliedRewardList: string[] = [];

    onGameStateSwitched: { (state: GameStates): void }[] = []

    segmentCount: number = 0;
    segmentArcLength: number = 0;

    spinResult: string = ""

    prevTargetIndex: number = 0;

    @property(cc.Boolean)
    rigged: boolean = false;

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
        // handle stopping on button click
        if (!this.timedSpinning && this.gameState == GameStates.SPINNING) {
            AudioManager.playButtonClickAudio(true);
            this.wheelSpinner.stopSpin();

            // if prevWin == RESPIN
            // let index = GameManager.getTargetIndex();
            // 
            // if (index == this.prevTargetIndex) {
            // 
            // let randomIndex = GameManager.getRandomIndex(0, this.baseRewardList.length);
            // while (randomIndex == this.prevTargetIndex) {
            // randomIndex = GameManager.getRandomIndex(0, this.baseRewardList.length);
            // }
            // 
            // index = randomIndex;
            // }

            // this.setTargetIndex(index);

            return;
        }

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


    setTargetIndex(index: number): void {
        cc.log("Index received = " + index);

        this.prevTargetIndex = index;

        if (index == 0) {
            this.wheelSpinner.stopTargetAngle = 0;
            return;
        }

        const targetSegment = this.baseRewardList[Math.min(index, this.baseRewardList.length - 1)];
        const targetSegmentMidAngle = ((targetSegment.rangeStart + targetSegment.rangeEnd) / 2) % 360
        cc.log("Mid angle = " + targetSegmentMidAngle);

        this.wheelSpinner.stopTargetAngle = targetSegmentMidAngle;
    }



    private _recalculateRewardList(): void {
        this.multipliedRewardList = [];

        for (let i = 0; i < this.baseRewardList.length; i++) {
            let rewardAmount = parseInt(this.baseRewardList[i].data);

            if (Number.isNaN(rewardAmount)) {
                this.multipliedRewardList[i] = this.baseRewardList[i].data;
                continue;
            }

            this.multipliedRewardList[i] = (rewardAmount * this.betMultiplier).toString();
        }
        cc.log(this.multipliedRewardList);
    }


    handlePostSpin(finalRotation: number): void {
        const rewardIndex = this._getIndexOfRewardAt(finalRotation);
        this._recalculateRewardList();
        this.spinResult = this.multipliedRewardList[rewardIndex];
        cc.log("Result = " + this.spinResult + ", " + this.prevTargetIndex);

        let winType = this._retrieveWinType(this.spinResult);

        if (this.rigged) {
            this.rigged = false;
            winType = WinTypes.RESPIN;
            this.spinResult = winType;
            // debugger
        }
        switch (winType) {
            case WinTypes.RESPIN:
                this.switchGameState(GameStates.SPIN_COMPLETE);

                const cb = this.startSpin;
                this.scheduleOnce(cb.bind(this), 1.5);

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
        this.gameState = to;
        cc.log(this.spinResult);
        GameManager.onGameStateChanged(to, this.spinResult);
    }


    startSpin(): void {
        this.wheelSpinner._timedSpinning = this.timedSpinning;

        this.switchGameState(GameStates.SPINNING);

        this.wheelSpinner.startSpin();
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
            cc.log(`${i}Degree = ${this.baseRewardList[this._getIndexOfRewardAt(i)].data}`);
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


    private _getIndexOfRewardAt(angle: number): number {
        if (this.baseRewardList[0].rangeStart <= angle || angle < this.baseRewardList[0].rangeEnd) {
            return 0;
        }

        for (let i = 1; i < this.baseRewardList.length; i++) {

            if (this.baseRewardList[i].rangeStart <= angle && angle < this.baseRewardList[i].rangeEnd) {
                return i;
            }
        }
    }


    protected onLoad(): void {
        GameManager.instance.activeGameController = this;
    }


    initDataList() {
        cc.log("Initializing data object list");
        const data = GameManager.fetchSegmentData();
        this.segmentArcLength = 360 / data.length;

        const dataObjConst = (start: number, end: number, sData: string) => {
            return {
                rangeStart: start,
                rangeEnd: end,
                data: sData
            }
        }

        let rangeStart: number = 360 - Math.floor(this.segmentArcLength / 2);
        let rangeEnd: number = this.segmentArcLength / 2;

        for (let i = 0; i < data.length; i++) {
            const dataObj = dataObjConst(rangeStart, rangeEnd, data[i]);
            this.baseRewardList.push(dataObj);

            rangeStart = rangeEnd;
            rangeEnd += this.segmentArcLength;
        }
    }


    // Display Result script
    protected start(): void {
        this._betIndex = 0;
        this.initDataList();
        cc.log(this.baseRewardList);
        this._recalculateRewardList();

        this.wheelSpinner = this.wheelSpinnerNode.getComponent(WheelSpiner);
        this.wheelSpinner.segmentLength = this.segmentArcLength;
    }
}