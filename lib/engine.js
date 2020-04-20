"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const yadda_1 = require("yadda");
const parsers_1 = require("yadda/lib/parsers");
const results_1 = require("./results");
const events_1 = require("events");
const converters_1 = require("./helpers/converters");
const glob = require("glob");
const async = require("async");
const _ = require("lodash");
let debug = require("debug")("qa");
class FeatureScope extends yadda_1.Context {
    constructor(defaults) {
        super(defaults);
    }
}
exports.FeatureScope = FeatureScope;
// FeatureParser, FeatureExport, ScenarioExport,
class Engine {
    constructor(config) {
        this.dialects = [];
        this.vars = {};
        this.paths = { files: "." };
        this.ctx = new yadda_1.Context(config);
        this.bus = new events_1.EventEmitter();
        // let Language = localisation.English;
        this.dictionary = new yadda_1.Dictionary();
        this.dictionary.define("CODE", /([^\u0000]*)/);
        this.dictionary.define("CSV", /([^\u0000]*)/, converters_1.Converters.csv);
        this.dictionary.define("JSON", /([^\u0000]*)/, converters_1.Converters.json);
        this.dictionary.define("TEXT", /([^\u0000]*)/, converters_1.Converters.text);
        this.dictionary.define("JS", /([^\u0000]*)/, converters_1.Converters.js);
        this.dictionary.define("file_folder", /(file|folder)/);
        this.library = new yadda_1.Library(this.dictionary);
        this.yadda = new yadda_1.Yadda(this.library);
        this.parser = new parsers_1.FeatureParser();
        this.vars = this.ctx.properties;
    }
    // learn(pattern: string, ) {
    //     this.library.define( phrase.pattern, (..._args: string[]) => {
    //         return new Promise<void>( (resolve, reject) => {
    //             try {
    //                 debug("doing: %o --> %o", phrase.pattern, _args);
    //                 phrase.fn(_args, resolve);
    //             } catch (err) {
    //                 debug("not done: %o --> %o", phrase.pattern, err);
    //                 reject();
    //             }
    //         });
    //     }, this.ctx, { mode: 'sync' });
    // }
    log(msg, ...opts) {
        let args = [msg, opts];
        debug.call(this, args);
    }
    /**
     * Support for a local event bus
     * @param name
     * @param vars
     */
    emit(name, vars) {
        this.bus.emit(name, vars);
    }
    /**
     * Register a Dialect with the engine
     *
     * @param dialect
     */
    addDialect(dialect) {
        this.dialects.push(dialect);
    }
    /**
     * Update the FeatureScope with default properties for each Dialect
     *
     * @param scope
     */
    scope(options) {
        _.defaults(options, { paths: { files: "./" } });
        let scope = new FeatureScope(options);
        this.dialects.forEach((dialect) => {
            dialect.scope(scope);
        });
        return scope;
    }
    /**
     * Read files and execute a Gherkin Feature as string (set of scenarios/steps)
     *
     * @param feature
     */
    read(scope, folder) {
        const self = this;
        return new Promise((resolve, reject) => {
            let results = new results_1.ResultSet();
            try {
                const files = glob.sync(folder + "**/*");
                // TODO: make sequential ...
                let done = 0;
                files.forEach(file => {
                    converters_1.Converters.load_feature(file, (_err, json) => __awaiter(this, void 0, void 0, function* () {
                        let featured = json;
                        self.execute(scope, featured, results).then((result) => {
                            debug("done: %o %o", file, result.passed());
                            done++;
                            if (done == files.length)
                                resolve(results);
                        }).catch(reject);
                    }));
                });
            }
            catch (e) {
                reject(this.toError(e));
            }
        });
    }
    /**
     * Parse and execute a Gherkin Feature as string (set of scenarios/steps)
     *
     * @param feature
     */
    run(feature, options) {
        let scope = this.scope(options);
        const self = this;
        return new Promise((resolve, reject) => {
            this.parser.parse(feature, function (featured) {
                self.execute(scope, featured, null)
                    .then(resolve)
                    .catch(err => {
                    reject(this.toError(err));
                });
            });
        });
    }
    /**
     * Execute a Gherkin Feature (scenarios/steps)
     *
     * @param scope
     * @param feature
     */
    execute(scope, feature, tests) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let results = tests || new results_1.ResultSet();
            this.bus.emit("feature", { feature: feature, results: results });
            this.feature(scope, feature, results).then(() => { resolve(results); }).catch(reject);
        }));
    }
    /**
     * Execute a Gherkin Feature
     *
     * @param scope
     * @param featured
     * @param results
     */
    feature(scope, featured, results) {
        let self = this;
        let feature_results = results.feature(featured);
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                debug("FEATURE: %o", featured.title);
                async.eachSeries(featured.scenarios, (scenario, next) => {
                    debug("SCENARIO: %o", scenario.title);
                    self.scenario(scope, featured, scenario, feature_results).then((result) => {
                        debug("SCENARIO DONE: %o --> %o", scenario.title, result.passed());
                        next();
                    }).catch((err) => {
                        debug("SCENARIO FAILED: %o --> %o", scenario.title, err);
                        reject(err);
                    });
                }, () => {
                    debug("FEATURE DONE: %o", featured.title);
                    resolve(feature_results);
                });
            }
            catch (err) {
                console.error("FEATURE ERROR: %o", err);
                reject(err);
            }
        }));
    }
    /**
     * Execute a Gherkin Scenario
     *
     * @param scope
     * @param featured
     * @param scenario
     * @param feature_results
     */
    scenario(scope, featured, scenario, feature_results) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let scenario_result = feature_results.scenario(scenario);
            this.bus.emit("scenario", {
                scope: scope,
                feature: featured,
                scenario: scenario,
                result: scenario_result
            });
            // execute each step using Yadda
            // debug("steps: %o", scenario.steps);
            async.eachSeries(scenario.steps, (step, next) => {
                this.yadda.run(step, scope, err => {
                    if (err) {
                        this.bus.emit("step:failed", {
                            scope: scope,
                            feature: featured,
                            scenario: scenario,
                            step: step,
                            error: err
                        });
                        reject(this.toError(err));
                    }
                    else {
                        next();
                    }
                });
                debug("STEP: %o", step);
            }, () => {
                scenario_result.pass();
                this.bus.emit("pass", {
                    scope: scope,
                    feature: featured,
                    scenario: scenario,
                    result: scenario_result
                });
                debug("%s STEPS DONE: %o", scenario.steps.length, scenario.title, scenario_result.passed());
                resolve(scenario_result);
            });
            // debug("SCENARIO DONE: %o", scenario);
            // resolve(scenario_result);
            // this.bus.emit("finished", { scope: scope, feature: featured, scenario: scenario, results: scenario_result });
        }));
    }
    getDocs() {
        let docs = [];
        this.dialects.forEach(dialect => {
            docs = docs.concat(dialect.docs);
        });
        return docs;
    }
    toError(err) {
        if (err instanceof results_1.StepError)
            return err.message;
        if (err instanceof Error)
            return err.message;
        if (err instanceof String)
            return err.toString();
        return err.toString();
    }
}
exports.Engine = Engine;
//# sourceMappingURL=engine.js.map