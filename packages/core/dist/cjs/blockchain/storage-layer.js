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
    get RemoteStorageLayer () {
        return RemoteStorageLayer;
    },
    get StorageLayer () {
        return StorageLayer;
    },
    get StorageValueKind () {
        return StorageValueKind;
    }
});
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _logger = require("../logger.js");
const _index = require("../utils/index.js");
const _keycache = /*#__PURE__*/ _interop_require_default(require("../utils/key-cache.js"));
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
function _class_private_method_get(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
}
function _class_private_method_init(obj, privateSet) {
    _check_private_redeclaration(obj, privateSet);
    privateSet.add(obj);
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const logger = _logger.defaultLogger.child({
    name: 'layer'
});
const BATCH_SIZE = 1000;
var StorageValueKind = /*#__PURE__*/ function(StorageValueKind) {
    StorageValueKind["Deleted"] = "Deleted";
    StorageValueKind["DeletedPrefix"] = "DeletedPrefix";
    return StorageValueKind;
}({});
var _api = /*#__PURE__*/ new WeakMap(), _at = /*#__PURE__*/ new WeakMap(), _db = /*#__PURE__*/ new WeakMap(), _keyCache = /*#__PURE__*/ new WeakMap(), _defaultChildKeyCache = /*#__PURE__*/ new WeakMap();
class RemoteStorageLayer {
    async get(key, _cache) {
        if (_class_private_field_get(this, _db)) {
            const res = await _class_private_field_get(this, _db).queryStorage(_class_private_field_get(this, _at), key);
            if (res) {
                return res.value ?? undefined;
            }
        }
        logger.trace({
            at: _class_private_field_get(this, _at),
            key
        }, 'RemoteStorageLayer get');
        const data = await _class_private_field_get(this, _api).getStorage(key, _class_private_field_get(this, _at));
        _class_private_field_get(this, _db)?.saveStorage(_class_private_field_get(this, _at), key, data);
        return data ?? undefined;
    }
    async findNextKey(prefix, startKey, _knownBest) {
        const keys = await this.getKeysPaged(prefix, 1, startKey);
        return keys[0];
    }
    async getKeysPaged(prefix, pageSize, startKey) {
        if (pageSize > BATCH_SIZE) throw new Error(`pageSize must be less or equal to ${BATCH_SIZE}`);
        logger.trace({
            at: _class_private_field_get(this, _at),
            prefix,
            pageSize,
            startKey
        }, 'RemoteStorageLayer getKeysPaged');
        const isChild = (0, _index.isPrefixedChildKey)(prefix);
        const minPrefixLen = isChild ? _index.CHILD_PREFIX_LENGTH : _index.PREFIX_LENGTH;
        // can't handle keyCache without prefix
        if (prefix === startKey || prefix.length < minPrefixLen || startKey.length < minPrefixLen) {
            return _class_private_field_get(this, _api).getKeysPaged(prefix, pageSize, startKey, _class_private_field_get(this, _at));
        }
        let batchComplete = false;
        const keysPaged = [];
        while(keysPaged.length < pageSize){
            const nextKey = isChild ? await _class_private_field_get(this, _defaultChildKeyCache).next(startKey) : await _class_private_field_get(this, _keyCache).next(startKey);
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
            const batch = await _class_private_field_get(this, _api).getKeysPaged(prefix, BATCH_SIZE, startKey, _class_private_field_get(this, _at));
            batchComplete = batch.length < BATCH_SIZE;
            // feed the key cache
            if (batch.length > 0) {
                if (isChild) {
                    _class_private_field_get(this, _defaultChildKeyCache).feed([
                        startKey,
                        ...batch
                    ]);
                } else {
                    _class_private_field_get(this, _keyCache).feed([
                        startKey,
                        ...batch
                    ]);
                }
            }
            if (batch.length === 0) {
                break;
            }
            if (_class_private_field_get(this, _db)) {
                // filter out keys that are not in the db]
                const newBatch = [];
                for (const key of batch){
                    const res = await _class_private_field_get(this, _db).queryStorage(_class_private_field_get(this, _at), key);
                    if (res) {
                        continue;
                    }
                    newBatch.push(key);
                }
                if (newBatch.length > 0) {
                    // batch fetch storage values and save to db, they may be used later
                    _class_private_field_get(this, _api).getStorageBatch(prefix, newBatch, _class_private_field_get(this, _at)).then((storage)=>{
                        for (const [key, value] of storage){
                            _class_private_field_get(this, _db)?.saveStorage(_class_private_field_get(this, _at), key, value);
                        }
                    });
                }
            }
        }
        return keysPaged;
    }
    constructor(api, at, db){
        _class_private_field_init(this, _api, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _at, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _db, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _keyCache, {
            writable: true,
            value: new _keycache.default(_index.PREFIX_LENGTH)
        });
        _class_private_field_init(this, _defaultChildKeyCache, {
            writable: true,
            value: new _keycache.default(_index.CHILD_PREFIX_LENGTH)
        });
        _class_private_field_set(this, _api, api);
        _class_private_field_set(this, _at, at);
        _class_private_field_set(this, _db, db);
    }
}
var _store = /*#__PURE__*/ new WeakMap(), _keys = /*#__PURE__*/ new WeakMap(), _deletedPrefix = /*#__PURE__*/ new WeakMap(), _parent = /*#__PURE__*/ new WeakMap(), _addKey = /*#__PURE__*/ new WeakSet(), _removeKey = /*#__PURE__*/ new WeakSet();
class StorageLayer {
    async get(key, cache) {
        if (_class_private_field_get(this, _store).has(key)) {
            return _class_private_field_get(this, _store).get(key);
        }
        if (_class_private_field_get(this, _deletedPrefix).some((dp)=>key.startsWith(dp))) {
            return "Deleted";
        }
        if (_class_private_field_get(this, _parent)) {
            const val = _class_private_field_get(this, _parent).get(key, false);
            if (cache) {
                _class_private_field_get(this, _store).set(key, val);
            }
            return val;
        }
        return undefined;
    }
    set(key, value) {
        switch(value){
            case "Deleted":
                _class_private_field_get(this, _store).set(key, "Deleted");
                _class_private_method_get(this, _removeKey, removeKey).call(this, key);
                break;
            case "DeletedPrefix":
                _class_private_field_get(this, _deletedPrefix).push(key);
                for (const k of _class_private_field_get(this, _keys)){
                    if (k.startsWith(key)) {
                        _class_private_field_get(this, _store).set(k, "Deleted");
                        _class_private_method_get(this, _removeKey, removeKey).call(this, k);
                    }
                }
                break;
            case undefined:
                _class_private_field_get(this, _store).delete(key);
                _class_private_method_get(this, _removeKey, removeKey).call(this, key);
                break;
            default:
                _class_private_field_get(this, _store).set(key, value);
                _class_private_method_get(this, _addKey, addKey).call(this, key);
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
        const maybeBest = _class_private_field_get(this, _keys).find((key)=>key.startsWith(prefix) && key > startKey);
        if (!knownBest) {
            knownBest = maybeBest;
        } else if (maybeBest && maybeBest < knownBest) {
            knownBest = maybeBest;
        }
        if (_class_private_field_get(this, _parent) && !_class_private_field_get(this, _deletedPrefix).some((dp)=>dp === prefix)) {
            const parentBest = await _class_private_field_get(this, _parent).findNextKey(prefix, startKey, knownBest);
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
        for (const [key, maybeValue] of _class_private_field_get(this, _store)){
            const value = await maybeValue;
            if (value === "Deleted") {
                into[key] = null;
            } else {
                into[key] = value;
            }
        }
    }
    constructor(parent){
        _class_private_method_init(this, _addKey);
        _class_private_method_init(this, _removeKey);
        _class_private_field_init(this, _store, {
            writable: true,
            value: new Map()
        });
        _class_private_field_init(this, _keys, {
            writable: true,
            value: []
        });
        _class_private_field_init(this, _deletedPrefix, {
            writable: true,
            value: []
        });
        _class_private_field_init(this, _parent, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _parent, parent);
    }
}
function addKey(key) {
    const idx = _lodash.default.sortedIndex(_class_private_field_get(this, _keys), key);
    const key2 = _class_private_field_get(this, _keys)[idx];
    if (key === key2) {
        return;
    }
    _class_private_field_get(this, _keys).splice(idx, 0, key);
}
function removeKey(key) {
    const idx = _lodash.default.sortedIndex(_class_private_field_get(this, _keys), key);
    const key2 = _class_private_field_get(this, _keys)[idx];
    if (key === key2) {
        _class_private_field_get(this, _keys).splice(idx, 1);
    }
}
