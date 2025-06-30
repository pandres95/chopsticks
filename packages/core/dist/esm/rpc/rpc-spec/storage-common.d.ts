import type { Block } from '@acala-network/chopsticks-core/blockchain/block.js';
import type { HexString } from '@polkadot/util/types';
export declare function getDescendantValues(block: Block, params: DescendantValuesParams): Promise<{
    items: Array<{
        key: string;
        value?: HexString;
    }>;
    next: DescendantValuesParams | null;
}>;
export declare const PAGE_SIZE = 1000;
export type DescendantValuesParams = {
    prefix: string;
    startKey: string;
    isDescendantHashes?: boolean;
};
