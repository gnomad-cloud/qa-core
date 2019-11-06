import { Engine, FeatureScope } from "./engine";
export declare abstract class Dialect {
    protected engine: Engine;
    constructor(engine: Engine);
    define(_pattern: string | string[] | RegExp | RegExp[], _fn: (...args: any[]) => void): void;
    scope(_scope: FeatureScope): void;
    debug(message: string): void;
}
