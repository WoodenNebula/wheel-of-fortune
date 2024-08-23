import AudioManager from "./AudioManager";
import { COINS } from "./Coins"
import { SHOP_COIN_PACKS, SHOP_PACKS, shopPackData } from "./GameConfig";
import MainMenuController from "./MainMenuController";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ShopController extends cc.Component {
    @property(cc.Node)
    mainMenuControllerNode: cc.Node = null;
    @property(cc.Node)
    shopUINode: cc.Node = null;
    @property(cc.Prefab)
    coinPurchasePackPrefab: cc.Prefab = null;

    @property(cc.AudioClip)
    transactionSuccessAudio: cc.AudioClip = null;
    @property(cc.AudioClip)
    transactionFailAudio: cc.AudioClip = null;

    shopPopupNode: cc.Node = null;
    mainMenuController: MainMenuController = null;
    // @property(cc.SpriteFrame)
    // coinSprite: cc.Sprite = null
    // 
    // @property(cc.SpriteFrame)
    // coinPackOfFiveHundredSprite: cc.SpriteFrame = null;
    // @property(cc.SpriteFrame)
    // coinPackofHundredSprite: cc.SpriteFrame = null;
    // @property(cc.SpriteFrame)
    // coinPackOfFiftySprite: cc.SpriteFrame = null;
    // spriteMap: Map<SHOP_COIN_PACKS, cc.SpriteFrame> = null;


    // coinPurchasePacks: cc.Node[] = null;

    // private _instantiateShop() {
    //     // COIN_PURCHASE_PROPERTIES.forEach((prop) => {
    //     //     const packInstance = cc.instantiate(this.coinPurchasePackPrefab);
    //     //     const image = packInstance.getComponent(cc.Sprite);
    //     //     image.spriteFrame = this.spriteMap.get(prop.packType);
    //     //     const button: cc.Button = packInstance.children[1].getComponent(cc.Button);
    //     //     button.node.on("click", () => { ShopController.onCoinPackBuy(); });

    //     // })
    // }

    onShopButtonClicked(): void {
        cc.log("Opening Shop!");
        AudioManager.playButtonClickAudio(true);

        // this.coinPurchasePacks.push();
        this.shopPopupNode.scaleX = 0;
        this.shopPopupNode.scaleY = 0;
        this.shopUINode.active = true;

        cc.tween(this.shopPopupNode)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .start();

    }

    onShopCloseButtonClicked(): void {
        cc.log("Closing Shop");
        AudioManager.playButtonClickAudio(true);

        cc.tween(this.shopPopupNode)
            .to(0.3, { scaleX: 0, scaleY: 0 })
            .call(() => { this.shopUINode.active = false; })
            .start();

    }


    onCoinPackBuy(event: cc.Event, data: string): void {
        const packType = SHOP_COIN_PACKS[data];
        cc.log("Purchasing pack of " + packType);
        const coinPack: shopPackData = SHOP_PACKS[packType];

        if (coinPack == null) {
            cc.error("BAD PURCHASE PACK TYPE");
            return;
        }

        const transactionSuccess = this._processTransaction(coinPack.price);

        if (transactionSuccess) {
            cc.log("Transaction success!");
            // show success feedback
            COINS.updateBalance(coinPack.amount);

            AudioManager.playClip(this.transactionSuccessAudio);
            this.mainMenuController.syncCoinCountDisplay();
        }
        else if (!transactionSuccess) {
            // show failed message/feedback
            cc.warn("Transaction failed!");

            AudioManager.playClip(this.transactionFailAudio)
            return;
        }
    }


    private _processTransaction(costAmount: number): boolean {
        let success = Math.random() < 0.8;
        cc.log("Processed amount " + costAmount);
        return success;
    }

    protected onLoad(): void {
        this.shopUINode.active = false;
        // children[0] is input blocker, 1 is 
        this.shopPopupNode = this.shopUINode.children[1];

        this.mainMenuController = this.mainMenuControllerNode.getComponent(MainMenuController);
        // this.coinPurchasePacks = [];

        // this.spriteMap = new Map();
        // this.spriteMap.set(SHOP_COIN_PACKS.FIVE_HUNDRED, this.coinPackofHundredSprite);
        // this.spriteMap.set(SHOP_COIN_PACKS.HUNDRED, this.coinPackofHundredSprite);
        // this.spriteMap.set(SHOP_COIN_PACKS.FIFTY, this.coinPackOfFiftySprite);

        // this._instantiateShop();
    }

}