# Jinspect

[![npm](https://img.shields.io/npm/v/jinspect?style=flat-square)](https://www.npmjs.com/package/jinspect)

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
// @deno-types="https://deno.land/x/jinspect@v1.0.0/lib/index.d.ts"
import { inspect } from "https://deno.land/x/jinspect@v1.0.0/lib/index.mjs";
```

### Browser

```js
import { inspect } from "https://deno.land/x/jinspect@v1.0.0/lib/index.mjs";
```

or

```js
const { inspect } = await import(
  "https://deno.land/x/jinspect@v1.0.0/lib/index.mjs"
);
```
