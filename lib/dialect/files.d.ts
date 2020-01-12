import { Engine, FeatureScope } from "../engine";
import { Dialect } from "../Dialect";
/**
 * File System
 * Configures the Gherkin parser with phrases that support operations on File System
 *
 * @module Default Dialect
 * @class File System
 *
 */
export declare class FilesDialect extends Dialect {
    FILE_ENCODING: string;
    converts: any;
    constructor(engine: Engine);
    scope(_scope: FeatureScope): void;
}
