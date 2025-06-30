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
const _nodefs = require("node:fs");
const _chopstickscore = require("@acala-network/chopsticks-core");
const _zod = require("zod");
const _context = require("../../context.js");
const _index = require("../../schema/index.js");
const _utils = require("./utils.js");
const schema = _index.configSchema.extend({
    vm: _zod.z.boolean({
        description: 'Trace VM opcode'
    }).optional(),
    'enable-memory': _zod.z.boolean({
        description: 'Enable memory trace'
    }).optional(),
    'disable-stack': _zod.z.boolean({
        description: 'Disable stack trace'
    }).optional(),
    'page-size': _zod.z.number({
        description: 'Default 50000. Reduce this if you get memory limit error.'
    }).optional(),
    output: _zod.z.string({
        description: 'Output file'
    })
});
const cli = (y)=>{
    y.command('trace-transaction <tx-hash>', 'EVM+ trace transaction. Only Acala and Karura are supported', (yargs)=>yargs.options((0, _index.getYargsOptions)(schema.shape)).positional('tx-hash', {
            desc: 'Transaction hash',
            type: 'string',
            required: true
        }), async (argv)=>{
        const config = schema.parse(argv);
        const wasmPath = config['wasm-override'];
        config['wasm-override'] = undefined;
        const context = await (0, _context.setupContext)(config, false);
        const txHash = argv['tx-hash'];
        if (!txHash) {
            throw new Error('tx-hash is required');
        }
        const transaction = await (0, _utils.fetchEVMTransaction)(await context.chain.head.runtimeVersion, txHash);
        _chopstickscore.pinoLogger.trace({
            transaction
        }, 'Transaction fetched');
        const { blockHash } = transaction;
        const { tracingBlock, extrinsic } = await (0, _utils.prepareBlock)(context.chain, blockHash, txHash, wasmPath);
        if (config.vm) {
            _chopstickscore.pinoLogger.info('Running EVM opcode trace ...');
            const steps = await (0, _utils.traceVM)(tracingBlock, extrinsic, config['page-size'], config['disable-stack'], config['enable-memory']);
            (0, _nodefs.writeFileSync)(argv.output, JSON.stringify(steps, null, 2));
        } else {
            _chopstickscore.pinoLogger.info('Running EVM call trace ...');
            const calls = await (0, _utils.traceCalls)(tracingBlock, extrinsic);
            (0, _nodefs.writeFileSync)(argv.output, JSON.stringify(calls, null, 2));
        }
        _chopstickscore.pinoLogger.info(`Trace logs: ${argv.output}`);
        process.exit(0);
    });
};
