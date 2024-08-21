import ProgressBar from "./ProgressBarController";

const { ccclass, property } = cc._decorator;



@ccclass
export default class SceneManager extends cc.Component {
    private static instance: SceneManager = null;

    @property(cc.Prefab)
    wheelSpinPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    loadingScreenPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    mainMenuUIPrefab: cc.Prefab = null;

    @property(cc.Node)
    canvas: cc.Node = null;

    mainMenuUIInstance: cc.Node = null;
    wheelInstance: cc.Node = null;
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


    onGameStart(): void {
        this.mainMenuUIInstance.destroy();

        this.onLoadingScreenLoaded(() => {
            cc.log("StartButton Handled!");
            this.wheelInstance = cc.instantiate(this.wheelSpinPrefab);
            this.canvas.addChild(this.wheelInstance);
        }, 5);
    }

    onGameExit(): void {
        this.wheelInstance.destroy();

        this.onLoadingScreenLoaded(() => {
            cc.log("ExitButton Handled");
            this.mainMenuUIInstance = cc.instantiate(this.mainMenuUIPrefab);
            this.canvas.addChild(this.mainMenuUIInstance);
        }, 3);
    }


    onLoadingScreenLoaded(cb: Function = null, delay: number = 2): void {
        this.loadingScreenInstance = cc.instantiate(this.loadingScreenPrefab);
        this.canvas.addChild(this.loadingScreenInstance);
        ProgressBar.setLoadingTime(delay);

        if (cb != null)
            ProgressBar.onProgressComplete.push(cb);
        ProgressBar.onProgressComplete.push(() => { SceneManager.Instance.loadingScreenInstance.destroy(); });
    }

}