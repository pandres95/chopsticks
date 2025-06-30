import type { HexString } from '@polkadot/util/types';
import type { Api } from '../api.js';
import type { Database } from '../database.js';
export declare enum StorageValueKind {
    Deleted = "Deleted",
    DeletedPrefix = "DeletedPrefix"
}
export type StorageValue = string | StorageValueKind | undefined;
export interface StorageLayerProvider {
    /**
     * Get the value of a storage key.
     */
    get(key: string, cache: boolean): Promise<StorageValue>;
    /**
     * Get paged storage keys.
     */
    getKeysPaged(prefix: string, pageSize: number, startKey: string): Promise<string[]>;
    /**
     * Find next storage key.
     */
    findNextKey(prefix: string, startKey: string, knownBest?: string): Promise<string | undefined>;
}
export declare class RemoteStorageLayer implements StorageLayerProvider {
    #private;
    constructor(api: Api, at: HexString, db: Database | undefined);
    get(key: string, _cache: boolean): Promise<StorageValue>;
    findNextKey(prefix: string, startKey: string, _knownBest?: string): Promise<string | undefined>;
    getKeysPaged(prefix: string, pageSize: number, startKey: string): Promise<string[]>;
}
export declare class StorageLayer implements StorageLayerProvider {
    #private;
    constructor(parent?: StorageLayerProvider);
    get(key: string, cache: boolean): Promise<StorageValue | undefined>;
    set(key: string, value: StorageValue): void;
    setAll(values: Record<string, StorageValue | null> | [string, StorageValue | null][]): void;
    findNextKey(prefix: string, startKey: string, knownBest?: string): Promise<string | undefined>;
    getKeysPaged(prefix: string, pageSize: number, startKey: string): Promise<string[]>;
    /**
     * Merge the storage layer into the given object, can be used to get sotrage diff.
     */
    mergeInto(into: Record<string, string | null>): Promise<void>;
}
