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
    protected engine: Engine;
    constructor(engine: Engine);
    install(): void;
    scope(scope: FeatureScope): FeatureScope;
}
