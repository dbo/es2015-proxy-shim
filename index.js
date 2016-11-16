/**
 * es2015-proxy-shim
 *
 * @license
 * Released under MIT license <https://raw.githubusercontent.com/dbo/es2015-proxy-shim/master/LICENSE>
 * Copyright (c) Daniel Bölzle
 */

/* global global, self, console */
/* eslint-disable eqeqeq, no-console */

(function(global) {
    "use strict";

    if (global.Proxy) {
        return;
    }
    if (!global.Reflect) {
        console.warn("es2015-proxy-shim: Missing Reflect.");
        return;
    }

    var reflSet = Reflect.set,
        reflGet = Reflect.get,
        UNSUPPORTED_TRAPS = new Set([
            "has",
            "deleteProperty",
            "defineProperty",
            "ownKeys",
            "getOwnPropertyDescriptor",
            "getPrototypeOf",
            "isExtensible",
            "preventExtensions",
            "setPrototypeOf"
        ]),
        PROXY_DEF = Symbol("proxy-def"),
        propsMapCache = new WeakMap();

    /**
     * Patched Reflect.get and Reflect.set to properly handle proxies.
     */
    Reflect.get = function(target, key, receiver) {
        if (receiver && receiver !== target) {
            var pdef = target[PROXY_DEF];
            if (typeof pdef !== "undefined") { // a proxy
                if (!pdef) {
                    throw new TypeError("Reflect.get on revoked target proxy.");
                }
                if (pdef.h.get) {
                    return pdef.h.get(pdef.t, key, receiver);
                }
                return Reflect.get(pdef.t, key, receiver);
            }
        }
        // fallback to original:
        return Reflect.apply(reflGet, Reflect, arguments);
    };
    Reflect.set = function(target, key, value, receiver) {
        if (receiver && receiver !== target) {
            var pdef = receiver[PROXY_DEF];
            if (typeof pdef !== "undefined") { // a proxy
                if (!pdef) {
                    throw new TypeError("Reflect.set on revoked proxy.");
                }

                var descr = pdef.pmap[key];
                if (descr && pdef.t === target) {
                    descr = descr.tdescr;
                    if (descr.hasOwnProperty("value")) {
                        if (!descr.writable) {
                            return false;
                        }
                        descr = Object.assign({}, descr);
                        descr.value = value;
                        Object.defineProperty(target, key, descr);
                    } else {
                        if (!descr.set) {
                            return false;
                        }
                        descr.set.call(receiver, value);
                    }
                    return true;
                }
                return Reflect.set(pdef.t, key, value, receiver);
            }
        }
        // fallback to original:
        return Reflect.apply(reflSet, Reflect, arguments);
    };

    /**
     * Used for get.
     */
    function getter(key) {
        return function() {
            var pdef = this[PROXY_DEF];
            if (!pdef) {
                throw new TypeError("Getting property on revoked proxy: " + key);
            }
            if (pdef.h.get) {
                return pdef.h.get(pdef.t, key, this);
            }
            return Reflect.get(pdef.t, key, this);
        };
    }
    /**
     * Used for set.
     */
    function setter(key) {
        return function(value) {
            var pdef = this[PROXY_DEF];
            if (!pdef) {
                throw new TypeError("Setting property on revoked proxy: " + key);
            }
            if (pdef.h.set) {
                if (pdef.h.set(pdef.t, key, value, this) === false) {
                    // assuming strict mode
                    throw new TypeError("Setting " + key + " on " + pdef.t + " has failed.");
                }
            } else {
                Reflect.set(pdef.t, key, value, this);
            }
        };
    }

    /**
     * Used for apply, construct.
     */
    function createFnProxy() {
        var proxy = function() {
            var pdef = proxy[PROXY_DEF];
            if (!pdef) {
                throw new TypeError("Calling on revoked proxy.");
            }
            if (this && this.constructor === proxy) {
                if (pdef.h.construct) {
                    var ret = pdef.h.construct(pdef.t, arguments, pdef.t); // TODO Array.from?
                    if (typeof ret !== "object") {
                        throw new TypeError("Constructor must create an Object.");
                    }
                    return ret;
                }
                return Reflect.construct(pdef.t, arguments);
            }
            if (pdef.h.apply) {
                return pdef.h.apply(pdef.t, this, arguments); // TODO Array.from?
            }
            return Reflect.apply(pdef.t, this, arguments);
        };
        return proxy;
    }

    /**
     * Creates and caches a property descriptor map for the given object installing getter/setter pairs.
     */
    function getPropsObjFor(obj) {
        if (obj == null) {
            return {};
        }

        var ret = propsMapCache.get(obj);
        if (ret) {
            return ret;
        }

        ret = getPropsObjFor(Object.getPrototypeOf(obj)) || {};

        var ownNames = Object.getOwnPropertyNames(obj),
            ownSymbols = Object.getOwnPropertySymbols(obj),
            index;

        index = ownSymbols.indexOf(PROXY_DEF);
        if (index >= 0) {
            ownSymbols.splice(index, 1);
        }
        index = ownNames.indexOf("prototype");
        if (index >= 0) {
            ownNames.splice(index, 1);
        }

        if (ownNames.length || ownSymbols.length) {
            ret = Object.assign({}, ret);
            var p, tdescr,
                i, len;

            for (i = 0, len = ownNames.length; i < len; ++i) {
                p = ownNames[i];
                tdescr = Object.getOwnPropertyDescriptor(obj, p);
                ret[p] = {
                    tdescr: tdescr,
                    get: getter(p),
                    set: setter(p),
                    enumerable: !!tdescr.enumerable
                };
            }
            for (i = 0, len = ownSymbols.length; i < len; ++i) {
                p = ownSymbols[i];
                tdescr = Object.getOwnPropertyDescriptor(obj, p);
                ret[p] = {
                    tdescr: tdescr,
                    get: getter(p),
                    set: setter(p),
                    enumerable: !!tdescr.enumerable
                };
            }
        }

        propsMapCache.set(obj, ret);
        return ret;
    }

    function Proxy(target, handler) {
        Object.getOwnPropertyNames(handler).forEach(function(trap) {
            if (UNSUPPORTED_TRAPS.has(trap)) {
                throw new TypeError("Unsupported trap: " + trap);
            }
        });

        var propsMap = getPropsObjFor(target),
            proxy;

        if (typeof target === "function") {
            proxy = createFnProxy();
            Object.defineProperties(proxy, propsMap);
        } else {
            proxy = Object.create(Object.getPrototypeOf(target), propsMap);
        }

        proxy[PROXY_DEF] = {
            h: handler,
            t: target,
            pmap: propsMap
        };
        Object.seal(proxy); // to notice once new properties are defined on it, i.e. a problem

        return proxy;
    }

    function revoker() {
        this[PROXY_DEF] = null;
    }

    Proxy.revocable = function revocable(target, handler) {
        var proxy = new Proxy(target, handler);

        return {
            proxy: proxy,
            revoke: revoker.bind(proxy)
        };
    };

    global.Proxy = Proxy;

})(typeof global === "object" ? global : self);
