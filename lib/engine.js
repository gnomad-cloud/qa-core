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
    //                 console.log("doing: %o --> %o", phrase.pattern, _args);
    //                 phrase.fn(_args, resolve);
    //             } catch (err) {
    //                 console.log("not done: %o --> %o", phrase.pattern, err);
    //                 reject();
    //             }
    //         });
    //     }, this.ctx, { mode: 'sync' });
    // }
    log(msg, ...opts) {
        let args = [msg, opts];
        console.log.call(this, args);
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
            console.log("walker: %o", folder);
            try {
                const files = glob.sync(folder + '**/*');
                console.log("walked: %o", files);
                files.forEach(file => {
                    converters_1.Converters.json_or_yaml(file, (_err, json) => __awaiter(this, void 0, void 0, function* () {
                        let featured = json;
                        console.log("json: (%s) %s -<> %o", _err, file, json);
                        results = yield self.feature(scope, featured, results);
                    }));
                });
                resolve(results);
            }
            catch (e) {
                reject(e);
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
                self.feature(scope, featured, null)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }
    /**
     * Execute a Gherkin Feature (scenarios/steps)
     *
     * @param scope
     * @param feature
     */
    feature(scope, featured, _rs) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            let results = _rs || new results_1.ResultSet();
            console.log("FEATURE: %o", featured);
            let self = this;
            try {
                featured.scenarios.forEach((scenario) => {
                    console.log("Scenario: %o", scenario);
                    let result = new results_1.ScenarioResult(scenario);
                    try {
                        /*
                        * execute each step using Yadda
                        */
                        scenario.steps.forEach((step) => {
                            console.log("STEP: %o", step);
                            self.yadda.run(step, scope, () => {
                            });
                        });
                        result.succeeded();
                        results.finished(result);
                    }
                    catch (err) {
                        result.failed(err.message);
                        console.error("OOPS: %o ", err);
                        results.finished(result);
                    }
                });
                resolve(results);
            }
            catch (e) {
                reject(e);
            }
        }));
    }
}
exports.Engine = Engine;
//# sourceMappingURL=engine.js.map