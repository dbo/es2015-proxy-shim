/* eslint-env node, mocha */
"use strict";

// TODO prototype chain tests

var createTestBed = require("./setup.js");
var assert = require("assert");

describe("Proxy#apply", function() {
    var x = createTestBed(),
        cc = {};
    var res = x.fnproxy.call(cc, 5, 6, 7);

    it("should trap", function() {
        assert.equal(x.trap, "apply");
    });
    it("should have the correct target", function() {
        assert.equal(x.target, x.fn);
    });
    it("should have the correct call context", function() {
        assert.equal(x.this, cc);
    });
    it("should have the correct args", function() {
        assert.deepEqual(Array.from(x.args), [5, 6, 7]);
    });
    it("should have the correct result", function() {
        assert.equal(res, x.proxy);
    });
});
