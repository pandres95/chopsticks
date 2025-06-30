import type { ProviderInterface, ProviderInterfaceCallback } from '@polkadot/rpc-provider/types';
import type { ExtDef } from '@polkadot/types/extrinsic/signedExtensions/types';
import type { HexString } from '@polkadot/util/types';
import type { ChainProperties, Header, SignedBlock } from './index.js';
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
 */
export declare class Api {
    #private;
    readonly signedExtensions: ExtDef;
    constructor(provider: ProviderInterface, signedExtensions?: ExtDef);
    disconnect(): Promise<void>;
    get isReady(): Promise<void> | undefined;
    get chain(): Promise<string>;
    get chainProperties(): Promise<ChainProperties>;
    onFetching(fetching?: () => void): void;
    send<T = any>(method: string, params: unknown[], isCacheable?: boolean): Promise<T>;
    getSystemName(): Promise<string>;
    getSystemProperties(): Promise<ChainProperties>;
    getSystemChain(): Promise<string>;
    getBlockHash(blockNumber?: number): Promise<`0x${string}` | null>;
    getHeader(hash?: string): Promise<Header | null>;
    getFinalizedHead(): Promise<string>;
    getBlock(hash?: string): Promise<SignedBlock | null>;
    getStorage(key: string, hash?: string): Promise<`0x${string}` | null>;
    getKeysPaged(prefix: string, pageSize: number, startKey: string, hash?: string): Promise<`0x${string}`[]>;
    getStorageBatch(prefix: HexString, keys: HexString[], hash?: HexString): Promise<[`0x${string}`, `0x${string}` | null][]>;
    subscribeRemoteNewHeads(cb: ProviderInterfaceCallback): Promise<string | number>;
    subscribeRemoteFinalizedHeads(cb: ProviderInterfaceCallback): Promise<string | number>;
}
