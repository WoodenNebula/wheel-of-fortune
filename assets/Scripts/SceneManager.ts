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

    private _launchGame(targetGamePrefab: cc.Prefab, loadingTime: number = DEFAULT_GAME_PROPERTIES.ENTER_LOADING_TIME): void {
        this.mainMenuUIInstance.destroy();

        this.onLoadingScreenLoaded(() => {
            this.gameInstance = cc.instantiate(targetGamePrefab);
            cc.log(`Started ${targetGamePrefab.name} Mode!`);
            this.canvas.addChild(this.gameInstance);
        }, loadingTime);
    }


    launchSingleWheelGame(): void {
        this._launchGame(this.singleWheelSpinPrefab, 2);
    }

    launchDoubleWheelGame(): void {
        this._launchGame(this.doubleWheelSpinPrefab, 2.5);
    }

    onGameExit(): void {
        this.gameInstance.destroy();

        this.onLoadingScreenLoaded(() => {
            cc.log("ExitButton Handled");
            this.mainMenuUIInstance = cc.instantiate(this.mainMenuUIPrefab);
            this.canvas.addChild(this.mainMenuUIInstance);
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