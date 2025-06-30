"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get signFake () {
        return signFake;
    },
    get signFakeWithApi () {
        return signFakeWithApi;
    }
});
const signFakeWithApi = async (api, tx, addr, options = {})=>{
    const nonce = options.nonce ?? (await api.query.system.account(addr)).nonce;
    signFake(tx, addr, {
        nonce,
        genesisHash: api.genesisHash,
        runtimeVersion: api.runtimeVersion,
        blockHash: api.genesisHash,
        ...options
    });
};
const signFake = (tx, addr, options)=>{
    const mockSignature = new Uint8Array(64);
    mockSignature.fill(0xcd);
    mockSignature.set([
        0xde,
        0xad,
        0xbe,
        0xef
    ]);
    tx.signFake(addr, options);
    tx.signature.set(mockSignature);
};
