// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SceneManager from "./SceneManager";
import AudioManager from "./AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WheelGameController extends cc.Component {
    @property(cc.Node)
    exitButtonNode: cc.Node = null;

    onExitButtonClicked(): void {
        AudioManager.Instance.playButtonClickAudio(true);
        SceneManager.Instance.onGameExit();
    }
}
