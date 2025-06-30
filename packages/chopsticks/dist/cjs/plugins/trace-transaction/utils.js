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
    get fetchEVMTransaction () {
        return fetchEVMTransaction;
    },
    get fetchRuntime () {
        return fetchRuntime;
    },
    get prepareBlock () {
        return prepareBlock;
    },
    get traceCalls () {
        return traceCalls;
    },
    get traceVM () {
        return traceVM;
    }
});
const _chopstickscore = require("@acala-network/chopsticks-core");
const _utilcrypto = require("@polkadot/util-crypto");
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _override = require("../../utils/override.js");
const _table = require("./table.js");
const _types = require("./types.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const fetchRuntime = async (runtimeVersion)=>{
    const GIHTUB_RELEASES_API = 'https://api.github.com/repos/AcalaNetwork/Acala/releases';
    const assetName = `${runtimeVersion.specName}_runtime_tracing_${runtimeVersion.specVersion}.compact.compressed.wasm`;
    _chopstickscore.pinoLogger.info({
        assetName
    }, 'Search for runtime with tracing feature from Github releases ...');
    const releases = await fetch(GIHTUB_RELEASES_API).then((res)=>res.json());
    for (const release of releases){
        if (release.assets) {
            for (const asset of release.assets){
                if (asset.name === assetName) {
                    _chopstickscore.pinoLogger.info({
                        url: asset.browser_download_url
                    }, 'Downloading ...');
                    const runtime = await fetch(asset.browser_download_url).then((x)=>x.arrayBuffer());
                    return Buffer.from(runtime);
                }
            }
        }
    }
};
const fetchEVMTransaction = async (runtimeVersion, txHash)=>{
    const ACALA_ETH_RPC = 'https://eth-rpc-acala.aca-api.network';
    const KARURA_ETH_RPC = 'https://eth-rpc-karura.aca-api.network';
    let ethRpc;
    if (runtimeVersion.specName.includes('acala')) {
        ethRpc = ACALA_ETH_RPC;
    } else if (runtimeVersion.specName.includes('karura')) {
        ethRpc = KARURA_ETH_RPC;
    } else {
        throw new Error(`Unsupported chain. Only Acala and Karura are supported`);
    }
    _chopstickscore.pinoLogger.info(`Fetching EVM transaction ...`);
    const response = await fetch(ethRpc, {
        headers: [
            [
                'Content-Type',
                'application/json'
            ],
            [
                'Accept',
                'application/json'
            ]
        ],
        method: 'POST',
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionByHash',
            params: [
                txHash
            ]
        })
    });
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }
    return data.result;
};
const traceVM = async (block, extrinsic, pageSize = 50_000, disableStack = false, enableMemory = true)=>{
    const meta = await block.meta;
    (0, _types.registerTypes)(meta.registry);
    let page = 0;
    let traceNextPage = true;
    let steps = [];
    while(traceNextPage){
        _chopstickscore.pinoLogger.info(`VM trace page ${page} ...`);
        const tracerConfig = meta.registry.createType('TracerConfig', {
            OpcodeTracer: {
                page,
                pageSize,
                disableStack,
                enableMemory
            }
        }).toHex();
        const taskResponse = await block.call('EVMTraceApi_trace_extrinsic', [
            extrinsic,
            tracerConfig
        ]);
        const outcome = meta.registry.createType('Result<TraceOutcome, TransactionValidityError>', taskResponse.result).asOk.toJSON();
        if (!('steps' in outcome)) {
            throw new Error('Invalid trace outcome');
        }
        steps = steps.concat(outcome.steps.map((step)=>({
                ...step,
                op: (0, _table.opName)(step.op),
                // transform memory to 64 bytes chunks
                memory: step.memory ? step.memory.map((chunk, idx)=>{
                    // remove 0x prefix
                    const slice = chunk.slice(2);
                    // make sure each chunk is 64 bytes
                    if (slice.length < 64 && idx + 1 < step.memory.length) {
                        return slice.padStart(64, '0');
                    }
                    return slice;
                }) : null
            })));
        page += 1;
        traceNextPage = outcome.steps.length === pageSize;
    }
    return steps;
};
const traceCalls = async (block, extrinsic)=>{
    const meta = await block.meta;
    (0, _types.registerTypes)(meta.registry);
    const tracerConfig = meta.registry.createType('TracerConfig', {
        CallTracer: null
    }).toHex();
    const taskResponse = await block.call('EVMTraceApi_trace_extrinsic', [
        extrinsic,
        tracerConfig
    ]);
    const outcome = meta.registry.createType('Result<TraceOutcome, TransactionValidityError>', taskResponse.result).asOk.toJSON();
    if (!('calls' in outcome)) {
        throw new Error('Invalid trace outcome');
    }
    return outcome.calls;
};
const prepareBlock = async (chain, blockHashNumber, txHash, wasmPath)=>{
    let wasm = wasmPath;
    const block = typeof blockHashNumber === 'number' ? await chain.getBlockAt(blockHashNumber) : await chain.getBlock(blockHashNumber);
    if (!block) {
        throw new Error(`Block not found ${blockHashNumber}`);
    }
    const header = await block.header;
    const parent = await chain.getBlock(header.parentHash.toHex());
    if (!parent) {
        throw new Error(`Block not found ${blockHashNumber}`);
    }
    await chain.setHead(parent);
    // override wasm with tracing feature
    if (typeof wasm === 'string') {
        await (0, _override.overrideWasm)(chain, wasm);
    } else {
        // Fetch runtime wasm with tracing feature from Github releases
        if (!wasm) {
            wasm = await fetchRuntime(await chain.head.runtimeVersion);
            if (!wasm) {
                throw new Error('Could not find runtime with tracing feature from Github releasesw. Make sure to manually override runtime wasm built with `tracing` feature enabled.');
            }
        }
        chain.head.setWasm(`0x${wasm.toString('hex')}`);
    }
    const runtimeVersion = await chain.head.runtimeVersion;
    _chopstickscore.pinoLogger.info(`${_lodash.default.capitalize(runtimeVersion.specName)} specVersion: ${runtimeVersion.specVersion}`);
    const extrinsics = await block.extrinsics;
    const txIndex = extrinsics.findIndex((tx)=>(0, _utilcrypto.blake2AsHex)(tx) === txHash);
    const tracingBlock = new _chopstickscore.Block(chain, block.number, block.hash, parent, {
        header,
        extrinsics: [],
        storage: parent.storage
    });
    _chopstickscore.pinoLogger.info(`Preparing block ${chain.head.number + 1} ...`);
    const { storageDiff } = await tracingBlock.call('Core_initialize_block', [
        header.toHex()
    ]);
    tracingBlock.pushStorageLayer().setAll(storageDiff);
    for (const extrinsic of extrinsics.slice(0, txIndex)){
        const { storageDiff } = await tracingBlock.call('BlockBuilder_apply_extrinsic', [
            extrinsic
        ]);
        tracingBlock.pushStorageLayer().setAll(storageDiff);
    }
    return {
        tracingBlock,
        extrinsic: extrinsics[txIndex]
    };
};
