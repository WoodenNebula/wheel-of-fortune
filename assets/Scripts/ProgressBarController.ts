// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class ProgressBarController extends cc.Component {
    public static Instance: ProgressBarController = null;
    @property(cc.Node)
    progressBarNode: cc.Node = null;

    progressBar: cc.ProgressBar = null;

    static loadingComplete: boolean = false;

    loadingTime: number = 2;
    progressPerFrame: number = 1 / this.loadingTime;

    public static onProgressComplete: Function[] = [];

    public static setLoadingTime(loadingTime: number = ProgressBarController.Instance.loadingTime): void {
        if (loadingTime != null)
            ProgressBarController.Instance.progressPerFrame = 1 / loadingTime;
    }


    protected onLoad(): void {
        ProgressBarController.Instance = this;
        this.progressBar = this.progressBarNode.getComponent(cc.ProgressBar);

        ProgressBarController.loadingComplete = false;
        ProgressBarController.setLoadingTime();
    }

    protected update(dt: number): void {
        if (this.progressBar.progress >= 1 && !ProgressBarController.loadingComplete) {
            ProgressBarController.loadingComplete = true;
            cc.log("Progress Complete!");
            if (ProgressBarController.onProgressComplete != null) {
                cc.log("Callback detected!");
                while (ProgressBarController.onProgressComplete.length > 0) {
                    let cb = ProgressBarController.onProgressComplete.pop();
                    cb();
                }
            }
        }

        this.progressBar.progress += this.progressPerFrame * dt;
    }

    protected onDestroy(): void {
        ProgressBarController.loadingComplete = false;
        cc.log("Loading Screen Destroyed");
    }

}