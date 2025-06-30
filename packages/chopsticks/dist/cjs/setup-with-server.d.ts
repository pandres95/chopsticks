import type { Config } from './schema/index.js';
export declare const setupWithServer: (argv: Config) => Promise<{
    addr: string;
    close(): Promise<void>;
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
