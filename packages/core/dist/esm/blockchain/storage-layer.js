import _ from 'lodash';
import { defaultLogger } from '../logger.js';
import { CHILD_PREFIX_LENGTH, PREFIX_LENGTH, isPrefixedChildKey } from '../utils/index.js';
import KeyCache from '../utils/key-cache.js';
const logger = defaultLogger.child({
    name: 'layer'
});
const BATCH_SIZE = 1000;
export var StorageValueKind = /*#__PURE__*/ function(StorageValueKind) {
    StorageValueKind["Deleted"] = "Deleted";
    StorageValueKind["DeletedPrefix"] = "DeletedPrefix";
    return StorageValueKind;
}({});
export class RemoteStorageLayer {
    #api;
    #at;
    #db;
    #keyCache = new KeyCache(PREFIX_LENGTH);
    #defaultChildKeyCache = new KeyCache(CHILD_PREFIX_LENGTH);
    constructor(api, at, db){
        this.#api = api;
        this.#at = at;
        this.#db = db;
    }
    async get(key, _cache) {
        if (this.#db) {
            const res = await this.#db.queryStorage(this.#at, key);
            if (res) {
                return res.value ?? undefined;
            }
        }
        logger.trace({
            at: this.#at,
            key
        }, 'RemoteStorageLayer get');
        const data = await this.#api.getStorage(key, this.#at);
        this.#db?.saveStorage(this.#at, key, data);
        return data ?? undefined;
    }
    async findNextKey(prefix, startKey, _knownBest) {
        const keys = await this.getKeysPaged(prefix, 1, startKey);
        return keys[0];
    }
    async getKeysPaged(prefix, pageSize, startKey) {
        if (pageSize > BATCH_SIZE) throw new Error(`pageSize must be less or equal to ${BATCH_SIZE}`);
        logger.trace({
            at: this.#at,
            prefix,
            pageSize,
            startKey
        }, 'RemoteStorageLayer getKeysPaged');
        const isChild = isPrefixedChildKey(prefix);
        const minPrefixLen = isChild ? CHILD_PREFIX_LENGTH : PREFIX_LENGTH;
        // can't handle keyCache without prefix
        if (prefix === startKey || prefix.length < minPrefixLen || startKey.length < minPrefixLen) {
            return this.#api.getKeysPaged(prefix, pageSize, startKey, this.#at);
        }
        let batchComplete = false;
        const keysPaged = [];
        while(keysPaged.length < pageSize){
            const nextKey = isChild ? await this.#defaultChildKeyCache.next(startKey) : await this.#keyCache.next(startKey);
            if (nextKey) {
                keysPaged.push(nextKey);
                startKey = nextKey;
                continue;
            }
            // batch fetch was completed
            if (batchComplete) {
                break;
            }
            // fetch a batch of keys
            const batch = await this.#api.getKeysPaged(prefix, BATCH_SIZE, startKey, this.#at);
            batchComplete = batch.length < BATCH_SIZE;
            // feed the key cache
            if (batch.length > 0) {
                if (isChild) {
                    this.#defaultChildKeyCache.feed([
                        startKey,
                        ...batch
                    ]);
                } else {
                    this.#keyCache.feed([
                        startKey,
                        ...batch
                    ]);
                }
            }
            if (batch.length === 0) {
                break;
            }
            if (this.#db) {
                // filter out keys that are not in the db]
                const newBatch = [];
                for (const key of batch){
                    const res = await this.#db.queryStorage(this.#at, key);
                    if (res) {
                        continue;
                    }
                    newBatch.push(key);
                }
                if (newBatch.length > 0) {
                    // batch fetch storage values and save to db, they may be used later
                    this.#api.getStorageBatch(prefix, newBatch, this.#at).then((storage)=>{
                        for (const [key, value] of storage){
                            this.#db?.saveStorage(this.#at, key, value);
                        }
                    });
                }
            }
        }
        return keysPaged;
    }
}
export class StorageLayer {
    #store = new Map();
    #keys = [];
    #deletedPrefix = [];
    #parent;
    constructor(parent){
        this.#parent = parent;
    }
    #addKey(key) {
        const idx = _.sortedIndex(this.#keys, key);
        const key2 = this.#keys[idx];
        if (key === key2) {
            return;
        }
        this.#keys.splice(idx, 0, key);
    }
    #removeKey(key) {
        const idx = _.sortedIndex(this.#keys, key);
        const key2 = this.#keys[idx];
        if (key === key2) {
            this.#keys.splice(idx, 1);
        }
    }
    async get(key, cache) {
        if (this.#store.has(key)) {
            return this.#store.get(key);
        }
        if (this.#deletedPrefix.some((dp)=>key.startsWith(dp))) {
            return "Deleted";
        }
        if (this.#parent) {
            const val = this.#parent.get(key, false);
            if (cache) {
                this.#store.set(key, val);
            }
            return val;
        }
        return undefined;
    }
    set(key, value) {
        switch(value){
            case "Deleted":
                this.#store.set(key, "Deleted");
                this.#removeKey(key);
                break;
            case "DeletedPrefix":
                this.#deletedPrefix.push(key);
                for (const k of this.#keys){
                    if (k.startsWith(key)) {
                        this.#store.set(k, "Deleted");
                        this.#removeKey(k);
                    }
                }
                break;
            case undefined:
                this.#store.delete(key);
                this.#removeKey(key);
                break;
            default:
                this.#store.set(key, value);
                this.#addKey(key);
                break;
        }
    }
    setAll(values) {
        if (!Array.isArray(values)) {
            values = Object.entries(values);
        }
        for (const [key, value] of values){
            this.set(key, value || "Deleted");
        }
    }
    async findNextKey(prefix, startKey, knownBest) {
        const maybeBest = this.#keys.find((key)=>key.startsWith(prefix) && key > startKey);
        if (!knownBest) {
            knownBest = maybeBest;
        } else if (maybeBest && maybeBest < knownBest) {
            knownBest = maybeBest;
        }
        if (this.#parent && !this.#deletedPrefix.some((dp)=>dp === prefix)) {
            const parentBest = await this.#parent.findNextKey(prefix, startKey, knownBest);
            if (parentBest) {
                if (!maybeBest) {
                    return parentBest;
                }
                if (parentBest < maybeBest) {
                    return parentBest;
                }
            }
        }
        return knownBest;
    }
    async getKeysPaged(prefix, pageSize, startKey) {
        if (!startKey || startKey === '0x') {
            startKey = prefix;
        }
        const keys = [];
        while(keys.length < pageSize){
            const next = await this.findNextKey(prefix, startKey, undefined);
            if (!next) break;
            startKey = next;
            if (await this.get(next, false) === "Deleted") continue;
            keys.push(next);
        }
        return keys;
    }
    /**
   * Merge the storage layer into the given object, can be used to get sotrage diff.
   */ async mergeInto(into) {
        for (const [key, maybeValue] of this.#store){
            const value = await maybeValue;
            if (value === "Deleted") {
                into[key] = null;
            } else {
                into[key] = value;
            }
        }
    }
}
