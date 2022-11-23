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
// @deno-types="https://deno.land/x/jinspect@v1.0.1/lib/index.d.ts"
import { inspect } from "https://deno.land/x/jinspect@v1.0.1/lib/index.mjs";
```

### Browser

```js
import { inspect } from "https://deno.land/x/jinspect@v1.0.1/lib/index.mjs";
```

or

```js
const { inspect } = await import(
  "https://deno.land/x/jinspect@v1.0.1/lib/index.mjs"
);
```
