/** RGB 8-bits per channel. Each in range `0->255` or `0x00->0xff` */
export interface Rgb {
    r: number;
    g: number;
    b: number;
}
/**
 * Reset the text modified
 * @param str text to reset
 */
export function reset(str: string): string;
/**
 * Make the text bold.
 * @param str text to make bold
 */
export function bold(str: string): string;
/**
 * The text emits only a small amount of light.
 * @param str text to dim
 */
export function dim(str: string): string;
/**
 * Make the text italic.
 * @param str text to make italic
 */
export function italic(str: string): string;
/**
 * Make the text underline.
 * @param str text to underline
 */
export function underline(str: string): string;
/**
 * Invert background color and text color.
 * @param str text to invert its color
 */
export function inverse(str: string): string;
/**
 * Make the text hidden.
 * @param str text to hide
 */
export function hidden(str: string): string;
/**
 * Put horizontal line through the center of the text.
 * @param str text to strike through
 */
export function strikethrough(str: string): string;
/**
 * Set text color to black.
 * @param str text to make black
 */
export function black(str: string): string;
/**
 * Set text color to red.
 * @param str text to make red
 */
export function red(str: string): string;
/**
 * Set text color to green.
 * @param str text to make green
 */
export function green(str: string): string;
/**
 * Set text color to yellow.
 * @param str text to make yellow
 */
export function yellow(str: string): string;
/**
 * Set text color to blue.
 * @param str text to make blue
 */
export function blue(str: string): string;
/**
 * Set text color to magenta.
 * @param str text to make magenta
 */
export function magenta(str: string): string;
/**
 * Set text color to cyan.
 * @param str text to make cyan
 */
export function cyan(str: string): string;
/**
 * Set text color to white.
 * @param str text to make white
 */
export function white(str: string): string;
/**
 * Set text color to gray.
 * @param str text to make gray
 */
export function gray(str: string): string;
/**
 * Set text color to bright black.
 * @param str text to make bright-black
 */
export function brightBlack(str: string): string;
/**
 * Set text color to bright red.
 * @param str text to make bright-red
 */
export function brightRed(str: string): string;
/**
 * Set text color to bright green.
 * @param str text to make bright-green
 */
export function brightGreen(str: string): string;
/**
 * Set text color to bright yellow.
 * @param str text to make bright-yellow
 */
export function brightYellow(str: string): string;
/**
 * Set text color to bright blue.
 * @param str text to make bright-blue
 */
export function brightBlue(str: string): string;
/**
 * Set text color to bright magenta.
 * @param str text to make bright-magenta
 */
export function brightMagenta(str: string): string;
/**
 * Set text color to bright cyan.
 * @param str text to make bright-cyan
 */
export function brightCyan(str: string): string;
/**
 * Set text color to bright white.
 * @param str text to make bright-white
 */
export function brightWhite(str: string): string;
/**
 * Set background color to black.
 * @param str text to make its background black
 */
export function bgBlack(str: string): string;
/**
 * Set background color to red.
 * @param str text to make its background red
 */
export function bgRed(str: string): string;
/**
 * Set background color to green.
 * @param str text to make its background green
 */
export function bgGreen(str: string): string;
/**
 * Set background color to yellow.
 * @param str text to make its background yellow
 */
export function bgYellow(str: string): string;
/**
 * Set background color to blue.
 * @param str text to make its background blue
 */
export function bgBlue(str: string): string;
/**
 *  Set background color to magenta.
 * @param str text to make its background magenta
 */
export function bgMagenta(str: string): string;
/**
 * Set background color to cyan.
 * @param str text to make its background cyan
 */
export function bgCyan(str: string): string;
/**
 * Set background color to white.
 * @param str text to make its background white
 */
export function bgWhite(str: string): string;
/**
 * Set background color to bright black.
 * @param str text to make its background bright-black
 */
export function bgBrightBlack(str: string): string;
/**
 * Set background color to bright red.
 * @param str text to make its background bright-red
 */
export function bgBrightRed(str: string): string;
/**
 * Set background color to bright green.
 * @param str text to make its background bright-green
 */
export function bgBrightGreen(str: string): string;
/**
 * Set background color to bright yellow.
 * @param str text to make its background bright-yellow
 */
export function bgBrightYellow(str: string): string;
/**
 * Set background color to bright blue.
 * @param str text to make its background bright-blue
 */
export function bgBrightBlue(str: string): string;
/**
 * Set background color to bright magenta.
 * @param str text to make its background bright-magenta
 */
export function bgBrightMagenta(str: string): string;
/**
 * Set background color to bright cyan.
 * @param str text to make its background bright-cyan
 */
export function bgBrightCyan(str: string): string;
/**
 * Set background color to bright white.
 * @param str text to make its background bright-white
 */
export function bgBrightWhite(str: string): string;
/**
 * Set text color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 * @param str text color to apply paletted 8bit colors to
 * @param color code
 */
export function rgb8(str: string, color: number): string;
/**
 * Set background color using paletted 8bit colors.
 * https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
 * @param str text color to apply paletted 8bit background colors to
 * @param color code
 */
export function bgRgb8(str: string, color: number): string;
/**
 * Set text color using 24bit rgb.
 * `color` can be a number in range `0x000000` to `0xffffff` or
 * an `Rgb`.
 *
 * To produce the color magenta:
 *
 * ```ts
 *      import { rgb24 } from "https://deno.land/std@$STD_VERSION/fmt/colors.ts";
 *      rgb24("foo", 0xff00ff);
 *      rgb24("foo", {r: 255, g: 0, b: 255});
 * ```
 * @param str text color to apply 24bit rgb to
 * @param color code
 */
export function rgb24(str: string, color: number | Rgb): string;
/**
 * Set background color using 24bit rgb.
 * `color` can be a number in range `0x000000` to `0xffffff` or
 * an `Rgb`.
 *
 * To produce the color magenta:
 *
 * ```ts
 *      import { bgRgb24 } from "https://deno.land/std@$STD_VERSION/fmt/colors.ts";
 *      bgRgb24("foo", 0xff00ff);
 *      bgRgb24("foo", {r: 255, g: 0, b: 255});
 * ```
 * @param str text color to apply 24bit rgb to
 * @param color code
 */
export function bgRgb24(str: string, color: number | Rgb): string;
/**
 * Remove ANSI escape codes from the string.
 * @param string to remove ANSI escape codes from
 */
export function stripColor(string: string): string;
export interface InspectOptions {
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
export function inspect(value: unknown, options?: InspectOptions): string;
export function promiseState(promise: Promise<unknown>): Promise<promiseDetails>;
export interface promiseDetails {
    status: "pending" | "fulfilled" | "rejected";
    result?: unknown;
}
