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
const _context = require("../../context.js");
const _index = require("../../schema/index.js");
const cli = (y)=>{
    y.command('decode-key <key>', 'Deocde a key', (yargs)=>yargs.options((0, _index.getYargsOptions)(_index.configSchema.shape)).positional('key', {
            desc: 'Key to decode',
            type: 'string'
        }), async (argv)=>{
        const context = await (0, _context.setupContext)(_index.configSchema.parse(argv));
        const { storage, decodedKey } = (0, _chopstickscore.decodeKey)(await context.chain.head.meta, argv.key);
        if (storage && decodedKey) {
            console.log(`${storage.section}.${storage.method}`, decodedKey.args.map((x)=>JSON.stringify(x.toHuman())).join(', '));
        } else {
            console.log('Unknown');
        }
        process.exit(0);
    });
};
