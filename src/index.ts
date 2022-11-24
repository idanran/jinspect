// Forked from deno's ext/console/02_console.js
// Copyright 2018-2022 the Deno authors. MIT license.
// Copyright 2022 idanran. MIT license.

import * as colors from './colors'

interface InspectOptions {
    /** Stylize output with ANSI colors. Defaults to `false`. */
    colors?: boolean
    /** Try to fit more than one entry of a collection on the same line.
     * Defaults to `true`. */
    compact?: boolean
    /** Traversal depth for nested objects. Defaults to `4`. */
    depth?: number
    /** The maximum number of iterable entries to print. Defaults to `100`. */
    iterableLimit?: number
    /** Sort Object, Set and Map entries by key. Defaults to `false`. */
    sorted?: boolean
    /** Add a trailing comma for multiline collections. Defaults to `false`. */
    trailingComma?: boolean
    /*** Evaluate the result of calling getters. Defaults to `false`. */
    getters?: boolean
    /** Show an object's non-enumerable properties. Defaults to `false`. */
    showHidden?: boolean
    /** The maximum length of a string before it is truncated with an
     * ellipsis. */
    strAbbreviateSize?: number
}

/** Converts the input into a string that has the same format as printed by `console.log()`. */
export function inspect(
    value: unknown,
    options: InspectOptions = {},
) {
    circular = undefined
    return inspectValue(value, {
        ...DEFAULT_INSPECT_OPTIONS,
        ...options,
    })
}

let circular: Map<unknown, number> | undefined
function handleCircular(value: unknown, cyan: (s: string) => string) {
    let index = 1
    if (circular === undefined) {
        circular = new Map()
        circular.set(value, index)
    } else {
        index = circular.get(value)!
        if (index === undefined) {
            index = circular.size + 1;
            circular.set(value, index)
        }
    }
    // Circular string is cyan
    return cyan(`[Circular *${index}]`)
}

const DEFAULT_INSPECT_OPTIONS = {
    depth: 4,
    indentLevel: 0,
    sorted: false,
    trailingComma: false,
    compact: true,
    iterableLimit: 100,
    colors: false,
    getters: false,
    showHidden: false,
    strAbbreviateSize: 100,
}

const DEFAULT_INDENT = "  " // Default indent string

const LINE_BREAKING_LENGTH = 80
const MIN_GROUP_LENGTH = 6

const STR_ABBREVIATE_SIZE = 100

const CTX_STACK: unknown[] = []
function ctxHas(x: Record<any, any>) {
    // Only check parent contexts
    return CTX_STACK.slice(0, CTX_STACK.length - 1).includes(x)
}

function inspectValue(
    value: unknown,
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    CTX_STACK.push(value)
    let x
    try {
        x = _inspectValue(value, inspectOptions)
    } finally {
        CTX_STACK.pop()
    }
    return x
}

function maybeColor(fn: (s: string) => string, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    return inspectOptions.colors ? fn : (s: string) => s
}

// We can match Node's quoting behavior exactly by swapping the double quote and
// single quote in this array. That would give preference to single quotes.
// However, we prefer double quotes as the default.
const QUOTES = ['"', "'", "`"]

// Replace escape sequences that can modify output.
function replaceEscapeSequences(string: string) {
    const escapeMap = {
        "\b": "\\b",
        "\f": "\\f",
        "\n": "\\n",
        "\r": "\\r",
        "\t": "\\t",
        "\v": "\\v",
    }

    return string.replace(/([\b\f\n\r\t\v])/g,
        (c) => escapeMap[c as keyof typeof escapeMap]).replace(/[\x00-\x1f\x7f-\x9f]/g,
            (c) =>
                "\\x" + c.charCodeAt(0).toString(16).padStart(2,
                    "0"))
}

/** Surround the string in quotes.
 *
 * The quote symbol is chosen by taking the first of the `QUOTES` array which
 * does not occur in the string. If they all occur, settle with `QUOTES[0]`.
 *
 * Insert a backslash before any occurrence of the chosen quote symbol and
 * before any backslash.
 */
function quoteString(string: string) {
    const quote = QUOTES.find((c) => !string.includes(c)) ?? QUOTES[0]
    const escapePattern = new RegExp(`(?=[${quote}\\\\])`, "g")
    string = string.replace(escapePattern, "\\")
    string = replaceEscapeSequences(string)
    return `${quote}${string}${quote}`
}

// Print strings when they are inside of arrays or objects with quotes
function inspectValueWithQuotes(
    value: unknown,
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    const abbreviateSize =
        typeof inspectOptions.strAbbreviateSize === "undefined"
            ? STR_ABBREVIATE_SIZE
            : inspectOptions.strAbbreviateSize;
    const green = maybeColor(colors.green, inspectOptions);
    switch (typeof value) {
        case "string": {
            const trunc = value.length > abbreviateSize
                ? value.slice(0, abbreviateSize) + "..."
                : value;
            return green(quoteString(trunc)); // Quoted strings are green
        }
        default:
            return inspectValue(value, inspectOptions);
    }
}

type TypedArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | BigInt64Array | BigUint64Array

// Copyright Joyent, Inc. and other Node contributors. MIT license.
// Forked from Node's lib/internal/cli_table.js
function isTypedArray(x: unknown): x is TypedArray {
    return ArrayBuffer.isView(x) &&
        !DataView.prototype.isPrototypeOf(x)
}

function isInvalidDate(x: Date) {
    return isNaN(x.getTime())
}

