"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _dotenv = require("dotenv");
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _yargs = /*#__PURE__*/ _interop_require_default(require("yargs"));
const _helpers = require("yargs/helpers");
const _zod = require("zod");
const _chopstickscore = require("@acala-network/chopsticks-core");
const _index = require("./index.js");
const _index1 = require("./plugins/index.js");
const _index2 = require("./schema/index.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _dotenv.config)();
const processArgv = async (argv)=>{
    try {
        if (argv.unsafeRpcMethods) {
            await (0, _index1.loadRpcMethodsByScripts)(argv.unsafeRpcMethods);
        }
        if (argv.config) {
            Object.assign(argv, _lodash.default.defaults(argv, await (0, _index2.fetchConfig)(argv.config)));
        }
        if (_chopstickscore.environment.PORT) {
            argv.port = Number(_chopstickscore.environment.PORT);
        }
    } catch (error) {
        if (error instanceof _zod.z.ZodError) {
            throw new Error('Bad argv', {
                cause: error.flatten().fieldErrors
            });
        }
        throw error;
    }
};
const commands = (0, _yargs.default)((0, _helpers.hideBin)(process.argv)).scriptName('chopsticks').middleware(processArgv, false).command('*', 'Dev mode, fork off a chain', (yargs)=>yargs.config('config', 'Path to config file with default options', ()=>({})).options((0, _index2.getYargsOptions)(_index2.configSchema.shape)).deprecateOption('addr', '⚠️ Use --host instead.'), async (argv)=>{
    await (0, _index.setupWithServer)(_index2.configSchema.parse(argv));
}).command('xcm', 'XCM setup with relaychain and parachains', (yargs)=>yargs.options({
        relaychain: {
            desc: 'Relaychain config file path',
            string: true
        },
        parachain: {
            desc: 'Parachain config file path',
            type: 'array',
            string: true,
            required: true
        }
    }).alias('relaychain', 'r').alias('parachain', 'p'), async (argv)=>{
    const parachains = [];
    for (const config of argv.parachain){
        const { chain } = await (0, _index.setupWithServer)(await (0, _index2.fetchConfig)(config));
        parachains.push(chain);
    }
    if (parachains.length > 1) {
        await (0, _chopstickscore.connectParachains)(parachains, _chopstickscore.environment.DISABLE_AUTO_HRMP);
    }
    if (argv.relaychain) {
        const { chain: relaychain } = await (0, _index.setupWithServer)(await (0, _index2.fetchConfig)(argv.relaychain));
        for (const parachain of parachains){
            await (0, _chopstickscore.connectVertical)(relaychain, parachain);
        }
    }
}).strict().help().alias('help', 'h').alias('version', 'v').alias('config', 'c').alias('endpoint', 'e').alias('port', 'p').alias('block', 'b').alias('unsafe-rpc-methods', 'ur').alias('import-storage', 's').alias('wasm-override', 'w').usage('Usage: $0 <command> [options]').example('$0', '-c acala').showHelpOnFail(false);
if (!_chopstickscore.environment.DISABLE_PLUGINS) {
    (0, _index1.pluginExtendCli)(commands.config('config', 'Path to config file with default options', ()=>({}))).then(()=>commands.parse());
} else {
    commands.parse();
}
