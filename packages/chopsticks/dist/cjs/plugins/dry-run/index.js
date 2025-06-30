"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "dryRunSchema", {
    enumerable: true,
    get: function() {
        return dryRunSchema;
    }
});
const _zod = require("zod");
const _index = require("../../schema/index.js");
_export_star(require("./cli.js"), exports);
_export_star(require("./rpc.js"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
const dryRunSchema = _zod.z.object({
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
