import { type StorageValues } from '@acala-network/chopsticks';
import type { NewBlockParams } from '@acala-network/chopsticks-core/rpc/dev/new-block.js';
import type { Config } from '@acala-network/chopsticks/schema/index.js';
import { ApiPromise, WsProvider } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { Keyring } from '@polkadot/keyring';
import type { Codec } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
export * from './signFake.js';
/**
 * Configuration options for setting up a blockchain network instance
 */
export type SetupOption = {
    /** WebSocket endpoint(s) for connecting to the network */
    endpoint: string | string[];
    /** Specific block number to start from */
    blockNumber?: number;
    /** Specific block hash to start from */
    blockHash?: HexString;
    /** Path to override WASM runtime */
    wasmOverride?: string;
    /** Path to database file */
    db?: string;
    /** Connection timeout in milliseconds */
    timeout?: number;
    /** Host address to bind the server to */
    host?: string;
    /** Port number to bind the server to */
    port?: number;
    /** Maximum number of blocks to keep in memory */
    maxMemoryBlockCount?: number;
    /** Resume from a previous state (block hash or number) */
    resume?: boolean | HexString | number;
    /** Runtime log level (0-5) */
    runtimeLogLevel?: number;
    /** Allow unresolved imports in runtime */
    allowUnresolvedImports?: boolean;
    /** Process queued XCM messages */
    processQueuedMessages?: boolean;
    /** Whether to save newly created blocks to the database */
    saveBlock?: boolean;
};
/**
 * Extended configuration type that includes timeout
 */
export type SetupConfig = Config & {
    /** Connection timeout in milliseconds */
    timeout?: number;
};
/**
 * Creates a configuration object from setup options
 * @param options - Setup options for the network
 * @returns Configuration object compatible with chopsticks
 */
export declare const createConfig: ({ endpoint, blockNumber, blockHash, wasmOverride, db, timeout, host, port, maxMemoryBlockCount, resume, runtimeLogLevel, allowUnresolvedImports, processQueuedMessages, saveBlock, }: SetupOption) => SetupConfig;
/**
 * Sets up a blockchain network context using provided options
 * @param option - Setup options for the network
 * @returns Network context including API, WebSocket provider, and utility functions
 */
export declare const setupContext: (option: SetupOption) => Promise<{
    url: string;
    chain: import("@acala-network/chopsticks").Blockchain;
    ws: WsProvider;
    api: ApiPromise;
    dev: {
        /** Creates a new block with optional parameters */
        newBlock: (param?: Partial<NewBlockParams>) => Promise<string>;
        /** Sets storage values at a specific block */
        setStorage: (values: StorageValues, blockHash?: string) => Promise<any>;
        /** Moves blockchain time to a specific timestamp */
        timeTravel: (date: string | number) => Promise<number>;
        /** Sets the chain head to a specific block */
        setHead: (hashOrNumber: string | number) => Promise<any>;
    };
    /** Cleans up resources and closes connections */
    teardown(): Promise<void>;
    /** Pauses execution and enables manual interaction through Polkadot.js apps */
    pause(): Promise<unknown>;
}>;
/**
 * Sets up a blockchain network context using a configuration object
 * @param config - Configuration object for the network
 * @returns Network context including API, WebSocket provider, and utility functions
 */
export declare const setupContextWithConfig: ({ timeout, ...config }: SetupConfig) => Promise<{
    url: string;
    chain: import("@acala-network/chopsticks").Blockchain;
    ws: WsProvider;
    api: ApiPromise;
    dev: {
        /** Creates a new block with optional parameters */
        newBlock: (param?: Partial<NewBlockParams>) => Promise<string>;
        /** Sets storage values at a specific block */
        setStorage: (values: StorageValues, blockHash?: string) => Promise<any>;
        /** Moves blockchain time to a specific timestamp */
        timeTravel: (date: string | number) => Promise<number>;
        /** Sets the chain head to a specific block */
        setHead: (hashOrNumber: string | number) => Promise<any>;
    };
    /** Cleans up resources and closes connections */
    teardown(): Promise<void>;
    /** Pauses execution and enables manual interaction through Polkadot.js apps */
    pause(): Promise<unknown>;
}>;
/** Type alias for the network context returned by setupContext */
export type NetworkContext = Awaited<ReturnType<typeof setupContext>>;
/**
 * Sets up multiple blockchain networks and establishes connections between them
 * @param networkOptions - Configuration options for each network
 * @returns Record of network contexts indexed by network name
 */
