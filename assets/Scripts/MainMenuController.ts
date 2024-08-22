import AudioManager from "./AudioManager";
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


    audioToggle: cc.Toggle = null;
    bgMusicToggle: cc.Toggle = null;


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


    onAudioToggleButtonClicked(): void {
        cc.log("ShouldPlay? " + AudioManager.isAudioEnabled);
        AudioManager.toggleAudio();
        AudioManager.Instance.playButtonClickAudio(AudioManager.isAudioEnabled);

        this.toggleAudioDisplay();
    }


    onBgMusicToggleButtonClicked(): void {
        AudioManager.toggleMusic();
        AudioManager.Instance.playButtonClickAudio(true);

        this.toggleBgMusicDisplay();
    }


    onSingleWheelButtonClicked(): void {
        AudioManager.Instance.playButtonClickAudio(true);
        SceneManager.Instance.onSingleWheelLaunch();
    }

    onDoubleWheelButtonClick(): void {
        AudioManager.Instance.playButtonClickAudio(true);
        SceneManager.Instance.onDoubleWheelLaunch();
    }


    onExitButtonClicked(): void {
        AudioManager.Instance.playButtonClickAudio(true);
        cc.log("Exiting Game!");
        AudioManager.Instance.saveState();
        cc.game.end();
    }


    protected onLoad(): void {
        cc.log("loaded MainMenu Controller");
        this.audioToggle = this.audioToggleNode.getComponent(cc.Toggle);
        this.bgMusicToggle = this.bgMusicToggleNode.getComponent(cc.Toggle);
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
    }
}
