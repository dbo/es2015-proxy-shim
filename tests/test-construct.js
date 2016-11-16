/* eslint-env node, mocha */
"use strict";

// TODO prototype chain tests

var createTestBed = require("./setup.js");
var assert = require("assert");

describe("Proxy#construct", function() {
    var x = createTestBed();
    var res = new x.fnproxy(5, 6, 7);

    it("should trap", function() {
        assert.equal(x.trap, "construct");
    });
    it("should have the correct target", function() {
        assert.equal(x.target, x.fn);
    });
    if (Proxy.__shim) {
        it("should have the correct new.target", function() {
            assert.equal(x.newTarget, x.fn);
        });
    }
    it("should have the correct args", function() {
        assert.deepEqual(Array.from(x.args), [5, 6, 7]);
    });
    it("should have the correct result", function() {
        assert.equal(res, x.proxy);
    });
});
