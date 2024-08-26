import AudioManager from "./AudioManager";
import SceneManager from "./SceneManager";
import GameController from "./GameController";

import { GAMES } from "./GameConfig";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenuController extends GameController {

    @property(cc.Node)
    startButtonNode: cc.Node = null;

    @property(cc.Node)
    bgMusicToggleNode: cc.Node = null;
    @property(cc.Node)
    audioToggleNode: cc.Node = null;
    @property(cc.Node)
    coinResetButton: cc.Node = null;


    audioToggle: cc.Toggle = null;
    bgMusicToggle: cc.Toggle = null;


    onSingleWheelButtonClicked(): void {
        AudioManager.playButtonClickAudio(true);
        SceneManager.Instance.launchSingleWheelGame();
    }

    onDoubleWheelButtonClick(): void {
        if (this.validateEntryFee(GAMES.DOUBLE_WHEEL_SPIN)) {
            AudioManager.playButtonClickAudio(true);
            SceneManager.Instance.launchDoubleWheelGame();
        }
        else {
            // Do some more stuff to show game cant be entered with current amount of coin
            AudioManager.playClip(this.errorAudioClip);
        }
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

        this.syncCoinCountDisplay();
    }
}
