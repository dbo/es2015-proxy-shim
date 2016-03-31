/* eslint-env node, mocha */
"use strict";

require("./setup.js");
var assert = require("assert");

describe("Proxy#unsupported-traps", function() {
    it("should fail on unsupported traps", function() {
        assert.throws(function() {
            new Proxy({}, { get: function() {}, ownKeys: function() {} });
        }, TypeError);
    });
});
