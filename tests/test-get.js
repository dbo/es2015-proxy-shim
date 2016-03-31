/* eslint-env node, mocha */
"use strict";

// TODO prototype chain tests

var createTestBed = require("./setup.js");
var assert = require("assert");

describe("Proxy#get", function() {
    describe("#string", function() {
        var x = createTestBed();
        x.proxy.foo;

        it("should trap", function() {
            assert.equal(x.trap, "get");
        });
        it("should have the correct target", function() {
            assert.equal(x.target, x.obj);
        });
        it("should have the correct key", function() {
            assert.equal(x.key, "foo");
        });
        it("should have the correct receiver", function() {
            assert.equal(x.receiver, x.proxy);
        });
        it("should have the correct result", function() {
            assert.equal(x.proxy.foo, 5);
        });
    });

    describe("#symbol", function() {
        var x = createTestBed();
        x.proxy[x.sym];

        it("should trap", function() {
            assert.equal(x.trap, "get");
        });
        it("should have the correct target", function() {
            assert.equal(x.target, x.obj);
        });
        it("should have the correct key", function() {
            assert.equal(x.key, x.sym);
        });
        it("should have the correct receiver", function() {
            assert.equal(x.receiver, x.proxy);
        });
        it("should have the correct result", function() {
            assert.equal(x.proxy[x.sym], 15);
        });
    });
});
