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
const _zod = require("zod");
const _chopstickscore = require("@acala-network/chopsticks-core");
const _context = require("../../context.js");
const _index = require("../../schema/index.js");
const _generatehtmldiff = require("../../utils/generate-html-diff.js");
const _openhtml = require("../../utils/open-html.js");
const schema = _zod.z.object({
    ..._index.configSchema.shape,
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
    y.command('run-block', 'Replay a block', (yargs)=>yargs.options((0, _index.getYargsOptions)(schema.shape)), async (argv)=>{
        const parsedArgv = schema.parse(argv);
        const context = await (0, _context.setupContext)(parsedArgv, true);
        const header = await context.chain.head.header;
        const block = context.chain.head;
        const parent = await block.parentBlock;
        if (!parent) throw Error('cant find parent block');
        const wasm = await parent.wasm;
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
            runtimeLogLevel: parsedArgv['runtime-log-level'] || 0
        }, (0, _chopstickscore.taskHandler)(parent));
        if ('Error' in result) {
            throw new Error(result.Error);
        }
        if (argv.html) {
            const filePath = await (0, _generatehtmldiff.generateHtmlDiffPreviewFile)(parent, result.Call.storageDiff, block.hash);
            console.log(`Generated preview ${filePath}`);
            if (argv.open) {
                (0, _openhtml.openHtml)(filePath);
            }
        } else if (argv.outputPath) {
            (0, _nodefs.writeFileSync)(argv.outputPath, JSON.stringify(result, null, 2));
        } else {
            console.dir(result, {
                depth: null,
                colors: false
            });
        }
        process.exit(0);
    });
};
