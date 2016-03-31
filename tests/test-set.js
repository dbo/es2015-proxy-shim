/* eslint-env node, mocha */
"use strict";

// TODO prototype chain tests

var createTestBed = require("./setup.js");
var assert = require("assert");

describe("Proxy#set", function() {
    describe("#string", function() {
        var x = createTestBed();
        x.proxy.foo = 7;

        it("should trap", function() {
            assert.equal(x.trap, "set");
        });
        it("should have the correct target", function() {
            assert.equal(x.target, x.obj);
        });
        it("should have the correct key", function() {
            assert.equal(x.key, "foo");
        });
        it("should have the value", function() {
            assert.equal(x.value, 7);
        });
        it("should have the correct receiver", function() {
            assert.equal(x.receiver, x.proxy);
        });
        it("should reflect the correct result", function() {
            assert.equal(x.proxy.foo, 7);
        });
    });

    describe("#symbol", function() {
        var x = createTestBed();
        x.proxy[x.sym] = 17;

        it("should trap", function() {
            assert.equal(x.trap, "set");
        });
        it("should have the correct target", function() {
            assert.equal(x.target, x.obj);
        });
        it("should have the correct key", function() {
            assert.equal(x.key, x.sym);
        });
        it("should have the value", function() {
            assert.equal(x.value, 17);
        });
        it("should have the correct receiver", function() {
            assert.equal(x.receiver, x.proxy);
        });
        it("should reflect the correct result", function() {
            assert.equal(x.proxy[x.sym], 17);
        });
    });

    describe("#new-properties", function() {
        it("should fail on defining new properties", function() {
            assert.throws(function() {
                var p = new Proxy({}, {});
                p.goo = 5;
            }, TypeError);
        });
    });
});
