# es2015-proxy-shim [![Build Status](https://travis-ci.org/dbo/es2015-proxy-shim.svg?branch=master)](https://travis-ci.org/dbo/es2015-proxy-shim) [![npm](https://img.shields.io/npm/v/es2015-proxy-shim.svg)](https://www.npmjs.com/package/es2015-proxy-shim) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

> An ES2015 Proxy shim that relies on a non-extensible fixed set of properties at the time of proxying a target object or function.

This shim is *limited* to a few supported traps:
- `construct`, `apply` (on functions)
- `get`, `set`

This shim relies on a decent ES2015 support, e.g.
- for-of loops
- symbols
- `WeakMap`
- `Reflect`

Use shims like [core-js](https://github.com/zloirock/core-js), if needed.

This shim patches `Reflect.set` which needs to walk in sync w.r.t. proxy objects.


## Install

```bash
$ npm install es2015-proxy-shim --save
```


## Usage

```js
require("core-js/shim");
require("es2015-proxy-shim");

var p = new Proxy({ foo: 5 }, {
    get: function(t, k, r) {
        console.log("#get", t, k);
        return Reflect.get(t, k, r);
    }
});
p.foo = 8;
console.log("is", p.foo);
```


## License

MIT © Daniel Bölzle
