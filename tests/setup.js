/* eslint-env node, mocha */
"use strict";

require("core-js/shim");
require("../index.js");

/**
 * Simple proxy setup wrapped up in an object to xrieve all trap details.
 */
module.exports = function() {
    var x = {
        sym: Symbol("sym"),
        obj: { foo: 5 }
    };
    x.obj[x.sym] = 15;

    x.proxy = new Proxy(x.obj, {
        get: function(t, k, r) {
            x.trap = "get";
            x.target = t;
            x.key = k;
            x.receiver = r;
            return Reflect.get(t, k, r);
        },
        set: function(t, k, v, r) {
            x.trap = "set";
            x.target = t;
            x.key = k;
            x.value = v
            x.receiver = r;
            return Reflect.set(t, k, v, r);
        }
    });

    x.fn = function() { return x.proxy; };
    x.fnproxy = new Proxy(x.fn, {
        apply: function(target, thisArg, args) {
            x.trap = "apply";
            x.target = target;
            x.this = thisArg;
            x.args = args;
            return Reflect.apply(target, thisArg, args);
        },
        construct: function(target, args, newTarget) {
            x.trap = "construct";
            x.target = target;
            x.args = args;
            x.newTarget = newTarget;
            return Reflect.construct(target, args, newTarget);
        }
    });

    return x;
};
