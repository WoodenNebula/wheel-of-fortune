import GameManager from "./GameManager";
import AudioManager from "./AudioManager";

import { BET_AMOUNTS, GameStates, WHEEL_SPECIAL_WINS, WinTypes } from "./GameConfig";

import { Coins } from "./Coins";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameUIController extends cc.Component {
    @property(cc.Node)
    spinButtonNode: cc.Node = null;

    @property(cc.Node)
    exitButtonNode: cc.Node = null;

    @property(cc.Node)
    buttonUnpressedNode: cc.Node = null;

    @property(cc.Node)
    betAmountParentNode: cc.Node = null;

    @property(cc.Label)
    betAmountLabel: cc.Label = null;

    @property(cc.Node)
    betAmountIncreaseButtonNode: cc.Node = null;

    @property(cc.Node)
    betAmountDecreaseButtonNode: cc.Node = null;


    @property(cc.Label)
    coinLabel: cc.Label = null;
    @property(cc.Label)
    coinAnimLabel: cc.Label = null;

    @property(cc.Node)
    jackpotBannerNode: cc.Node = null;

    @property(cc.Label)
    resultDisplayLabel: cc.Label = null;


    @property(cc.Node)
    segmentParentNode: cc.Node = null;

    rewardLabels: cc.Label[] = null;
    segmentArcLength: number = 0;

    onSpinButtonClicked(): void {
        GameManager.startGame();
    }


    onExitButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        GameManager.exitGame();
    }


    onBetIncreaseButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        GameManager.increaseBetAmount();
        this.syncBetData();
    }


    onBetDecreaseButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        GameManager.decreaseBetAmount();
        this.syncBetData();
    }




    // data is received only on spin_complete
    onGameStateChanged(to: GameStates, data: string): void {
        switch (to) {
            case GameStates.IDLE:
                this.betAmountParentNode.active = true;
                break;
            case GameStates.SPINNING:
                this.betAmountParentNode.active = false;

                this.jackpotBannerNode.active = false;

                this.resultDisplayLabel.node.active = true;
                this.resultDisplayLabel.string = "SPINNING...";
                this.resultDisplayLabel.node.color = cc.Color.YELLOW;
                break;
            case GameStates.SPIN_COMPLETE:
                this.displayResult(data);

                break;
            default:
                break;
        }
    }


    displayResult(resultantData: string) {
        const resultStringHeader = "YOU WON ";
        const resultStringFooter = " COINS";
        let displayString = resultStringHeader + resultantData;

        // handle jackpot case
        if (resultantData == WinTypes.JACKPOT) {
            this.jackpotBannerNode.scaleX = 0;
            this.jackpotBannerNode.scaleY = 0;

            this.jackpotBannerNode.active = true;
            this.resultDisplayLabel.node.active = false;
            cc.tween(this.jackpotBannerNode)
                .to(0.5, { scaleX: 1, scaleY: 1 }, { easing: "expoIn" })
                .start();

            return;
        }
        else if (resultantData == WinTypes.RESPIN) {
            this.spinButtonNode.getComponent(cc.Button).interactable = false;
            this.buttonUnpressedNode.active = false;

            displayString = resultStringHeader + "A FREE RESPIN!";
        }
        // add "coins" for any normal win
        else if (resultantData == WinTypes.NORMAL) {
            displayString += resultStringFooter;
        }

        cc.log("Displaying Result!");

        this.resultDisplayLabel.node.color = cc.Color.GREEN;
        this.resultDisplayLabel.node.active = true;

        this.resultDisplayLabel.string = displayString;
    }


    syncBetData(): void {
        this._syncBetAmount(GameManager.getBetAmount());
        this._syncRewards(GameManager.getBetRewardList());
    }

    private _syncBetAmount(toAmount: number): void {
        // update multiplier display
        this.betAmountLabel.string = toAmount.toString();

        if (toAmount == BET_AMOUNTS[0]) {
            this.betAmountDecreaseButtonNode.active = false;
        }
        else if (toAmount == BET_AMOUNTS[BET_AMOUNTS.length - 1]) {
            this.betAmountIncreaseButtonNode.active = false;
        }
        else {
            this.betAmountIncreaseButtonNode.active = true;
            this.betAmountDecreaseButtonNode.active = true;
        }
    }


    private _syncRewards(newRewardLabels: string[]): void {
        // update value
        for (let i = 0; i < this.rewardLabels.length; i++) {
            this.rewardLabels[i].string = newRewardLabels[i];
        }
    }


    get segmentLabelData(): string[] {
        const rewards: string[] = [];
        for (let i = 0; i < this.rewardLabels.length; i++) {
            rewards.push(this.rewardLabels[i].string);
        }
        cc.log("Rewards data sent" + rewards);
        return rewards;
    }


    private _setLabelReferences() {
        this.rewardLabels = new Array();

        for (let i = 0; i < this.segmentParentNode.childrenCount; i++) {
            this.rewardLabels[i] = this.segmentParentNode.children[i].getComponent(cc.Label);
        }
    }


    private _randomizeRewardList(rewardList: cc.Label[], length: number): void {
        for (let i = 0; i < length; i++) {
            let r = Math.random();
            while (r < 1) {
                r *= 10;
            }
            r = Math.floor(r)

            rewardList[i].string = (r * BET_AMOUNTS[0]).toString();
            rewardList[i].fontSize = 40;
        }
    }


    private _assignSpecialWinSegment(segmentLabel: cc.Label[], specialWinValue: WinTypes) {
        let i: number;
        do {
            i = GameManager.getRandomIndex(segmentLabel.length);
        } while (Number.isNaN(parseInt(segmentLabel[i].string)));

        let targetLabel = segmentLabel[i];
        targetLabel.string = specialWinValue;
        targetLabel.fontSize = 20;
        // offset is taken from 3 since third segment is horizontal, subtract one as indexing starts from 0
        targetLabel.node.angle = this.segmentArcLength * (3 - i - 1);
    }


    protected onLoad(): void {
        GameManager.instance.activeUIController = this;
        Coins.syncCoinCountDisplay(this.coinLabel);
    }


    initLabels(): void {
        this._setLabelReferences();

        this.segmentArcLength = 360 / this.segmentParentNode.childrenCount;

        this._randomizeRewardList(this.rewardLabels, this.rewardLabels.length);
        this._assignSpecialWinSegment(this.rewardLabels, WinTypes.JACKPOT);
        this._assignSpecialWinSegment(this.rewardLabels, WinTypes.RESPIN);
    }

    protected start(): void {
        this.spinButtonNode.active = true;
        this.buttonUnpressedNode.active = true;
        this.betAmountDecreaseButtonNode.active = false;

        this.initLabels();

        cc.log("FROM UI");
        cc.log(this.rewardLabels);
    }
}