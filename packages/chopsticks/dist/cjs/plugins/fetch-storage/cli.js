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
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _zod = require("zod");
const _index = require("../../schema/index.js");
const _fetchstorages = require("../../utils/fetch-storages.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const schema = _zod.z.object(_lodash.default.pick(_index.configSchema.shape, [
    'endpoint',
    'block',
    'db'
]));
const cli = (y)=>{
    y.command({
        command: 'fetch-storages [items..]',
        aliases: [
            'fetch-storage'
        ],
        describe: 'Fetch and save storages',
        builder: (yargs)=>yargs.options((0, _index.getYargsOptions)(schema.shape)),
        handler: async (argv)=>{
            const config = schema.parse(argv);
            if (!argv.items) throw new Error('fetch-storages items are required');
            try {
                await (0, _fetchstorages.fetchStorages)({
                    block: config.block,
                    endpoint: config.endpoint,
                    dbPath: config.db,
                    config: argv.items
                });
                process.exit(0);
            } catch (e) {
                _fetchstorages.logger.error(e);
                process.exit(1);
            }
        }
    });
};
