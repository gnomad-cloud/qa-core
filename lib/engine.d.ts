/// <reference types="node" />
import { Yadda, Library, Context } from "yadda";
import { FeatureParser } from "yadda/lib/parsers";
import { FeatureExport, ScenarioExport } from "yadda/lib/parsers/FeatureParser";
import { ResultSet as TestResult, FeatureResult, ScenarioResult } from "./results";
import { Dialect } from "./Dialect";
import { EventEmitter } from "events";
export declare class FeatureScope extends Context {
    constructor(defaults?: any);
}
export declare class Engine {
    ctx: Context;
    dictionary: any;
    yadda: Yadda;
    debug: any;
    library: Library;
    parser: FeatureParser;
    bus: EventEmitter;
    dialects: Dialect[];
    vars: any;
    paths: any;
    constructor(config: any);
    log(msg: string, ...opts: any): void;
    /**
     * Support for a local event bus
     * @param name
     * @param vars
     */
    emit(name: string, vars: any): void;
    /**
     * Register a Dialect with the engine
     *
     * @param dialect
     */
    addDialect(dialect: Dialect): void;
    /**
     * Update the FeatureScope with default properties for each Dialect
     *
     * @param scope
     */
    scope(options: any): FeatureScope;
    /**
     * Read files and execute a Gherkin Feature as string (set of scenarios/steps)
     *
     * @param feature
     */
    read(scope: FeatureScope, folder: string): Promise<TestResult>;
    /**
     * Parse and execute a Gherkin Feature as string (set of scenarios/steps)
     *
     * @param feature
     */
    run(feature: string, options?: any): Promise<TestResult>;
    /**
     * Execute a Gherkin Feature (scenarios/steps)
     *
     * @param scope
     * @param feature
     */
    execute(scope: FeatureScope, feature: FeatureExport, tests?: TestResult): Promise<TestResult>;
    /**
     * Execute a Gherkin Feature
     *
     * @param scope
     * @param featured
     * @param results
     */
    feature(scope: FeatureScope, featured: FeatureExport, results: TestResult): Promise<FeatureResult>;
    /**
     * Execute a Gherkin Scenario
     *
     * @param scope
     * @param featured
     * @param scenario
     * @param feature_results
     */
    scenario(scope: FeatureScope, featured: FeatureExport, scenario: ScenarioExport, feature_results: FeatureResult): Promise<ScenarioResult>;
    toError(err: any): string;
}
