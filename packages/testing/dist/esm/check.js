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
/**
 * Main class for checking and validating blockchain data
 * Provides a fluent interface for data transformation, filtering, and assertion
 */ export class Checker {
    #expectFn;
    #value;
    #pipeline = [];
    #extraChecks = [];
    #format = 'json';
    #message;
    #redactOptions;
    /**
   * Creates a new Checker instance
   * @param expectFn - Function for making test assertions
   * @param value - Value to check
   * @param message - Optional message for assertions
   */ constructor(expectFn, value, message){
        this.#expectFn = expectFn;
        this.#value = value;
        this.#message = message;
    }
    /** Convert the checked value to human-readable format */ toHuman() {
        this.#format = 'human';
        return this;
    }
    /** Convert the checked value to hexadecimal format */ toHex() {
        this.#format = 'hex';
        return this;
    }
    /** Convert the checked value to JSON format */ toJson() {
        this.#format = 'json';
        return this;
    }
    /**
   * Set a message for test assertions
   * @param message - Message to use in assertions
   */ message(message) {
        this.#message = message;
        return this;
    }
    /**
   * Filter blockchain events based on provided filters
   * @param filters - Event filters to apply
   */ filterEvents(...filters) {
        this.toHuman();
        this.#pipeline.push((value)=>{
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
        this.#redactOptions = {
            ...this.#redactOptions,
            ...options
        };
        return this;
    }
    #redact(value) {
        if (!this.#redactOptions) {
            return value;
        }
        const redactNumber = this.#redactOptions.number === true || typeof this.#redactOptions.number === 'number';
        const precision = redactNumber ? typeof this.#redactOptions.number === 'number' ? this.#redactOptions.number : 0 : 0;
        const redactHash = this.#redactOptions.hash === true;
        const redactHex = this.#redactOptions.hex === true;
        const redactAddress = this.#redactOptions.address === true;
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
                    if (this.#redactOptions?.removeKeys?.test(k)) {
                        return false;
                    }
                    return true;
                }).map(([k, v])=>{
                    if (this.#redactOptions?.noRedactKeys?.test(k)) {
                        return [
                            k,
                            v
                        ];
                    }
                    if (this.#redactOptions?.redactKeys?.test(k)) {
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
    /**
   * Add a transformation function to the processing pipeline
   * @param fn - Transformation function
   */ map(fn) {
        this.#pipeline.push(fn);
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
        this.#extraChecks.push(fn);
        return this;
    }
    /**
   * Get the final processed value
   * @returns Processed value after applying all transformations
   */ async value() {
        let value = await this.#value;
        switch(this.#format){
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
        for (const fn of this.#pipeline){
            value = await fn(value);
        }
        value = this.#redact(value);
        for (const fn of this.#extraChecks){
            await fn(value);
        }
        return value;
    }
    /**
   * Assert that the value matches a snapshot
   * @param msg - Optional message for the assertion
   */ async toMatchSnapshot(msg) {
        return this.#expectFn(await this.value()).toMatchSnapshot(msg ?? this.#message);
    }
    /**
   * Assert that the value matches an expected value
   * @param value - Expected value
   * @param msg - Optional message for the assertion
   */ async toMatch(value, msg) {
        return this.#expectFn(await this.value()).toMatch(value, msg ?? this.#message);
    }
    /**
   * Assert that the value matches an expected object structure
   * @param value - Expected object structure
   * @param msg - Optional message for the assertion
   */ async toMatchObject(value, msg) {
        return this.#expectFn(await this.value()).toMatchObject(value, msg ?? this.#message);
    }
}
/**
 * Creates a set of checking utilities with a provided assertion function
 * @param expectFn - Function for making test assertions
 * @returns Object containing various checking utilities
 */ export const withExpect = (expectFn)=>{
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
