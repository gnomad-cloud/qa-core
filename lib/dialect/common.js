"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialect_1 = require("../Dialect");
const results_1 = require("../results");
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
        this.define(["I am $actor", "I am a $actor", "I am an $actor"], function (actor, done) {
            this.name = actor;
            console.log("My name is: %o", actor);
            done();
        });
        this.define(["I fail"], function (_done) {
            throw new Error("Deliberate Fail");
        });
        this.define(["I fail with $msg"], function (msg, _done) {
            throw new results_1.StepError("Deliberate Fail: " + msg, this);
        });
        this.define(["I pass", "I do nothing", "I succeed"], function (done) {
            done();
        });
        this.define(["I wait $time $units", "I wait for $time $units"], function (time, units, done) {
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
        });
    }
}
exports.CommonDialect = CommonDialect;
//  var self = module.exports = function(meta4qa, learn, config, dialect) {
// 	assert(meta4qa, "missing meta4qa");
//     assert(learn, "missing learn");
//     assert(config, "missing config");
//     assert(dialect, "missing dialect");
//     assert(helps, "missing helpers");
//     Array.prototype.contains = function(element){
//         return this.indexOf(element) > -1;
//     };
//     this.define(["I am $actor", "I am a $actor", "I am an $actor"], function(actor, done: Function) {
//         assert(actor, "Missing $actor");
//         debug("My name is "+actor);
//         this.vars.name = actor;
//         done();
//     });
//     this.define(["I want $outcome", "I want a $outcome", "I want an $outcome", "I want some $outcome", "I want to $outcome"], function(outcome, done: Function) {
//         assert(outcome, "Missing $outcome");
//         debug("We want "+outcome);
//         this.vars.name = outcome;
//         done();
//     });
//     this.define(["debug $msg"], function(msg, done: Function) {
//         debug(msg);
//         done();
//     });
//     this.define(["log $msg"], function(msg, done: Function) {
//         log(msg);
//         done();
//     });
//     this.define(["error $msg"], function(msg, done: Function) {
//         error(msg);
//         done();
//     });
//     this.define(["dump $varname", "I dump $varname"], function(name, done: Function) {
//         assert(name, "Missing $varname")
//         debug("dump %s in current scope", name);
//         var found = helps.vars.findNamed(this, name);
//         console.log("\t%s ==>\n%j", name, (found || "Not Found") );
//         done();
//     });
//     this.define(["dump", "I dump"], function(this: any, done: Function) {
//         debug("dump current scope");
//         console.log("%j", this);
//         done();
//     });
//     this.define(["I fail"], function(this: any, done: Function) {
//         debug("Deliberate OOPS !!");
//         throw new Error("Deliberate Fail");
//     });
//     this.define(["I fail with $msg"], function(msg, done: Function) {
//         debug("doh !! %s", msg);
//         throw new Error("Deliberate Fail: "+msg);
//     });
//     this.define(["I pass", "I do nothing", "I succeed"], function(this: any, done: Function) {
//         debug("Yay. '%s' was successful", this.feature);
//         done();
//     });
//     this.define(["I wait $time $units", "I wait for $time $units"], function(time, units, done: Function) {
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
//     this.define(["I run $filename"], function(command, done: Function) {
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
//     this.define(["I exec $command"], function(command, done: Function) {
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