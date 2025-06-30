import type { Registry } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';
export type CallTrace = {
    type: 'CALL' | 'CALLCODE' | 'STATICCALL' | 'DELEGATECALL' | 'CREATE' | 'SUICIDE';
    from: HexString;
    to: HexString;
    input: HexString;
    value: HexString;
    gas: number;
    gasUsed: number;
    output: HexString | null;
    error: string | null;
    revertReason: string | null;
    depth: number;
    logs: LogTrace[];
    calls: CallTrace[];
};
export type LogTrace = {
    log: {
        address: HexString;
        topics: HexString[];
        data: HexString;
    };
} | {
    sLoad: {
        address: HexString;
        index: HexString;
        value: HexString;
    };
} | {
    sStore: {
        address: HexString;
        index: HexString;
        value: HexString;
    };
};
export type Step = {
    op: number;
    pc: number;
    depth: number;
    gas: number;
    stack: HexString[];
    memory: string[] | null;
};
export type TraceOutcome = {
    steps: Step[];
} | {
    calls: CallTrace[];
};
export declare const registerTypes: (registry: Registry) => void;
