"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "cli", {
    enumerable: true,
    get: function() {
        return cli;
    }
});
const _chopstickscore = require("@acala-network/chopsticks-core");
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _zod = require("zod");
const _context = require("../../context.js");
const _index = require("../../rpc/index.js");
const _index1 = require("../../schema/index.js");
const _server = require("../../server.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const logger = _chopstickscore.defaultLogger.child({
    name: 'follow-chain'
});
var HeadMode = /*#__PURE__*/ function(HeadMode) {
    HeadMode["Latest"] = "Latest";
    HeadMode["Finalized"] = "Finalized";
    return HeadMode;
}(HeadMode || {});
const schema = _zod.z.object({
    ..._lodash.default.pick(_index1.configSchema.shape, [
        'endpoint',
        'port',
        'wasm-override',
        'runtime-log-level',
        'offchain-worker'
    ]),
    'head-mode': _zod.z.nativeEnum(HeadMode).default("Latest")
});
const cli = (y)=>{
    y.command('follow-chain', 'Always follow the latest block on upstream', (yargs)=>yargs.options((0, _index1.getYargsOptions)(schema.shape)), async (argv)=>{
        const config = schema.parse(argv);
        const endpoints = Array.isArray(config.endpoint) ? config.endpoint : [
            config.endpoint ?? ''
        ];
        for (const endpoint of endpoints){
            if (/^(https|http):\/\//.test(endpoint)) {
                throw Error('http provider is not supported');
            }
        }
        const context = await (0, _context.setupContext)(config, true);
        const { close, addr } = await (0, _server.createServer)((0, _index.handler)(context), config.port, config.host);
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
                const block = new _chopstickscore.Block(chain, header.number.toNumber(), header.hash.toHex(), parent);
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
                const result = await (0, _chopstickscore.runTask)({
                    wasm,
                    calls,
                    mockSignatureHost: false,
                    allowUnresolvedImports: false,
                    runtimeLogLevel: config['runtime-log-level'] || 0
                }, (0, _chopstickscore.taskHandler)(parent));
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
