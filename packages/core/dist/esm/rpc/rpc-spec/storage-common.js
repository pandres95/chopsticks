export async function getDescendantValues(block, params) {
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
export const PAGE_SIZE = 1000;
