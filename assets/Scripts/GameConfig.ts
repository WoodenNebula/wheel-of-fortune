export const DEFAULT_GAME_PROPERTIES = {
    ENTER_LOADING_TIME: 5,
    EXIT_LOADING_TIME: 3
}

export enum SHOP_COIN_PACKS {
    FIFTY = 50,
    HUNDRED = 100,
    FIVE_HUNDRED = 500
}


export const COIN_COST_LOOKUP: { [key in keyof typeof SHOP_COIN_PACKS]: number } = {
    FIFTY: 99.99,
    HUNDRED: 199.99,
    FIVE_HUNDRED: 999.99
}

export const COIN_PURCHASE_PROPERTIES: {
    "name": string,
    "packType": SHOP_COIN_PACKS,
    "price": number,
    "spritePath": string,
}[] = [
        {
            "name": "PackOfFiveHundred",
            "packType": SHOP_COIN_PACKS.FIVE_HUNDRED,
            "spritePath": "assets\\Resources\\Textures\\filled-cart.png",
            "price": COIN_COST_LOOKUP.FIVE_HUNDRED,

        },
        {
            "name": "PackOfHundred",
            "packType": SHOP_COIN_PACKS.HUNDRED,
            "spritePath": "assets\\Resources\\Textures\\empty-cart.png",
            "price": COIN_COST_LOOKUP.HUNDRED
        },
        {
            "name": "PackOfFifty",
            "packType": SHOP_COIN_PACKS.FIFTY,
            "spritePath": "assets\\Resources\\Textures\\empty-cart-0.png",
            "price": COIN_COST_LOOKUP.FIFTY
        },
    ]