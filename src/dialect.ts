import { Engine, FeatureScope } from "./engine";
import * as _ from "lodash";
import * as uuidv5 from "uuid/v5";

export class DialectDocs {
    public tag: string
    public description: string = "unknown"
    public phrases: any[]

    constructor(_tag: string, _description: string, _phrases?:any ) {
        this.tag = _tag || "unknown";
        this.description = _description || "unknown";
        this.phrases = _phrases || [];
    }

}
export abstract class Dialect {
    docs: DialectDocs[] = [];

    constructor(protected engine: Engine) {
        this.engine.addDialect(this);
    }

    define(_pattern: string | string[] | RegExp | RegExp[], _fn: (...args:any[] )=>void, doc?: DialectDocs ): DialectDocs {
        this.engine.library.define(_pattern, _fn, this.engine.ctx);

        let phrases = _.isArray(_pattern)?_pattern:[_pattern.toString()];

        if (!doc) {
            let description = phrases[0].toString().replace("\n", "");
            if (description.startsWith("I ")) description = description.substring(2).toUpperCase()
            doc = new DialectDocs( uuidv5(phrases[0].toString(),uuidv5.DNS), description );
        }
        if (this.docs.indexOf(doc)<0) this.docs.push( doc );
        doc.phrases = doc.phrases.concat(phrases)
        return doc
    }

    scope(_scope: FeatureScope) {
        _.defaults(_scope, {
        });
    }

    debug(message: string) {
        console.warn(">> %o", message);
    }
}