// Ported from Node.js
// Copyright Node.js contributors. All rights reserved.
function groupEntries(
    entries: any[],
    level: number,
    value?: Array<unknown>,
    iterableLimit = 100,
) {
    let totalLength = 0
    let maxLength = 0
    let entriesLength = entries.length
    if (iterableLimit < entriesLength) {
        // This makes sure the "... n more items" part is not taken into account.
        entriesLength--
    }
    const separatorSpace = 2 // Add 1 for the space and 1 for the separator.
    const dataLen = new Array(entriesLength)
    // Calculate the total length of all output entries and the individual max
    // entries length of all output entries.
    // IN PROGRESS: Colors are being taken into account.
    for (let i = 0; i < entriesLength; i++) {
        // Taking colors into account: removing the ANSI color
        // codes from the string before measuring its length
        const len = colors.stripColor(entries[i]).length
        dataLen[i] = len
        totalLength += len + separatorSpace
        if (maxLength < len) maxLength = len
    }
    // Add two to `maxLength` as we add a single whitespace character plus a comma
    // in-between two entries.
    const actualMax = maxLength + separatorSpace
    // Check if at least three entries fit next to each other and prevent grouping
    // of arrays that contains entries of very different length (i.e., if a single
    // entry is longer than 1/5 of all other entries combined). Otherwise the
    // space in-between small entries would be enormous.
    if (
        actualMax * 3 + (level + 1) < LINE_BREAKING_LENGTH &&
        (totalLength / actualMax > 5 || maxLength <= 6)
    ) {
        const approxCharHeights = 2.5
        const averageBias = Math.sqrt(actualMax - totalLength / entries.length)
        const biasedMax = Math.max(actualMax - 3 - averageBias, 1)
        // Dynamically check how many columns seem possible.
        const columns = Math.min(
            // Ideally a square should be drawn. We expect a character to be about 2.5
            // times as high as wide. This is the area formula to calculate a square
            // which contains n rectangles of size `actualMax * approxCharHeights`.
            // Divide that by `actualMax` to receive the correct number of columns.
            // The added bias increases the columns for short entries.
            Math.round(
                Math.sqrt(approxCharHeights * biasedMax * entriesLength) / biasedMax,
            ),
            // Do not exceed the breakLength.
            Math.floor((LINE_BREAKING_LENGTH - (level + 1)) / actualMax),
            // Limit the columns to a maximum of fifteen.
            15,
        )
        // Return with the original output if no grouping should happen.
        if (columns <= 1) {
            return entries;
        }
        const tmp: string[] = []
        const maxLineLength = []
        for (let i = 0; i < columns; i++) {
            let lineMaxLength = 0
            for (let j = i; j < entries.length; j += columns) {
                if (dataLen[j] > lineMaxLength) lineMaxLength = dataLen[j]
            }
            lineMaxLength += separatorSpace
            maxLineLength[i] = lineMaxLength
        }
        let order: keyof typeof String.prototype = "padStart"
        if (value !== undefined) {
            for (let i = 0; i < entries.length; i++) {
                if (
                    typeof (value[i]) !== "number" &&
                    typeof value[i] !== "bigint"
                ) {
                    order = "padEnd"
                    break
                }
            }
        }
        // Each iteration creates a single line of grouped entries.
        for (let i = 0; i < entriesLength; i += columns) {
            // The last lines may contain less entries than columns.
            const max = Math.min(i + columns, entriesLength)
            let str = ""
            let j = i
            for (; j < max - 1; j++) {
                const lengthOfColorCodes = entries[j].length - dataLen[j]
                const padding = maxLineLength[j - i] + lengthOfColorCodes
                str += `${entries[j]}, `[order](padding, " ")
            }
            if (order === "padStart") {
                const lengthOfColorCodes = entries[j].length - dataLen[j]
                const padding = maxLineLength[j - i] +
                    lengthOfColorCodes -
                    separatorSpace;
                str += entries[j].padStart(padding, " ")
            } else {
                str += entries[j]
            }
            tmp.push(str)
        }
        if (iterableLimit < entries.length) {
            tmp.push(entries[entriesLength])
        }
        entries = tmp
    }
    return entries
}

interface entryHandlerResp {
    entry: string
    skipTo?: number
}

interface inspectIterableOptions {
    typeName: string
    displayName: string
    delims: string[]
    entryHandler: (entry: [any, unknown], inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) => entryHandlerResp | string
    group: boolean
    sort: boolean
}

function inspectIterable(
    value: unknown,
    options: inspectIterableOptions,
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    if (inspectOptions.indentLevel >= inspectOptions.depth) {
        return cyan(`[${options.typeName}]`)
    }

    const entries: unknown[] = []
    let iter: IterableIterator<[any, any]> | undefined
    let valueIsTypedArray = false
    let entriesLength

    switch (options.typeName) {
        case "Map":
            iter = (value as Map<any, any>).entries()
            entriesLength = (value as Map<any, any>).size
            break
        case "Set":
            iter = (value as Set<any>).entries()
            entriesLength = (value as Set<any>).size
            break
        case "Array":
            entriesLength = (value as Array<any>).length
            break
        default:
            if (isTypedArray(value)) {
                entriesLength = value.length
                iter = value.entries()
                valueIsTypedArray = true;
            } else {
                throw new TypeError("unreachable")
            }
    }

    let entriesLengthWithoutEmptyItems = entriesLength
    if (options.typeName === "Array") {
        for (
            let i = 0, j = 0;
            i < entriesLength && j < inspectOptions.iterableLimit;
            i++, j++
        ) {
            inspectOptions.indentLevel++
            const { entry, skipTo } = (options.entryHandler(
                [i, (value as Array<unknown>)[i]],
                inspectOptions,
            ) as entryHandlerResp)
            entries.push(entry)
            inspectOptions.indentLevel--

            if (skipTo) {
                // subtract skipped (empty) items
                entriesLengthWithoutEmptyItems -= skipTo - i
                i = skipTo
            }
        }
    } else {
        let i = 0
        while (true) {
            let el
            try {
                const res = iter!.next()
                if (res.done) {
                    break
                }
                el = res.value
            } catch (err) {
                if (valueIsTypedArray) {
                    // TypedArray.prototype.entries doesn't throw, unless the ArrayBuffer
                    // is detached. We don't want to show the exception in that case, so
                    // we catch it here and pretend the ArrayBuffer has no entries (like
                    // Chrome DevTools does).
                    break
                }
                throw err
            }
            if (i < inspectOptions.iterableLimit) {
                inspectOptions.indentLevel++
                entries.push(options.entryHandler(
                    el,
                    inspectOptions,
                ))
                inspectOptions.indentLevel--
            } else {
                break
            }
            i++
        }
    }

    if (options.sort) {
        entries.sort()
    }

    if (entriesLengthWithoutEmptyItems > inspectOptions.iterableLimit) {
        const nmore = entriesLengthWithoutEmptyItems -
            inspectOptions.iterableLimit
        entries.push(`... ${nmore} more items`)
    }

    const iPrefix = `${options.displayName ? options.displayName + " " : ""}`

    const level = inspectOptions.indentLevel;
    const initIndentation = `\n${DEFAULT_INDENT.repeat(level + 1)}`
    const entryIndentation = `,\n${DEFAULT_INDENT.repeat(level + 1)}`
    const closingDelimIndentation = DEFAULT_INDENT.repeat(level)
    const closingIndentation = `${inspectOptions.trailingComma ? "," : ""
        }\n${closingDelimIndentation}`;

    let iContent;
    if (entries.length === 0 && !inspectOptions.compact) {
        iContent = `\n${closingDelimIndentation}`
    } else if (options.group && entries.length > MIN_GROUP_LENGTH) {
        const groups = groupEntries(entries, level, value as unknown[])
        iContent = `${initIndentation}${groups.join(entryIndentation)
            }${closingIndentation}`
    } else {
        iContent = entries.length === 0
            ? ""
            : ` ${entries.join(", ")} `
        if (
            colors.stripColor(iContent).length > LINE_BREAKING_LENGTH ||
            !inspectOptions.compact
        ) {
            iContent = `${initIndentation}${entries.join(entryIndentation)
                }${closingIndentation}`
        }
    }

    return `${iPrefix}${options.delims[0]}${iContent}${options.delims[1]}`;
}

