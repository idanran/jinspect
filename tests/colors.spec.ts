// Ported from deno_std's fmt/colors_test.ts 
// Copyright 2018-2022 the Deno authors. MIT license.
// Copyright 2022 idanran. MIT license.

import assert from 'assert'
import * as c from '../src/colors'
import { test } from 'mocha'

test("reset", function () {
    assert.equal(c.reset("foo bar"), "[0mfoo bar[0m")
})

test("single color", function () {
    assert.equal(c.red("foo bar"), "[31mfoo bar[39m")
})

test("double color", function () {
    assert.equal(c.bgBlue(c.red("foo bar")), "[44m[31mfoo bar[39m[49m")
})

test("replaces close characters", function () {
    assert.equal(c.red("Hel[39mlo"), "[31mHel[31mlo[39m")
})

test("test bold", function () {
    assert.equal(c.bold("foo bar"), "[1mfoo bar[22m")
})

test("test dim", function () {
    assert.equal(c.dim("foo bar"), "[2mfoo bar[22m")
})

test("test italic", function () {
    assert.equal(c.italic("foo bar"), "[3mfoo bar[23m")
})

test("test underline", function () {
    assert.equal(c.underline("foo bar"), "[4mfoo bar[24m")
})

test("test inverse", function () {
    assert.equal(c.inverse("foo bar"), "[7mfoo bar[27m")
})

test("test hidden", function () {
    assert.equal(c.hidden("foo bar"), "[8mfoo bar[28m")
})

test("test strikethrough", function () {
    assert.equal(c.strikethrough("foo bar"), "[9mfoo bar[29m")
})

test("test black", function () {
    assert.equal(c.black("foo bar"), "[30mfoo bar[39m")
})

test("test red", function () {
    assert.equal(c.red("foo bar"), "[31mfoo bar[39m")
})

test("test green", function () {
    assert.equal(c.green("foo bar"), "[32mfoo bar[39m")
})

test("test yellow", function () {
    assert.equal(c.yellow("foo bar"), "[33mfoo bar[39m")
})

test("test blue", function () {
    assert.equal(c.blue("foo bar"), "[34mfoo bar[39m")
})

test("test magenta", function () {
    assert.equal(c.magenta("foo bar"), "[35mfoo bar[39m")
})

test("test cyan", function () {
    assert.equal(c.cyan("foo bar"), "[36mfoo bar[39m")
})

test("test white", function () {
    assert.equal(c.white("foo bar"), "[37mfoo bar[39m")
})

test("test gray", function () {
    assert.equal(c.gray("foo bar"), "[90mfoo bar[39m")
})

test("test brightBlack", function () {
    assert.equal(c.brightBlack("foo bar"), "[90mfoo bar[39m")
})

test("test brightRed", function () {
    assert.equal(c.brightRed("foo bar"), "[91mfoo bar[39m")
})

test("test brightGreen", function () {
    assert.equal(c.brightGreen("foo bar"), "[92mfoo bar[39m")
})

test("test brightYellow", function () {
    assert.equal(c.brightYellow("foo bar"), "[93mfoo bar[39m")
})

test("test brightBlue", function () {
    assert.equal(c.brightBlue("foo bar"), "[94mfoo bar[39m")
})

test("test brightMagenta", function () {
    assert.equal(c.brightMagenta("foo bar"), "[95mfoo bar[39m")
})

test("test brightCyan", function () {
    assert.equal(c.brightCyan("foo bar"), "[96mfoo bar[39m")
})

test("test brightWhite", function () {
    assert.equal(c.brightWhite("foo bar"), "[97mfoo bar[39m")
})

test("test bgBlack", function () {
    assert.equal(c.bgBlack("foo bar"), "[40mfoo bar[49m")
})

test("test bgRed", function () {
    assert.equal(c.bgRed("foo bar"), "[41mfoo bar[49m")
})

test("test bgGreen", function () {
    assert.equal(c.bgGreen("foo bar"), "[42mfoo bar[49m")
})

test("test bgYellow", function () {
    assert.equal(c.bgYellow("foo bar"), "[43mfoo bar[49m")
})

test("test bgBlue", function () {
    assert.equal(c.bgBlue("foo bar"), "[44mfoo bar[49m")
})

test("test bgMagenta", function () {
    assert.equal(c.bgMagenta("foo bar"), "[45mfoo bar[49m")
})

test("test bgCyan", function () {
    assert.equal(c.bgCyan("foo bar"), "[46mfoo bar[49m")
})

test("test bgWhite", function () {
    assert.equal(c.bgWhite("foo bar"), "[47mfoo bar[49m")
})

test("test bgBrightBlack", function () {
    assert.equal(c.bgBrightBlack("foo bar"), "[100mfoo bar[49m")
})

test("test bgBrightRed", function () {
    assert.equal(c.bgBrightRed("foo bar"), "[101mfoo bar[49m")
})

test("test bgBrightGreen", function () {
    assert.equal(c.bgBrightGreen("foo bar"), "[102mfoo bar[49m")
})

test("test bgBrightYellow", function () {
    assert.equal(c.bgBrightYellow("foo bar"), "[103mfoo bar[49m")
})

test("test bgBrightBlue", function () {
    assert.equal(c.bgBrightBlue("foo bar"), "[104mfoo bar[49m")
})

test("test bgBrightMagenta", function () {
    assert.equal(c.bgBrightMagenta("foo bar"), "[105mfoo bar[49m")
})

test("test bgBrightCyan", function () {
    assert.equal(c.bgBrightCyan("foo bar"), "[106mfoo bar[49m")
})

test("test bgBrightWhite", function () {
    assert.equal(c.bgBrightWhite("foo bar"), "[107mfoo bar[49m")
})

test("test clamp using rgb8", function () {
    assert.equal(c.rgb8("foo bar", -10), "[38;5;0mfoo bar[39m")
})

test("test truncate using rgb8", function () {
    assert.equal(c.rgb8("foo bar", 42.5), "[38;5;42mfoo bar[39m")
})

test("test rgb8", function () {
    assert.equal(c.rgb8("foo bar", 42), "[38;5;42mfoo bar[39m")
})

test("test bgRgb8", function () {
    assert.equal(c.bgRgb8("foo bar", 42), "[48;5;42mfoo bar[49m")
})

test("test rgb24", function () {
    assert.equal(
        c.rgb24("foo bar", {
            r: 41,
            g: 42,
            b: 43,
        }),
        "[38;2;41;42;43mfoo bar[39m",
    )
})

test("test rgb24 number", function () {
    assert.equal(c.rgb24("foo bar", 0x070809), "[38;2;7;8;9mfoo bar[39m")
})

test("test bgRgb24", function () {
    assert.equal(
        c.bgRgb24("foo bar", {
            r: 41,
            g: 42,
            b: 43,
        }),
        "[48;2;41;42;43mfoo bar[49m",
    )
})

test("test bgRgb24 number", function () {
    assert.equal(c.bgRgb24("foo bar", 0x070809), "[48;2;7;8;9mfoo bar[49m")
})

// https://github.com/chalk/strip-ansi/blob/2b8c961e75760059699373f9a69101065c3ded3a/test.js#L4-L6
test("test stripColor", function () {
    assert.equal(
        c.stripColor(
            "\u001B[0m\u001B[4m\u001B[42m\u001B[31mfoo\u001B[39m\u001B[49m\u001B[24mfoo\u001B[0m",
        ),
        "foofoo",
    )
})