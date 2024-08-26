import { COINS } from "./Coins";
import { gameData } from "./GameConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameController extends cc.Component {
    @property(cc.Label)
    coinDisplayLabel: cc.Label = null;


    @property(cc.AudioClip)
    successAudioClip: cc.AudioClip = null;

    @property(cc.AudioClip)
    errorAudioClip: cc.AudioClip = null;


    // returns false if coin < entry fee else deducts entryfee and returns true
    validateEntryFee(game: gameData): boolean {
        const usrCoin = COINS.getCount();
        if (usrCoin < game.entryCost) {
            return false;
        } else {
            COINS.updateBalance(-game.entryCost);
            this.syncCoinCountDisplay();
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