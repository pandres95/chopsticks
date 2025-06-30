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
    get getRpcExtensionMethods () {
        return getRpcExtensionMethods;
    },
    get loadRpcExtensionMethod () {
        return loadRpcExtensionMethod;
    },
    get loadRpcMethodsByScripts () {
        return loadRpcMethodsByScripts;
    },
    get pluginExtendCli () {
        return pluginExtendCli;
    },
    get rpcPluginHandlers () {
        return rpcPluginHandlers;
    },
    get rpcPluginMethods () {
        return rpcPluginMethods;
    }
});
const _nodefs = require("node:fs");
const _chopstickscore = require("@acala-network/chopsticks-core");
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _nodepath = require("node:path");
const _logger = require("../logger.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const logger = _logger.defaultLogger.child({
    name: 'plugin'
});
const rpcPluginHandlers = {};
// list of plugins directory
const plugins = (0, _nodefs.readdirSync)(new URL('.', require("url").pathToFileURL(__filename).toString())).filter((file)=>(0, _nodefs.lstatSync)(new URL(file, require("url").pathToFileURL(__filename).toString())).isDirectory());
const rpcPluginMethods = plugins.filter((name)=>(0, _nodefs.readdirSync)(new URL(name, require("url").pathToFileURL(__filename).toString())).some((file)=>file.startsWith('rpc'))).map((name)=>`dev_${_lodash.default.camelCase(name)}`);
const loadRpcPlugin = async (method)=>{
    if (_chopstickscore.environment.DISABLE_PLUGINS) {
        return undefined;
    }
    if (rpcPluginHandlers[method]) return rpcPluginHandlers[method];
    const plugin = _lodash.default.snakeCase(method.split('dev_')[1]).replaceAll('_', '-');
    if (!plugin) return undefined;
    const location = new URL(`${plugin}/index.js`, require("url").pathToFileURL(__filename).toString());
    const { rpc } = await Promise.resolve(location.pathname).then((p)=>/*#__PURE__*/ _interop_require_wildcard(require(p)));
    if (!rpc) return undefined;
    rpcPluginHandlers[method] = rpc;
    logger.debug(`Registered plugin ${plugin} RPC`);
    return rpc;
};
// store the loaded methods by cli
let rpcScriptMethods = {};
const loadRpcMethodsByScripts = async (path)=>{
    try {
        const scriptContent = (0, _nodefs.readFileSync)((0, _nodepath.resolve)(path), 'utf8');
        rpcScriptMethods = new Function(scriptContent)();
        logger.info(`${Object.keys(rpcScriptMethods).length} extension rpc methods loaded from ${path}`);
    } catch (error) {
        console.log('Failed to load rpc extension methods', error);
    }
};
const getRpcExtensionMethods = ()=>{
    return [
        ...Object.keys(rpcScriptMethods),
        ...rpcPluginMethods
    ];
};
const loadRpcExtensionMethod = async (method)=>{
    if (rpcScriptMethods[method]) return rpcScriptMethods[method];
    return loadRpcPlugin(method);
};
const pluginExtendCli = async (y)=>{
    for (const plugin of plugins){
        const location = new URL(`${plugin}/index.js`, require("url").pathToFileURL(__filename).toString());
        const { cli } = await Promise.resolve(location.pathname).then((p)=>/*#__PURE__*/ _interop_require_wildcard(require(p)));
        if (cli) {
            cli(y);
            logger.debug(`Registered plugin CLI: ${plugin}`);
        }
    }
};
