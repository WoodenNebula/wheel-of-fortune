import AudioManager from "./AudioManager";
import { Coins } from "./Coins";
import { SHOP_COIN_PACKS, SHOP_PACKS, shopPackData } from "./GameConfig";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ShopController extends cc.Component {
    @property(cc.Node)
    shopUINode: cc.Node = null;
    @property(cc.Prefab)
    coinPurchasePackPrefab: cc.Prefab = null;

    @property(cc.Node)
    shopPopupNode: cc.Node = null;

    coinLabel: cc.Label = null;
    coinAnimLabel: cc.Label = null;

    onCloseCb: { (): void } = null;

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

    init(coinLabel: cc.Label, coinAnimLabel: cc.Label, onClose: { (): void }): void {
        cc.log("Initialized Shop!");
        this.coinLabel = coinLabel;
        this.coinAnimLabel = coinAnimLabel;
        this.onCloseCb = onClose;
    }

    openShop(): void {
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

    closeShop(): void {
        cc.log("Closing Shop");
        AudioManager.playButtonClickAudio(true);

        cc.tween(this.shopPopupNode)
            .to(0.3, { scaleX: 0, scaleY: 0 })
            .call(() => { this.shopUINode.active = false; this.onCloseCb(); })
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
            Coins.updateCoins(coinPack.amount, this.coinLabel, this.coinAnimLabel);

            AudioManager.playClip(AudioManager.Instance.successAudioClip);
        }
        else if (!transactionSuccess) {
            // show failed message/feedback
            cc.warn("Transaction failed!");

            AudioManager.playClip(AudioManager.Instance.errorAudioClip);
            return;
        }
    }


    private _processTransaction(costAmount: number): boolean {
        let success = Math.random() < 0.6;
        cc.log("Processed amount " + costAmount);
        return success;
    }

    protected onLoad(): void {
        this.shopUINode.active = false;
        // this.coinPurchasePacks = [];

        // this.spriteMap = new Map();
        // this.spriteMap.set(SHOP_COIN_PACKS.FIVE_HUNDRED, this.coinPackofHundredSprite);
        // this.spriteMap.set(SHOP_COIN_PACKS.HUNDRED, this.coinPackofHundredSprite);
        // this.spriteMap.set(SHOP_COIN_PACKS.FIFTY, this.coinPackOfFiftySprite);

        // this._instantiateShop();
    }
}