/// <reference types="node" />
import { Yadda, Library, Context } from "yadda";
import { FeatureParser } from "yadda/lib/parsers";
import { FeatureExport } from "yadda/lib/parsers/FeatureParser";
import { ResultSet, StepError } from "./results";
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
    read(scope: FeatureScope, folder: string): Promise<ResultSet>;
    /**
     * Parse and execute a Gherkin Feature as string (set of scenarios/steps)
     *
     * @param feature
     */
    run(feature: string, options?: any): Promise<ResultSet>;
    /**
     * Execute a Gherkin Feature (scenarios/steps)
     *
     * @param scope
     * @param feature
     */
    execute(scope: FeatureScope, featured: FeatureExport, _rs: ResultSet): Promise<ResultSet>;
    toError(err: any): StepError;
}
