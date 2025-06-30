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
    get Checker () {
        return Checker;
    },
    get withExpect () {
        return withExpect;
    }
});
function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}
function _class_private_method_get(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
}
function _class_private_method_init(obj, privateSet) {
    _check_private_redeclaration(obj, privateSet);
    privateSet.add(obj);
}
/**
 * Processes a Codec or array of Codecs with a given transformation function
 * @param codec - Single Codec or array of Codecs to process
 * @param fn - Transformation function to apply to each Codec
 * @returns Processed value(s)
 */ const processCodecOrArray = (codec, fn)=>Array.isArray(codec) ? codec.map(fn) : fn(codec);
/**
 * Converts Codec data to human-readable format
 * @param codec - Codec data to convert
 */ const toHuman = (codec)=>processCodecOrArray(codec, (c)=>c?.toHuman?.() ?? c);
/**
 * Converts Codec data to hexadecimal format
 * @param codec - Codec data to convert
 */ const toHex = (codec)=>processCodecOrArray(codec, (c)=>c?.toHex?.() ?? c);
/**
 * Converts Codec data to JSON format
 * @param codec - Codec data to convert
 */ const toJson = (codec)=>processCodecOrArray(codec, (c)=>c?.toJSON?.() ?? c);
var _expectFn = /*#__PURE__*/ new WeakMap(), _value = /*#__PURE__*/ new WeakMap(), _pipeline = /*#__PURE__*/ new WeakMap(), _extraChecks = /*#__PURE__*/ new WeakMap(), _format = /*#__PURE__*/ new WeakMap(), _message = /*#__PURE__*/ new WeakMap(), _redactOptions = /*#__PURE__*/ new WeakMap(), _redact = /*#__PURE__*/ new WeakSet();
class Checker {
    /** Convert the checked value to human-readable format */ toHuman() {
        _class_private_field_set(this, _format, 'human');
        return this;
    }
    /** Convert the checked value to hexadecimal format */ toHex() {
        _class_private_field_set(this, _format, 'hex');
        return this;
    }
    /** Convert the checked value to JSON format */ toJson() {
        _class_private_field_set(this, _format, 'json');
        return this;
    }
    /**
   * Set a message for test assertions
   * @param message - Message to use in assertions
   */ message(message) {
        _class_private_field_set(this, _message, message);
        return this;
    }
    /**
   * Filter blockchain events based on provided filters
   * @param filters - Event filters to apply
   */ filterEvents(...filters) {
        this.toHuman();
        _class_private_field_get(this, _pipeline).push((value)=>{
            let data = value.map(({ event: { index: _, ...event } })=>event);
            if (filters.length > 0) {
                data = data.filter((evt)=>{
                    return filters.some((filter)=>{
                        if (typeof filter === 'string') {
                            return evt.section === filter;
                        }
                        if ('method' in filter) {
                            const { section, method } = filter;
                            return evt.section === section && evt.method === method;
                        }
                    });
                });
            }
            return data;
        });
        return this;
    }
    /**
   * Apply redaction rules to the checked value
   * @param options - Redaction options
   */ redact(options = {
        number: 2,
        hash: true
    }) {
        _class_private_field_set(this, _redactOptions, {
            ..._class_private_field_get(this, _redactOptions),
            ...options
        });
        return this;
    }
    /**
   * Add a transformation function to the processing pipeline
   * @param fn - Transformation function
   */ map(fn) {
        _class_private_field_get(this, _pipeline).push(fn);
        return this;
    }
    /**
   * Apply a function to the current Checker instance
   * @param fn - Function to apply
   */ pipe(fn) {
        return fn ? fn(this) : this;
    }
    /**
   * Add an extra check function to the pipeline
   * @param fn - Extra check function
   */ check(fn) {
        _class_private_field_get(this, _extraChecks).push(fn);
        return this;
    }
    /**
   * Get the final processed value
   * @returns Processed value after applying all transformations
   */ async value() {
        let value = await _class_private_field_get(this, _value);
        switch(_class_private_field_get(this, _format)){
            case 'human':
                value = toHuman(value);
                break;
            case 'hex':
                value = toHex(value);
                break;
            case 'json':
                value = toJson(value);
                break;
        }
        for (const fn of _class_private_field_get(this, _pipeline)){
            value = await fn(value);
        }
        value = _class_private_method_get(this, _redact, redact).call(this, value);
        for (const fn of _class_private_field_get(this, _extraChecks)){
            await fn(value);
        }
        return value;
    }
    /**
   * Assert that the value matches a snapshot
   * @param msg - Optional message for the assertion
   */ async toMatchSnapshot(msg) {
        return _class_private_field_get(this, _expectFn).call(this, await this.value()).toMatchSnapshot(msg ?? _class_private_field_get(this, _message));
    }
    /**
   * Assert that the value matches an expected value
   * @param value - Expected value
   * @param msg - Optional message for the assertion
   */ async toMatch(value, msg) {
        return _class_private_field_get(this, _expectFn).call(this, await this.value()).toMatch(value, msg ?? _class_private_field_get(this, _message));
    }
    /**
   * Assert that the value matches an expected object structure
   * @param value - Expected object structure
   * @param msg - Optional message for the assertion
   */ async toMatchObject(value, msg) {
        return _class_private_field_get(this, _expectFn).call(this, await this.value()).toMatchObject(value, msg ?? _class_private_field_get(this, _message));
    }
    /**
   * Creates a new Checker instance
   * @param expectFn - Function for making test assertions
   * @param value - Value to check
   * @param message - Optional message for assertions
   */ constructor(expectFn, value, message){
        _class_private_method_init(this, _redact);
        _class_private_field_init(this, _expectFn, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _value, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _pipeline, {
            writable: true,
            value: []
        });
        _class_private_field_init(this, _extraChecks, {
            writable: true,
            value: []
        });
        _class_private_field_init(this, _format, {
            writable: true,
            value: 'json'
        });
        _class_private_field_init(this, _message, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _redactOptions, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _expectFn, expectFn);
        _class_private_field_set(this, _value, value);
        _class_private_field_set(this, _message, message);
    }
}
function redact(value) {
    if (!_class_private_field_get(this, _redactOptions)) {
        return value;
    }
    const redactNumber = _class_private_field_get(this, _redactOptions).number === true || typeof _class_private_field_get(this, _redactOptions).number === 'number';
    const precision = redactNumber ? typeof _class_private_field_get(this, _redactOptions).number === 'number' ? _class_private_field_get(this, _redactOptions).number : 0 : 0;
    const redactHash = _class_private_field_get(this, _redactOptions).hash === true;
    const redactHex = _class_private_field_get(this, _redactOptions).hex === true;
    const redactAddress = _class_private_field_get(this, _redactOptions).address === true;
    const processNumber = (value)=>{
        if (precision > 0) {
            const rounded = Number.parseFloat(value.toPrecision(precision));
            if (rounded === value) {
                return rounded;
            }
            return `(rounded ${rounded})`;
        }
        return '(number)';
    };
    const process = (obj, depth)=>{
        if (depth <= 0) {
            return obj;
        }
        if (obj == null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((x)=>process(x, depth - 1));
        }
        if (redactNumber && typeof obj === 'number') {
            return processNumber(obj);
        }
        if (typeof obj === 'string') {
            if (redactNumber && obj.match(/0x000000[0-9a-f]{26}/)) {
                // this is very likely u128 encoded in hex
                const num = Number.parseInt(obj);
                return processNumber(num);
            }
            if (redactHash && obj.match(/0x[0-9a-f]{64}/)) {
                return '(hash)';
            }
            if (redactHex && obj.match(/0x[0-9a-f]+/)) {
                return '(hex)';
            }
            if (redactAddress && obj.match(/^[1-9A-HJ-NP-Za-km-z]{46,48}$/)) {
                return '(address)';
            }
            if (redactNumber && obj.match(/^-?[\d,]+$/)) {
                const num = Number.parseInt(obj.replace(/,/g, ''));
                return processNumber(num);
            }
            return obj;
        }
        if (typeof obj === 'object') {
            return Object.fromEntries(Object.entries(obj).filter(([k])=>{
                if (_class_private_field_get(this, _redactOptions)?.removeKeys?.test(k)) {
                    return false;
                }
                return true;
            }).map(([k, v])=>{
                if (_class_private_field_get(this, _redactOptions)?.noRedactKeys?.test(k)) {
                    return [
                        k,
                        v
                    ];
                }
                if (_class_private_field_get(this, _redactOptions)?.redactKeys?.test(k)) {
                    return [
                        k,
                        '(redacted)'
                    ];
                }
                return [
                    k,
                    process(v, depth - 1)
                ];
            }));
        }
        return obj;
    };
    return process(value, 50);
}
const withExpect = (expectFn)=>{
    /**
   * Create a new Checker instance
   * @param value - Value to check
   * @param msg - Optional message for assertions
   */ const check = (value, msg)=>{
        if (value instanceof Checker) {
            if (msg) {
                return value.message(msg);
            }
            return value;
        }
        return new Checker(expectFn, value, msg);
    };
    /**
   * Check blockchain events with filtering and redaction
   * @param events - Events to check
   * @param filters - Event filters to apply
   */ const checkEvents = ({ events }, ...filters)=>check(events, 'events').filterEvents(...filters).redact();
    /**
   * Check system events with filtering and redaction
   * @param api - Polkadot API instance
   * @param filters - Event filters to apply
   */ const checkSystemEvents = ({ api }, ...filters)=>check(api.query.system.events(), 'system events').filterEvents(...filters).redact();
    /**
   * Check Upward Message Passing (UMP) messages
   * @param api - Polkadot API instance
   */ const checkUmp = ({ api })=>check(api.query.parachainSystem.upwardMessages(), 'ump').map((value)=>api.createType('Vec<XcmVersionedXcm>', value).toJSON());
    /**
   * Check HRMP (Horizontal Relay-routed Message Passing) messages
   * @param api - Polkadot API instance
   */ const checkHrmp = ({ api })=>check(api.query.parachainSystem.hrmpOutboundMessages(), 'hrmp').map((value)=>value.map(({ recipient, data })=>({
                    data: api.createType('(XcmpMessageFormat, XcmVersionedXcm)', data).toJSON(),
                    recipient
                })));
    /**
   * Check a value in hexadecimal format
   * @param value - Value to check
   * @param msg - Optional message for assertions
   */ const checkHex = (value, msg)=>check(value, msg).toHex();
    return {
        check,
        checkEvents,
        checkSystemEvents,
        checkUmp,
        checkHrmp,
        checkHex
    };
};
