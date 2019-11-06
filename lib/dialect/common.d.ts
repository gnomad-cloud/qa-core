import { Dialect } from "../Dialect";
import { Engine } from "../engine";
/**
 * Configures the Gherkin parser with phrases that support common, useful operations
 *
 * @module Default Dialect
 * @class Common
 * @decription common phrases
 *
 */
export declare class CommonDialect extends Dialect {
    constructor(engine: Engine);
}