export declare const setupNetworks: (networkOptions: Partial<Record<string, Config | string | undefined>>) => Promise<Record<string, {
    url: string;
    chain: import("@acala-network/chopsticks").Blockchain;
    ws: WsProvider;
    api: ApiPromise;
    dev: {
        /** Creates a new block with optional parameters */
        newBlock: (param?: Partial<NewBlockParams>) => Promise<string>;
        /** Sets storage values at a specific block */
        setStorage: (values: StorageValues, blockHash?: string) => Promise<any>;
        /** Moves blockchain time to a specific timestamp */
        timeTravel: (date: string | number) => Promise<number>;
        /** Sets the chain head to a specific block */
        setHead: (hashOrNumber: string | number) => Promise<any>;
    };
    /** Cleans up resources and closes connections */
    teardown(): Promise<void>;
    /** Pauses execution and enables manual interaction through Polkadot.js apps */
    pause(): Promise<unknown>;
}>>;
/**
 * Creates a deferred promise that can be resolved or rejected from outside
 * @returns Object containing promise, resolve function, and reject function
 */
export declare function defer<T>(): {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
    promise: Promise<T>;
};
/**
 * Sends a transaction and waits for it to be included in a block
 * @param tx - Promise of a submittable extrinsic
 * @returns Promise that resolves with transaction events
 */
export declare const sendTransaction: (tx: Promise<SubmittableExtrinsic<"promise">>) => Promise<{
    events: Promise<Codec[]>;
}>;
/**
 * Creates a set of test keypairs for both ed25519/sr25519 and ethereum addresses
 * @param keyringType - Type of keyring to use for substrate addresses ('ed25519' or 'sr25519')
 * @param ss58Format - SS58 address format to use
 * @returns Object containing various test keypairs and keyring instances
 */
export declare const testingPairs: (keyringType?: "ed25519" | "sr25519", ss58Format?: number) => {
    alice: import("@polkadot/keyring/types").KeyringPair;
    bob: import("@polkadot/keyring/types").KeyringPair;
    charlie: import("@polkadot/keyring/types").KeyringPair;
    dave: import("@polkadot/keyring/types").KeyringPair;
    eve: import("@polkadot/keyring/types").KeyringPair;
    alith: import("@polkadot/keyring/types").KeyringPair;
    baltathar: import("@polkadot/keyring/types").KeyringPair;
    charleth: import("@polkadot/keyring/types").KeyringPair;
    dorothy: import("@polkadot/keyring/types").KeyringPair;
    ethan: import("@polkadot/keyring/types").KeyringPair;
    keyring: Keyring;
    keyringEth: import("@polkadot/keyring/types").KeyringInstance;
};
/**
 * Creates a set of test signers for either Ed25519 or Sr25519.
 * @param keyringType Type of keyring to use for substrate addresses ('ed25519' or 'sr25519')
 * @returns Object containing various test signers, and a `polkadotSignerBuilder` function to create more.
 */
export declare const testingSigners: (keyringType?: "Ed25519" | "Sr25519") => {
    alice: import("@polkadot-api/polkadot-signer").PolkadotSigner;
    bob: import("@polkadot-api/polkadot-signer").PolkadotSigner;
    charlie: import("@polkadot-api/polkadot-signer").PolkadotSigner;
    dave: import("@polkadot-api/polkadot-signer").PolkadotSigner;
    eve: import("@polkadot-api/polkadot-signer").PolkadotSigner;
    ferdie: import("@polkadot-api/polkadot-signer").PolkadotSigner;
    polkadotSignerBuilder: (path: string, keyringType?: "Ed25519" | "Sr25519") => import("@polkadot-api/polkadot-signer").PolkadotSigner;
};
