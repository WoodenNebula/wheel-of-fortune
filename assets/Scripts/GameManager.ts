import SceneManager from "./SceneManager";

import { DEFAULT_GAME_PROPERTIES, GameData, GameStates } from "./GameConfig";

import GameUIController from "./GameUIController";
import WheelGameController from "./WheelGameController";

const { ccclass, property } = cc._decorator;


@ccclass
export default class GameManager extends cc.Component {
    private static _instance: GameManager = null;

    @property([cc.Prefab])
    gamePrefabs: cc.Prefab[] = [];

    activeGameInstance: cc.Node = null;

    activeUIController: GameUIController = null;
    activeGameController: WheelGameController = null;


    static getRandomIndex(min: number, max: number): number {
        let range = max - min;
        let rand = Math.random();
        return (min + Math.floor(rand * range));
    }


    // specific
    static fetchSegmentData(): string[] {
        cc.log("fetched reward list");

        return GameManager.instance.activeUIController.segmentLabelData;
    }



    // specific
    static increaseBetAmount(): void {
        GameManager.instance.activeGameController.increaseBetAmount();
    }

    // specific
    static decreaseBetAmount(): void {
        GameManager.instance.activeGameController.decreaseBetAmount();
    }

    // specific
    static getBetAmount(): number {
        return GameManager.instance.activeGameController.betAmount;
    }

    // specific
    static getBetRewardList(): string[] {
        return GameManager.instance.activeGameController.finalRewardList;
    }

    // specific
    static setTargetIndex(index: number): void {
        GameManager.instance.activeGameController.setTargetIndex(index);
    }

    // specific
    static getTargetIndex(): number {
        return GameManager.instance.activeUIController.getTargetIndex();
    }


    static get instance() {
        return GameManager._instance;
    }


    static startGame(): void {
        GameManager.instance.activeGameController.startGame();
    }

    static onGameStateChanged(to: GameStates, data: string): void {
        GameManager.instance.activeUIController.onGameStateChanged(to, data);
        // notify all listeners here
    }


    static loadGame(game: GameData, loadingTime: number = DEFAULT_GAME_PROPERTIES.ENTER_LOADING_TIME): void {
        const gamePrefab = GameManager.instance.gamePrefabs[game.index];

        GameManager.instance.activeGameInstance = SceneManager.loadPrefab(gamePrefab);
        const loadGame = () => {
            cc.log(`Started ${game.name} Game!`);
            SceneManager.Instance.canvas.addChild(GameManager.instance.activeGameInstance);
        };

        SceneManager.Instance.onLoadingScreenLoaded(loadGame, loadingTime);
    }


    static exitGame(): void {
        GameManager.instance.activeGameInstance.destroy();
        GameManager.instance.activeGameInstance = null;
        SceneManager.loadMainMenu();
    }


    protected onLoad(): void {
        cc.log("Loaded Audio Manager");
        if (GameManager.instance == null) {
            GameManager._instance = this;
        } else {
            this.destroy();
        }
        cc.game.addPersistRootNode(this.node);


        cc.log("Loading data");
    }
}