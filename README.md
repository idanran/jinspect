# Jinspect

[![Codecov](https://img.shields.io/codecov/c/github/idanran/jinspect)](https://codecov.io/gh/idanran/jinspect)
[![NPM](https://img.shields.io/npm/v/jinspect)](https://www.npmjs.com/package/jinspect)
[![License](https://img.shields.io/github/license/idanran/jinspect)](https://github.com/idanran/jinspect/blob/main/LICENSE)

String representations of objects. Can run on any platform that supports
JavaScript.

## Usage

### Node.js

```sh
npm install jinspect
```

```ts
import { inspect } from "jinspect";
```

### Deno

```ts
import { inspect } from "npm:jinspect@latest";
```

or

```ts
// @deno-types="https://deno.land/x/jinspect@1.0.3/lib/index.d.ts"
import { inspect } from "https://deno.land/x/jinspect@1.0.3/lib/index.mjs";
```

### Browser

```js
import { inspect } from "https://deno.land/x/jinspect@1.0.3/lib/index.mjs";
```

or

```js
const { inspect } = await import(
  "https://deno.land/x/jinspect@v1.0.3/lib/index.mjs"
);
```

## API

### inspec(value, options?)

- **value:** `unknown` Input (e.g., object).
- **options:** `InspectOptions` See the following interface for details.
- Return: `string` String representations of input.

```ts
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
```
