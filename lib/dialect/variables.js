"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialect_1 = require("../Dialect");
const vars_1 = require("../helpers/vars");
const assert = require("assert");
const _ = require("lodash");
let debug = require("debug")("qa-engine:dialect:vars");
/**
 * Variables
 * Configures the Gherkin parser with phrases that support operations on variables
 *
 * @module Default Dialect
 * @class Variables
 *
 */
class VarsDialect extends Dialect_1.Dialect {
    constructor(engine) {
        super(engine);
        this.engine = engine;
        let self = this;
        // ***** GIVEN *****
        /**
         * Remove all the scoped variables
         *
         *      I clear variables
         *
         *      I reset variables
         *
         * @example
         *
         *      GIVEN I reset variables
         *
         * @method Clear Variables
         */
        let doc = this.define(["I clear variables", "I reset variables"], function (done) {
            for (let name in this)
                delete this[name];
            done();
        }, new Dialect_1.DialectDocs("vars.define", "Working with variables"));
        /**
         * Set the value of a scoped variable
         *
         *      I set $varname to $value
         *
         *      I set $varname = $value
         *
         *      I define $varname = $value
         *
         *      I define $varname is $value
         *
         * @example
         *
         *      GIVEN I set hello to world
         *      AND I set yes to true
         *      AND I set nope to false
         *      AND I set answer to 42
         *      Then answer should be 42
         *      Then nope should be false
         *      Then yes should be true
         *
         * @method Set Variable
         * @param {String} variable - variable name
         * @param {Object} value - simple value (string | number | boolean)
         */
        this.define(["I set $varname to $value", "I set $varname = $value", "I define $varname = $value", "I set $varname is $value"], function (name, value, done) {
            if (value == "true")
                value = true;
            else if (value == "false")
                value = false;
            vars_1.Vars.set(this, name, value);
            debug("set %o to %o", name, value);
            done();
        }, doc);
        this.define(["I set $varname from $varname2"], function (name, var2, done) {
            let value = vars_1.Vars.find(this, var2);
            assert(value != undefined, "Value " + name + " is undefined");
            vars_1.Vars.set(this, name, value);
            debug("set %o to %o", name, value);
            done();
        }, doc);
        this.define(["I unset $varname"], function (name, done) {
            assert(name, "missing" + name);
            delete this[name];
            done();
        }, doc);
        this.define(["I convert $varname to text"], function (name, done) {
            let original = vars_1.Vars.find(this, name);
            let value = JSON.stringify(original);
            vars_1.Vars.set(this, name, value);
            debug("set %o to %o", name, value);
            done();
        }, doc);
        this.define(["I sanitize $varname"], function (varname, done) {
            let value = vars_1.Vars.get(this, varname);
            assert(value, "Can't sanitize missing value: " + varname);
            value = vars_1.Vars.sanitize(value, "_").toLowerCase();
            vars_1.Vars.set(this, varname, value);
            done();
        }, doc);
        /**
         * Assert some variable is assigned a value that is truthy
         *
         *      variable $varname should exist
         *
         * @example
         *
         *      GIVEN I set variable hello to world
         *      THEN variable hello should exist
         *
         * @method Assert variable is truthy
         * @param {String} varname - scoped variable
         */
        this.define(["variable $varname should exist", "variable $varname exists", "$varname should exist", "$varname exists"], function (varname, done) {
            let value = vars_1.Vars.find(this, varname);
            //		console.log("VAR: %j", this);
            assert(value, "Variable " + varname + " does not exist");
            assert(value != undefined, "Variable " + varname + " does not exist");
            done();
        }, doc);
        /**
         * Assert some variable should match an exact value
         *
         *
         *      variable $varname should be $value
         *      $varname should be $value
         *      $varname equals $value
         *      $varname is $value
         *      $varname = $value
         *
         * @example
         *
         *      GIVEN I set variable hello to world
         *      THEN variable hello should exist
         *
         * @method Assert variable matches a value exactly
         * @param {String} varname - scoped variable
         * @param {String} value - expected value
         */
        this.define(["variable $varname should be $value", "$varname should be $value",
            "$varname equals $value", "$varname must equal $value",
            "$varname = $value"], function (name, value, done) {
            if (value == "true")
                value = true;
            else if (value == "false")
                value = false;
            let v = vars_1.Vars.findNamed(this, name);
            assert(v != undefined, "Variable [" + name + "] does not exist -> " + this[name]);
            assert(v == value, "Variable " + name + " does not equal " + value);
            done();
        }, doc);
        /**
         * Assert some variable should contain a value
         *
         *
         *      variable $varname should contain $value
         *
         * @example
         *
         *      GIVEN I set variable hello to world
         *      THEN variable hello should contain orl
         *
         * @method Assert variable value contains some string
         * @param {String} varname - scoped variable
         * @param {String} value - expected value
         */
        this.define("variable $varname should contain $value", function (name, value, done) {
            let v = vars_1.Vars.get(this, name);
            assert(v, "Variable " + name + " does not exist");
            assert(v.indexOf(value) > 0, "Variable " + name + " does not contain " + value);
            done();
        }, doc);
        /**
         * Assert some variable should match a regular expression (RegExp)
         *
         *
         *      variable $varname should match $regex
         *
         * @example
         *
         *      GIVEN I set variable hello to world
         *      THEN variable hello should match a-z
         *
         * @method Assert variable matches RegExp
         * @param {String} varname - scoped variable
         * @param {String} regex - regular expression
         */
        this.define(["variable $varname should match $regex", "variable $varname must match $regex"], function (name, regex, done) {
            let v = vars_1.Vars.findNamed(this, name);
            assert(v, "Variable " + name + " does not exist");
            let re = new RegExp(regex);
            assert(re.test(v), "Variable " + name + " does not match " + regex);
            done();
        }, doc);
        /**
       * Assert some JSON path should match a regular expression (RegExp)
       *
       *
       *      variable $varname should match $regex
       *
       * @example
       *
       *      GIVEN I set variable hello to world
       *      THEN variable hello should match a-z
       *
       * @method Assert variable matches RegExp
       * @param {String} varname - scoped variable
       * @param {String} regex - regular expression
       */
        this.define(["$path should match $regex", "$path matches $regex", "$path must match $regex"], function (name, regex, done) {
            let v = vars_1.Vars.findNamed(this, name);
            assert(v, "Variable " + name + " does not exist");
            let re = new RegExp(regex);
            assert(re.test(v), "Variable " + name + " does not match " + regex);
            done();
        }, doc);
        /**
         * Assert some JSON path should contain a string
         *
         *
         *      variable $varname should contain $match
         *
         * @example
         *
         *      GIVEN I set variable hello to world
         *      THEN variable hello should contain world
         *
         * @method Assert variable matches conditions
         * @param {String} varname - scoped variable
         * @param {String} text - text to match
         */
        this.define(["$path in $varname should contain $match", "$path in $varname contains $match",
            "$path in $varname must contain $match"], function (path, name, match, done) {
            let value = vars_1.Vars.findNamed(this, name);
            assert(value, "Variable " + name + " does not exist");
            let found = vars_1.Vars.findInPath(value, path);
            // console.log("%j in %j -> %j --> %j / %j = %s", name, path, value, found, match, found.indexOf(match) );
            assert(found.toString().indexOf(match) >= 0, "Variable " + name + " in " + path + " does not contain " + match);
            done();
        }, doc);
        this.define(["$path in $varname should be empty"], function (path, name, done) {
            let value = vars_1.Vars.findNamed(this, name);
            assert(value, "Variable " + name + " does not exist");
            let found = vars_1.Vars.findInPath(value, path);
            assert(_.isEmpty(found), "Variable " + name + " in " + path + " is not empty");
            done();
        }, doc);
        /**
         * Assert some JSON path within a complex variable should match a regular expression (RegExp)
         *
         *      $.hello in $varname should match $regex
         *
         * @example
         *
         *      GIVEN I set variable my.hello to world
         *      THEN $.hello in my should match a-z
         *
         * @method Assert JSON path matches RegExp
         * @param {String} path- JSON path
         * @param {String} varname - scoped variable
         * @param {String} regex - regular expression
         */
        this.define(["$path in $varname should match $regex", "$path in $varname must match $regex",
            "$path in $varname matches $regex"], function (path, name, regex, done) {
            let value = vars_1.Vars.findNamed(this, name);
            assert(value, "Variable " + name + " does not exist");
            let found = vars_1.Vars.findInPath(value, path);
            engine.debug("found: %s in %s -> %j", path, name, found);
            assert(found, "Path " + path + " not found in " + name);
            let re = new RegExp(regex);
            assert(re.test(found), "No path " + path + " in " + name + " matches " + regex);
            done();
        }, doc);
        /**
         * Assert that any array element in JSON path within a variable should match a regular expression (RegExp)
         *
         *      $.hello in $varname should match $regex
         *
         * @example
         *
         *      GIVEN I set variable my.hello to world
         *      THEN any $.hello in my should match a-z
         *
         * @method Assert JSON path matches RegExp
         * @param {String} path - a valid JSON path
         * @param {String} varname - scoped variable
         * @param {String} regex - regular expression
         */
        this.define(["any $path in $varname should match $regex", "any $path in $varname must match $regex",
            "any $path in $varname matches $regex"], function (path, name, regex, done) {
            let value = vars_1.Vars.findNamed(this, name);
            //        debug("VALUE: %j in %s -> %j", value, name, this);
            assert(value, "Variable " + name + " does not exist");
            //        debug("found: %s -> %j", name, value);
            let found = vars_1.Vars.findAllInPath(value, path);
            assert(found, "Path " + path + " not found in " + name);
            if (!_.isArray(found))
                found = [found];
            engine.debug("found all: %s in %s -> %j", path, name, found);
            let re = new RegExp(regex);
            let passed = false;
            _.each(found, function (value) {
                passed = passed ? passed : re.test(value);
            });
            assert(passed, "No path " + path + " in " + name + " matches " + regex);
            done();
        }, doc);
        this.define(["I merge $varnames as $newvar", "I merge $varnames into $newvar"], function (varnames, newvar, done) {
            let names = varnames.split(",");
            let result = {};
            _.each(names, function (name) {
                let found = vars_1.Vars.findNamed(self, name) || {};
                _.extend(result, found);
            });
            vars_1.Vars.set(this, newvar, result);
            done();
        }, doc);
        /**
         * Transform some variable using a Javascript function
         *
         * @example
         *
         *      When I transform something with:
         *          this.transformed = this.transformed?this.transformed+1:1;
         *      THEN something.transformed should be true
         *
         * @method Transform a variable using Javascript
         * @param {String} varname - variable to transform
         * @param {String} javascript - inline javascript
         */
        this.define(["I transform $varname as $newvar with:\n$javascript",
            "I map $varname as $newvar with:\n$javascript"], function (varname, newvar, js, done) {
            let fn = new Function(js);
            let original = vars_1.Vars.find(this, varname) || [];
            let results = _.map(original, fn);
            vars_1.Vars.set(this, newvar, results);
            done();
        }, doc);
        this.define(["dump $varname", "I dump $varname"], function (name, done) {
            var found = name == "this" ? this : vars_1.Vars.findNamed(this, name);
            console.log("dump context...\n%j", found);
            done();
        });
        /**
         * Sets the value of a scoped variable to inline CSV data structure
         *
         *      I set $varname to CSV:
         *      -------------
         *      $CSV
         *      -------------
         *
         *      some $varname as CSV:
         *      -------------
         *      $CSV
         *      -------------
         *
         * @example
         *
         *      GIVEN I set my-csv to CSV:
         *      -------------
         *      hello, goodbye
         *      world, earth
         *      -------------
         *
         *  or:
         *
         *      AND some CSV as my-csv:
         *      -------------
         *      hello, goodbye
         *      world, earth
         *      -------------
         *
         *
         * @method Set Variable from CSV
         * @param {String} name - variable name
         * @param {string} CSV - inline CSV text
         */
        this.define(["I set $varname to CSV:\n$CSV", "some CSV as $varname:\n$CSV"], function (varname, csv, done) {
            vars_1.Vars.set(this, varname, csv);
            done();
        }, new Dialect_1.DialectDocs("vars.block", "Set variables from block of formatted text"));
        /**
         * Sets the value of a scoped variable to inline JSON data structure
         * ---------- ---------- ---------- ----------
         *
         * @example
         *
         *      GIVEN I set $varname to JSON:
         *      -------------
         *      { "hello": "world" }
         *      -------------
         *
         *  or:
         *
         *      AND some JSON as $varname:
         *      -------------
         *      { "hello": "world" }
         *      -------------
         *
         *
         * @method Set Variable from JSON
         * @param {String} name - variable name
         * @param {Object} JSON - inline JSON
         */
        this.define(["I set $varname to JSON:\n$JSON", "some JSON as $varname:\n$JSON"], function (name, json, done) {
            vars_1.Vars.set(this, name, json);
            done();
        }, doc);
        this.define(["I set $varname to text:\n$TEXT", "some text as $varname:\n$TEXT"], function (name, text, done) {
            vars_1.Vars.set(this, name, text);
            done();
        }, doc);
        false && doc;
    }
}
exports.VarsDialect = VarsDialect;
//# sourceMappingURL=variables.js.map