export namespace Coins {
    const LOCAL_STORAGE_KEYS = {
        COUNT: "CoinCount"
    }

    let _count: number = 0;

    export function setCount(val: number): void {
        _count = val;
        cc.sys.localStorage.setItem(LOCAL_STORAGE_KEYS.COUNT, val);
    }

    export function getCount(): number {
        let val: number = parseInt(cc.sys.localStorage.getItem(LOCAL_STORAGE_KEYS.COUNT));
        if (Number.isNaN(val))
            val = 0;

        setCount(val);

        return _count;
    }

    function _updateBalance(updateAmount: number): void {
        _count = Math.max(0, getCount() + updateAmount);
        setCount(_count);
    }


    export function updateCoins(delAmount: number, coinLabel: cc.Label, coinAnimLabel: cc.Label): void {
        cc.log(`Adding ${delAmount} coins!`);
        coinAnimLabel.node.active = true;
        if (delAmount < 0) {
            coinAnimLabel.node.color = cc.Color.RED;
            coinAnimLabel.string = delAmount.toString();
        }
        else if (delAmount > 0) {
            coinAnimLabel.node.color = cc.Color.GREEN;
            coinAnimLabel.string = "+" + delAmount.toString();
        }

        const animCtrl = coinAnimLabel.getComponent(cc.Animation);
        animCtrl.play();

        coinLabel.scheduleOnce(() => {
            _updateBalance(delAmount);
            syncCoinCountDisplay(coinLabel);
            coinAnimLabel.node.active = false;
        }, animCtrl.defaultClip.duration);
    }


    export function hasBetAmount(betAmount: number): boolean {
        const usrCoin = Coins.getCount();

        if (usrCoin < betAmount) {
            return false;
        } else {
            return true;
        }
    }


    export function syncCoinCountDisplay(coinLabel: cc.Label): void {
        coinLabel.string = `x${getCount()}`;
    }

    export function resetCoins(coinLabel: cc.Label, coinAnimLabel: cc.Label): void {
        updateCoins(-getCount(), coinLabel, coinAnimLabel);
        syncCoinCountDisplay(coinLabel);
    }
}