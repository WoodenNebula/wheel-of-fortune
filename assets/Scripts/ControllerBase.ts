import { COINS } from "./Coins";
import { gameData } from "./GameConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ControllerBase extends cc.Component {
    @property(cc.Label)
    coinDisplayLabel: cc.Label = null;

    @property(cc.Label)
    coinAnimLabel: cc.Label = null;

    @property(cc.AudioClip)
    successAudioClip: cc.AudioClip = null;

    @property(cc.AudioClip)
    errorAudioClip: cc.AudioClip = null;


    updateCoins(delAmount: number): void {
        this.coinAnimLabel.node.active = true;
        if (delAmount < 0) {
            this.coinAnimLabel.node.color = cc.Color.RED;
            this.coinAnimLabel.string = delAmount.toString();
        }
        else if (delAmount > 0) {
            this.coinAnimLabel.node.color = cc.Color.GREEN;
            this.coinAnimLabel.string = "+" + delAmount.toString();
        }

        const animCtrl = this.coinAnimLabel.getComponent(cc.Animation);
        animCtrl.play();

        this.scheduleOnce(() => {
            COINS.updateBalance(delAmount);
            this.syncCoinCountDisplay();
            this.coinAnimLabel.node.active = false;
        }, animCtrl.defaultClip.duration);
    }

    // returns false if coin < entry fee else deducts entryfee and returns true
    hasBetAmount(game: gameData, betMultiplier: number): boolean {
        const usrCoin = COINS.getCount();
        const entryFee = game.entryCost * betMultiplier;

        if (usrCoin < entryFee) {
            return false;
        } else {
            return true;
        }
    }


    syncCoinCountDisplay(): void {
        this.coinDisplayLabel.string = `x${COINS.getCount()}`;
    }

    resetCoins(): void {
        COINS.setCount(0);
        this.syncCoinCountDisplay();
    }
}