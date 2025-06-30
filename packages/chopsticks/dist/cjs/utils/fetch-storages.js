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
    get fetchStorages () {
        return fetchStorages;
    },
    get getPrefixesFromConfig () {
        return getPrefixesFromConfig;
    },
    get logger () {
        return logger;
    },
    get startFetchStorageWorker () {
        return startFetchStorageWorker;
    }
});
const _nodeworker_threads = /*#__PURE__*/ _interop_require_default(require("node:worker_threads"));
const _chopstickscore = require("@acala-network/chopsticks-core");
const _chopsticksdb = require("@acala-network/chopsticks-db");
const _api = require("@polkadot/api");
const _rpcprovider = require("@polkadot/rpc-provider");
const _types = require("@polkadot/types");
const _util = require("@polkadot/util");
const _utilcrypto = require("@polkadot/util-crypto");
const _comlink = require("comlink");
const _nodeadapter = /*#__PURE__*/ _interop_require_default(require("comlink/dist/umd/node-adapter.js"));
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const BATCH_SIZE = 1000;
const logger = _chopstickscore.defaultLogger.child({
    name: 'fetch-storages'
});
const getHexKeyWithArgs = (meta, storage, args)=>{
    const isPartialKey = args.length !== (meta.type.isPlain ? 0 : meta.type.asMap.hashers.length);
    const hexKey = isPartialKey && storage.creator.iterKey ? storage.creator.iterKey(...args).toHex() : (0, _util.u8aToHex)((0, _util.compactStripLength)(storage.creator(...args))[1]);
    return hexKey;
};
const checkPalletStorageByName = (meta, palletName, storageName)=>{
    const pallet = meta.query[(0, _util.stringCamelCase)(palletName)];
    if (!pallet) throw Error(`Cannot find pallet ${palletName}`);
    let storage;
    if (storageName) {
        storage = pallet[(0, _util.stringCamelCase)(storageName)];
        if (!storage) throw Error(`Cannot find storage ${storageName} in pallet ${palletName}`);
    }
    return {
        pallet,
        storage
    };
};
const getPrefixesFromConfig = async (config, api)=>{
    logger.debug({
        config
    }, 'received fetch-storage config');
    const prefixes = [];
    const metadata = await api.rpc.state.getMetadata();
    const expandMeta = (0, _types.expandMetadata)(metadata.registry, metadata);
    for (const item of config){
        if (typeof item === 'string' && item.startsWith('0x')) {
            // hex
            prefixes.push(item);
        } else if (typeof item === 'string' && !item.includes('.')) {
            // pallet
            checkPalletStorageByName(expandMeta, item);
            prefixes.push((0, _utilcrypto.xxhashAsHex)(item, 128));
        } else if (typeof item === 'string' && item.includes('.')) {
            // pallet.storage
            const [palletName, storageName] = item.split('.');
            const { storage } = checkPalletStorageByName(expandMeta, palletName, storageName);
            prefixes.push((0, _util.u8aToHex)(storage.keyPrefix()));
        } else if (typeof item === 'object') {
            // object cases
            const [objectKey, objectVal] = Object.entries(item)[0];
            if (typeof objectVal === 'string') {
                // - System: Account
                const { storage } = checkPalletStorageByName(expandMeta, objectKey, objectVal);
                prefixes.push((0, _util.u8aToHex)(storage.keyPrefix()));
            } else if (objectKey.includes('.') && Array.isArray(objectVal)) {
                // - Pallet.Storage: [xxx, ...]
                const [pallet, storage] = objectKey.split('.').map((x)=>(0, _util.stringCamelCase)(x));
                checkPalletStorageByName(expandMeta, pallet, storage);
                const storageEntry = api.query[pallet][storage];
                const meta = storageEntry.creator.meta;
                const args = objectVal;
                const hexKey = getHexKeyWithArgs(meta, storageEntry, args);
                prefixes.push(hexKey);
            } else if (!Array.isArray(objectVal)) {
                // - Tokens:
                //     Accounts: [xxx, ...]
                const pallet = (0, _util.stringCamelCase)(objectKey);
                const [storage, args] = Object.entries(objectVal)[0];
                checkPalletStorageByName(expandMeta, pallet, storage);
                const storageEntry = api.query[pallet][(0, _util.stringCamelCase)(storage)];
                const meta = storageEntry.creator.meta;
                const hexKey = getHexKeyWithArgs(meta, storageEntry, args);
                prefixes.push(hexKey);
            } else {
                throw new Error(`Unsupported fetch-storage config: ${objectKey}.${objectVal}`);
            }
        }
    }
    logger.debug({
        prefixes
    }, 'prefixes from config');
    return prefixes;
};
const fetchStorages = async ({ block, endpoint, dbPath, config })=>{
    if (!endpoint) throw new Error('endpoint is required');
    const provider = new _rpcprovider.WsProvider(endpoint, 3_000);
    const apiPromise = new _api.ApiPromise({
        provider,
        noInitWarn: true
    });
    await apiPromise.isReady;
    let blockHash;
    if (block == null) {
        const lastHdr = await apiPromise.rpc.chain.getHeader();
        blockHash = lastHdr.hash.toString();
    } else if (typeof block === 'string' && block.startsWith('0x')) {
        blockHash = block;
    } else if (Number.isInteger(+block)) {
        blockHash = await apiPromise.rpc.chain.getBlockHash(Number(block)).then((h)=>h.toString());
    } else {
        throw new Error(`Invalid block number or hash: ${block}`);
    }
    const prefixesFromConfig = await getPrefixesFromConfig(config, apiPromise);
    const uniqPrefixes = _lodash.default.uniq(prefixesFromConfig);
    const processPrefixes = (prefixes)=>{
        prefixes.sort();
        const result = [];
        for (const prefix of prefixes){
            // check if the current prefix is not a prefix of any added prefix
            if (!result.some((prev)=>prefix.startsWith(prev))) {
                result.push(prefix);
            }
        }
        return result;
    };
    const prefixes = processPrefixes(uniqPrefixes);
    if (!prefixes.length) throw new Error('No prefixes to fetch');
    const signedBlock = await apiPromise.rpc.chain.getBlock(blockHash);
    const blockNumber = signedBlock.block.header.number.toNumber();
    const chainName = (await apiPromise.rpc.system.chain()).toString();
    const finalDbPath = dbPath ?? `db-${chainName}-${blockNumber}.sqlite`;
    const api = new _chopstickscore.Api(provider);
    const db = new _chopsticksdb.SqliteDatabase(finalDbPath);
    logger.info(`Storages will be saved at ${finalDbPath}, use '--db=${finalDbPath} --block=${blockNumber}' to apply it later on`);
    for (const prefix of prefixes){
        let startKey = '0x';
        let hasMorePages = true;
        while(hasMorePages){
            logger.debug({
                prefix,
                startKey
            }, 'fetching keys');
            const keysPage = await api.getKeysPaged(prefix, BATCH_SIZE, startKey, blockHash);
            logger.debug({
                prefix,
                startKey
            }, `fetched ${keysPage.length} keys`);
            if (!keysPage.length) break;
            startKey = keysPage[keysPage.length - 1];
            if (!keysPage || keysPage.length < BATCH_SIZE) {
                hasMorePages = false;
            }
            logger.debug({
                prefix
            }, 'fetching storages');
            const storages = await api.getStorageBatch(prefix, keysPage, blockHash);
            logger.debug({
                prefix
            }, `fetched ${storages.length} storages`);
            const keyValueEntries = storages.map(([key, value])=>({
                    blockHash,
                    key,
                    value
                }));
            await db.saveStorageBatch(keyValueEntries);
            logger.debug({
                prefix
            }, `saved ${storages.length} storages ✅`);
        }
    }
    logger.info(`Storages are saved at ${finalDbPath}, use '--db=${finalDbPath} --block=${blockNumber}' to apply it`);
};
const startFetchStorageWorker = async (options)=>{
    if (!options.config) return null;
    const worker = new _nodeworker_threads.default.Worker(new URL('./fetch-storages-worker.js', require("url").pathToFileURL(__filename).toString()), {
        name: 'fetch-storages-worker'
    });
    const workerApi = (0, _comlink.wrap)((0, _nodeadapter.default)(worker));
    workerApi.startFetch(options);
    const terminate = async ()=>{
        workerApi[_comlink.releaseProxy]();
        await worker.terminate();
    };
    return {
        worker: workerApi,
        terminate
    };
};
