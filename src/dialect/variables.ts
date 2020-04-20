import { Engine } from "../engine";
import { Dialect } from "../Dialect";
import { Vars } from "../helpers/vars";
import * as assert from "assert"
import * as _ from "lodash";
let debug = require("debug")("qa-engine:dialect:vars");

/**
 * Variables
 * Configures the Gherkin parser with phrases that support operations on variables
 *
 * @module Default Dialect
 * @class Variables
 *
 */

export class VarsDialect extends Dialect {

	constructor(protected engine: Engine) {
		super(engine);
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

		this.define(["I clear variables", "I reset variables"], function (this: any, done: Function) {
			for (let name in this) delete this[name];
			done();
		});

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

		this.define(["I set $varname to $value", "I set $varname = $value", "I define $varname = $value", "I set $varname is $value"], function (this: any, name: string, value: any, done: Function) {
			if (value == "true") value = true;
			else if (value == "false") value = false;

			Vars.set(this, name, value);
			debug("set %o to %o", name, value);
			done();
		});

		this.define(["I set $varname from $varname2"], function (this: any, name: string, var2: string, done: Function) {
			let value = Vars.find(this, var2);
			assert(value != undefined, "Value " + name + " is undefined");
			Vars.set(this, name, value);
			debug("set %o to %o", name, value);
			done();
		});

		this.define(["I unset $varname"], function (this: any, name: string, done: Function) {
			assert(name, "missing" + name);
			delete this[name];
			done();
		});

		this.define(["I convert $varname to text"], function (this: any, name: string, done: Function) {
			let original = Vars.find(this, name);
			let value = JSON.stringify(original);
			Vars.set(this, name, value);
			debug("set %o to %o", name, value);
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

		this.define(["I set $varname to CSV:\n$CSV", "some CSV as $varname:\n$CSV"], function (this: any, varname: string, csv: string, done: Function) {
			Vars.set(this, varname, csv);
			done();
		});

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

		this.define(["I set $varname to JSON:\n$JSON", "some JSON as $varname:\n$JSON"], function (this: any, name: string, json: string, done: Function) {
			Vars.set(this, name, json);
			done();
		});

		this.define(["I set $varname to text:\n$TEXT", "some text as $varname:\n$TEXT"], function (this: any, name: string, text: string, done: Function) {
			Vars.set(this, name, text);
			done();
		});

		this.define(["I sanitize $varname"], function (this: any, varname: string, done: Function) {
			let value = Vars.get(this, varname);
			assert(value, "Can't sanitize missing value: " + varname);
			value = Vars.sanitize(value, "_").toLowerCase();
			Vars.set(this, varname, value);
			done();
		});


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

		this.define(["variable $varname should exist", "variable $varname exists", "$varname should exist", "$varname exists"], function (this: any, varname: string, done: Function) {
			let value = Vars.find(this, varname);
			//		console.log("VAR: %j", this);
			assert(value, "Variable " + varname + " does not exist");
			assert(value != undefined, "Variable " + varname + " does not exist");
			done();
		});

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
					"$varname = $value"], function (this: any, name: string, value: any, done: Function) {
			if (value == "true") value = true;
			else if (value == "false") value = false;
			let v = Vars.findNamed(this, name);
			assert(v != undefined, "Variable [" + name + "] does not exist -> " + this[name]);
			assert(v == value, "Variable " + name + " does not equal " + value);
			done();
		});

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

		this.define("variable $varname should contain $value", function (this: any, name: string, value: string, done: Function) {
			let v = Vars.get(this, name);
			assert(v, "Variable " + name + " does not exist");
			assert(v.indexOf(value) > 0, "Variable " + name + " does not contain " + value);
			done();
		});

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

		this.define(["variable $varname should match $regex", "variable $varname must match $regex"], function (this: any, name: string, regex: string, done: Function) {
			let v = Vars.findNamed(this, name);
			assert(v, "Variable " + name + " does not exist");
			let re = new RegExp(regex);
			assert(re.test(v), "Variable " + name + " does not match " + regex);
			done();
		});

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

		this.define(["$path should match $regex", "$path matches $regex", "$path must match $regex"], function (this: any, name: string, regex: string, done: Function) {
			let v = Vars.findNamed(this, name);
			assert(v, "Variable " + name + " does not exist");
			let re = new RegExp(regex);
			assert(re.test(v), "Variable " + name + " does not match " + regex);
			done();
		});


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
					"$path in $varname must contain $match"], function (this: any, path: string, name: string, match: string, done: Function) {
			let value = Vars.findNamed(this, name);
			assert(value, "Variable " + name + " does not exist");
			let found = Vars.findInPath(value, path);
			// console.log("%j in %j -> %j --> %j / %j = %s", name, path, value, found, match, found.indexOf(match) );
			assert(found.toString().indexOf(match) >= 0, "Variable " + name + " in " + path + " does not contain " + match);
			done();
		});

		this.define(["$path in $varname should be empty"], function (this: any, path: string, name: string, done: Function) {
			let value = Vars.findNamed(this, name);
			assert(value, "Variable " + name + " does not exist");
			let found = Vars.findInPath(value, path);
			assert(_.isEmpty(found), "Variable " + name + " in " + path + " is not empty");
			done();
		});

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
					"$path in $varname matches $regex"], function (this: any, path: string, name: string, regex: string, done: Function) {
			let value = Vars.findNamed(this, name);
			assert(value, "Variable " + name + " does not exist");
			let found = Vars.findInPath(value, path);
			engine.debug("found: %s in %s -> %j", path, name, found);
			assert(found, "Path " + path + " not found in " + name);
			let re = new RegExp(regex);
			assert(re.test(found), "No path " + path + " in " + name + " matches " + regex);
			done();
		});

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
					"any $path in $varname matches $regex"], function (this: any, path: string, name: string, regex: string, done: Function) {
			let value = Vars.findNamed(this, name);
			//        debug("VALUE: %j in %s -> %j", value, name, this);
			assert(value, "Variable " + name + " does not exist");
			//        debug("found: %s -> %j", name, value);
			let found = Vars.findAllInPath(value, path);
			assert(found, "Path " + path + " not found in " + name);

			if (!_.isArray(found)) found = [found];
			engine.debug("found all: %s in %s -> %j", path, name, found);

			let re = new RegExp(regex);
			let passed = false;
			_.each(found, function (value: any) {
				passed = passed ? passed : re.test(value);
			})
			assert(passed, "No path " + path + " in " + name + " matches " + regex);
			done();
		});

		this.define(["I merge $varnames as $newvar", "I merge $varnames into $newvar"], function (this: any, varnames: string, newvar: string, done: Function) {
			let names = varnames.split(",");
			let result = {};
			_.each(names, function (name: string) {
				let found = Vars.findNamed(self, name) || {};
				_.extend(result, found);
			})
			Vars.set(this, newvar, result);
			done();
		});

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
				"I map $varname as $newvar with:\n$javascript"], function (this: any, varname: string, newvar: string, js: string, done: Function) {
			let fn = new Function(js);
			let original = Vars.find(this, varname) || [];
			let results = _.map(original, fn);
			Vars.set(this, newvar, results);
			done();
		});

        this.define(["dump $varname", "I dump $varname"], function (this: any, name: string, done: Function) {
			var found = name == "this" ? this : Vars.findNamed(this, name);
			console.log("dump context...\n%j", found)
            done();
        });

		// this.define(["I reduce $varname as $newlet with:\n$javascript"], function (this: any, args: any[], done: Function) {
		// 	let varname = args[0], newvar = args[1], js = args[2];
		// 	let fn = new Function(js);
		// 	let original = Vars.find(this, varname) || [];
		// 	let results = { self: original };
		// 	_.reduce(original, fn, results);
		// 	Vars.set(this, newvar, results);
		// 	done();
		// });
	}
}