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
    get archive_v1_body () {
        return archive_v1_body;
    },
    get archive_v1_call () {
        return archive_v1_call;
    },
    get archive_v1_finalizedHeight () {
        return archive_v1_finalizedHeight;
    },
    get archive_v1_genesisHash () {
        return archive_v1_genesisHash;
    },
    get archive_v1_hashByHeight () {
        return archive_v1_hashByHeight;
    },
    get archive_v1_header () {
        return archive_v1_header;
    },
    get archive_v1_stopStorage () {
        return archive_v1_stopStorage;
    },
    get archive_v1_storage () {
        return archive_v1_storage;
    }
});
const _headstate = require("../../blockchain/head-state.js");
const _utilcrypto = require("@polkadot/util-crypto");
const _storagecommon = require("./storage-common.js");
const archive_v1_body = async (context, [hash])=>{
    const block = await context.chain.getBlock(hash);
    return block ? await block.extrinsics : null;
};
const archive_v1_call = async (context, [hash, method, callParameters])=>{
    const block = await context.chain.getBlock(hash);
    if (!block) {
        return null;
    }
    try {
        const resp = await block.call(method, [
            callParameters
        ]);
        return {
            success: true,
            value: resp.result
        };
    } catch (ex) {
        return {
            success: false,
            error: ex.message
        };
    }
};
const archive_v1_finalizedHeight = (context)=>{
    return Promise.resolve(context.chain.head.number);
};
const archive_v1_genesisHash = async (context)=>{
    const genesisBlock = await context.chain.getBlockAt(0);
    return genesisBlock.hash;
};
const archive_v1_hashByHeight = async (context, [height])=>{
    const block = await context.chain.getBlockAt(height);
    return block ? [
        block.hash
    ] : [];
};
const archive_v1_header = async (context, [hash])=>{
    const block = await context.chain.getBlock(hash);
    return block ? (await block.header).toHex() : null;
};
async function afterResponse(fn) {
    await new Promise((resolve)=>setTimeout(resolve, 0));
    fn();
}
/**
 * Contains the storage operations.
 */ const storageOperations = new Map();
const archive_v1_storage = async (context, [hash, items, _childTrie], { subscribe })=>{
    const operationId = (0, _headstate.randomId)();
    afterResponse(async ()=>{
        const block = await context.chain.getBlock(hash);
        if (!block) {
            storageOperations.get(operationId)?.callback({
                event: 'storageError',
                operationId,
                error: 'Block not found'
            });
            return;
        }
        const handleStorageItemRequest = async (sir)=>{
            switch(sir.type){
                case 'value':
                    {
                        const value = await block.get(sir.key);
                        if (value) {
                            storageOperations.get(operationId)?.callback({
                                event: 'storage',
                                key: sir.key,
                                value
                            });
                        }
                        return null;
                    }
                case 'hash':
                    {
                        const value = await block.get(sir.key);
                        if (value) {
                            storageOperations.get(operationId)?.callback({
                                event: 'storage',
                                key: sir.key,
                                hash
                            });
                        }
                        return null;
                    }
                case 'descendantsValues':
                    {
                        let items;
                        let next = {
                            prefix: sir.key,
                            startKey: '0x'
                        };
                        do {
                            ;
                            ({ items, next } = await (0, _storagecommon.getDescendantValues)(block, next));
                            for (const { key, value } of items){
                                storageOperations.get(operationId)?.callback({
                                    event: 'storage',
                                    key,
                                    value
                                });
                            }
                        }while (next !== null)
                        return null;
                    }
                case 'descendantsHashes':
                    {
                        let items;
                        let next = {
                            prefix: sir.key,
                            startKey: '0x'
                        };
                        do {
                            ;
                            ({ items, next } = await (0, _storagecommon.getDescendantValues)(block, next));
                            for (const { key, value } of items){
                                if (value === undefined) {
                                    continue;
                                }
                                storageOperations.get(operationId)?.callback({
                                    event: 'storage',
                                    key,
                                    hash: (0, _utilcrypto.blake2AsHex)(value)
                                });
                            }
                        }while (next !== null)
                        return null;
                    }
                case 'closestDescendantMerkleValue':
                    {
                        const subscription = storageOperations.get(operationId);
                        if (!subscription) return null;
                        if (!subscription.storageDiffs.has(sir.key)) {
                            // Set up a diff watch for this key
                            subscription.storageDiffs.set(sir.key, 0);
                        }
                        subscription.callback({
                            event: 'storage',
                            operationId,
                            items: [
                                {
                                    key: sir.key,
                                    closestDescendantMerkleValue: String(subscription.storageDiffs.get(sir.key))
                                }
                            ]
                        });
                        return null;
                    }
            }
        };
        await Promise.all(items.map(handleStorageItemRequest));
        storageOperations.get(operationId)?.callback({
            event: 'storageDone'
        });
    });
    const callback = subscribe('chainHead_v1_storageEvent', operationId, ()=>storageOperations.delete(operationId));
    storageOperations.set(operationId, {
        callback,
        hash,
        params: [],
        storageDiffs: new Map()
    });
    return operationId;
};
const archive_v1_stopStorage = async (_, [operationId], { unsubscribe })=>{
    unsubscribe(operationId);
    return null;
};
