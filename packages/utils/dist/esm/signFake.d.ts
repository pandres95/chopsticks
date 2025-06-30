import type { ApiPromise } from '@polkadot/api';
import type { GenericExtrinsic } from '@polkadot/types';
import type { SignatureOptions } from '@polkadot/types/types';
export type SignFakeOptions = Partial<SignatureOptions>;
export declare const signFakeWithApi: (api: ApiPromise, tx: GenericExtrinsic, addr: string, options?: SignFakeOptions) => Promise<void>;
export declare const signFake: (tx: GenericExtrinsic, addr: string, options: SignatureOptions) => void;
