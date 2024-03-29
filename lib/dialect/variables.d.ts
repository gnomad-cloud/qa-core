import { Engine } from "../engine";
import { Dialect } from "../Dialect";
/**
 * Variables
 * Configures the Gherkin parser with phrases that support operations on variables
 *
 * @module Default Dialect
 * @class Variables
 *
 */
export declare class VarsDialect extends Dialect {
    protected engine: Engine;
    constructor(engine: Engine);
}
