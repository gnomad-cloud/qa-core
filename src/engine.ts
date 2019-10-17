import { Yadda, Library, Dictionary, Context } from "yadda";
import { FeatureParser } from "yadda/lib/parsers";
import { FeatureExport, ScenarioExport } from "yadda/lib/parsers/FeatureParser";
import { ScenarioResult, ResultSet } from "./results";
import { Dialect } from "./Dialect";
import { EventEmitter } from "events";
import { Converters } from "./helpers/converters";
import * as glob from 'glob';

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
    let args = [msg, opts];
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
  scope(options: any): FeatureScope {
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

  read(scope: FeatureScope, folder: string): Promise<ResultSet> {
    const self = this;

    return new Promise<ResultSet>((resolve, reject) => {
      let results = new ResultSet();
      console.log("walker: %o", folder);
      try {
        const files = glob.sync(folder + '**/*')
        console.log("walked: %o", files)
        files.forEach(file => {
          Converters.json_or_yaml(file, async (_err: any, json: any) => {
            let featured = json as FeatureExport;
            console.log("json: (%s) %s -<> %o", _err, file, json);
            results = await self.feature(scope, featured, results);
          });
        })
        resolve(results);
      } catch (e) {
        reject(e);
      }
    });
  }

  /**
   * Parse and execute a Gherkin Feature as string (set of scenarios/steps)
   *
   * @param feature
   */
  run(feature: string, options?: any): Promise<ResultSet> {
    let scope = this.scope(options);
    const self = this;
    return new Promise<ResultSet>((resolve, reject) => {
      this.parser.parse(feature, function (featured: FeatureExport) {
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

  feature(scope: FeatureScope, featured: FeatureExport, _rs: ResultSet): Promise<ResultSet> {

    return new Promise<ResultSet>(async (resolve, reject) => {
      let results = _rs || new ResultSet();
      console.log("FEATURE: %o", featured);
      let self = this;

      try {
        featured.scenarios.forEach((scenario: ScenarioExport) => {
          console.log("Scenario: %o", scenario);
          let result = new ScenarioResult(scenario);
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

          } catch (err) {
            result.failed(err.message);
            console.error("OOPS: %o ", err);
            results.finished(result);
          }
        });

        resolve(results);
      } catch (e) {
        reject(e);
      }
    });
  }
}
