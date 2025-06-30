"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _globalagent = require("global-agent");
const _chopstickscore = require("@acala-network/chopsticks-core");
const _npmconf = /*#__PURE__*/ _interop_require_default(require("@pnpm/npm-conf"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _globalagent.bootstrap)();
const npmConfig = (0, _npmconf.default)().config;
globalThis.GLOBAL_AGENT.HTTP_PROXY = _chopstickscore.environment.HTTP_PROXY || _chopstickscore.environment.http_proxy || _chopstickscore.environment.HTTPS_PROXY || _chopstickscore.environment.https_proxy || npmConfig.get('proxy') || npmConfig.get('https-proxy') || globalThis.GLOBAL_AGENT.HTTP_PROXY;
