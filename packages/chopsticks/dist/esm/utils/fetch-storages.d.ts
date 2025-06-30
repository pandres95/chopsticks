import { ApiPromise } from '@polkadot/api';
import type { HexString } from '@polkadot/util/types';
export declare const logger: import("pino").default.Logger<never, boolean>;
type FetchStorageConfigItem = HexString | string | Record<string, string | Record<string, any[]> | Record<string, any>[] | (string | any)[]>;
export type FetchStorageConfig = FetchStorageConfigItem[];
/**
 * Convert fetch-storage configs to prefixes for fetching.
 */
export declare const getPrefixesFromConfig: (config: FetchStorageConfig, api: ApiPromise) => Promise<string[]>;
type FetchStoragesParams = {
    block?: number | string | null;
    endpoint?: string | string[];
    dbPath?: string;
    config: FetchStorageConfig;
};
/**
 * Fetch storages and save in a local db
 */
export declare const fetchStorages: ({ block, endpoint, dbPath, config }: FetchStoragesParams) => Promise<void>;
export declare const startFetchStorageWorker: (options: FetchStoragesParams) => Promise<{
    worker: import("comlink").Remote<{
        startFetch: (options: FetchStoragesParams) => Promise<void>;
    }>;
    terminate: () => Promise<void>;
} | null>;
export {};
