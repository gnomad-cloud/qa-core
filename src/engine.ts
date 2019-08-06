


import { Yadda, Library, localisation, Dictionary, Context } from 'yadda';
import { FeatureParser } from 'yadda/lib/parsers';
import { FeatureExport, ScenarioExport } from 'yadda/lib/parsers/FeatureParser';
import { ScenarioResult, ResultSet } from './results';
import { Dialect } from "./Dialect";
import { EventEmitter } from 'events';
import { Converters } from './converters';
import { mapSeries } from 'async';

export class FeatureScope extends Context{

    constructor(defaults?: any) {
        super( defaults );
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

        let converts = new Converters();
        let Language = localisation.English;
        this.dictionary = new Dictionary();
        this.dictionary.define('CODE', /([^\u0000]*)/);
        this.dictionary.define('CSV', /([^\u0000]*)/, converts.csv );
        this.dictionary.define('JSON', /([^\u0000]*)/, converts.json );
        this.dictionary.define('TEXT', /([^\u0000]*)/, converts.text );
        this.dictionary.define('JS', /([^\u0000]*)/, converts.js );

        this.dictionary.define('file_folder', /(file|folder)/);

        this.library = new Library(this.dictionary);
        this.yadda = new Yadda(this.library);
        this.parser = new FeatureParser();

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

    log(msg: string, ...opts: any) {
        let args = [ msg, opts]; 
        console.log.call(this, args);
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
    scope(scope: FeatureScope): FeatureScope {
        this.dialects.forEach( (dialect: Dialect) => {
            dialect.scope(scope);
        });
        return scope;
    }

    /**
     * Execute a Gherkin Feature file (set of scenarios/steps)
     * 
     * @param feature 
     */
    run(feature: string): Promise<ResultSet> {

        let scope = this.scope(new FeatureScope());
        let self = this;

        return new Promise<ResultSet>((resolve, reject) => {
            let results = new ResultSet();

            this.parser.parse(feature, function (featured: FeatureExport) {
                console.log("FEATURED: %o", featured.title);

                mapSeries(featured.scenarios, (scenario: ScenarioExport, scenario_done) => {
                    let result = new ScenarioResult(scenario);
                    try {
                        /*
                         * execute each step using Yadda
                         */
                        mapSeries(scenario.steps, function(step, next) {
                            console.log("STEP: %o", step);
                            self.yadda.run(step, scope, next);
                        }, (err: any, _scenario_results) => {
                            console.log("SCENARIO: %o --> %o", scenario.title, err ? err : "ok");
                            err ? result.failed(err.message) : result.success();
                            results.finished(result);
                            scenario_done(err, result);
                        });

                    } catch (err) {
                        result.failed(err.message);
                        console.log("OOPS: %o", err.message);
                        results.finished(result);
                        scenario_done(err, result);
                    }
                }, (err, all_results) => {
                    console.log("PASSED: %o", results.passed());
                    if (err) {
                        reject(results)
                    } else {
                        resolve(results);
                    }
                });

            });
        })
    }

}