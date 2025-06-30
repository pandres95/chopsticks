import { z } from 'zod';
export declare const dryRunSchema: z.ZodObject<{
    extrinsic: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    preimage: z.ZodOptional<z.ZodString>;
    at: z.ZodOptional<z.ZodString>;
    'output-path': z.ZodOptional<z.ZodString>;
    html: z.ZodOptional<z.ZodBoolean>;
    open: z.ZodOptional<z.ZodBoolean>;
    addr: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"localhost">, z.ZodString]>>;
    host: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"localhost">, z.ZodString]>>;
    port: z.ZodDefault<z.ZodNumber>;
    endpoint: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    block: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNumber, z.ZodNull]>>;
    'build-block-mode': z.ZodDefault<z.ZodNativeEnum<typeof import("@acala-network/chopsticks-core").BuildBlockMode>>;
    'import-storage': z.ZodOptional<z.ZodAny>;
    'allow-unresolved-imports': z.ZodOptional<z.ZodBoolean>;
    'mock-signature-host': z.ZodOptional<z.ZodBoolean>;
    'max-memory-block-count': z.ZodOptional<z.ZodNumber>;
    db: z.ZodOptional<z.ZodString>;
    'save-blocks': z.ZodOptional<z.ZodBoolean>;
    'wasm-override': z.ZodOptional<z.ZodString>;
    genesis: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        properties: z.ZodObject<{
            ss58Format: z.ZodOptional<z.ZodNumber>;
            tokenDecimals: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>>;
            tokenSymbol: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        }, "strip", z.ZodTypeAny, {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        }, {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        }>;
        genesis: z.ZodObject<{
            raw: z.ZodObject<{
                top: z.ZodRecord<z.ZodString, z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                top: Record<string, string>;
            }, {
                top: Record<string, string>;
            }>;
        }, "strip", z.ZodTypeAny, {
            raw: {
                top: Record<string, string>;
            };
        }, {
            raw: {
                top: Record<string, string>;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        properties: {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        };
        genesis: {
            raw: {
                top: Record<string, string>;
            };
        };
    }, {
        name: string;
        id: string;
        properties: {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        };
        genesis: {
            raw: {
                top: Record<string, string>;
            };
        };
    }>]>>;
    'chain-spec': z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        properties: z.ZodObject<{
            ss58Format: z.ZodOptional<z.ZodNumber>;
            tokenDecimals: z.ZodOptional<z.ZodUnion<[z.ZodNumber, z.ZodArray<z.ZodNumber, "many">]>>;
            tokenSymbol: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
        }, "strip", z.ZodTypeAny, {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        }, {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        }>;
        genesis: z.ZodObject<{
            raw: z.ZodObject<{
                top: z.ZodRecord<z.ZodString, z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                top: Record<string, string>;
            }, {
                top: Record<string, string>;
            }>;
        }, "strip", z.ZodTypeAny, {
            raw: {
                top: Record<string, string>;
            };
        }, {
            raw: {
                top: Record<string, string>;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        properties: {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        };
        genesis: {
            raw: {
                top: Record<string, string>;
            };
        };
    }, {
        name: string;
        id: string;
        properties: {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        };
        genesis: {
            raw: {
                top: Record<string, string>;
            };
        };
    }>]>>;
    timestamp: z.ZodOptional<z.ZodNumber>;
    'registered-types': z.ZodOptional<z.ZodAny>;
    'runtime-log-level': z.ZodOptional<z.ZodNumber>;
    'offchain-worker': z.ZodOptional<z.ZodBoolean>;
    resume: z.ZodOptional<z.ZodUnion<[z.ZodIntersection<z.ZodString, z.ZodType<`0x${string}`, z.ZodTypeDef, `0x${string}`>>, z.ZodNumber, z.ZodBoolean]>>;
    'process-queued-messages': z.ZodOptional<z.ZodBoolean>;
    'prefetch-storages': z.ZodOptional<z.ZodAny>;
    'rpc-timeout': z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    port: number;
    'build-block-mode': import("@acala-network/chopsticks-core").BuildBlockMode;
    at?: string | undefined;
    addr?: string | undefined;
    host?: string | undefined;
    endpoint?: string | string[] | undefined;
    block?: string | number | null | undefined;
    'import-storage'?: any;
    'allow-unresolved-imports'?: boolean | undefined;
    'mock-signature-host'?: boolean | undefined;
    'max-memory-block-count'?: number | undefined;
    db?: string | undefined;
    'save-blocks'?: boolean | undefined;
    'wasm-override'?: string | undefined;
    genesis?: string | {
        name: string;
        id: string;
        properties: {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        };
        genesis: {
            raw: {
                top: Record<string, string>;
            };
        };
    } | undefined;
    'chain-spec'?: string | {
        name: string;
        id: string;
        properties: {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        };
        genesis: {
            raw: {
                top: Record<string, string>;
            };
        };
    } | undefined;
    timestamp?: number | undefined;
    'registered-types'?: any;
    'runtime-log-level'?: number | undefined;
    'offchain-worker'?: boolean | undefined;
    resume?: number | boolean | `0x${string}` | undefined;
    'process-queued-messages'?: boolean | undefined;
    'prefetch-storages'?: any;
    'rpc-timeout'?: number | undefined;
    open?: boolean | undefined;
    extrinsic?: string | undefined;
    address?: string | undefined;
    preimage?: string | undefined;
    'output-path'?: string | undefined;
    html?: boolean | undefined;
}, {
    at?: string | undefined;
    addr?: string | undefined;
    host?: string | undefined;
    port?: number | undefined;
    endpoint?: string | string[] | undefined;
    block?: string | number | null | undefined;
    'build-block-mode'?: import("@acala-network/chopsticks-core").BuildBlockMode | undefined;
    'import-storage'?: any;
    'allow-unresolved-imports'?: boolean | undefined;
    'mock-signature-host'?: boolean | undefined;
    'max-memory-block-count'?: number | undefined;
    db?: string | undefined;
    'save-blocks'?: boolean | undefined;
    'wasm-override'?: string | undefined;
    genesis?: string | {
        name: string;
        id: string;
        properties: {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        };
        genesis: {
            raw: {
                top: Record<string, string>;
            };
        };
    } | undefined;
    'chain-spec'?: string | {
        name: string;
        id: string;
        properties: {
            ss58Format?: number | undefined;
            tokenDecimals?: number | number[] | undefined;
            tokenSymbol?: string | string[] | undefined;
        };
        genesis: {
            raw: {
                top: Record<string, string>;
            };
        };
    } | undefined;
    timestamp?: number | undefined;
    'registered-types'?: any;
    'runtime-log-level'?: number | undefined;
    'offchain-worker'?: boolean | undefined;
    resume?: number | boolean | `0x${string}` | undefined;
    'process-queued-messages'?: boolean | undefined;
    'prefetch-storages'?: any;
    'rpc-timeout'?: number | undefined;
    open?: boolean | undefined;
    extrinsic?: string | undefined;
    address?: string | undefined;
    preimage?: string | undefined;
    'output-path'?: string | undefined;
    html?: boolean | undefined;
}>;
export type DryRunSchemaType = z.infer<typeof dryRunSchema>;
export * from './cli.js';
export * from './rpc.js';
