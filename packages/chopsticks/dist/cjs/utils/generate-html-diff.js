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
    get generateHtmlDiff () {
        return generateHtmlDiff;
    },
    get generateHtmlDiffPreviewFile () {
        return generateHtmlDiffPreviewFile;
    }
});
const _nodefs = require("node:fs");
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _decoder = require("./decoder.js");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const generateHtmlDiff = async (block, diff)=>{
    const { oldState, delta } = await (0, _decoder.decodeStorageDiff)(block, diff);
    const htmlTemplate = (0, _nodefs.readFileSync)(new URL('template/diff.html', require("url").pathToFileURL(__filename).toString()), 'utf-8');
    return _lodash.default.template(htmlTemplate)({
        left: JSON.stringify(oldState),
        delta: JSON.stringify(delta)
    });
};
const generateHtmlDiffPreviewFile = async (block, diff, filename)=>{
    const html = await generateHtmlDiff(block, diff);
    (0, _nodefs.mkdirSync)('./preview', {
        recursive: true
    });
    const filePath = `./preview/${filename}.html`;
    (0, _nodefs.writeFileSync)(filePath, html);
    return filePath;
};
