function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self1 = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self1, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, g, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    };
    return g = {
        next: verb(0),
        "throw": verb(1),
        "return": verb(2)
    }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(_)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var wasm;
var cachedTextDecoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', {
    ignoreBOM: true,
    fatal: true
}) : {
    decode: function() {
        throw Error('TextDecoder not available');
    }
};
if (typeof TextDecoder !== 'undefined') {
    cachedTextDecoder.decode();
}
;
var cachedUint8Memory0 = null;
function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}
function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}
var heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);
var heap_next = heap.length;
function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    var idx = heap_next;
    heap_next = heap[idx];
    heap[idx] = obj;
    return idx;
}
function getObject(idx) {
    return heap[idx];
}
function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}
function takeObject(idx) {
    var ret = getObject(idx);
    dropObject(idx);
    return ret;
}
var WASM_VECTOR_LEN = 0;
var cachedTextEncoder = typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : {
    encode: function() {
        throw Error('TextEncoder not available');
    }
};
var encodeString = typeof cachedTextEncoder.encodeInto === 'function' ? function encodeString(arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
} : function(arg, view) {
    var buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
};
function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        var buf = cachedTextEncoder.encode(arg);
        var ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }
    var len = arg.length;
    var ptr1 = malloc(len, 1) >>> 0;
    var mem = getUint8Memory0();
    var offset = 0;
    for(; offset < len; offset++){
        var code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr1 + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr1 = realloc(ptr1, len, len = offset + arg.length * 3, 1) >>> 0;
        var view = getUint8Memory0().subarray(ptr1 + offset, ptr1 + len);
        var ret = encodeString(arg, view);
        offset += ret.written;
        ptr1 = realloc(ptr1, len, offset, 1) >>> 0;
    }
    WASM_VECTOR_LEN = offset;
    return ptr1;
}
function isLikeNone(x) {
    return x === undefined || x === null;
}
var cachedInt32Memory0 = null;
function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
var cachedBigInt64Memory0 = null;
function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}
var cachedFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}
function debugString(val) {
    // primitive types
    var type = typeof val === "undefined" ? "undefined" : _type_of(val);
    if (type == 'number' || type == 'boolean' || val == null) {
        return "".concat(val);
    }
    if (type == 'string') {
        return '"'.concat(val, '"');
    }
    if (type == 'symbol') {
        var description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return "Symbol(".concat(description, ")");
        }
    }
    if (type == 'function') {
        var name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return "Function(".concat(name, ")");
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        var length = val.length;
        var debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(var i = 1; i < length; i++){
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    var builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    var className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (_instanceof(val, Error)) {
        return "".concat(val.name, ": ").concat(val.message, "\n").concat(val.stack);
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}
var CLOSURE_DTORS = typeof FinalizationRegistry === 'undefined' ? {
    register: function() {},
    unregister: function() {}
} : new FinalizationRegistry(function(state) {
    wasm.__wbindgen_export_2.get(state.dtor)(state.a, state.b);
});
function makeMutClosure(arg0, arg1, dtor, f) {
    var state = {
        a: arg0,
        b: arg1,
        cnt: 1,
        dtor: dtor
    };
    var real = function() {
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        var a = state.a;
        state.a = 0;
        try {
            return f.apply(void 0, [
                a,
                state.b
            ].concat(_to_consumable_array(args)));
        } finally{
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}
function __wbg_adapter_48(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h599a77ca3c3541ed(arg0, arg1, addHeapObject(arg2));
}
function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}
/**
* @param {any} code
* @returns {Promise<any>}
*/ export function get_runtime_version(code) {
    var ret = wasm.get_runtime_version(addHeapObject(code));
    return takeObject(ret);
}
/**
* @param {any} entries
* @param {any} trie_version
* @returns {Promise<any>}
*/ export function calculate_state_root(entries, trie_version) {
    var ret = wasm.calculate_state_root(addHeapObject(entries), addHeapObject(trie_version));
    return takeObject(ret);
}
/**
* @param {any} trie_root_hash
* @param {any} nodes
* @returns {Promise<any>}
*/ export function decode_proof(trie_root_hash, nodes) {
    var ret = wasm.decode_proof(addHeapObject(trie_root_hash), addHeapObject(nodes));
    return takeObject(ret);
}
/**
* @param {any} nodes
* @param {any} updates
* @returns {Promise<any>}
*/ export function create_proof(nodes, updates) {
    var ret = wasm.create_proof(addHeapObject(nodes), addHeapObject(updates));
    return takeObject(ret);
}
/**
* @param {any} task
* @param {JsCallback} js
* @returns {Promise<any>}
*/ export function run_task(task, js) {
    var ret = wasm.run_task(addHeapObject(task), addHeapObject(js));
    return takeObject(ret);
}
/**
* @param {JsCallback} js
* @param {any} key
* @returns {Promise<any>}
*/ export function testing(js, key) {
    var ret = wasm.testing(addHeapObject(js), addHeapObject(key));
    return takeObject(ret);
}
function __wbg_adapter_109(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures__invoke2_mut__h127e0c06482ee17d(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}
function __wbg_load(module, imports) {
    return ___wbg_load.apply(this, arguments);
}
function ___wbg_load() {
    ___wbg_load = _async_to_generator(function(module, imports) {
        var e, bytes, instance;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (!(typeof Response === 'function' && _instanceof(module, Response))) return [
                        3,
                        7
                    ];
                    if (!(typeof WebAssembly.instantiateStreaming === 'function')) return [
                        3,
                        4
                    ];
                    _state.label = 1;
                case 1:
                    _state.trys.push([
                        1,
                        3,
                        ,
                        4
                    ]);
                    return [
                        4,
                        WebAssembly.instantiateStreaming(module, imports)
                    ];
                case 2:
                    return [
                        2,
                        _state.sent()
                    ];
                case 3:
                    e = _state.sent();
                    if (module.headers.get('Content-Type') != 'application/wasm') {
                        console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                    } else {
                        throw e;
                    }
                    return [
                        3,
                        4
                    ];
                case 4:
                    return [
                        4,
                        module.arrayBuffer()
                    ];
                case 5:
                    bytes = _state.sent();
                    return [
                        4,
                        WebAssembly.instantiate(bytes, imports)
                    ];
                case 6:
                    return [
                        2,
                        _state.sent()
                    ];
                case 7:
                    return [
                        4,
                        WebAssembly.instantiate(module, imports)
                    ];
                case 8:
                    instance = _state.sent();
                    if (_instanceof(instance, WebAssembly.Instance)) {
                        return [
                            2,
                            {
                                instance: instance,
                                module: module
                            }
                        ];
                    } else {
                        return [
                            2,
                            instance
                        ];
                    }
                    _state.label = 9;
                case 9:
                    return [
                        2
                    ];
            }
        });
    });
    return ___wbg_load.apply(this, arguments);
}
function __wbg_get_imports() {
    var imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        var ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        var ret = new Error(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_72fb9a18b5ae2624 = function() {
        var ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        var ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_f975102236d3c502 = function(arg0, arg1, arg2) {
        getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
    };
    imports.wbg.__wbg_new_16b304a2cfa7ff4a = function() {
        var ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_d4638f722068f043 = function(arg0, arg1, arg2) {
        getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
    };
    imports.wbg.__wbg_call_b3ca7c6051f9bec1 = function() {
        return handleError(function(arg0, arg1, arg2) {
            var ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        var val = getObject(arg0);
        var ret = (typeof val === "undefined" ? "undefined" : _type_of(val)) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_getwithrefkey_edc2c8960f0f1191 = function(arg0, arg1) {
        var ret = getObject(arg0)[getObject(arg1)];
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        var ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        var ret = getObject(arg0) in getObject(arg1);
        return ret;
    };
    imports.wbg.__wbg_isSafeInteger_f7b04ef02296c4d2 = function(arg0) {
        var ret = Number.isSafeInteger(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
        var ret = +getObject(arg0);
        return ret;
    };
    imports.wbg.__wbg_isArray_2ab64d95e09ea0ae = function(arg0) {
        var ret = Array.isArray(getObject(arg0));
        return ret;
    };
    imports.wbg.__wbg_length_cd7af8117672b8b8 = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_get_bd8e338fbd5f5cc8 = function(arg0, arg1) {
        var ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_next_196c84450b364254 = function() {
        return handleError(function(arg0) {
            var ret = getObject(arg0).next();
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_done_298b57d23c0fc80c = function(arg0) {
        var ret = getObject(arg0).done;
        return ret;
    };
    imports.wbg.__wbg_value_d93c65011f51a456 = function(arg0) {
        var ret = getObject(arg0).value;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        var v = getObject(arg0);
        var ret = typeof v === 'boolean' ? v ? 1 : 0 : 2;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        var obj = getObject(arg1);
        var ret = typeof obj === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_getStorage_22c97034e37920e0 = function() {
        return handleError(function(arg0, arg1) {
            var ret = getObject(arg0).getStorage(takeObject(arg1));
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        var obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        var ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        var ret = _type_of(getObject(arg0)) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
        var v = getObject(arg1);
        var ret = (typeof v === "undefined" ? "undefined" : _type_of(v)) === 'bigint' ? v : undefined;
        getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        var ret = BigInt.asUintN(64, arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        var ret = getObject(arg0) === getObject(arg1);
        return ret;
    };
    imports.wbg.__wbg_String_b9412f8799faab3e = function(arg0, arg1) {
        var ret = String(getObject(arg1));
        var ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        var ret = getObject(arg0) == getObject(arg1);
        return ret;
    };
    imports.wbg.__wbg_getNextKey_8157bf1cdfa76a1e = function() {
        return handleError(function(arg0, arg1, arg2) {
            var ret = getObject(arg0).getNextKey(takeObject(arg1), takeObject(arg2));
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_offchainGetStorage_ff86ba48f46174ec = function() {
        return handleError(function(arg0, arg1) {
            var ret = getObject(arg0).offchainGetStorage(takeObject(arg1));
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_offchainTimestamp_65394c8096420ee7 = function() {
        return handleError(function(arg0) {
            var ret = getObject(arg0).offchainTimestamp();
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_offchainRandomSeed_11f36503d9648b8d = function() {
        return handleError(function(arg0) {
            var ret = getObject(arg0).offchainRandomSeed();
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_offchainSubmitTransaction_b0bdbc6e146312fb = function() {
        return handleError(function(arg0, arg1) {
            var ret = getObject(arg0).offchainSubmitTransaction(takeObject(arg1));
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        var ret = typeof getObject(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbg_new_81740750da40724f = function(arg0, arg1) {
        try {
            var state0 = {
                a: arg0,
                b: arg1
            };
            var cb0 = function(arg0, arg1) {
                var a = state0.a;
                state0.a = 0;
                try {
                    return __wbg_adapter_109(a, state0.b, arg0, arg1);
                } finally{
                    state0.a = a;
                }
            };
            var ret = new Promise(cb0);
            return addHeapObject(ret);
        } finally{
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        var ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        var ret = getObject(arg1).stack;
        var ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        var deferred0_0;
        var deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally{
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_iterator_2cee6dadfd956dfa = function() {
        var ret = Symbol.iterator;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_e3c254076557e348 = function() {
        return handleError(function(arg0, arg1) {
            var ret = Reflect.get(getObject(arg0), getObject(arg1));
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        var ret = typeof getObject(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg_call_27c0f87801dedf93 = function() {
        return handleError(function(arg0, arg1) {
            var ret = getObject(arg0).call(getObject(arg1));
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_next_40fc327bfc8770e6 = function(arg0) {
        var ret = getObject(arg0).next;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_ce0dbfc45cf2f5be = function() {
        return handleError(function() {
            var ret = self.self;
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_window_c6fb939a7f436783 = function() {
        return handleError(function() {
            var ret = window.window;
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_globalThis_d1e6af4856ba331b = function() {
        return handleError(function() {
            var ret = globalThis.globalThis;
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_global_207b558942527489 = function() {
        return handleError(function() {
            var ret = global.global;
            return addHeapObject(ret);
        }, arguments);
    };
    imports.wbg.__wbg_newnoargs_e258087cd0daa0ea = function(arg0, arg1) {
        var ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_length_c20a40f15020d68a = function(arg0) {
        var ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        var ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_12d079cc21e14bdb = function(arg0) {
        var ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_63b92bc8671ed464 = function(arg0) {
        var ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_a47bac70306a19a7 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        var obj = getObject(arg1);
        var ret = typeof obj === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_instanceof_Uint8Array_2b3bbecd033d19f6 = function(arg0) {
        var result;
        try {
            result = _instanceof(getObject(arg0), Uint8Array);
        } catch (_) {
            result = false;
        }
        var ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_836825be07d4c9d2 = function(arg0) {
        var result;
        try {
            result = _instanceof(getObject(arg0), ArrayBuffer);
        } catch (_) {
            result = false;
        }
        var ret = result;
        return ret;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        var ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        var ret = debugString(getObject(arg1));
        var ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_then_a73caa9a87991566 = function(arg0, arg1, arg2) {
        var ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_queueMicrotask_3cbae2ec6b6cd3d6 = function(arg0) {
        var ret = getObject(arg0).queueMicrotask;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_resolve_b0083a7967828ec8 = function(arg0) {
        var ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_0c86a60e8fcfe9f6 = function(arg0, arg1) {
        var ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_queueMicrotask_481971b0d87f3dd4 = function(arg0) {
        queueMicrotask(getObject(arg0));
    };
    imports.wbg.__wbg_debug_5fb96680aecf5dc8 = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__wbg_error_8e3928cfb8a43e2b = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__wbg_info_530a29cb2e4e3304 = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__wbg_log_5bb5f88f245d7762 = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__wbg_warn_63bbae1730aead09 = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbindgen_closure_wrapper1424 = function(arg0, arg1, arg2) {
        var ret = makeMutClosure(arg0, arg1, 147, __wbg_adapter_48);
        return addHeapObject(ret);
    };
    return imports;
}
function __wbg_init_memory(imports, maybe_memory) {}
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedBigInt64Memory0 = null;
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint8Memory0 = null;
    return wasm;
}
function initSync(module) {
    if (wasm !== undefined) return wasm;
    var imports = __wbg_get_imports();
    __wbg_init_memory(imports);
    if (!_instanceof(module, WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    var instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}
function __wbg_init(input) {
    return ___wbg_init.apply(this, arguments);
}
function ___wbg_init() {
    ___wbg_init = _async_to_generator(function(input) {
        var imports, _ref, instance, module;
        return _ts_generator(this, function(_state) {
            switch(_state.label){
                case 0:
                    if (wasm !== undefined) return [
                        2,
                        wasm
                    ];
                    if (typeof input === 'undefined') {
                        input = new URL('chopsticks_executor_bg.wasm', import.meta.url);
                    }
                    imports = __wbg_get_imports();
                    if (typeof input === 'string' || typeof Request === 'function' && _instanceof(input, Request) || typeof URL === 'function' && _instanceof(input, URL)) {
                        input = fetch(input);
                    }
                    __wbg_init_memory(imports);
                    return [
                        4,
                        input
                    ];
                case 1:
                    return [
                        4,
                        __wbg_load.apply(void 0, [
                            _state.sent(),
                            imports
                        ])
                    ];
                case 2:
                    _ref = _state.sent(), instance = _ref.instance, module = _ref.module;
                    return [
                        2,
                        __wbg_finalize_init(instance, module)
                    ];
            }
        });
    });
    return ___wbg_init.apply(this, arguments);
}
export { initSync };
export default __wbg_init;
