"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get PAGE_SIZE () {
        return PAGE_SIZE;
    },
    get getDescendantValues () {
        return getDescendantValues;
    }
});
async function getDescendantValues(block, params) {
    const keys = await block.getKeysPaged({
        ...params,
        pageSize: PAGE_SIZE
    });
    const items = await Promise.all(keys.map((key)=>block.get(key).then((value)=>({
                key,
                value
            }))));
    if (keys.length < PAGE_SIZE) {
        return {
            items,
            next: null
        };
    }
    return {
        items,
        next: {
            ...params,
            startKey: keys[PAGE_SIZE - 1]
        }
    };
}
const PAGE_SIZE = 1000;
