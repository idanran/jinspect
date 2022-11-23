interface InspectOptions {
    /** Stylize output with ANSI colors. Defaults to `false`. */
    colors?: boolean;
    /** Try to fit more than one entry of a collection on the same line.
     * Defaults to `true`. */
    compact?: boolean;
    /** Traversal depth for nested objects. Defaults to `4`. */
    depth?: number;
    /** The maximum number of iterable entries to print. Defaults to `100`. */
    iterableLimit?: number;
    /** Sort Object, Set and Map entries by key. Defaults to `false`. */
    sorted?: boolean;
    /** Add a trailing comma for multiline collections. Defaults to `false`. */
    trailingComma?: boolean;
    /*** Evaluate the result of calling getters. Defaults to `false`. */
    getters?: boolean;
    /** Show an object's non-enumerable properties. Defaults to `false`. */
    showHidden?: boolean;
    /** The maximum length of a string before it is truncated with an
     * ellipsis. */
    strAbbreviateSize?: number;
}
/** Converts the input into a string that has the same format as printed by `console.log()`. */
export declare function inspect(value: unknown, options?: InspectOptions): string;
export {};
