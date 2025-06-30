"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "Api", {
    enumerable: true,
    get: function() {
        return Api;
    }
});
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _index = require("./utils/index.js");
function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _provider = /*#__PURE__*/ new WeakMap(), _ready = /*#__PURE__*/ new WeakMap(), _chain = /*#__PURE__*/ new WeakMap(), _chainProperties = /*#__PURE__*/ new WeakMap(), _apiHooks = /*#__PURE__*/ new WeakMap();
class Api {
    async disconnect() {
        return _class_private_field_get(this, _provider).disconnect();
    }
    get isReady() {
        if (!_class_private_field_get(this, _ready)) {
            if (_class_private_field_get(this, _provider)['isReady']) {
                _class_private_field_set(this, _ready, _class_private_field_get(this, _provider)['isReady']);
            } else {
                _class_private_field_set(this, _ready, new Promise((resolve)=>{
                    if (_class_private_field_get(this, _provider).hasSubscriptions) {
                        _class_private_field_get(this, _provider).on('connected', resolve);
                        _class_private_field_get(this, _provider).connect();
                    } else {
                        resolve();
                    }
                }));
            }
        }
        return _class_private_field_get(this, _ready);
    }
    get chain() {
        if (!_class_private_field_get(this, _chain)) {
            _class_private_field_set(this, _chain, this.getSystemChain());
        }
        return _class_private_field_get(this, _chain);
    }
    get chainProperties() {
        if (!_class_private_field_get(this, _chainProperties)) {
            _class_private_field_set(this, _chainProperties, this.getSystemProperties());
        }
        return _class_private_field_get(this, _chainProperties);
    }
    // Set the hook function to be called when api fetch endpoint.
    onFetching(fetching) {
        _class_private_field_get(this, _apiHooks).fetching = fetching;
    }
    async send(method, params, isCacheable) {
        _class_private_field_get(this, _apiHooks)?.fetching?.();
        return _class_private_field_get(this, _provider).send(method, params, isCacheable);
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
        const [child, storageKey] = (0, _index.splitChildKey)(key);
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
        const [child, storageKey] = (0, _index.splitChildKey)(prefix);
        if (child) {
            // child storage key, use childstate_getKeysPaged
            // strip child prefix from startKey
            const params = [
                child,
                storageKey,
                pageSize,
                (0, _index.stripChildPrefix)(startKey)
            ];
            if (hash) params.push(hash);
            return _class_private_field_get(this, _provider).send('childstate_getKeysPaged', params, !!hash).then((keys)=>keys.map((key)=>(0, _index.prefixedChildKey)(child, key)));
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
        const [child] = (0, _index.splitChildKey)(prefix);
        if (child) {
            // child storage key, use childstate_getStorageEntries
            // strip child prefix from keys
            const params = [
                child,
                keys.map((key)=>(0, _index.stripChildPrefix)(key))
            ];
            if (hash) params.push(hash);
            return _class_private_field_get(this, _provider).send('childstate_getStorageEntries', params, !!hash).then((values)=>_lodash.default.zip(keys, values));
        }
        // main storage key, use state_getStorageAt
        const params = [
            keys
        ];
        if (hash) params.push(hash);
        return _class_private_field_get(this, _provider).send('state_queryStorageAt', params, !!hash).then((result)=>result[0]?.['changes'] || []);
    }
    async subscribeRemoteNewHeads(cb) {
        if (!_class_private_field_get(this, _provider).hasSubscriptions) {
            throw new Error('subscribeRemoteNewHeads only works with subscriptions');
        }
        return _class_private_field_get(this, _provider).subscribe('chain_newHead', 'chain_subscribeNewHeads', [], cb);
    }
    async subscribeRemoteFinalizedHeads(cb) {
        if (!_class_private_field_get(this, _provider).hasSubscriptions) {
            throw new Error('subscribeRemoteFinalizedHeads only works with subscriptions');
        }
        return _class_private_field_get(this, _provider).subscribe('chain_finalizedHead', 'chain_subscribeFinalizedHeads', [], cb);
    }
    constructor(provider, signedExtensions){
        _class_private_field_init(this, _provider, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _ready, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _chain, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _chainProperties, {
            writable: true,
            value: void 0
        });
        _define_property(this, "signedExtensions", void 0);
        _class_private_field_init(this, _apiHooks, {
            writable: true,
            value: {}
        });
        _class_private_field_set(this, _provider, provider);
        this.signedExtensions = signedExtensions || {};
    }
}