function inspectArray(
    value: unknown[],
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    const gray = maybeColor(colors.gray, inspectOptions)
    let lastValidIndex = 0
    let keys: string[]
    const options: inspectIterableOptions = {
        typeName: "Array",
        displayName: "",
        delims: ["[", "]"],
        entryHandler: (entry: [number, unknown], inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) => {
            const [index, val] = entry
            let i = index
            lastValidIndex = index
            if (!value.hasOwnProperty(i)) {
                let skipTo
                keys = keys || Object.keys(value)
                i = value.length
                if (keys.length === 0) {
                    // fast path, all items are empty
                    skipTo = i
                } else {
                    // Not all indexes are empty or there's a non-index property
                    // Find first non-empty array index
                    while (keys.length) {
                        const key = keys.shift()!
                        // check if it's a valid array index
                        if (key as unknown as number > lastValidIndex && key as unknown as number < 2 ** 32 - 1) {
                            i = Number(key)
                            break
                        }
                    }

                    skipTo = i - 1;
                }
                const emptyItems = i - index;
                const ending = emptyItems > 1 ? "s" : "";
                return {
                    entry: gray(`<${emptyItems} empty item${ending}>`),
                    skipTo,
                };
            } else {
                return { entry: inspectValueWithQuotes(val, inspectOptions) }
            }
        },
        group: inspectOptions.compact,
        sort: false,
    }
    return inspectIterable(value, options, inspectOptions)
}

// Surround a symbol's description in quotes when it is required (e.g the description has non printable characters).
function maybeQuoteSymbol(symbol: symbol) {
    if (symbol.description === undefined) {
        return symbol.toString()
    }

    if (/^[a-zA-Z_][a-zA-Z_.0-9]*$/.test(symbol.description)) {
        return symbol.toString()
    }

    return `Symbol(${quoteString(symbol.description)})`
}

function getClassInstanceName(instance: unknown) {
    if (typeof instance != "object") {
        return ""
    }
    const constructor = instance?.constructor;
    if (typeof constructor == "function") {
        return constructor.name ?? ""
    }
    return ""
}

// Surround a string with quotes when it is required (e.g the string not a valid identifier).
function maybeQuoteString(string: string) {
    if (/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(string)) {
        return replaceEscapeSequences(string)
    }

    return quoteString(string)
}

function propertyIsEnumerable(obj: Record<symbol | string, unknown>, prop: symbol) {
    if (
        obj == null ||
        typeof obj.propertyIsEnumerable !== "function"
    ) {
        return false;
    }

    return obj.propertyIsEnumerable(prop)
}

function inspectRawObject(
    value: Record<symbol | string, any>,
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    const cyan = maybeColor(colors.cyan, inspectOptions)

    if (inspectOptions.indentLevel >= inspectOptions.depth) {
        return [cyan("[Object]"), ""]; // wrappers are in cyan
    }

    let baseString;

    let shouldShowDisplayName = false
    let displayName = value[
        Symbol.toStringTag
    ]
    if (!displayName) {
        displayName = getClassInstanceName(value)
    }
    if (
        displayName && displayName !== "Object" && displayName !== "anonymous"
    ) {
        shouldShowDisplayName = true
    }

    const entries: string[] = []
    const stringKeys = Object.keys(value)
    const symbolKeys = Object.getOwnPropertySymbols(value)
    if (inspectOptions.sorted) {
        stringKeys.sort()
        symbolKeys.sort((s1, s2) =>
            (s1.description ?? "").localeCompare(s2.description ?? ""),
        )
    }

    const red = maybeColor(colors.red, inspectOptions)

    inspectOptions.indentLevel++

    for (const key of stringKeys) {
        if (inspectOptions.getters) {
            let propertyValue
            let error = null
            try {
                propertyValue = value[key]
            } catch (error_: any) {
                error = error_
            }
            const inspectedValue = error == null
                ? inspectValueWithQuotes(propertyValue, inspectOptions)
                : red(`[Thrown ${error.name}: ${error.message}]`);
            entries.push(`${maybeQuoteString(key)}: ${inspectedValue}`)
        } else {
            const descriptor = Object.getOwnPropertyDescriptor(value, key)
            if (descriptor!.get !== undefined && descriptor!.set !== undefined) {
                entries.push(`${maybeQuoteString(key)}: [Getter/Setter]`)
            } else if (descriptor!.get !== undefined) {
                entries.push(`${maybeQuoteString(key)}: [Getter]`)
            } else {
                entries.push(`${maybeQuoteString(key)}: ${inspectValueWithQuotes(value[key], inspectOptions)
                    }`)
            }
        }
    }

    for (const key of symbolKeys) {
        if (
            !inspectOptions.showHidden &&
            !propertyIsEnumerable(value, key)
        ) {
            continue
        }

        if (inspectOptions.getters) {
            let propertyValue
            let error
            try {
                propertyValue = value[key];
            } catch (error_: any) {
                error = error_
            }
            const inspectedValue = error == null
                ? inspectValueWithQuotes(propertyValue, inspectOptions)
                : red(`Thrown ${error.name}: ${error.message}`)
            entries.push(`[${maybeQuoteSymbol(key)}]: ${inspectedValue}`)
        } else {
            const descriptor = Object.getOwnPropertyDescriptor(value, key)
            if (descriptor!.get !== undefined && descriptor!.set !== undefined) {
                entries.push(`[${maybeQuoteSymbol(key)}]: [Getter/Setter]`)
            } else if (descriptor!.get !== undefined) {
                entries.push(`[${maybeQuoteSymbol(key)}]: [Getter]`)
            } else {
                entries.push(`[${maybeQuoteSymbol(key)}]: ${inspectValueWithQuotes(value[key], inspectOptions)
                    }`)
            }
        }
    }

    inspectOptions.indentLevel--

    // Making sure color codes are ignored when calculating the total length
    const totalLength = entries.length + inspectOptions.indentLevel +
        colors.stripColor(entries.join("")).length

    if (entries.length === 0) {
        baseString = "{}";
    } else if (totalLength > LINE_BREAKING_LENGTH || !inspectOptions.compact) {
        const entryIndent = DEFAULT_INDENT.repeat(inspectOptions.indentLevel + 1)
        const closingIndent = DEFAULT_INDENT.repeat(inspectOptions.indentLevel)
        baseString = `{\n${entryIndent}${entries.join(`,\n${entryIndent}`)
            }${inspectOptions.trailingComma ? "," : ""}\n${closingIndent}}`;
    } else {
        baseString = `{ ${entries.join(", ")} }`;
    }

    if (shouldShowDisplayName) {
        baseString = `${displayName} ${baseString}`;
    }

    let refIndex = "";
    if (circular !== undefined) {
        const index = circular.get(value)
        if (index !== undefined) {
            refIndex = cyan(`<ref *${index}> `);
        }
    }

    return [baseString, refIndex];
}

