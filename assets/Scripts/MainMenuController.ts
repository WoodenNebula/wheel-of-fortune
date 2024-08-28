import AudioManager from "./AudioManager";
import { Coins } from "./Coins";
import ShopController from "./ShopController";
import GameManager from "./GameManager";
import { AVAILABLE_GAMES } from "./GameConfig";
import SceneManager from "./SceneManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenuController extends cc.Component {

    @property(cc.Node)
    startButtonNode: cc.Node = null;

    @property(cc.Node)
    bgMusicToggleNode: cc.Node = null;
    @property(cc.Node)
    audioToggleNode: cc.Node = null;
    @property(cc.Node)
    coinResetButton: cc.Node = null;

    @property(cc.Label)
    coinLabel: cc.Label = null;
    @property(cc.Label)
    coinAnimLabel: cc.Label = null;

    audioToggle: cc.Toggle = null;
    bgMusicToggle: cc.Toggle = null;


    onCoinResetButtonClicked(): void {
        Coins.resetCoins(this.coinLabel, this.coinAnimLabel);
    }

    onShopButtonClicked(): void {
        SceneManager.loadShop(this.coinLabel, this.coinAnimLabel);
    }

    onSingleWheelButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        GameManager.loadGame(AVAILABLE_GAMES.SINGLE_WHEEL_SPIN, 2);
    }

    onDoubleWheelButtonClick(): void {
        AudioManager.playButtonClickAudio(true);
    }


    onExitButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        cc.log("Exiting Game!");
        AudioManager.Instance.saveState();
        cc.game.end();
    }

    onAudioToggleButtonClicked(): void {
        cc.log("ShouldPlay? " + AudioManager.isAudioEnabled);
        AudioManager.toggleAudio();
        AudioManager.playButtonClickAudio(AudioManager.isAudioEnabled);

        this.toggleAudioDisplay();
    }


    onBgMusicToggleButtonClicked(): void {
        AudioManager.toggleMusic();
        AudioManager.playButtonClickAudio(true);

        this.toggleBgMusicDisplay();
    }


    toggleAudioDisplay(): void {
        if (AudioManager.isAudioEnabled)
            this.audioToggle.uncheck();
        else
            this.audioToggle.check();
    }


    toggleBgMusicDisplay(): void {
        if (AudioManager.isBgMusicEnabled)
            this.bgMusicToggle.uncheck();
        else
            this.bgMusicToggle.check();
    }


    protected onLoad(): void {
        cc.log("loaded MainMenu Controller");
        this.audioToggle = this.audioToggleNode.getComponent(cc.Toggle);
        this.bgMusicToggle = this.bgMusicToggleNode.getComponent(cc.Toggle);

        // this.coinResetButton.active = false;
    }

    protected start(): void {
        cc.log("Started mainmenu controlelr!");
        cc.log("From menu controller start: (audio, music) = (" + AudioManager.isAudioEnabled + ", " + AudioManager.isBgMusicEnabled);

        if (AudioManager.isAudioEnabled)
            this.audioToggle.uncheck();
        else
            this.audioToggle.check();

        if (AudioManager.isBgMusicEnabled)
            this.bgMusicToggle.uncheck();
        else
            this.bgMusicToggle.check();

        Coins.syncCoinCountDisplay(this.coinLabel);
    }
}