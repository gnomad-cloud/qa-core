"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialect_1 = require("../Dialect");
const results_1 = require("../results");
const assert = require("assert");
// import { StepError } from "../results";
/**
 * Configures the Gherkin parser with phrases that support common, useful operations
 *
 * @module Default Dialect
 * @class Common
 * @decription common phrases
 *
 */
class CommonDialect extends Dialect_1.Dialect {
    constructor(engine) {
        super(engine);
        let doc = this.define(["I am $actor", "I am a $actor", "I am an $actor"], function (actor, done) {
            this.name = actor;
            done();
        }, new Dialect_1.DialectDocs("common.actor", "Set the `name` variable"));
        doc = this.define(["I fail"], function (_done) {
            throw new results_1.StepError("Deliberate Fail", this);
        }, new Dialect_1.DialectDocs("common.fail", "Deliberately fail"));
        this.define(["I fail with $msg"], function (msg, _done) {
            throw new results_1.StepError("Deliberate Fail: " + msg, this);
        }, doc);
        doc = this.define(["I pass", "I do nothing", "I succeed"], function (done) {
            done();
        }, new Dialect_1.DialectDocs("common.pass", "Do nothing / pass"));
        doc = this.define(["I wait $time $units", "I wait for $time $units"], function (time, units, done) {
            var scale = 1000;
            switch (units) {
                case "m":
                case "min":
                case "mins":
                case "minute":
                case "minutes":
                    scale = 60 * 1000;
                    break;
                case "s":
                case "second":
                case "seconds":
                    scale = 1000;
                    break;
                case "ms":
                case "millsecond":
                case "millseconds":
                    scale = 1;
                    break;
                default:
                    scale = 1000;
                    break;
            }
            var wait = time * scale;
            console.log("waiting " + wait + " ms");
            done && setTimeout(done, wait);
        }, new Dialect_1.DialectDocs("common.wait", "Wait for period of time"));
        doc = this.define(["elapsed time should be less than $elapsed", "duration should be less than $elapsed"], function (elapsed, done) {
            assert(this.stopwatch.duration < elapsed);
            done();
        }, new Dialect_1.DialectDocs("common.stopwatch", "Check for elapsed time"));
        false && doc;
    }
}
exports.CommonDialect = CommonDialect;
//  var self = module.exports = function(qa-engine, learn, config, dialect) {
// 	assert(qa-engine, "missing qa-engine");
//     assert(learn, "missing learn");
//     assert(config, "missing config");
//     assert(dialect, "missing dialect");
//     assert(helps, "missing helpers");
//     Array.prototype.contains = function(element){
//         return this.indexOf(element) > -1;
//     };
//     doc = this.define(["I am $actor", "I am a $actor", "I am an $actor"], function(actor, done: Function) {
//         assert(actor, "Missing $actor");
//         debug("My name is "+actor);
//         this.vars.name = actor;
//         done();
//     });
//     doc = this.define(["I want $outcome", "I want a $outcome", "I want an $outcome", "I want some $outcome", "I want to $outcome"], function(outcome, done: Function) {
//         assert(outcome, "Missing $outcome");
//         debug("We want "+outcome);
//         this.vars.name = outcome;
//         done();
//     });
//     doc = this.define(["debug $msg"], function(msg, done: Function) {
//         debug(msg);
//         done();
//     });
//     doc = this.define(["log $msg"], function(msg, done: Function) {
//         log(msg);
//         done();
//     });
//     doc = this.define(["error $msg"], function(msg, done: Function) {
//         error(msg);
//         done();
//     });
//     doc = this.define(["dump $varname", "I dump $varname"], function(name, done: Function) {
//         assert(name, "Missing $varname")
//         debug("dump %s in current scope", name);
//         var found = helps.vars.findNamed(this, name);
//         console.log("\t%s ==>\n%j", name, (found || "Not Found") );
//         done();
//     });
//     doc = this.define(["dump", "I dump"], function(this: any, done: Function) {
//         debug("dump current scope");
//         console.log("%j", this);
//         done();
//     });
//     doc = this.define(["I fail"], function(this: any, done: Function) {
//         debug("Deliberate OOPS !!");
//         throw new Error("Deliberate Fail");
//     });
//     doc = this.define(["I fail with $msg"], function(msg, done: Function) {
//         debug("doh !! %s", msg);
//         throw new Error("Deliberate Fail: "+msg);
//     });
//     doc = this.define(["I pass", "I do nothing", "I succeed"], function(this: any, done: Function) {
//         debug("Yay. '%s' was successful", this.feature);
//         done();
//     });
//     doc = this.define(["I wait $time $units", "I wait for $time $units"], function(time, units, done: Function) {
//         var scale = 1000;
//         switch(units) {
//             case "m":
//             case "min":
//             case "mins":
//             case "minute":
//             case "minutes":
//                 scale = 60*1000; break;
//             case "s":
//             case "second":
//             case "seconds":
//                 scale = 1000; break;
//             case "ms":
//             case "millsecond":
//             case "millseconds":
//                 scale = 1; break;
//             default:
//                 scale = 1000; break;
//         }
//         var wait = time * scale;
//         debug("waiting "+wait+" ms");
//         done && setTimeout(done, wait);
//     });
//     doc = this.define(["I run $filename"], function(command, done: Function) {
//         var self = this;
//         debug ("CLI Run %s from %s", command, process.cwd());
//         child_process.execFile(command, {}, {
//             cwd: process.cwd()
//         }, function(err, stdout, stderr) {
//             debug ("Finished Run: %s -> %s", command, err);
//             assert(!err, "RUN: "+command+" -> "+err);
//             self.stdout = stdout;
//             self.stderr = stderr;
//             done();
//         })
//     });
//     doc = this.define(["I exec $command"], function(command, done: Function) {
//         var self = this;
//         debug ("CLI Exec: %s from %s", command, process.cwd());
//         child_process.exec(command, {}, {
//             cwd: process.cwd()
//         }, function(err, stdout, stderr) {
//             debug ("Finished Exec: %s -> %s", command, err);
//             assert(!err, "EXEC: "+command+" -> "+err);
//             self.stdout = stdout;
//             self.stderr = stderr;
//             done();
//         })
//     });
//     // **********************************************************************
//     // * Dialect Controller
//     // **********************************************************************
//     self.feature = function(dialect, scope) {
//         assert(dialect, "missing dialect");
//         assert(scope, "missing scope");
//     };
//     self.scenario = function(dialect, scope) {
//         assert(dialect, "missing dialect");
//         assert(scope, "missing scope");
//     };
//     self.annotations = function(dialect, annotations, scope, scope2) {
//         assert(dialect, "missing dialect");
//         assert(annotations, "missing annotations");
//         assert(scope, "missing scope");
//         _.defaults(scope, { stopwatch: {} });
//         var bail = annotations.bail?true:false;
//         if (annotations.bail && scope2.bail) {
//             scope2.bail(bail);
//             debug("%s bails on failure", scope2.title);
//         }
//         // dynamic dialects
//         var dialects = [];
//         if (_.isString(annotations.dialects)) dialects.push(annotations.dialects);
//         if (_.isArray(annotations.dialects)) dialects.concat(annotations.dialects);
//         if (_.isString(annotations.dialect)) dialects.push(annotations.dialect);
//         if (_.isArray(annotations.dialect)) dialects.concat(annotations.dialect);
//         if (annotations.timeout && scope2 && _.isFunction(scope2.timeout)) {
//             debug("timeout: %s", annotations.timeout);
//             scope2.timeout(annotations.timeout);
//         }
//         dialect.requires(dialects);
//         scope.dialects = dialects;
//     }
//     debug("utility phrases - v%s",pkg.version);
//     return self;
// }
//# sourceMappingURL=common.js.map