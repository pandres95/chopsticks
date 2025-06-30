/* tslint:disable */
/* eslint-disable */
/**
* @param {any} code
* @returns {Promise<any>}
*/
export function get_runtime_version(code: any): Promise<any>;
/**
* @param {any} entries
* @param {any} trie_version
* @returns {Promise<any>}
*/
export function calculate_state_root(entries: any, trie_version: any): Promise<any>;
/**
* @param {any} trie_root_hash
* @param {any} nodes
* @returns {Promise<any>}
*/
export function decode_proof(trie_root_hash: any, nodes: any): Promise<any>;
/**
* @param {any} nodes
* @param {any} updates
* @returns {Promise<any>}
*/
export function create_proof(nodes: any, updates: any): Promise<any>;
/**
* @param {any} task
* @param {JsCallback} js
* @returns {Promise<any>}
*/
export function run_task(task: any, js: JsCallback): Promise<any>;
/**
* @param {JsCallback} js
* @param {any} key
* @returns {Promise<any>}
*/
export function testing(js: JsCallback, key: any): Promise<any>;

type HexString = `0x${string}`;
export interface JsCallback {
	getStorage: (key: HexString) => Promise<string | undefined>
	getNextKey: (prefix: HexString, key: HexString) => Promise<string | undefined>
	offchainGetStorage: (key: HexString) => Promise<string | undefined>
	offchainTimestamp: () => Promise<number>
	offchainRandomSeed: () => Promise<HexString>
	offchainSubmitTransaction: (tx: HexString) => Promise<boolean>
}



export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly get_runtime_version: (a: number) => number;
  readonly calculate_state_root: (a: number, b: number) => number;
  readonly decode_proof: (a: number, b: number) => number;
  readonly create_proof: (a: number, b: number) => number;
  readonly run_task: (a: number, b: number) => number;
  readonly testing: (a: number, b: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h599a77ca3c3541ed: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h127e0c06482ee17d: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
