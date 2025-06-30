"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SetNimbusAuthorInherent", {
    enumerable: true,
    get: function() {
        return SetNimbusAuthorInherent;
    }
});
const _types = require("@polkadot/types");
const _index = require("../../../utils/index.js");
class SetNimbusAuthorInherent {
    async createInherents(newBlock, _params) {
        const parent = await newBlock.parentBlock;
        if (!parent) throw new Error('parent block not found');
        const meta = await parent.meta;
        if (!meta.tx.authorInherent?.kickOffAuthorshipValidation) {
            if (meta.query.authorNoting) {
                newBlock.pushStorageLayer().set((0, _index.compactHex)(meta.query.authorNoting.didSetContainerAuthorData()), meta.registry.createType('bool', true).toHex());
            }
            return [];
        }
        // mock author inherent data and authorities noting data
        const layer = newBlock.pushStorageLayer();
        const accountType = meta.registry.hasType('NimbusPrimitivesNimbusCryptoPublic') ? 'NimbusPrimitivesNimbusCryptoPublic' : 'AccountId';
        const alice = meta.registry.hasType('NimbusPrimitivesNimbusCryptoPublic') ? '0x567b6ddb05396c0a83853b6f40d27450534c7963df8619b8c6064480c4db9703' : '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
        layer.set((0, _index.compactHex)(meta.query.authorInherent.author()), meta.registry.createType(accountType, alice).toHex());
        if (meta.query.authoritiesNoting) {
            layer.set((0, _index.compactHex)(meta.query.authoritiesNoting.authorities()), meta.registry.createType(`Vec<${accountType}>`, [
                alice
            ]).toHex());
            layer.set((0, _index.compactHex)(meta.query.authoritiesNoting.didSetOrchestratorAuthorityData()), meta.registry.createType('bool', true).toHex());
        }
        if (meta.query.parachainStaking) {
            layer.set((0, _index.compactHex)(meta.query.parachainStaking.selectedCandidates()), meta.registry.createType(`Vec<${accountType}>`, [
                alice
            ]).toHex());
        }
        if (meta.query.authorityAssignment && meta.query.session) {
            const session = await newBlock.chain.head.read('u32', meta.query.session.currentIndex);
            if (session) {
                // We need to set both the assignemnt for current and next sessions
                layer.set((0, _index.compactHex)(meta.query.authorityAssignment.collatorContainerChain(session)), meta.registry.createType(`DpCollatorAssignmentAssignedCollatorsPublic`, {
                    orchestratorChain: [
                        alice
                    ]
                }).toHex());
                layer.set((0, _index.compactHex)(meta.query.authorityAssignment.collatorContainerChain(session.toBigInt() + 1n)), meta.registry.createType(`DpCollatorAssignmentAssignedCollatorsPublic`, {
                    orchestratorChain: [
                        alice
                    ]
                }).toHex());
            }
            layer.set((0, _index.compactHex)(meta.query.authorNoting.didSetContainerAuthorData()), meta.registry.createType('bool', true).toHex());
        }
        return [
            new _types.GenericExtrinsic(meta.registry, meta.tx.authorInherent.kickOffAuthorshipValidation()).toHex()
        ];
    }
}
