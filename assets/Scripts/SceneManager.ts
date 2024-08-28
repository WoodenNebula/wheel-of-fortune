import { DEFAULT_GAME_PROPERTIES } from "./GameConfig";
import ProgressBar from "./ProgressBarController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneManager extends cc.Component {
    private static instance: SceneManager = null;

    @property(cc.Prefab)
    singleWheelSpinPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    doubleWheelSpinPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    loadingScreenPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    mainMenuUIPrefab: cc.Prefab = null;

    @property(cc.Node)
    canvas: cc.Node = null;

    mainMenuUIInstance: cc.Node = null;
    gameInstance: cc.Node = null;
    loadingScreenInstance: cc.Node = null;


    public static get Instance(): SceneManager {
        return this.instance;
    }


    protected onLoad(): void {
        cc.log("Loaded SceneManager!");
        if (SceneManager.instance == null) {
            SceneManager.instance = this;
        } else {
            this.destroy();
        }
        cc.game.addPersistRootNode(this.node);

        // this.startButtonNode.getComponent(cc.Button);

    }


    protected start(): void {
        this.mainMenuUIInstance = cc.instantiate(this.mainMenuUIPrefab);
        this.canvas.addChild(this.mainMenuUIInstance);

    }


    // loads a given prefab and returns the instance for use
    static loadPrefab(prefab: cc.Prefab): cc.Node {
        SceneManager.Instance.mainMenuUIInstance.destroy();
        return cc.instantiate(prefab);
    }


    private _launchGame(targetPrefab: cc.Prefab, loadingTime: number = DEFAULT_GAME_PROPERTIES.ENTER_LOADING_TIME): void {
        this.mainMenuUIInstance.destroy();

        this.onLoadingScreenLoaded(() => {
            this.gameInstance = cc.instantiate(targetPrefab);
            cc.log(`Started ${targetPrefab.name} Mode!`);
            this.canvas.addChild(this.gameInstance);
        }, loadingTime);
    }


    static launchSingleWheelGame(gamePrefab: cc.Prefab = SceneManager.Instance.singleWheelSpinPrefab): void {
        SceneManager.Instance._launchGame(gamePrefab, 2);
    }

    launchDoubleWheelGame(): void {
        this._launchGame(this.doubleWheelSpinPrefab, 2.5);
    }

    static loadMainMenu(): void {
        SceneManager.Instance.gameInstance?.destroy();

        SceneManager.instance.onLoadingScreenLoaded(() => {
            cc.log("ExitButton Handled");
            SceneManager.Instance.mainMenuUIInstance = cc.instantiate(SceneManager.Instance.mainMenuUIPrefab);
            SceneManager.Instance.canvas.addChild(SceneManager.Instance.mainMenuUIInstance);
        });
    }


    onLoadingScreenLoaded(cb: Function = null, delay: number = DEFAULT_GAME_PROPERTIES.EXIT_LOADING_TIME): void {
        this.loadingScreenInstance = cc.instantiate(this.loadingScreenPrefab);
        this.canvas.addChild(this.loadingScreenInstance);
        ProgressBar.setLoadingTime(delay);

        if (cb != null)
            ProgressBar.onProgressComplete.push(cb);
        ProgressBar.onProgressComplete.push(() => { SceneManager.Instance.loadingScreenInstance.destroy(); });
    }

}