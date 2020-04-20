import { Engine, FeatureScope } from "./engine";
export declare class DialectDocs {
    tag: string;
    description: string;
    phrases: any[];
    constructor(_tag: string, _description: string, _phrases?: any);
}
export declare abstract class Dialect {
    protected engine: Engine;
    docs: DialectDocs[];
    constructor(engine: Engine);
    define(_pattern: string | string[] | RegExp | RegExp[], _fn: (...args: any[]) => void, doc?: DialectDocs): DialectDocs;
    scope(_scope: FeatureScope): void;
    debug(message: string): void;
}