const denoCustomInspect = Symbol.for("Deno.customInspect")

function inspectFunction(value: Function, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    if (
        Reflect.has(value, denoCustomInspect) &&
        typeof (value as Function & { [denoCustomInspect]: typeof denoCustomInspect })[denoCustomInspect] === "function"
    ) {
        return String((value as Function & { [denoCustomInspect]: Function })[denoCustomInspect](inspect, inspectOptions))
    }
    // Might be Function/AsyncFunction/GeneratorFunction/AsyncGeneratorFunction
    let cstrName = Object.getPrototypeOf(value)?.constructor?.name
    if (!cstrName) {
        // If prototype is removed or broken,
        // use generic 'Function' instead.
        cstrName = "Function"
    }

    // Our function may have properties, so we want to format those
    // as if our function was an object
    // If we didn't find any properties, we will just append an
    // empty suffix.
    let suffix = ``
    let refStr = ""
    if (
        Object.keys(value).length > 0 ||
        Object.getOwnPropertySymbols(value).length > 0
    ) {
        const [propString, refIndex] = inspectRawObject(
            value,
            inspectOptions,
        );
        refStr = refIndex
        // Filter out the empty string for the case we only have
        // non-enumerable symbols.
        if (
            propString.length > 0 &&
            propString !== "{}"
        ) {
            suffix = ` ${propString}`
        }
    }

    if (value.name && value.name !== "anonymous") {
        // from MDN spec
        return cyan(`${refStr}[${cstrName}: ${value.name}]`) + suffix
    }
    return cyan(`${refStr}[${cstrName}]`) + suffix
}

const colorKeywords = new Map([
    ["black", "#000000"],
    ["silver", "#c0c0c0"],
    ["gray", "#808080"],
    ["white", "#ffffff"],
    ["maroon", "#800000"],
    ["red", "#ff0000"],
    ["purple", "#800080"],
    ["fuchsia", "#ff00ff"],
    ["green", "#008000"],
    ["lime", "#00ff00"],
    ["olive", "#808000"],
    ["yellow", "#ffff00"],
    ["navy", "#000080"],
    ["blue", "#0000ff"],
    ["teal", "#008080"],
    ["aqua", "#00ffff"],
    ["orange", "#ffa500"],
    ["aliceblue", "#f0f8ff"],
    ["antiquewhite", "#faebd7"],
    ["aquamarine", "#7fffd4"],
    ["azure", "#f0ffff"],
    ["beige", "#f5f5dc"],
    ["bisque", "#ffe4c4"],
    ["blanchedalmond", "#ffebcd"],
    ["blueviolet", "#8a2be2"],
    ["brown", "#a52a2a"],
    ["burlywood", "#deb887"],
    ["cadetblue", "#5f9ea0"],
    ["chartreuse", "#7fff00"],
    ["chocolate", "#d2691e"],
    ["coral", "#ff7f50"],
    ["cornflowerblue", "#6495ed"],
    ["cornsilk", "#fff8dc"],
    ["crimson", "#dc143c"],
    ["cyan", "#00ffff"],
    ["darkblue", "#00008b"],
    ["darkcyan", "#008b8b"],
    ["darkgoldenrod", "#b8860b"],
    ["darkgray", "#a9a9a9"],
    ["darkgreen", "#006400"],
    ["darkgrey", "#a9a9a9"],
    ["darkkhaki", "#bdb76b"],
    ["darkmagenta", "#8b008b"],
    ["darkolivegreen", "#556b2f"],
    ["darkorange", "#ff8c00"],
    ["darkorchid", "#9932cc"],
    ["darkred", "#8b0000"],
    ["darksalmon", "#e9967a"],
    ["darkseagreen", "#8fbc8f"],
    ["darkslateblue", "#483d8b"],
    ["darkslategray", "#2f4f4f"],
    ["darkslategrey", "#2f4f4f"],
    ["darkturquoise", "#00ced1"],
    ["darkviolet", "#9400d3"],
    ["deeppink", "#ff1493"],
    ["deepskyblue", "#00bfff"],
    ["dimgray", "#696969"],
    ["dimgrey", "#696969"],
    ["dodgerblue", "#1e90ff"],
    ["firebrick", "#b22222"],
    ["floralwhite", "#fffaf0"],
    ["forestgreen", "#228b22"],
    ["gainsboro", "#dcdcdc"],
    ["ghostwhite", "#f8f8ff"],
    ["gold", "#ffd700"],
    ["goldenrod", "#daa520"],
    ["greenyellow", "#adff2f"],
    ["grey", "#808080"],
    ["honeydew", "#f0fff0"],
    ["hotpink", "#ff69b4"],
    ["indianred", "#cd5c5c"],
    ["indigo", "#4b0082"],
    ["ivory", "#fffff0"],
    ["khaki", "#f0e68c"],
    ["lavender", "#e6e6fa"],
    ["lavenderblush", "#fff0f5"],
    ["lawngreen", "#7cfc00"],
    ["lemonchiffon", "#fffacd"],
    ["lightblue", "#add8e6"],
    ["lightcoral", "#f08080"],
    ["lightcyan", "#e0ffff"],
    ["lightgoldenrodyellow", "#fafad2"],
    ["lightgray", "#d3d3d3"],
    ["lightgreen", "#90ee90"],
    ["lightgrey", "#d3d3d3"],
    ["lightpink", "#ffb6c1"],
    ["lightsalmon", "#ffa07a"],
    ["lightseagreen", "#20b2aa"],
    ["lightskyblue", "#87cefa"],
    ["lightslategray", "#778899"],
    ["lightslategrey", "#778899"],
    ["lightsteelblue", "#b0c4de"],
    ["lightyellow", "#ffffe0"],
    ["limegreen", "#32cd32"],
    ["linen", "#faf0e6"],
    ["magenta", "#ff00ff"],
    ["mediumaquamarine", "#66cdaa"],
    ["mediumblue", "#0000cd"],
    ["mediumorchid", "#ba55d3"],
    ["mediumpurple", "#9370db"],
    ["mediumseagreen", "#3cb371"],
    ["mediumslateblue", "#7b68ee"],
    ["mediumspringgreen", "#00fa9a"],
    ["mediumturquoise", "#48d1cc"],
    ["mediumvioletred", "#c71585"],
    ["midnightblue", "#191970"],
    ["mintcream", "#f5fffa"],
    ["mistyrose", "#ffe4e1"],
    ["moccasin", "#ffe4b5"],
    ["navajowhite", "#ffdead"],
    ["oldlace", "#fdf5e6"],
    ["olivedrab", "#6b8e23"],
    ["orangered", "#ff4500"],
    ["orchid", "#da70d6"],
    ["palegoldenrod", "#eee8aa"],
    ["palegreen", "#98fb98"],
    ["paleturquoise", "#afeeee"],
    ["palevioletred", "#db7093"],
    ["papayawhip", "#ffefd5"],
    ["peachpuff", "#ffdab9"],
    ["peru", "#cd853f"],
    ["pink", "#ffc0cb"],
    ["plum", "#dda0dd"],
    ["powderblue", "#b0e0e6"],
    ["rosybrown", "#bc8f8f"],
    ["royalblue", "#4169e1"],
    ["saddlebrown", "#8b4513"],
    ["salmon", "#fa8072"],
    ["sandybrown", "#f4a460"],
    ["seagreen", "#2e8b57"],
    ["seashell", "#fff5ee"],
    ["sienna", "#a0522d"],
    ["skyblue", "#87ceeb"],
    ["slateblue", "#6a5acd"],
    ["slategray", "#708090"],
    ["slategrey", "#708090"],
    ["snow", "#fffafa"],
    ["springgreen", "#00ff7f"],
    ["steelblue", "#4682b4"],
    ["tan", "#d2b48c"],
    ["thistle", "#d8bfd8"],
    ["tomato", "#ff6347"],
    ["turquoise", "#40e0d0"],
    ["violet", "#ee82ee"],
    ["wheat", "#f5deb3"],
    ["whitesmoke", "#f5f5f5"],
    ["yellowgreen", "#9acd32"],
    ["rebeccapurple", "#663399"],
])

