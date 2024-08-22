import AudioManager from "./AudioManager";
import { SHOP_COIN_PACKS, COIN_COST_LOOKUP, COIN_PURCHASE_PROPERTIES } from "./GameConfig";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ShopController extends cc.Component {
    @property(cc.Node)
    shopUINode: cc.Node = null;
    @property(cc.Prefab)
    coinPurchasePackPrefab: cc.Prefab = null;

    @property(cc.SpriteFrame)
    coinPackOfFiveHundredSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    coinPackofHundredSprite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    coinPackOfFiftySprite: cc.SpriteFrame = null;

    shopPopup: cc.Node = null;
    spriteMap: Map<SHOP_COIN_PACKS, cc.SpriteFrame> = null;

    coinPurchasePacks: cc.Node[] = null;

    private _instantiateShop() {
        // COIN_PURCHASE_PROPERTIES.forEach((prop) => {
        //     const packInstance = cc.instantiate(this.coinPurchasePackPrefab);
        //     const image = packInstance.getComponent(cc.Sprite);
        //     image.spriteFrame = this.spriteMap.get(prop.packType);
        //     const button: cc.Button = packInstance.children[1].getComponent(cc.Button);
        //     button.node.on("click", () => { ShopController.onCoinPackBuy(); });

        // })
    }

    onShopButtonClicked(): void {
        cc.log("Opening Shop!");
        AudioManager.playButtonClickAudio(true);

        // this.coinPurchasePacks.push();
        this.shopPopup.scaleX = 0;
        this.shopPopup.scaleY = 0;
        this.shopUINode.active = true;

        cc.tween(this.shopPopup)
            .to(0.6, { scaleX: 1, scaleY: 1 })
            .start();

    }

    onShopCloseButtonClicked(): void {
        cc.log("Closing Shop");
        AudioManager.playButtonClickAudio(true);

        cc.tween(this.shopPopup)
            .to(0.3, { scaleX: 0, scaleY: 0 })
            .call(() => { this.shopUINode.active = false; })
            .start();

    }


    onCoinPackBuy(): void {
        cc.log("Buying Coin!");
        this._handlePurchase(SHOP_COIN_PACKS.FIFTY);
    }


    private _handlePurchase(coinAmount: SHOP_COIN_PACKS): void {
        let transactionSuccess = this._processTransaction(COIN_COST_LOOKUP.FIFTY);

        if (transactionSuccess) {
            cc.log("Transaction success!");
            // show success feedback
            // Coin.AddCoin(coinAmount)
        }
        else if (!transactionSuccess) {
            cc.log("Transaction failed!");
            // show failed message/feedback
        }

    }

    private _processTransaction(costAmount: number): boolean {
        let success = true;
        cc.log("Processed amount " + costAmount);
        return success;
    }

    protected onLoad(): void {
        this.shopUINode.active = false;
        // children[0] is input blocker, 1 is 
        this.shopPopup = this.shopUINode.children[1];

        this.coinPurchasePacks = [];

        this.spriteMap = new Map();
        this.spriteMap.set(SHOP_COIN_PACKS.FIVE_HUNDRED, this.coinPackofHundredSprite);
        this.spriteMap.set(SHOP_COIN_PACKS.HUNDRED, this.coinPackofHundredSprite);
        this.spriteMap.set(SHOP_COIN_PACKS.FIFTY, this.coinPackOfFiftySprite);

        this._instantiateShop();
    }

}