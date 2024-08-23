const { ccclass, property } = cc._decorator;

const LOCAL_STORAGE_KEYS = {
    IS_AUDIO_ENABLED: "isAudioEnabled",
    IS_MUSIC_ENABLED: "isBgMusicEnabled"
}

@ccclass
export default class AudioManager extends cc.Component {
    private static instance: AudioManager = null;

    @property(cc.Node)
    musicNode: cc.Node = null;
    @property(cc.Node)
    audioNode: cc.Node = null;

    @property(cc.AudioClip)
    buttonClickAudio: cc.AudioClip = null;


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
        AudioManager.Instance.saveState();
        cc.log("Aduio toggled!");
    }


    public static toggleMusic() {
        AudioManager.isBgMusicEnabled = !AudioManager.isBgMusicEnabled;
        AudioManager.Instance.saveState();

        AudioManager.playBgMusic(AudioManager.isBgMusicEnabled);
        cc.log("Music toggled!");
    }

    public static playClip(clip: cc.AudioClip): void {
        cc.log("Audio enabled: " + AudioManager.isAudioEnabled);

        if (AudioManager.isAudioEnabled) {
            AudioManager.Instance.buttonAudioSource.clip = clip;
            AudioManager.Instance.buttonAudioSource.play();
            // const tmpAudioNode = cc.instantiate(AudioManager.Instance.buttonAudioSource.node);
            // const tmpAudioSrc = tmpAudioNode.getComponent(cc.AudioSource);
            // tmpAudioSrc.clip = clip;
            // tmpAudioSrc.play();
        }
    }

    public static playButtonClickAudio(shouldPlay: boolean): void {
        if (shouldPlay) {
            cc.log("playing Button click!");
            this.playClip(AudioManager.Instance.buttonClickAudio);
        }
    }


    public static playBgMusic(shouldPlay: boolean): void {
        if (AudioManager.isBgMusicEnabled && !AudioManager.Instance.hasPlayedOnce) {
            AudioManager.Instance.musicSource.play();
            AudioManager.Instance.hasPlayedOnce = true;
        }
        else if (AudioManager.isBgMusicEnabled && shouldPlay) {
            AudioManager.Instance.musicSource.resume();
        }
        else {
            AudioManager.Instance.musicSource.pause();
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
        let audioEnabled = cc.sys.localStorage.getItem(LOCAL_STORAGE_KEYS.IS_AUDIO_ENABLED);
        if (audioEnabled == "true" || audioEnabled == "null")
            AudioManager.isAudioEnabled = true;
        else
            AudioManager.isAudioEnabled = false;

        let musicEnabled = cc.sys.localStorage.getItem(LOCAL_STORAGE_KEYS.IS_MUSIC_ENABLED);
        if (musicEnabled == "true" || musicEnabled == "null")
            AudioManager.isBgMusicEnabled = true;
        else
            AudioManager.isBgMusicEnabled = false;


        this.musicSource = this.musicNode.getComponent(cc.AudioSource);
        this.musicSource.playOnLoad = AudioManager.isBgMusicEnabled;

        this.buttonAudioSource = this.audioNode.getComponent(cc.AudioSource);
    }

    saveState(): void {
        cc.log(`Saving (audio, music) = (${AudioManager.isAudioEnabled}, ${AudioManager.isBgMusicEnabled})`);

        cc.sys.localStorage.setItem(LOCAL_STORAGE_KEYS.IS_AUDIO_ENABLED, AudioManager.isAudioEnabled.toString());
        cc.sys.localStorage.setItem(LOCAL_STORAGE_KEYS.IS_MUSIC_ENABLED, AudioManager.isBgMusicEnabled.toString());
    }

    protected onDestroy(): void {
        // Save current state
        this.saveState();
    }

}
