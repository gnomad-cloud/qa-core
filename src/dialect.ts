import { Engine, FeatureScope } from "./engine";

export abstract class Dialect {

    constructor(protected engine: Engine) {
        this.engine.addDialect(this);
    }

    define(_pattern: string | string[] | RegExp | RegExp[], _fn: (...args:any[] )=>void ) {
        this.engine.library.define(_pattern, _fn, this.engine.ctx), {};
    }

    scope(_scope: FeatureScope) {
        // to be extended
    }

    debug(message: string) {
        console.warn(">> %o", message);
    }
}