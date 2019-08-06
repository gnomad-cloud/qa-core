import { Engine, FeatureScope } from "./engine";
// import { StepFn } from "yadda";

// export class Phrase {
//     pattern: string | string[] | RegExp | RegExp[] = "noop";
//     fn: Function = function(_args: any, next: Function) {
//         console.log("not implemented");
//         next();
//     };

//     constructor(_pattern?: string | string[] | RegExp | RegExp[], _fn?: Function) {
//         if (_pattern) {
//             this.learn(_pattern, _fn?_fn:this.fn);
//         }
//     }

//     learn(_pattern: string | string[] | RegExp | RegExp[], _fn: Function ): void {
//         this.pattern = _pattern;
//         this.fn = _fn;
//     }

// }

export abstract class Dialect {

    constructor(protected engine: Engine) {
        this.engine.addDialect(this);
    }

    define(_pattern: string | string[] | RegExp | RegExp[], _fn: (...args:any[] )=>void ) {
        this.engine.library.define(_pattern, _fn, this.engine.ctx), {};
    }

    scope(scope: FeatureScope) {
        // to be extended
    }

    debug(message: string) {
        console.warn(">> %o", message);
    }
}