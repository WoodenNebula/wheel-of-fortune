export namespace COINS {
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

    export function updateBalance(updateAmount: number): void {

        _count = Math.max(0, getCount() + updateAmount);
        setCount(_count);
    }
}