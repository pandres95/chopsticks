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
    get createConfig () {
        return createConfig;
    },
    get defer () {
        return defer;
    },
    get sendTransaction () {
        return sendTransaction;
    },
    get setupContext () {
        return setupContext;
    },
    get setupContextWithConfig () {
        return setupContextWithConfig;
    },
    get setupNetworks () {
        return setupNetworks;
    },
    get testingPairs () {
        return testingPairs;
    },
    get testingSigners () {
        return testingSigners;
    }
});
const _chopsticks = require("@acala-network/chopsticks");
const _hdkd = require("@polkadot-labs/hdkd");
const _hdkdhelpers = require("@polkadot-labs/hdkd-helpers");
const _api = require("@polkadot/api");
const _keyring = require("@polkadot/keyring");
const _signer = require("polkadot-api/signer");
_export_star(require("./signFake.js"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
const logger = _chopsticks.defaultLogger.child({
    name: 'utils'
});
const createConfig = ({ endpoint, blockNumber, blockHash, wasmOverride, db, timeout, host, port, maxMemoryBlockCount, resume, runtimeLogLevel, allowUnresolvedImports, processQueuedMessages, saveBlock })=>{
    // random port if not specified
    port = port ?? Math.floor(Math.random() * 10000) + 10000;
    const config = {
        endpoint,
        host,
        port,
        block: blockNumber || blockHash,
        'mock-signature-host': true,
        'build-block-mode': _chopsticks.BuildBlockMode.Manual,
        'max-memory-block-count': maxMemoryBlockCount ?? 100,
        'runtime-log-level': runtimeLogLevel,
        db,
        'wasm-override': wasmOverride,
        timeout,
        resume: resume ?? false,
        'allow-unresolved-imports': allowUnresolvedImports,
        'process-queued-messages': processQueuedMessages,
        'save-block': saveBlock
    };
    return config;
};
const setupContext = async (option)=>{
    return setupContextWithConfig(createConfig(option));
};
const setupContextWithConfig = async ({ timeout, ...config })=>{
    const { chain, addr, close } = await (0, _chopsticks.setupWithServer)(config);
    const url = `ws://${addr}`;
    const ws = new _api.WsProvider(url, 3_000, undefined, timeout);
    const api = await _api.ApiPromise.create({
        provider: ws,
        noInitWarn: true
    });
    return {
        url,
        chain,
        ws,
        api,
        dev: {
            /** Creates a new block with optional parameters */ newBlock: (param)=>{
                return ws.send('dev_newBlock', [
                    param
                ]);
            },
            /** Sets storage values at a specific block */ setStorage: (values, blockHash)=>{
                return ws.send('dev_setStorage', [
                    values,
                    blockHash
                ]);
            },
            /** Moves blockchain time to a specific timestamp */ timeTravel: (date)=>{
                return ws.send('dev_timeTravel', [
                    date
                ]);
            },
            /** Sets the chain head to a specific block */ setHead: (hashOrNumber)=>{
                return ws.send('dev_setHead', [
                    hashOrNumber
                ]);
            }
        },
        /** Cleans up resources and closes connections */ async teardown () {
            await api.disconnect();
            await close();
        },
        /** Pauses execution and enables manual interaction through Polkadot.js apps */ async pause () {
            await ws.send('dev_setBlockBuildMode', [
                _chopsticks.BuildBlockMode.Instant
            ]);
            // log a bit later to ensure the message is visible
            setTimeout(()=>console.log(`Test paused. Polkadot.js apps URL: https://polkadot.js.org/apps/?rpc=${url}`), 100);
            return new Promise((_resolve)=>{}) // wait forever
            ;
        }
    };
};
const setupNetworks = async (networkOptions)=>{
    const ret = {};
    let wasmOverriden = false;
    for (const [name, options] of Object.entries(networkOptions)){
        const config = typeof options === 'string' ? await (0, _chopsticks.fetchConfig)(options) : options ?? await (0, _chopsticks.fetchConfig)(name);
        ret[name] = await setupContextWithConfig(config);
        wasmOverriden ||= config['wasm-override'] != null;
    }
    const relaychainName = Object.keys(ret).filter((x)=>[
            'polkadot',
            'kusama'
        ].includes(x.toLocaleLowerCase()))[0];
    const { [relaychainName]: relaychain, ...parachains } = ret;
    if (relaychain) {
        for (const parachain of Object.values(parachains)){
            await (0, _chopsticks.connectVertical)(relaychain.chain, parachain.chain);
        }
    }
    const parachainList = Object.values(parachains).map((i)=>i.chain);
    if (parachainList.length > 0) {
        await (0, _chopsticks.connectParachains)(parachainList, _chopsticks.environment.DISABLE_AUTO_HRMP);
    }
    if (wasmOverriden) {
        // trigger runtime upgrade if needed (due to wasm override)
        for (const chain of Object.values(ret)){
            await chain.dev.newBlock();
        }
        // handle xcm version message if needed (due to wasm override triggered xcm version upgrade)
        for (const chain of Object.values(ret)){
            await chain.dev.newBlock();
        }
    }
    return ret;
};
function defer() {
    const deferred = {};
    deferred.promise = new Promise((resolve, reject)=>{
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}
const sendTransaction = async (tx)=>{
    const signed = await tx;
    const deferred = defer();
    await signed.send((status)=>{
        logger.debug({
            status: status.status.toHuman()
        }, 'Transaction status');
        if (status.isInBlock || status.isFinalized) {
            deferred.resolve(status.events);
        }
        if (status.isError) {
            deferred.reject(status.status);
        }
    });
    return {
        events: deferred.promise
    };
};
const testingPairs = (keyringType = 'ed25519', ss58Format)=>{
    const keyringEth = (0, _keyring.createTestKeyring)({
        type: 'ethereum'
    });
    // default to ed25519 because sr25519 signature is non-deterministic
    const keyring = new _keyring.Keyring({
        type: keyringType,
        ss58Format
    });
    return {
        alice: keyring.addFromUri('//Alice'),
        bob: keyring.addFromUri('//Bob'),
        charlie: keyring.addFromUri('//Charlie'),
        dave: keyring.addFromUri('//Dave'),
        eve: keyring.addFromUri('//Eve'),
        alith: keyringEth.getPair('0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'),
        baltathar: keyringEth.getPair('0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0'),
        charleth: keyringEth.getPair('0x798d4Ba9baf0064Ec19eB4F0a1a45785ae9D6DFc'),
        dorothy: keyringEth.getPair('0x773539d4Ac0e786233D90A233654ccEE26a613D9'),
        ethan: keyringEth.getPair('0xFf64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB'),
        keyring,
        keyringEth
    };
};
const testingSigners = (keyringType = 'Ed25519')=>{
    const entropy = (0, _hdkdhelpers.mnemonicToEntropy)(_hdkdhelpers.DEV_PHRASE);
    const miniSecret = (0, _hdkdhelpers.entropyToMiniSecret)(entropy);
    const derive = keyringType === 'Ed25519' ? (0, _hdkd.ed25519CreateDerive)(miniSecret) : (0, _hdkd.sr25519CreateDerive)(miniSecret);
    // Create a PAPI polkadot signer given a derivation path e.g. "//Alice" or "//Bob".
    const polkadotSignerBuilder = (path, keyringType = 'Ed25519')=>{
        const hdkdKeyPair = derive(path);
        return (0, _signer.getPolkadotSigner)(hdkdKeyPair.publicKey, keyringType, hdkdKeyPair.sign);
    };
    return {
        alice: polkadotSignerBuilder('//Alice', keyringType),
        bob: polkadotSignerBuilder('//Bob', keyringType),
        charlie: polkadotSignerBuilder('//Charlie', keyringType),
        dave: polkadotSignerBuilder('//Dave', keyringType),
        eve: polkadotSignerBuilder('//Eve', keyringType),
        ferdie: polkadotSignerBuilder('//Ferdie', keyringType),
        polkadotSignerBuilder
    };
};
