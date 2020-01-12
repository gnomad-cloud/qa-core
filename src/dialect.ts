import { Engine, FeatureScope } from "./engine";
import * as _ from "lodash";
import * as uuidv5 from "uuid/v5";

export class DialectDocs {

    constructor(protected id: string, protected description: string, public phrases?:any ) {

    }
}
export abstract class Dialect {
    docs: DialectDocs[] = [];

    constructor(protected engine: Engine) {
        this.engine.addDialect(this);
    }

    define(_pattern: string | string[] | RegExp | RegExp[], _fn: (...args:any[] )=>void, doc?: DialectDocs ) {
        this.engine.library.define(_pattern, _fn, this.engine.ctx);

        
        if (!doc) doc = new DialectDocs( uuidv5(_pattern.toString(),uuidv5.DNS), _pattern.toString() );

        doc.phrases = _.isArray(_pattern)?_pattern:[_pattern];

        this.docs.push( doc );
    }

    scope(_scope: FeatureScope) {
        _.defaults(_scope, {
        });
    }

    debug(message: string) {
        console.warn(">> %o", message);
    }
}