"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: Object.getOwnPropertyDescriptor(all, name).get
    });
}
_export(exports, {
    get configSchema () {
        return configSchema;
    },
    get fetchConfig () {
        return fetchConfig;
    },
    get getYargsOptions () {
        return getYargsOptions;
    },
    get zHash () {
        return zHash;
    },
    get zHex () {
        return zHex;
    }
});
const _nodefs = require("node:fs");
const _nodepath = require("node:path");
const _chopstickscore = require("@acala-network/chopsticks-core");
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _jsyaml = /*#__PURE__*/ _interop_require_default(require("js-yaml"));
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _zod = require("zod");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const zHex = _zod.z.custom((val)=>/^0x\w+$/.test(val));
const zHash = _zod.z.string().length(66).and(zHex);
const configSchema = _zod.z.object({
    addr: _zod.z.union([
        _zod.z.literal('localhost'),
        _zod.z.string().ip()
    ]).optional(),
    host: _zod.z.union([
        _zod.z.literal('localhost'),
        _zod.z.string().ip()
    ], {
        description: 'Server listening interface'
    }).optional(),
    port: _zod.z.number({
        description: 'Server listening port'
    }).default(8000),
    endpoint: _zod.z.union([
        _zod.z.string(),
        _zod.z.array(_zod.z.string())
    ], {
        description: 'Endpoint to connect to'
    }).optional(),
    block: _zod.z.union([
        _zod.z.string(),
        _zod.z.number().max(Number.MAX_SAFE_INTEGER, 'Number is too big, please make it a string if you are using a hex string'),
        _zod.z.null()
    ], {
        description: 'Block hash or block number. Default to latest block'
    }).optional(),
    'build-block-mode': _zod.z.nativeEnum(_chopstickscore.BuildBlockMode).default(_chopstickscore.BuildBlockMode.Batch),
    'import-storage': _zod.z.any({
        description: 'Pre-defined JSON/YAML storage file path'
    }).optional(),
    'allow-unresolved-imports': _zod.z.boolean().optional(),
    'mock-signature-host': _zod.z.boolean({
        description: 'Mock signature host so any signature starts with 0xdeadbeef and filled by 0xcd is considered valid'
    }).optional(),
    'max-memory-block-count': _zod.z.number().optional(),
    db: _zod.z.string({
        description: 'Path to database'
    }).optional(),
    'save-blocks': _zod.z.boolean({
        description: 'Save blocks to database. Default to true.'
    }).optional(),
    'wasm-override': _zod.z.string({
        description: 'Path to wasm override'
    }).optional(),
    genesis: _zod.z.union([
        _zod.z.string(),
        _chopstickscore.genesisSchema
    ], {
        description: 'Alias to `chain-spec`. URL to chain spec file. NOTE: Only parachains with AURA consensus are supported!'
    }).optional(),
    'chain-spec': _zod.z.union([
        _zod.z.string(),
        _chopstickscore.genesisSchema
    ], {
        description: 'URL to chain spec file. NOTE: Only parachains with AURA consensus are supported!'
    }).optional(),
    timestamp: _zod.z.number().optional(),
    'registered-types': _zod.z.any().optional(),
    'runtime-log-level': _zod.z.number({
        description: 'Runtime maximum log level [off = 0; error = 1; warn = 2; info = 3; debug = 4; trace = 5]'
    }).min(0).max(5).optional(),
    'offchain-worker': _zod.z.boolean({
        description: 'Enable offchain worker'
    }).optional(),
    resume: _zod.z.union([
        zHash,
        _zod.z.number(),
        _zod.z.boolean()
    ], {
        description: 'Resume from the specified block hash or block number in db. If true, it will resume from the latest block in db. Note this will override the block option'
    }).optional(),
    'process-queued-messages': _zod.z.boolean({
        description: 'Produce extra block when queued messages are detected. Default to true. Set to false to disable it.'
    }).optional(),
    'prefetch-storages': _zod.z.any({
        description: 'Storage key prefixes config for fetching storage, useful for testing big migrations, see README for examples'
    }).optional(),
    'rpc-timeout': _zod.z.number({
        description: 'RPC timeout in milliseconds'
    }).optional()
});
const getZodType = (option)=>{
    switch(option._def.typeName){
        case 'ZodString':
            return 'string';
        case 'ZodNumber':
            return 'number';
        case 'ZodBoolean':
            return 'boolean';
        default:
            break;
    }
    if (option._def.innerType ?? option._def.left) {
        return getZodType(option._def.innerType ?? option._def.left);
    }
    return undefined;
};
const getZodChoices = (option)=>{
    if (option._def.innerType instanceof _zod.ZodNativeEnum) {
        return Object.values(option._def.innerType._def.values).filter((x)=>typeof x === 'string');
    }
    if (option._def.innerType) {
        return getZodChoices(option._def.innerType);
    }
    return undefined;
};
const getZodFirstOption = (option)=>{
    const options = option._def.options;
    if (options) {
        for (const option of options){
            const type = getZodType(option);
            if (type) return type;
        }
    }
    if (option._def.innerType) {
        return getZodFirstOption(option._def.innerType);
    }
    return undefined;
};
const getYargsOptions = (zodShape)=>{
    return _lodash.default.mapValues(zodShape, (option)=>({
            demandOption: !option.isOptional(),
            description: option._def.description,
            type: getZodType(option) || getZodFirstOption(option),
            choices: getZodChoices(option)
        }));
};
const CONFIGS_BASE_URL = 'https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/';
const fetchConfig = async (path)=>{
    let file;
    if ((0, _chopstickscore.isUrl)(path)) {
        file = await _axios.default.get(path).then((x)=>x.data);
    } else {
        try {
            file = (0, _nodefs.readFileSync)(path, 'utf8');
        } catch (err) {
            if ((0, _nodepath.basename)(path) === path && [
                '',
                '.yml',
                '.yaml',
                '.json'
            ].includes((0, _nodepath.extname)(path))) {
                if ((0, _nodepath.extname)(path) === '') {
                    path += '.yml';
                }
                const url = CONFIGS_BASE_URL + path;
                _chopstickscore.defaultLogger.info(`Loading config file ${url}`);
                file = await _axios.default.get(url).then((x)=>x.data);
            } else {
                throw err;
            }
        }
    }
    const config = _jsyaml.default.load(_lodash.default.template(file, {
        variable: 'env'
    })(process.env));
    return configSchema.strict().parse(config);
};
