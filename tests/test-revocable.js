/* eslint-env node, mocha */
"use strict";

require("./setup.js");
var assert = require("assert");

describe("Proxy#revocable", function() {
    describe("#object-proxy", function() {
        var t = Proxy.revocable({ foo: 5 }, {});
        t.revoke();

        it("should fail on get", function() {
            assert.throws(function() {
                t.proxy.foo;
            }, TypeError);
        });
        it("should fail on set", function() {
            assert.throws(function() {
                t.proxy.foo = 5;
            }, TypeError);
        });
    });

    describe("#function-proxy", function() {
        var t = Proxy.revocable(function() {}, {});
        t.revoke();

        it("should fail on apply", function() {
            assert.throws(function() {
                t.proxy();
            }, TypeError);
        });
        it("should fail on construct", function() {
            assert.throws(function() {
                new t.proxy();
            }, TypeError);
        });
    });
});
