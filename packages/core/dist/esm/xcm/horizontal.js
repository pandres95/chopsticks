import { hexToU8a } from '@polkadot/util';
import { compactHex } from '../utils/index.js';
import { xcmLogger } from './index.js';
export const connectHorizontal = async (parachains, disableAutoHrmp = false)=>{
    for (const [id, chain] of Object.entries(parachains)){
        const meta = await chain.head.meta;
        const hrmpOutboundMessagesKey = compactHex(meta.query.parachainSystem.hrmpOutboundMessages());
        await chain.headState.subscribeStorage([
            hrmpOutboundMessagesKey
        ], async (head, pairs)=>{
            const value = pairs[0][1];
            if (!value) return;
            const meta = await head.meta;
            const outboundHrmpMessage = meta.registry.createType('Vec<PolkadotCorePrimitivesOutboundHrmpMessage>', hexToU8a(value)).toJSON();
            xcmLogger.info({
                outboundHrmpMessage
            }, 'outboundHrmpMessage');
            for (const { recipient, data } of outboundHrmpMessage){
                const receiver = parachains[recipient];
                if (receiver) {
                    receiver.submitHorizontalMessages(Number(id), [
                        {
                            sentAt: head.number,
                            data
                        }
                    ]);
                }
            }
        });
        const hrmpHeads = await chain.head.read('BTreeMap<u32, H256>', meta.query.parachainSystem.lastHrmpMqcHeads);
        if (hrmpHeads && !disableAutoHrmp) {
            const existingChannels = Array.from(hrmpHeads.keys()).map((x)=>x.toNumber());
            for (const paraId of Object.keys(parachains).filter((x)=>x !== id)){
                if (!existingChannels.includes(Number(paraId))) {
                    chain.submitHorizontalMessages(Number(paraId), []);
                }
            }
        }
    }
};
