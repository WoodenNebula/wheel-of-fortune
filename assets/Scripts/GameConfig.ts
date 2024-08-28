export const DEFAULT_GAME_PROPERTIES = {
    ENTER_LOADING_TIME: 5,
    EXIT_LOADING_TIME: 3
}

export const BET_AMOUNTS = [10, 100, 200, 300, 400, 500];


export enum WinTypes {
    RESPIN = "RESPIN",
    JACKPOT = "JACKPOT",
    NORMAL = "NORMAL"
}

export enum GameStates {
    IDLE,
    SPINNING,
    SPIN_COMPLETE
}

export enum SPIN_STATES {
    NO_SPIN = 0,
    ACCELERATING = 1,
    CONSTANT_SPEED = 2,
    DECELERATING = 3
}

export enum SHOP_COIN_PACKS {
    FIFTY = 50,
    HUNDRED = 100,
    FIVE_HUNDRED = 500
}

export type shopPackData = { price: number, amount: number };

export const SHOP_PACKS: { [key in keyof typeof SHOP_COIN_PACKS]: shopPackData } = {
    FIFTY: { price: 99.99, amount: 50 },
    HUNDRED: { price: 199.99, amount: 100 },
    FIVE_HUNDRED: { price: 999.99, amount: 500 },
}


export const COIN_PURCHASE_PROPERTIES: {
    "name": string,
    "packType": SHOP_COIN_PACKS,
    "spritePath": string,
    "price": number,
}[] = [
        {
            "name": "PackOfFiveHundred",
            "packType": SHOP_COIN_PACKS.FIVE_HUNDRED,
            "spritePath": "assets\\Resources\\Textures\\filled-cart.png",
            "price": SHOP_PACKS.FIVE_HUNDRED.price,

        },
        {
            "name": "PackOfHundred",
            "packType": SHOP_COIN_PACKS.HUNDRED,
            "spritePath": "assets\\Resources\\Textures\\empty-cart.png",
            "price": SHOP_PACKS.HUNDRED.price
        },
        {
            "name": "PackOfFifty",
            "packType": SHOP_COIN_PACKS.FIFTY,
            "spritePath": "assets\\Resources\\Textures\\empty-cart-0.png",
            "price": SHOP_PACKS.HUNDRED.price
        },
    ]


export type GameData = { name: string, index: number };

export const AVAILABLE_GAMES = {
    SINGLE_WHEEL_SPIN: { name: "SINGLE_WHEEL_SPIN", index: 0 },
    DOUBLE_WHEEL_SPIN: { name: "DOUBLE_WHEEL_SPIN", index: 1 },
}


export const WHEEL_SPECIAL_WINS = {
    RESPIN: { name: "RESPIN" },
    JACKPOT: { name: "JACKPOT", winAmount: 500 }
}