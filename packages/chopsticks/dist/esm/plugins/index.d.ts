import { type Handlers } from '@acala-network/chopsticks-core';
import type { Argv } from 'yargs';
export declare const rpcPluginHandlers: Handlers;
export declare const rpcPluginMethods: string[];
export declare const loadRpcMethodsByScripts: (path: string) => Promise<void>;
export declare const getRpcExtensionMethods: () => string[];
export declare const loadRpcExtensionMethod: (method: string) => Promise<any>;
export declare const pluginExtendCli: (y: Argv) => Promise<void>;
