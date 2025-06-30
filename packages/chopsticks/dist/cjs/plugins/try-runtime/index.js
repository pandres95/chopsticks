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
const _override = require("../../utils/override.js");
const schema = _zod.z.object({
    endpoint: _index.configSchema.shape.endpoint,
    block: _index.configSchema.shape.block,
    db: _index.configSchema.shape.db,
    'runtime-log-level': _index.configSchema.shape['runtime-log-level'].default(5),
    runtime: _zod.z.string({
        description: 'Path to WASM built with feature `try-runtime` enabled'
    }),
    'import-storage': _index.configSchema.shape['import-storage'],
    checks: _zod.z.enum([
        'None',
        'All',
        'PreAndPost',
        'TryState'
    ]),
    'disable-spec-check': _zod.z.boolean({
        description: 'Disable spec name/version check'
    }).optional(),
    'output-path': _zod.z.string({
        description: 'File path to print output'
    }).optional()
});
const cli = (y)=>{
    y.command('try-runtime', '🚧 EXPERIMENTAL: Check upgrade migrations 🚧', (yargs)=>yargs.options((0, _index.getYargsOptions)(schema.shape)), async (argv)=>{
        console.log('🚧 EXPERIMENTAL FEATURE 🚧');
        const config = schema.parse(argv);
        if (!config.db) {
            console.log('⚠️ Make sure to provide db, it will speed up the process');
        }
        const context = await (0, _context.setupContext)({
            ...config,
            host: 'localhost',
            port: 8000,
            'build-block-mode': _chopstickscore.BuildBlockMode.Manual
        });
        const block = context.chain.head;
        const registry = await block.registry;
        registry.register({
            UpgradeCheckSelect: {
                _enum: {
                    None: null,
                    All: null,
                    PreAndPost: null,
                    TryState: null
                }
            }
        });
        const oldVersion = await block.runtimeVersion;
        // set new runtime
        await (0, _override.overrideWasm)(block.chain, config.runtime);
        const newVersion = await block.runtimeVersion;
        console.log('\n');
        console.log(new Array(80).fill('-').join(''));
        console.log(`\tCurrent runtime spec_name: ${oldVersion.specName}, spec_version: ${oldVersion.specVersion}`);
        console.log(`\tNew runtime spec_name: ${newVersion.specName}, spec_version: ${newVersion.specVersion}`);
        console.log(new Array(80).fill('-').join(''));
        console.log('\n');
        if (!config['disable-spec-check'] && oldVersion.specName !== newVersion.specName) {
            console.log('❌ Spec name does not match. Use --disable-spec-check to disable this check');
            process.exit(1);
        }
        if (!config['disable-spec-check'] && oldVersion.specVersion >= newVersion.specVersion) {
            console.log('❌ Spec version must increase. Use --disable-spec-check to disable this check');
            process.exit(1);
        }
        const select_none = registry.createType('UpgradeCheckSelect', config.checks);
        const response = await block.call('TryRuntime_on_runtime_upgrade', [
            select_none.toHex()
        ]);
        if (argv.outputPath) {
            (0, _nodefs.writeFileSync)(argv.outputPath, JSON.stringify(response, null, 2));
        } else {
            const [actual, max] = registry.createType('(Weight, Weight)', response.result);
            const consumedWeight = actual.refTime.toBn();
            const maxWeight = max.refTime.toBn();
            console.log('\n🚧 EXPERIMENTAL FEATURE 🚧');
            console.log('⚠️ PoV measure is not supported, consider using https://crates.io/crates/try-runtime-cli');
            console.log(`\nConsumed weight: ${consumedWeight.toNumber()} of max: ${maxWeight.toNumber()} ( ${(consumedWeight.toNumber() / maxWeight.toNumber() * 100).toFixed(2)}% )`);
            if (consumedWeight.gt(maxWeight)) {
                console.log('❌ Weight limit is exceeded ❌');
                process.exit(1);
            }
        }
        process.exit(0);
    });
};