function parseCssColor(colorString: string): [number, number, number] | null {
    if (colorKeywords.has(colorString)) {
        colorString = colorKeywords.get(colorString)!
    }
    const hashMatch = colorString.match(/^#([\dA-Fa-f]{2})([\dA-Fa-f]{2})([\dA-Fa-f]{2})([\dA-Fa-f]{2})?$/)
    if (hashMatch != null) {
        return [
            Number(`0x${hashMatch[1]}`),
            Number(`0x${hashMatch[2]}`),
            Number(`0x${hashMatch[3]}`),
        ]
    }
    const smallHashMatch = colorString.match(/^#([\dA-Fa-f])([\dA-Fa-f])([\dA-Fa-f])([\dA-Fa-f])?$/)
    if (smallHashMatch != null) {
        return [
            Number(`0x${smallHashMatch[1]}0`),
            Number(`0x${smallHashMatch[2]}0`),
            Number(`0x${smallHashMatch[3]}0`),
        ]
    }
    const rgbMatch = colorString.match(/^rgba?\(\s*([+\-]?\d*\.?\d+)\s*,\s*([+\-]?\d*\.?\d+)\s*,\s*([+\-]?\d*\.?\d+)\s*(,\s*([+\-]?\d*\.?\d+)\s*)?\)$/)
    if (rgbMatch != null) {
        return [
            Math.round(Math.max(0, Math.min(255, Number(rgbMatch[1])))),
            Math.round(Math.max(0, Math.min(255, Number(rgbMatch[2])))),
            Math.round(Math.max(0, Math.min(255, Number(rgbMatch[3])))),
        ]
    }
    const hslMatch = colorString.match(/^hsla?\(\s*([+\-]?\d*\.?\d+)\s*,\s*([+\-]?\d*\.?\d+)%\s*,\s*([+\-]?\d*\.?\d+)%\s*(,\s*([+\-]?\d*\.?\d+)\s*)?\)$/)
    if (hslMatch != null) {
        // https://www.rapidtables.com/convert/color/hsl-to-rgb.html
        let h = Number(hslMatch[1]) % 360
        if (h < 0) {
            h += 360
        }
        const s = Math.max(0, Math.min(100, Number(hslMatch[2]))) / 100
        const l = Math.max(0, Math.min(100, Number(hslMatch[3]))) / 100
        const c = (1 - Math.abs(2 * l - 1)) * s
        const x = c * (1 - Math.abs((h / 60) % 2 - 1))
        const m = l - c / 2
        let r_
        let g_
        let b_
        if (h < 60) {
            [r_, g_, b_] = [c, x, 0]
        } else if (h < 120) {
            [r_, g_, b_] = [x, c, 0]
        } else if (h < 180) {
            [r_, g_, b_] = [0, c, x]
        } else if (h < 240) {
            [r_, g_, b_] = [0, x, c]
        } else if (h < 300) {
            [r_, g_, b_] = [x, 0, c]
        } else {
            [r_, g_, b_] = [c, 0, x]
        }
        return [
            Math.round((r_ + m) * 255),
            Math.round((g_ + m) * 255),
            Math.round((b_ + m) * 255),
        ]
    }
    return null
}

interface Css {
    backgroundColor: [number, number, number] | string | null
    color: [number, number, number] | string | null
    fontWeight: string | null
    fontStyle: string | null
    textDecorationColor: [number, number, number] | null
    textDecorationLine: string[]
}

function getDefaultCss(): Css {
    return {
        backgroundColor: null,
        color: null,
        fontWeight: null,
        fontStyle: null,
        textDecorationColor: null,
        textDecorationLine: [],
    }
}

function parseCss(cssString: string) {
    const css = getDefaultCss()

    const rawEntries = []
    let inValue = false
    let currentKey = null
    let parenthesesDepth = 0
    let currentPart = ""
    for (let i = 0; i < cssString.length; i++) {
        const c = cssString[i];
        if (c == "(") {
            parenthesesDepth++;
        } else if (parenthesesDepth > 0) {
            if (c == ")") {
                parenthesesDepth--;
            }
        } else if (inValue) {
            if (c == ";") {
                const value = currentPart.trim()
                if (value != "") {
                    rawEntries.push([currentKey, value])
                }
                currentKey = null
                currentPart = ""
                inValue = false
                continue;
            }
        } else if (c == ":") {
            currentKey = currentPart.trim()
            currentPart = ""
            inValue = true
            continue
        }
        currentPart += c
    }
    if (inValue && parenthesesDepth == 0) {
        const value = currentPart.trim()
        if (value != "") {
            rawEntries.push([currentKey, value])
        }
        currentKey = null
        currentPart = ""
    }

    for (const [key, value] of rawEntries) {
        if (key == "background-color") {
            if (value != null) {
                css.backgroundColor = value;
            }
        } else if (key == "color") {
            if (value != null) {
                css.color = value
            }
        } else if (key == "font-weight") {
            if (value == "bold") {
                css.fontWeight = value
            }
        } else if (key == "font-style") {
            if (
                ["italic", "oblique", "oblique 14deg"].includes(value!)
            ) {
                css.fontStyle = "italic"
            }
        } else if (key == "text-decoration-line") {
            css.textDecorationLine = [];
            for (const lineType of value?.split(/\s+/g)!) {
                if (
                    ["line-through", "overline", "underline"].includes(lineType)
                ) {
                    css.textDecorationLine.push(lineType)
                }
            }
        } else if (key == "text-decoration-color") {
            const color = parseCssColor(value!)
            if (color != null) {
                css.textDecorationColor = color
            }
        } else if (key == "text-decoration") {
            css.textDecorationColor = null
            css.textDecorationLine = []
            for (const arg of value?.split(/\s+/g)!) {
                const maybeColor = parseCssColor(arg)
                if (maybeColor != null) {
                    css.textDecorationColor = maybeColor
                } else if (
                    ["line-through", "overline", "underline"].includes(arg)
                ) {
                    css.textDecorationLine.push(arg)
                }
            }
        }
    }

    return css;
}

function colorEquals(color1: string | number[], color2: string | number[]) {
    return color1?.[0] == color2?.[0] && color1?.[1] == color2?.[1] &&
        color1?.[2] == color2?.[2];
}

function cssToAnsi(css: Css, prevCss: Css | null = null) {
    prevCss = prevCss ?? getDefaultCss()
    let ansi = ""
    if (!colorEquals(css.backgroundColor!, prevCss.backgroundColor!)) {
        if (css.backgroundColor == null) {
            ansi += "\x1b[49m";
        } else if (css.backgroundColor == "black") {
            ansi += `\x1b[40m`;
        } else if (css.backgroundColor == "red") {
            ansi += `\x1b[41m`;
        } else if (css.backgroundColor == "green") {
            ansi += `\x1b[42m`;
        } else if (css.backgroundColor == "yellow") {
            ansi += `\x1b[43m`;
        } else if (css.backgroundColor == "blue") {
            ansi += `\x1b[44m`;
        } else if (css.backgroundColor == "magenta") {
            ansi += `\x1b[45m`;
        } else if (css.backgroundColor == "cyan") {
            ansi += `\x1b[46m`;
        } else if (css.backgroundColor == "white") {
            ansi += `\x1b[47m`;
        } else {
            if (Array.isArray(css.backgroundColor)) {
                const [r, g, b] = css.backgroundColor
                ansi += `\x1b[48;2;${r};${g};${b}m`
            } else {
                const parsed = parseCssColor(css.backgroundColor)
                if (parsed !== null) {
                    const [r, g, b] = parsed
                    ansi += `\x1b[48;2;${r};${g};${b}m`
                } else {
                    ansi += "\x1b[49m"
                }
            }
        }
    }
    if (!colorEquals(css.color!, prevCss.color!)) {
        if (css.color == null) {
            ansi += "\x1b[39m";
        } else if (css.color == "black") {
            ansi += `\x1b[30m`;
        } else if (css.color == "red") {
            ansi += `\x1b[31m`;
        } else if (css.color == "green") {
            ansi += `\x1b[32m`;
        } else if (css.color == "yellow") {
            ansi += `\x1b[33m`;
        } else if (css.color == "blue") {
            ansi += `\x1b[34m`;
        } else if (css.color == "magenta") {
            ansi += `\x1b[35m`;
        } else if (css.color == "cyan") {
            ansi += `\x1b[36m`;
        } else if (css.color == "white") {
            ansi += `\x1b[37m`;
        } else {
            if (Array.isArray(css.color)) {
                const [r, g, b] = css.color
                ansi += `\x1b[38;2;${r};${g};${b}m`
            } else {
                const parsed = parseCssColor(css.color)
                if (parsed !== null) {
                    const [r, g, b] = parsed
                    ansi += `\x1b[38;2;${r};${g};${b}m`
                } else {
                    ansi += "\x1b[39m"
                }
            }
        }
    }
    if (css.fontWeight != prevCss.fontWeight) {
        if (css.fontWeight == "bold") {
            ansi += `\x1b[1m`
        } else {
            ansi += "\x1b[22m"
        }
    }
    if (css.fontStyle != prevCss.fontStyle) {
        if (css.fontStyle == "italic") {
            ansi += `\x1b[3m`
        } else {
            ansi += "\x1b[23m"
        }
    }
    if (!colorEquals(css.textDecorationColor!, prevCss.textDecorationColor!)) {
        if (css.textDecorationColor != null) {
            const [r, g, b] = css.textDecorationColor
            ansi += `\x1b[58;2;${r};${g};${b}m`
        } else {
            ansi += "\x1b[59m"
        }
    }
    if (
        css.textDecorationLine.includes("line-through") !=
        prevCss.textDecorationLine.includes("line-through")
    ) {
        if (css.textDecorationLine.includes("line-through")) {
            ansi += "\x1b[9m"
        } else {
            ansi += "\x1b[29m"
        }
    }
    if (
        css.textDecorationLine.includes("overline") !=
        prevCss.textDecorationLine.includes("overline")
    ) {
        if (css.textDecorationLine.includes("overline")) {
            ansi += "\x1b[53m"
        } else {
            ansi += "\x1b[55m"
        }
    }
    if (
        css.textDecorationLine.includes("underline") !=
        prevCss.textDecorationLine.includes("underline")
    ) {
        if (css.textDecorationLine.includes("underline")) {
            ansi += "\x1b[4m"
        } else {
            ansi += "\x1b[24m"
        }
    }
    return ansi
}

function inspectArgs(args: unknown[], inspectOptions = {}) {
    circular = undefined

    const rInspectOptions = { ...DEFAULT_INSPECT_OPTIONS, ...inspectOptions };
    const first = args[0]
    let a = 0
    let string = ""

    if (typeof first == "string" && args.length > 1) {
        a++
        // Index of the first not-yet-appended character. Use this so we only
        // have to append to `string` when a substitution occurs / at the end.
        let appendedChars = 0
        let usedStyle = false
        let prevCss = null
        for (let i = 0; i < first.length - 1; i++) {
            if (first[i] == "%") {
                const char = first[++i]
                if (a < args.length) {
                    let formattedArg = null
                    if (char == "s") {
                        // Format as a string.
                        formattedArg = String(args[a++])
                    } else if (["d", "i"].includes(char)) {
                        // Format as an integer.
                        const value = args[a++]
                        if (typeof value == "bigint") {
                            formattedArg = `${value}n`
                        } else if (typeof value == "number") {
                            formattedArg = `${Number.parseInt(String(value))}`
                        } else {
                            formattedArg = "NaN"
                        }
                    } else if (char == "f") {
                        // Format as a floating point value.
                        const value = args[a++];
                        if (typeof value == "number") {
                            formattedArg = `${value}`
                        } else {
                            formattedArg = "NaN"
                        }
                    } else if (["O", "o"].includes(char)) {
                        // Format as an object.
                        formattedArg = inspectValue(args[a++], rInspectOptions)
                    } else if (char == "c") {
                        const value = args[a++]
                        if (rInspectOptions.colors) {
                            const css = parseCss(value as string)
                            formattedArg = cssToAnsi(css, prevCss)
                            if (formattedArg != "") {
                                usedStyle = true
                                prevCss = css
                            }
                        } else {
                            formattedArg = ""
                        }
                    }

                    if (formattedArg != null) {
                        string += first.slice(appendedChars, i - 1) +
                            formattedArg
                        appendedChars = i + 1
                    }
                }
                if (char == "%") {
                    string += first.slice(appendedChars, i - 1) + "%"
                    appendedChars = i + 1
                }
            }
        }
        string += first.slice(appendedChars)
        if (usedStyle) {
            string += "\x1b[0m"
        }
    }

    for (; a < args.length; a++) {
        if (a > 0) {
            string += " "
        }
        if (typeof args[a] == "string") {
            string += args[a]
        } else {
            // Use default maximum depth for null or undefined arguments.
            string += inspectValue(args[a], rInspectOptions)
        }
    }

    if (rInspectOptions.indentLevel > 0) {
        const groupIndent = DEFAULT_INDENT.repeat(rInspectOptions.indentLevel)
        string = groupIndent + string.replaceAll("\n", `\n${groupIndent}`)
    }

    return string
}

function inspectError(value: Error, cyan: (s: string) => string) {
    const causes: any[] = [value]

    let err = value
    while (err.cause) {
        if (causes.includes(err.cause)) {
            causes.push(handleCircular(err.cause, cyan))
            break
        } else {
            causes.push(err.cause)
            err = err.cause as Error
        }
    }

    const refMap = new Map()
    for (const cause of causes) {
        if (circular !== undefined) {
            const index = circular.get(cause)
            if (index !== undefined) {
                refMap.set(cause, cyan(`<ref *${index}> `))
            }
        }
    }
    causes.shift()

    let finalMessage = (refMap.get(value) ?? "")

    if (AggregateError.prototype.isPrototypeOf(value)) {
        const stackLines = value.stack?.split("\n")
        while (true) {
            const line = stackLines?.shift()!
            if (/\s+at/.test(line)) {
                stackLines?.unshift(line)
                break
            } else if (typeof line === "undefined") {
                break
            }

            finalMessage += line
            finalMessage += "\n"
        }
        const aggregateMessage = (value as AggregateError).errors.map((error) =>
            inspectArgs([error]).replace(/^(?!\s*$)/gm, " ".repeat(4))).join("\n")
        finalMessage += aggregateMessage
        finalMessage += "\n"
        finalMessage += stackLines?.join("\n")
    } else {
        finalMessage += value.stack
    }

    finalMessage += causes.map((cause) =>
        "\nCaused by " + (refMap.get(cause) ?? "") +
        (cause?.stack ?? cause)).join("")

    return finalMessage
}

function inspectNumberObject(value: number, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    // Special handling of -0
    return cyan(
        `[Number: ${Object.is(value.valueOf(), -0)
            ? "-0"
            : value.toString()
        }]`,
    ) // wrappers are in cyan
}

function inspectBigIntObject(value: bigint, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    return cyan(`[BigInt: ${value.toString()}n]`) // wrappers are in cyan
}

function inspectBooleanObject(value: boolean, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    return cyan(`[Boolean: ${value.toString()}]`) // wrappers are in cyan
}

function inspectStringObject(value: string, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    return cyan(`[String: "${value.toString()}"]`) // wrappers are in cyan
}

function inspectSymbolObject(value: symbol, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    return cyan(`[Symbol: ${maybeQuoteSymbol(value.valueOf())}]`) // wrappers are in cyan
}

// TODO
function inspectPromise(
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    return `Promise { ${cyan("[items unknown]")} }`
}

function inspectRegExp(value: RegExp, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const red = maybeColor(colors.red, inspectOptions)
    return red(value.toString()) // RegExps are red
}

function inspectDate(value: Date, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    // without quotes, ISO format, in magenta like before
    const magenta = maybeColor(colors.magenta, inspectOptions)
    return magenta(
        isInvalidDate(value) ? "Invalid Date" : value.toISOString(),
    )
}

function inspectSet(
    value: Set<unknown>,
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    const options = {
        typeName: "Set",
        displayName: "Set",
        delims: ["{", "}"],
        entryHandler: (entry: [unknown, unknown], inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) => {
            const val = entry[1]
            inspectOptions.indentLevel++
            const inspectedValue = inspectValueWithQuotes(val, inspectOptions)
            inspectOptions.indentLevel--
            return inspectedValue
        },
        group: false,
        sort: inspectOptions.sorted,
    };
    return inspectIterable(value, options, inspectOptions)
}

function inspectMap(
    value: Map<unknown, unknown>,
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    const options = {
        typeName: "Map",
        displayName: "Map",
        delims: ["{", "}"],
        entryHandler: (entry: [unknown, unknown], inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) => {
            const [key, val] = entry;
            inspectOptions.indentLevel++
            const inspectedValue = `${inspectValueWithQuotes(key, inspectOptions)
                } => ${inspectValueWithQuotes(val, inspectOptions)}`;
            inspectOptions.indentLevel--
            return inspectedValue;
        },
        group: false,
        sort: inspectOptions.sorted,
    }
    return inspectIterable(
        value,
        options,
        inspectOptions,
    )
}

function inspectWeakSet(inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    return `WeakSet { ${cyan("[items unknown]")} }` // as seen in Node, with cyan color
}

function inspectWeakMap(inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) {
    const cyan = maybeColor(colors.cyan, inspectOptions)
    return `WeakMap { ${cyan("[items unknown]")} }` // as seen in Node, with cyan color
}

function inspectTypedArray(
    typedArrayName: string,
    value: TypedArray,
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
) {
    const valueLength = value.length;
    const options = {
        typeName: typedArrayName,
        displayName: `${typedArrayName}(${valueLength})`,
        delims: ["[", "]"],
        entryHandler: (entry: [unknown, unknown], inspectOptions: typeof DEFAULT_INSPECT_OPTIONS) => {
            const val = entry[1]
            inspectOptions.indentLevel++
            const inspectedValue = inspectValueWithQuotes(val, inspectOptions)
            inspectOptions.indentLevel--
            return inspectedValue
        },
        group: inspectOptions.compact,
        sort: false,
    }
    return inspectIterable(value, options, inspectOptions)
}

function inspectObject(value: Record<any, any>, inspectOptions: typeof DEFAULT_INSPECT_OPTIONS, proxyDetails?: any[]) {
    if (
        Reflect.has(value, denoCustomInspect) &&
        typeof (value as typeof value & { [denoCustomInspect]: typeof denoCustomInspect })[denoCustomInspect] === "function"
    ) {
        return String((value as typeof value & { [denoCustomInspect]: Function })[denoCustomInspect](inspect, inspectOptions))
    }
    // This non-unique symbol is used to support op_crates, ie.
    // in extensions/web we don't want to depend on public
    // Symbol.for("Deno.customInspect") symbol defined in the public API.
    // Internal only, shouldn't be used by users.
    const denoPrivateCustomInspect = Symbol.for("Deno.privateCustomInspect");
    if (
        Reflect.has(value, denoPrivateCustomInspect) &&
        typeof (value as typeof value & { [denoPrivateCustomInspect]: typeof denoPrivateCustomInspect })[denoPrivateCustomInspect] === "function"
    ) {
        // TODO(nayeemrmn): `inspect` is passed as an argument because custom
        // inspect implementations in `extensions` need it, but may not have access
        // to the `Deno` namespace in web workers. Remove when the `Deno`
        // namespace is always enabled.
        return String(
            (value as typeof value & { [denoPrivateCustomInspect]: Function })[denoPrivateCustomInspect](inspect, inspectOptions),
        )
    }
    if (Error.prototype.isPrototypeOf(value)) {
        return inspectError(value as Error, maybeColor(colors.cyan, inspectOptions))
    } else if (Array.isArray(value)) {
        return inspectArray(value, inspectOptions)
    } else if (Number.prototype.isPrototypeOf(value)) {
        return inspectNumberObject(value as unknown as number, inspectOptions)
    } else if (BigInt.prototype.isPrototypeOf(value)) {
        return inspectBigIntObject(value as unknown as bigint, inspectOptions)
    } else if (Boolean.prototype.isPrototypeOf(value)) {
        return inspectBooleanObject(value as unknown as boolean, inspectOptions)
    } else if (String.prototype.isPrototypeOf(value)) {
        return inspectStringObject(value as unknown as string, inspectOptions)
    } else if (Symbol.prototype.isPrototypeOf(value)) {
        return inspectSymbolObject(value as unknown as symbol, inspectOptions)
    } else if (Promise.prototype.isPrototypeOf(value)) {
        return inspectPromise(inspectOptions)
    } else if (RegExp.prototype.isPrototypeOf(value)) {
        return inspectRegExp(value as RegExp, inspectOptions)
    } else if (Date.prototype.isPrototypeOf(value)) {
        return inspectDate(
            proxyDetails ? proxyDetails[0] : value,
            inspectOptions,
        )
    } else if (Set.prototype.isPrototypeOf(value)) {
        return inspectSet(
            proxyDetails ? proxyDetails[0] : value,
            inspectOptions,
        )
    } else if (Map.prototype.isPrototypeOf(value)) {
        return inspectMap(
            proxyDetails ? proxyDetails[0] : value,
            inspectOptions,
        )
    } else if (WeakSet.prototype.isPrototypeOf(value)) {
        return inspectWeakSet(inspectOptions)
    } else if (WeakMap.prototype.isPrototypeOf(value)) {
        return inspectWeakMap(inspectOptions)
    } else if (isTypedArray(value)) {
        return inspectTypedArray(
            Object.getPrototypeOf(value).constructor.name,
            value,
            inspectOptions,
        );
    } else {
        // Otherwise, default object formatting
        let [insp, refIndex] = inspectRawObject(value, inspectOptions);
        insp = refIndex + insp;
        return insp;
    }
}

function _inspectValue(
    value: unknown,
    inspectOptions: typeof DEFAULT_INSPECT_OPTIONS,
): string {
    const green = maybeColor(colors.green, inspectOptions);
    const yellow = maybeColor(colors.yellow, inspectOptions);
    const gray = maybeColor(colors.gray, inspectOptions);
    const cyan = maybeColor(colors.cyan, inspectOptions);
    const bold = maybeColor(colors.bold, inspectOptions);
    const red = maybeColor(colors.red, inspectOptions);

    switch (typeof value) {
        case "string":
            return green(quoteString(value))
        case "number": // Numbers are yellow
            // Special handling of -0
            return yellow(Object.is(value, -0) ? "-0" : `${value}`)
        case "boolean": // booleans are yellow
            return yellow(String(value))
        case "undefined": // undefined is gray
            return gray(String(value))
        case "symbol": // Symbols are green
            return green(maybeQuoteSymbol(value))
        case "bigint": // Bigints are yellow
            return yellow(`${value}n`)
        case "function": // Function string is cyan
            if (ctxHas(value)) {
                // Circular string is cyan
                return handleCircular(value, cyan)
            }

            return inspectFunction(value, inspectOptions)
        case "object": // null is bold
            if (value === null) {
                return bold("null");
            }

            if (ctxHas(value)) {
                return handleCircular(value, cyan);
            }

            return inspectObject(
                value,
                inspectOptions
            );
        default:
            // Not implemented is red
            return red("[Not Implemented]");
    }
}