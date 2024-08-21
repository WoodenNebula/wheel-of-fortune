const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioManager extends cc.Component {
    private static instance: AudioManager = null;

    @property(cc.Node)
    musicNode: cc.Node = null;
    @property(cc.Node)
    audioNode: cc.Node = null;

    musicSource: cc.AudioSource = null;
    buttonAudioSource: cc.AudioSource = null;


    // @property(cc.AudioClip)
    // wheelSpinning: cc.AudioClip = null;

    // audioSource: cc.AudioSource = null;

    hasPlayedOnce: boolean = false;

    public static isBgMusicEnabled: boolean = true;
    public static isAudioEnabled: boolean = true;


    public static toggleAudio() {
        AudioManager.isAudioEnabled = !AudioManager.isAudioEnabled;
        cc.log("Aduio toggled!");
    }


    public static toggleMusic() {
        AudioManager.isBgMusicEnabled = !AudioManager.isBgMusicEnabled;


        AudioManager.Instance.playBgMusic(AudioManager.isBgMusicEnabled);
        cc.log("Music toggled!");
    }


    playButtonClickAudio(shouldPlay: boolean): void {
        cc.log("Audio enabled: " + AudioManager.isAudioEnabled);

        if (AudioManager.isAudioEnabled && shouldPlay) {
            cc.log("playing Button click!");
            this.buttonAudioSource.play();
        }
    }


    playBgMusic(shouldPlay: boolean): void {
        if (AudioManager.isBgMusicEnabled && !this.hasPlayedOnce) {
            this.musicSource.play();
            this.hasPlayedOnce = true;
        }
        else if (AudioManager.isBgMusicEnabled && shouldPlay) {
            this.musicSource.resume();
        }
        else {
            this.musicSource.pause();
        }
    }


    public static get Instance() {
        return AudioManager.instance;
    }

    private static set Instance(val: AudioManager) {
        AudioManager.instance = val;
    }


    protected onLoad(): void {
        cc.log("Loaded Audio Manager");
        if (AudioManager.Instance == null) {
            AudioManager.Instance = this;
        } else {
            this.destroy();
        }
        cc.game.addPersistRootNode(this.node);


        // load prev saved data
        cc.log("Loading data");
        AudioManager.isAudioEnabled = (cc.sys.localStorage.getItem('isAudioEnabled') == "true");
        AudioManager.isBgMusicEnabled = (cc.sys.localStorage.getItem('isBgMusicEnabled') == "true");


        this.musicSource = this.musicNode.getComponent(cc.AudioSource);
        this.musicSource.playOnLoad = AudioManager.isBgMusicEnabled;

        this.buttonAudioSource = this.audioNode.getComponent(cc.AudioSource);
    }

    saveState(): void {
        cc.log(`Saving (audio, music) = (${AudioManager.isAudioEnabled}, ${AudioManager.isBgMusicEnabled})`);

        cc.sys.localStorage.setItem('isAudioEnabled', AudioManager.isAudioEnabled);
        cc.sys.localStorage.setItem('isBgMusicEnabled', AudioManager.isBgMusicEnabled);
    }

    protected onDestroy(): void {
        // Save current state
        this.saveState();
    }

}
