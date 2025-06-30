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
    get apiFetching () {
        return apiFetching;
    },
    get defaultLogger () {
        return _chopstickscore.defaultLogger;
    },
    get spinnerFrames () {
        return spinnerFrames;
    },
    get truncate () {
        return _chopstickscore.truncate;
    }
});
const _lodash = /*#__PURE__*/ _interop_require_default(require("lodash"));
const _chopstickscore = require("@acala-network/chopsticks-core");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const showProgress = process.stdout.isTTY && !process.env.CI && !process.env.TEST;
const spinnerFrames = process.platform === 'win32' ? [
    '-',
    '\\',
    '|',
    '/'
] : [
    '⠋',
    '⠙',
    '⠹',
    '⠸',
    '⠼',
    '⠴',
    '⠦',
    '⠧',
    '⠇',
    '⠏'
];
let index = 0;
// clear to the right from cursor
const clearStatus = _lodash.default.debounce(()=>process.stdout.clearLine(1), 500, {
    trailing: true
});
const apiFetching = _lodash.default.throttle(()=>{
    if (!showProgress) return;
    // print ` ⠋ Fetching|` and move cursor at position 0 of the line `| ⠋ Fetching`
    process.stdout.write(` ${spinnerFrames[index++]} Fetching`);
    process.stdout.cursorTo(0);
    index = ++index % spinnerFrames.length;
    clearStatus();
}, 50, {
    leading: true
});
