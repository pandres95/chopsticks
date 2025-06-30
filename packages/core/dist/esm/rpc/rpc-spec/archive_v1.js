import { randomId } from '../../blockchain/head-state.js';
import { blake2AsHex } from '@polkadot/util-crypto';
import { getDescendantValues } from './storage-common.js';
/**
 * Retrieve the body of a specific block
 *
 * @param context
 * @param params - [`hash`]
 *
 * @return An array of the SCALE-encoded transactions of a block, or `null` if the block is not found.
 */ export const archive_v1_body = async (context, [hash])=>{
    const block = await context.chain.getBlock(hash);
    return block ? await block.extrinsics : null;
};
/**
 * Perform a runtime call for a block
 *
 * @param context
 * @param params - [`hash`, `function`, `callParameters`]
 *
 * @return A {@link CallResult} with the result of the runtime call, or `null` if the block
 * is not found.
 */ export const archive_v1_call = async (context, [hash, method, callParameters])=>{
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
/**
 * Retrieve the height of the finalized block.
 *
 * @param context
 *
 * @return The `number` of the height of the head (a.k.a. finalized) block.
 */ export const archive_v1_finalizedHeight = (context)=>{
    return Promise.resolve(context.chain.head.number);
};
/**
 * Retrieve the genesis hash
 *
 * @param context
 *
 * @return An {@link HexString} with the hash of the genesis block.
 */ export const archive_v1_genesisHash = async (context)=>{
    const genesisBlock = await context.chain.getBlockAt(0);
    return genesisBlock.hash;
};
/**
 * Retrieve the hash of a specific height
 *
 * @param context
 * @param params - [`height`]
 *
 * @return An array of {@link HexString} with the hashes of the blocks associated to the
 * given height.
 */ export const archive_v1_hashByHeight = async (context, [height])=>{
    const block = await context.chain.getBlockAt(height);
    return block ? [
        block.hash
    ] : [];
};
/**
 * Retrieve the header for a specific block
 *
 * @param context
 * @param params - [`hash`]
 *
 * @return SCALE-encoded header, or `null` if the block is not found.
 */ export const archive_v1_header = async (context, [hash])=>{
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
/**
 * Query the storage for a given block
 *
 * @param context
 * @param params - [`hash`, `items`, `childTrie`]
 *
 * @return the operationId to capture the notifications where to receive the result
 *
 * The query type `closestDescendantMerkleValue` is not up to spec.
 * According to the spec, the result should be the Merkle value of the key or
 * the closest descendant of the key.
 * As chopsticks doesn't have direct access to the Merkle tree, it will return
 * a string that will change every time that one of the descendant changes, but
 * it won't be the actual Merkle value.
 * This should be enough for applications that don't rely on the actual Merkle
 * value, but just use it to detect for storage changes.
 */ export const archive_v1_storage = async (context, [hash, items, _childTrie], { subscribe })=>{
    const operationId = randomId();
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
                            ({ items, next } = await getDescendantValues(block, next));
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
                            ({ items, next } = await getDescendantValues(block, next));
                            for (const { key, value } of items){
                                if (value === undefined) {
                                    continue;
                                }
                                storageOperations.get(operationId)?.callback({
                                    event: 'storage',
                                    key,
                                    hash: blake2AsHex(value)
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
export const archive_v1_stopStorage = async (_, [operationId], { unsubscribe })=>{
    unsubscribe(operationId);
    return null;
};
