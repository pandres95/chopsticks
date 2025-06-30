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
    get dryRun () {
        return _index.rpc;
    },
    get runBlock () {
        return _index1.rpc;
    }
});
const _index = require("./dry-run/index.js");
const _index1 = require("./run-block/index.js");
