import './utils/tunnel.js';
import { GenesisProvider } from '@acala-network/chopsticks-core';
import type { Config } from './schema/index.js';
export declare const genesisFromUrl: (url: string) => Promise<GenesisProvider>;
export declare const setupContext: (argv: Config, overrideParent?: boolean) => Promise<{
    chain: import("@acala-network/chopsticks-core").Blockchain;
    fetchStorageWorker: {
        worker: import("comlink").Remote<{
            startFetch: (options: {
                block?: number | string | null;
                endpoint?: string | string[];
                dbPath?: string;
                config: import("./utils/fetch-storages.js").FetchStorageConfig;
            }) => Promise<void>;
        }>;
        terminate: () => Promise<void>;
    } | null;
}>;
