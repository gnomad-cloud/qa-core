import { Engine, FeatureScope } from "./engine";
export declare class DialectDocs {
    protected id: string;
    protected description: string;
    phrases?: any;
    constructor(id: string, description: string, phrases?: any);
}
export declare abstract class Dialect {
    protected engine: Engine;
    docs: DialectDocs[];
    constructor(engine: Engine);
    define(_pattern: string | string[] | RegExp | RegExp[], _fn: (...args: any[]) => void, doc?: DialectDocs): void;
    scope(_scope: FeatureScope): void;
    debug(message: string): void;
}
