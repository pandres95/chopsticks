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
const _zod = require("zod");
const _index = require("../../schema/index.js");
const _dryrunextrinsic = require("./dry-run-extrinsic.js");
const _dryrunpreimage = require("./dry-run-preimage.js");
const schema = _zod.z.object({
    ..._index.configSchema.shape,
    extrinsic: _zod.z.string({
        description: 'Extrinsic or call to dry run. If you pass call here then address is required to fake signature'
    }).optional(),
    address: _zod.z.string({
        description: 'Address to fake sign extrinsic'
    }).optional(),
    preimage: _zod.z.string({
        description: 'Preimage to dry run'
    }).optional(),
    at: _zod.z.string({
        description: 'Block hash to dry run'
    }).optional(),
    'output-path': _zod.z.string({
        description: 'File path to print output'
    }).optional(),
    html: _zod.z.boolean({
        description: 'Generate html with storage diff'
    }).optional(),
    open: _zod.z.boolean({
        description: 'Open generated html'
    }).optional()
});
const cli = (y)=>{
    y.command('dry-run', 'Dry run an extrinsic', (yargs)=>yargs.options((0, _index.getYargsOptions)(schema.shape)), async (argv)=>{
        const config = schema.parse(argv);
        if (config.preimage) {
            await (0, _dryrunpreimage.dryRunPreimage)(config);
        } else {
            await (0, _dryrunextrinsic.dryRunExtrinsic)(config);
        }
    });
};
