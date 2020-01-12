import { Yadda, Library, Dictionary, Context } from "yadda";
import { FeatureParser } from "yadda/lib/parsers";
import { FeatureExport, ScenarioExport } from "yadda/lib/parsers/FeatureParser";
import { ResultSet as TestResult, StepError, FeatureResult, ScenarioResult } from "./results";
import { Dialect } from "./Dialect";
import { EventEmitter } from "events";
import { Converters } from "./helpers/converters";
import * as glob from "glob";
import * as async from "async";
import * as _ from "lodash";
let debug = require("debug")("qa");

export class FeatureScope extends Context {
    constructor(defaults?: any) {
        super(defaults);
    }
}

// FeatureParser, FeatureExport, ScenarioExport,
export class Engine {
    ctx: Context;
    dictionary: any;
    yadda: Yadda;
    debug: any;
    library: Library;
    parser: FeatureParser;
    bus: EventEmitter;
    dialects: Dialect[] = [];

    vars: any = {};
    paths: any = { files: "." };

    constructor(config: any) {
        this.ctx = new Context(config);
        this.bus = new EventEmitter();

        // let Language = localisation.English;
        this.dictionary = new Dictionary();
        this.dictionary.define("CODE", /([^\u0000]*)/);
        this.dictionary.define("CSV", /([^\u0000]*)/, Converters.csv);
        this.dictionary.define("JSON", /([^\u0000]*)/, Converters.json);
        this.dictionary.define("TEXT", /([^\u0000]*)/, Converters.text);
        this.dictionary.define("JS", /([^\u0000]*)/, Converters.js);

        this.dictionary.define("file_folder", /(file|folder)/);

        this.library = new Library(this.dictionary);
        this.yadda = new Yadda(this.library);
        this.parser = new FeatureParser();

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

    log(msg: string, ...opts: any) {
        let args = [msg, opts];
        debug.call(this, args);
    }

    /**
     * Support for a local event bus
     * @param name
     * @param vars
     */
    emit(name: string, vars: any) {
        this.bus.emit(name, vars);
    }

    /**
     * Register a Dialect with the engine
     *
     * @param dialect
     */

    addDialect(dialect: Dialect) {
        this.dialects.push(dialect);
    }

    /**
     * Update the FeatureScope with default properties for each Dialect
     *
     * @param scope
     */
    scope(options: any): FeatureScope {
        _.defaults(options, { paths: { files: "./" }});

        let scope = new FeatureScope(options);
        this.dialects.forEach((dialect: Dialect) => {
            dialect.scope(scope);
        });
        return scope;
    }

    /**
     * Read files and execute a Gherkin Feature as string (set of scenarios/steps)
     *
     * @param feature
     */
    read(scope: FeatureScope, folder: string): Promise<TestResult> {
        const self = this;

        return new Promise<TestResult>((resolve, reject) => {
            let results = new TestResult();
            try {
                const files = glob.sync(folder + "**/*");

                // TODO: make sequential ...
                let done = 0;
                files.forEach(file => {
                    Converters.load_feature(
                        file,
                        async (_err: any, json: any) => {
                            let featured = json as FeatureExport;
                            self.execute(scope, featured, results).then((result: TestResult)=> {
                                debug("done: %o %o", file, result.passed());
                                done++;
                                if (done == files.length)
                                    resolve(results);

                            }).catch(reject);
                        }
                    );
                });
            } catch (e) {
                reject(this.toError(e));
            }
        });
    }

    /**
     * Parse and execute a Gherkin Feature as string (set of scenarios/steps)
     *
     * @param feature
     */
    run(feature: string, options?: any): Promise<TestResult> {
        let scope = this.scope(options);
        const self = this;
        return new Promise<TestResult>((resolve, reject) => {
            this.parser.parse(feature, function(featured: FeatureExport) {
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
    execute(
        scope: FeatureScope,
        feature: FeatureExport,
        tests?: TestResult
    ): Promise<TestResult> {
        return new Promise<TestResult>(async (resolve, reject) => {
            let results = tests || new TestResult();
            this.bus.emit("feature", { feature: feature, results: results });
            this.feature(scope, feature, results).then( () => { resolve(results) }).catch(reject);
        });
    }

    /**
     * Execute a Gherkin Feature
     * 
     * @param scope 
     * @param featured 
     * @param results 
     */

     feature(
        scope: FeatureScope,
        featured: FeatureExport,
        results: TestResult
    ): Promise<FeatureResult> {
        let self = this;
        let feature_results: FeatureResult = results.feature(featured);

        return new Promise<FeatureResult>(async (resolve, reject) => {
            try {
                debug("FEATURE: %o", featured.title);
                async.eachSeries(
                    featured.scenarios,
                    (scenario: ScenarioExport, next: Function) => {
                        debug("SCENARIO: %o", scenario.title);
                        self.scenario(scope, featured, scenario, feature_results).then( (result: ScenarioResult) => {
                            debug("SCENARIO DONE: %o --> %o", scenario.title, result.passed());
                            next();
                        }).catch((err)=> {
                            debug("SCENARIO FAILED: %o --> %o", scenario.title, err);
                            reject(err);
                        });
                    }, () => {
                        debug("FEATURE DONE: %o", featured.title);
                        resolve(feature_results);
                    }
                );
            } catch (err) {
                console.error("FEATURE ERROR: %o", err);
                reject(err);
            }
        });
    }

    /**
     * Execute a Gherkin Scenario
     * 
     * @param scope 
     * @param featured 
     * @param scenario 
     * @param feature_results 
     */

     scenario(
        scope: FeatureScope,
        featured: FeatureExport,
        scenario: ScenarioExport,
        feature_results: FeatureResult
    ): Promise<ScenarioResult> {

        return new Promise<ScenarioResult>(async (resolve, reject) => {
            let scenario_result: ScenarioResult = feature_results.scenario(scenario);
            this.bus.emit("scenario", {
                scope: scope,
                feature: featured,
                scenario: scenario,
                result: scenario_result
            });
            // execute each step using Yadda

            // debug("steps: %o", scenario.steps);
            async.eachSeries( scenario.steps, (step: string, next: Function) => {
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
                    } else {
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
        });
    }


    toError(err: any): string {
        if (err instanceof StepError) return err.message;
        if (err instanceof Error) return err.message;
        if (err instanceof String) return err.toString();
        return err.toString();
    }
}
