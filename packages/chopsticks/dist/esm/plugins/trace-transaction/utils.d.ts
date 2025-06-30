import { Block, type Blockchain, type RuntimeVersion } from '@acala-network/chopsticks-core';
import type { HexString } from '@polkadot/util/types';
import { type Step } from './types.js';
/**
 * Fetches the runtime with tracing feature from Github releases.
 * @param runtimeVersion - The version of the runtime.
 * @returns A Promise that resolves to the fetched runtime as a Buffer.
 */
export declare const fetchRuntime: (runtimeVersion: RuntimeVersion) => Promise<Buffer<ArrayBuffer> | undefined>;
export declare const fetchEVMTransaction: (runtimeVersion: RuntimeVersion, txHash: string) => Promise<any>;
/**
 * Traces the execution of a transaction in the VM.
 * @param block - The block to trace the extrinsic in.
 * @param extrinsic - The extrinsic to trace.
 * @returns An array of VM steps.
 * @throws Error if the trace outcome is invalid.
 */
export declare const traceVM: (block: Block, extrinsic: HexString, pageSize?: number, disableStack?: boolean, enableMemory?: boolean) => Promise<Step[]>;
/**
 * Traces the calls made by an extrinsic in a block.
 * @param block - The block to trace the extrinsic in.
 * @param extrinsic - The extrinsic to trace.
 * @returns An array of calls made by the extrinsic.
 * @throws Error if the trace outcome is invalid.
 */
export declare const traceCalls: (block: Block, extrinsic: HexString) => Promise<import("./types.js").CallTrace[]>;
/**
 * Prepares a block for tracing a transaction.
 * @param chain The blockchain instance.
 * @param blockHashNumber The block hash or block number.
 * @param txHash The transaction hash.
 * @param wasmPath The path to the runtime wasm file.
 * @returns An object containing the tracing block and the transaction extrinsic.
 * @throws Error if the block or parent block is not found, or if the runtime wasm with tracing feature cannot be found.
 */
export declare const prepareBlock: (chain: Blockchain, blockHashNumber: HexString | number, txHash: string, wasmPath?: string) => Promise<{
    tracingBlock: Block;
    extrinsic: `0x${string}`;
}>;
