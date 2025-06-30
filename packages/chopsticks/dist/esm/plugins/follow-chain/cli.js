import { Block, defaultLogger, runTask, taskHandler } from '@acala-network/chopsticks-core';
import _ from 'lodash';
import { z } from 'zod';
import { setupContext } from '../../context.js';
import { handler } from '../../rpc/index.js';
import { configSchema, getYargsOptions } from '../../schema/index.js';
import { createServer } from '../../server.js';
const logger = defaultLogger.child({
    name: 'follow-chain'
});
var HeadMode = /*#__PURE__*/ function(HeadMode) {
    HeadMode["Latest"] = "Latest";
    HeadMode["Finalized"] = "Finalized";
    return HeadMode;
}(HeadMode || {});
const schema = z.object({
    ..._.pick(configSchema.shape, [
        'endpoint',
        'port',
        'wasm-override',
        'runtime-log-level',
        'offchain-worker'
    ]),
    'head-mode': z.nativeEnum(HeadMode).default("Latest")
});
export const cli = (y)=>{
    y.command('follow-chain', 'Always follow the latest block on upstream', (yargs)=>yargs.options(getYargsOptions(schema.shape)), async (argv)=>{
        const config = schema.parse(argv);
        const endpoints = Array.isArray(config.endpoint) ? config.endpoint : [
            config.endpoint ?? ''
        ];
        for (const endpoint of endpoints){
            if (/^(https|http):\/\//.test(endpoint)) {
                throw Error('http provider is not supported');
            }
        }
        const context = await setupContext(config, true);
        const { close, addr } = await createServer(handler(context), config.port, config.host);
        logger.info(`${await context.chain.api.getSystemChain()} RPC listening on http://${addr} and ws://${addr}`);
        const chain = context.chain;
        chain.api[config['head-mode'] === "Latest" ? 'subscribeRemoteNewHeads' : 'subscribeRemoteFinalizedHeads'](async (error, data)=>{
            try {
                if (error) throw error;
                logger.info({
                    header: data
                }, `Follow ${config['head-mode']} head from upstream`);
                const parent = await chain.getBlock(data.parentHash);
                if (!parent) throw Error(`Cannot find parent', ${data.parentHash}`);
                const registry = await parent.registry;
                const header = registry.createType('Header', data);
                const wasm = await parent.wasm;
                const block = new Block(chain, header.number.toNumber(), header.hash.toHex(), parent);
                await chain.setHead(block);
                const calls = [
                    [
                        'Core_initialize_block',
                        [
                            header.toHex()
                        ]
                    ]
                ];
                for (const extrinsic of (await block.extrinsics)){
                    calls.push([
                        'BlockBuilder_apply_extrinsic',
                        [
                            extrinsic
                        ]
                    ]);
                }
                calls.push([
                    'BlockBuilder_finalize_block',
                    []
                ]);
                const result = await runTask({
                    wasm,
                    calls,
                    mockSignatureHost: false,
                    allowUnresolvedImports: false,
                    runtimeLogLevel: config['runtime-log-level'] || 0
                }, taskHandler(parent));
                if ('Error' in result) {
                    throw new Error(result.Error);
                }
            } catch (e) {
                logger.error(e, 'Error when processing new head');
                await close();
                process.exit(1);
            }
        });
    });
};
