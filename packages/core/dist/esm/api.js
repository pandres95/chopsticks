import _ from 'lodash';
import { prefixedChildKey, splitChildKey, stripChildPrefix } from './utils/index.js';
/**
 * API class. Calls provider to get on-chain data.
 * Either `endpoint` or `genesis` porvider must be provided.
 *
 * @example Instantiate an API
 *
 * ```ts
 * const provider = new WsProvider(options.endpoint)
 * const api = new Api(provider)
 * await api.isReady
 * ```
 */ export class Api {
    #provider;
    #ready;
    #chain;
    #chainProperties;
    signedExtensions;
    #apiHooks = {};
    constructor(provider, signedExtensions){
        this.#provider = provider;
        this.signedExtensions = signedExtensions || {};
    }
    async disconnect() {
        return this.#provider.disconnect();
    }
    get isReady() {
        if (!this.#ready) {
            if (this.#provider['isReady']) {
                this.#ready = this.#provider['isReady'];
            } else {
                this.#ready = new Promise((resolve)=>{
                    if (this.#provider.hasSubscriptions) {
                        this.#provider.on('connected', resolve);
                        this.#provider.connect();
                    } else {
                        resolve();
                    }
                });
            }
        }
        return this.#ready;
    }
    get chain() {
        if (!this.#chain) {
            this.#chain = this.getSystemChain();
        }
        return this.#chain;
    }
    get chainProperties() {
        if (!this.#chainProperties) {
            this.#chainProperties = this.getSystemProperties();
        }
        return this.#chainProperties;
    }
    // Set the hook function to be called when api fetch endpoint.
    onFetching(fetching) {
        this.#apiHooks.fetching = fetching;
    }
    async send(method, params, isCacheable) {
        this.#apiHooks?.fetching?.();
        return this.#provider.send(method, params, isCacheable);
    }
    async getSystemName() {
        return this.send('system_name', []);
    }
    async getSystemProperties() {
        return this.send('system_properties', []);
    }
    async getSystemChain() {
        return this.send('system_chain', []);
    }
    async getBlockHash(blockNumber) {
        return this.send('chain_getBlockHash', Number.isInteger(blockNumber) ? [
            blockNumber
        ] : [], !!blockNumber);
    }
    async getHeader(hash) {
        return this.send('chain_getHeader', hash ? [
            hash
        ] : [], !!hash);
    }
    async getFinalizedHead() {
        return this.send('chain_getFinalizedHead', []);
    }
    async getBlock(hash) {
        return this.send('chain_getBlock', hash ? [
            hash
        ] : [], !!hash);
    }
    async getStorage(key, hash) {
        const [child, storageKey] = splitChildKey(key);
        if (child) {
            // child storage key, use childstate_getStorage
            const params = [
                child,
                storageKey
            ];
            if (hash) params.push(hash);
            return this.send('childstate_getStorage', params, !!hash);
        }
        // main storage key, use state_getStorage
        const params = [
            key
        ];
        if (hash) params.push(hash);
        return this.send('state_getStorage', params, !!hash);
    }
    async getKeysPaged(prefix, pageSize, startKey, hash) {
        const [child, storageKey] = splitChildKey(prefix);
        if (child) {
            // child storage key, use childstate_getKeysPaged
            // strip child prefix from startKey
            const params = [
                child,
                storageKey,
                pageSize,
                stripChildPrefix(startKey)
            ];
            if (hash) params.push(hash);
            return this.#provider.send('childstate_getKeysPaged', params, !!hash).then((keys)=>keys.map((key)=>prefixedChildKey(child, key)));
        }
        // main storage key, use state_getKeysPaged
        const params = [
            prefix,
            pageSize,
            startKey
        ];
        if (hash) params.push(hash);
        return this.send('state_getKeysPaged', params, !!hash);
    }
    async getStorageBatch(prefix, keys, hash) {
        const [child] = splitChildKey(prefix);
        if (child) {
            // child storage key, use childstate_getStorageEntries
            // strip child prefix from keys
            const params = [
                child,
                keys.map((key)=>stripChildPrefix(key))
            ];
            if (hash) params.push(hash);
            return this.#provider.send('childstate_getStorageEntries', params, !!hash).then((values)=>_.zip(keys, values));
        }
        // main storage key, use state_getStorageAt
        const params = [
            keys
        ];
        if (hash) params.push(hash);
        return this.#provider.send('state_queryStorageAt', params, !!hash).then((result)=>result[0]?.['changes'] || []);
    }
    async subscribeRemoteNewHeads(cb) {
        if (!this.#provider.hasSubscriptions) {
            throw new Error('subscribeRemoteNewHeads only works with subscriptions');
        }
        return this.#provider.subscribe('chain_newHead', 'chain_subscribeNewHeads', [], cb);
    }
    async subscribeRemoteFinalizedHeads(cb) {
        if (!this.#provider.hasSubscriptions) {
            throw new Error('subscribeRemoteFinalizedHeads only works with subscriptions');
        }
        return this.#provider.subscribe('chain_finalizedHead', 'chain_subscribeFinalizedHeads', [], cb);
    }
}
