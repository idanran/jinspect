// Ported from deno's cli/tests/unit/console_test.ts
// Copyright 2018-2022 the Deno authors. MIT license.
// Copyright 2022 idanran. MIT license.

import assert from 'assert'
import { stripColor } from '../src/colors'
import { inspect } from '../src/index'
import { test } from 'mocha'

test('inspectString', function () {
    assert.equal(
        stripColor(inspect("\0")),
        `"\\x00"`,
    )
    assert.equal(
        stripColor(inspect("\x1b[2J")),
        `"\\x1b[2J"`,
    )
})

test('inspectGetters', function () {
    assert.equal(
        stripColor(inspect({
            get foo() {
                return 0
            },
        })),
        "{ foo: [Getter] }",
    )

    assert.equal(
        stripColor(inspect({
            get foo() {
                return 0
            },
        }, { getters: true })),
        "{ foo: 0 }",
    )

    assert.equal(
        inspect({
            get foo() {
                throw new Error("bar")
            },
        }, { getters: true }),
        "{ foo: [Thrown Error: bar] }",
    )
})

test('inspectPrototype', function () {
    class A { }
    assert.equal(inspect(A.prototype), "A {}")
})

test('inspectSorted', function () {
    assert.equal(
        stripColor(inspect({ b: 2, a: 1 }, { sorted: true })),
        "{ a: 1, b: 2 }",
    )
    assert.equal(
        stripColor(inspect(new Set(["b", "a"]), { sorted: true })),
        `Set { "a", "b" }`,
    )
    assert.equal(
        stripColor(inspect(
            new Map([
                ["b", 2],
                ["a", 1],
            ]),
            { sorted: true },
        )),
        `Map { "a" => 1, "b" => 2 }`,
    )
})

test('inspectTrailingComma', function () {
    assert.equal(
        stripColor(inspect(
            [
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            ],
            { trailingComma: true },
        )),
        `[
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
]`,
    )
    assert.equal(
        stripColor(inspect(
            {
                aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: 1,
                bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb: 2,
            },
            { trailingComma: true },
        )),
        `{
  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: 1,
  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb: 2,
}`,
    )
    assert.equal(
        stripColor(inspect(
            new Set([
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            ]),
            { trailingComma: true },
        )),
        `Set {
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
}`,
    )
    assert.equal(
        stripColor(inspect(
            new Map([
                ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", 1],
                ["bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", 2],
            ]),
            { trailingComma: true },
        )),
        `Map {
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" => 1,
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" => 2,
}`,
    )
})

test('inspectCompact', function () {
    assert.equal(
        stripColor(inspect({ a: 1, b: 2 }, { compact: false })),
        `{
  a: 1,
  b: 2
}`,
    )
})

test('inspectIterableLimit', function () {
    assert.equal(
        stripColor(inspect(["a", "b", "c"], { iterableLimit: 2 })),
        `[ "a", "b", ... 1 more items ]`,
    )
    assert.equal(
        stripColor(inspect(new Set(["a", "b", "c"]), { iterableLimit: 2 })),
        `Set { "a", "b", ... 1 more items }`,
    )
    assert.equal(
        stripColor(inspect(
            new Map([
                ["a", 1],
                ["b", 2],
                ["c", 3],
            ]),
            { iterableLimit: 2 },
        )),
        `Map { "a" => 1, "b" => 2, ... 1 more items }`,
    )
})

test('inspectProxy', function () {
    assert.equal(
        stripColor(inspect(
            new Proxy([1, 2, 3], {}),
        )),
        "[ 1, 2, 3 ]",
    )
    assert.equal(
        stripColor(inspect(
            new Proxy({ key: "value" }, {}),
        )),
        `{ key: "value" }`,
    )
    assert.equal(
        stripColor(inspect(
            new Proxy({}, {
                get(_target, key) {
                    if (key === Symbol.toStringTag) {
                        return "MyProxy"
                    } else {
                        return 5
                    }
                },
                getOwnPropertyDescriptor() {
                    return {
                        enumerable: true,
                        configurable: true,
                        value: 5,
                    }
                },
                ownKeys() {
                    return ["prop1", "prop2"]
                },
            }),
        )),
        `MyProxy { prop1: 5, prop2: 5 }`,
    )
})

test('inspectError', function () {
    const error1 = new Error("This is an error")
    const error2 = new Error("This is an error", {
        cause: new Error("This is a cause error"),
    })

    assert(stripColor(inspect(error1)).includes("Error: This is an error"))
    assert(stripColor(inspect(error2)).includes("Error: This is an error"))
    assert(stripColor(inspect(error2)).includes("Caused by Error: This is a cause error"))
})

test('inspectErrorCircular', function () {
    const error1 = new Error("This is an error")
    const error2 = new Error("This is an error", {
        cause: new Error("This is a cause error"),
    })
    error1.cause = error1
    assert(error2.cause instanceof Error)
    error2.cause.cause = error2

    assert(stripColor(inspect(error1)).includes("Error: This is an error"))
    assert(stripColor(inspect(error2)).includes("<ref *1> Error: This is an error"))
    assert(stripColor(inspect(error2)).includes("Caused by Error: This is a cause error"))
    assert(stripColor(inspect(error2)).includes("Caused by [Circular *1]"))
})

test('inspectColors', function () {
    assert.equal(inspect(1), "1")
    assert(inspect(1, { colors: true }).includes("\x1b["))
})

test('inspectEmptyArray', function () {
    const arr: string[] = []

    assert.equal(
        inspect(arr, {
            compact: false,
            trailingComma: true,
        }),
        "[\n]",
    )
})

test('inspectDeepEmptyArray', function () {
    const obj = {
        arr: [],
    }

    assert.equal(
        inspect(obj, {
            compact: false,
            trailingComma: true,
        }),
        `{
  arr: [
  ],
}`,
    )
})

test('inspectEmptyMap', function () {
    const map = new Map()

    assert.equal(
        inspect(map, {
            compact: false,
            trailingComma: true,
        }),
        "Map {\n}",
    )
})

test('inspectEmptySet', function () {
    const set = new Set()

    assert.equal(
        inspect(set, {
            compact: false,
            trailingComma: true,
        }),
        "Set {\n}",
    )
})

test('inspectEmptyTypedArray', function () {
    const typedArray = new Uint8Array(0)

    assert.equal(
        inspect(typedArray, {
            compact: false,
            trailingComma: true,
        }),
        "Uint8Array(0) [\n]",
    )
})

test('inspectStringAbbreviation', function () {
    const LONG_STRING =
        "This is a really long string which will be abbreviated with ellipsis."
    const obj = {
        str: LONG_STRING,
    }
    const arr = [LONG_STRING]

    assert.equal(
        inspect(obj, { strAbbreviateSize: 10 }),
        '{ str: "This is a ..." }',
    )

    assert.equal(
        inspect(arr, { strAbbreviateSize: 10 }),
        '[ "This is a ..." ]',
    )
})

test('inspectAggregateError', async function () {
    try {
        await Promise.any([])
    } catch (err) {
        assert.equal(
            inspect(err).trimEnd(),
            "AggregateError: All promises were rejected",
        )
    }
})