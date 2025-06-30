import type { ApiPromise } from '@polkadot/api';
import type { Codec } from '@polkadot/types/types';
/**
 * Defines a filter for blockchain events
 * Can be either a string (section name) or an object with method and section
 */
export type EventFilter = string | {
    method: string;
    section: string;
};
/**
 * Configuration options for data redaction
 */
export type RedactOptions = {
    /** Redact numbers with optional precision */
    number?: boolean | number;
    /** Redact 32-byte hex values */
    hash?: boolean;
    /** Redact any hex values with 0x prefix */
    hex?: boolean;
    /** Redact base58 addresses */
    address?: boolean;
    /** Regex pattern for keys whose values should be redacted */
    redactKeys?: RegExp;
    /** Regex pattern for keys that should be removed */
    removeKeys?: RegExp;
    /** Regex pattern for keys that should not be redacted */
    noRedactKeys?: RegExp;
};
/**
 * Function type for test assertions
 */
export type ExpectFn = (value: any) => {
    toMatchSnapshot: (msg?: string) => void;
    toMatch(value: any, msg?: string): void;
    toMatchObject(value: any, msg?: string): void;
};
/**
 * Main class for checking and validating blockchain data
 * Provides a fluent interface for data transformation, filtering, and assertion
 */
export declare class Checker {
    #private;
    /**
     * Creates a new Checker instance
     * @param expectFn - Function for making test assertions
     * @param value - Value to check
     * @param message - Optional message for assertions
     */
    constructor(expectFn: ExpectFn, value: any, message?: string);
    /** Convert the checked value to human-readable format */
    toHuman(): this;
    /** Convert the checked value to hexadecimal format */
    toHex(): this;
    /** Convert the checked value to JSON format */
    toJson(): this;
    /**
     * Set a message for test assertions
     * @param message - Message to use in assertions
     */
    message(message: string): this;
    /**
     * Filter blockchain events based on provided filters
     * @param filters - Event filters to apply
     */
    filterEvents(...filters: EventFilter[]): this;
    /**
     * Apply redaction rules to the checked value
     * @param options - Redaction options
     */
    redact(options?: RedactOptions): this;
    /**
     * Add a transformation function to the processing pipeline
     * @param fn - Transformation function
     */
    map(fn: (value: any) => any): this;
    /**
     * Apply a function to the current Checker instance
     * @param fn - Function to apply
     */
    pipe(fn?: (value: Checker) => Checker): Checker;
    /**
     * Add an extra check function to the pipeline
     * @param fn - Extra check function
     */
    check(fn: (value: any) => Promise<void> | void): this;
    /**
     * Get the final processed value
     * @returns Processed value after applying all transformations
     */
    value(): Promise<any>;
    /**
     * Assert that the value matches a snapshot
     * @param msg - Optional message for the assertion
     */
    toMatchSnapshot(msg?: string): Promise<void>;
    /**
     * Assert that the value matches an expected value
     * @param value - Expected value
     * @param msg - Optional message for the assertion
     */
    toMatch(value: any, msg?: string): Promise<void>;
    /**
     * Assert that the value matches an expected object structure
     * @param value - Expected object structure
     * @param msg - Optional message for the assertion
     */
    toMatchObject(value: any, msg?: string): Promise<void>;
}
/**
 * Creates a set of checking utilities with a provided assertion function
 * @param expectFn - Function for making test assertions
 * @returns Object containing various checking utilities
 */
export declare const withExpect: (expectFn: ExpectFn) => {
    check: (value: any, msg?: string) => Checker;
    checkEvents: ({ events }: {
        events: Promise<Codec[] | Codec>;
    }, ...filters: EventFilter[]) => Checker;
    checkSystemEvents: ({ api }: {
        api: ApiPromise;
    }, ...filters: EventFilter[]) => Checker;
    checkUmp: ({ api }: {
        api: ApiPromise;
    }) => Checker;
    checkHrmp: ({ api }: {
        api: ApiPromise;
    }) => Checker;
    checkHex: (value: any, msg?: string) => Checker;
};
