"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialect_1 = require("../Dialect");
const vars_1 = require("../helpers/vars");
var assert = require('assert');
/**
 * Variables
 * Configures the Gherkin parser with phrases that support operations on variables
 *
 * @module Default Dialect
 * @class Variables
 *
 */
class ScriptingDialect extends Dialect_1.Dialect {
    constructor(engine) {
        super(engine);
        /**
         * Run Javscript and save result into a variable
         *
         * @example
         *
         *      GIVEN I return 2+3 as my-answer
         *
         *      AND I return new Date().getTime() as now
    
         * @method Save Javascript to Variable
         * @param {String} javascript - inline javascript
         * @param {string} varname - variable name
         */
        this.define("I return $javascript as $varname", function (js, name, done) {
            var fn = new Function("return (" + js + ");");
            var result = fn.apply(self, arguments);
            vars_1.Vars.set(engine.vars, name, result);
            done();
        });
        /**
         * Execute Javascript - trigger a fail if return is falsey
         *
         * @example
         *
         *      WHEN I execute (3+4)
         *
         * @method Execute Javascript
         * @param {String} javascript - inline javascript
         */
        this.define(["I execute $javascript", "I execute\n$javascript"], function (js, done) {
            var fn = new Function(js);
            var result = fn.apply(self);
            if (typeof (result) != "undefined") {
                assert(result, "Javascript return 'falsey'");
            }
            done();
        });
        /**
         * Assert some Javascript returns true or trigger a fail if return is 'falsey'
         *
         * @example
         *
         *      GIVEN I am testing
         *      THEN I assert engine.name == "testing"
         *
         * @method Assert Javascript
         * @param {String} javascript - inline javascript
         */
        this.define(["I assert $javascript", "I expect $javascript"], function (js, done) {
            var fn = new Function("return (" + js + ");");
            var result = fn.apply(self);
            assert(result, "Javascript assert: " + js + " --> " + result);
            done();
        });
    }
}
exports.ScriptingDialect = ScriptingDialect;
//# sourceMappingURL=scripting.js.map