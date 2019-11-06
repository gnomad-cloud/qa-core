import { Engine, FeatureScope } from "../engine";
import { Dialect } from "../Dialect";
/**
 * Web API
 * Configures the Yadda parser with phrases that support operations on HTTP APIs
 *
 * @module Web API Dialect
 * @class Web API
 *
 */
export declare class WebAPIDialect extends Dialect {
    VERBOSE: boolean;
    constructor(engine: Engine);
    scope(scope: any): FeatureScope;
}
