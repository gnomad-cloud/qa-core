"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const uuidv5 = require("uuid/v5");
class DialectDocs {
    constructor(_tag, _description, _phrases) {
        this.description = "unknown";
        this.tag = _tag || "unknown";
        this.description = _description || "unknown";
        this.phrases = _phrases || [];
    }
}
exports.DialectDocs = DialectDocs;
class Dialect {
    constructor(engine) {
        this.engine = engine;
        this.docs = [];
        this.engine.addDialect(this);
    }
    define(_pattern, _fn, doc) {
        this.engine.library.define(_pattern, _fn, this.engine.ctx);
        let phrases = _.isArray(_pattern) ? _pattern : [_pattern];
        if (!doc) {
            let description = phrases[0].toString().replace("\n", "");
            if (description.startsWith("I "))
                description = description.substring(2).toUpperCase();
            doc = new DialectDocs(uuidv5(phrases[0].toString(), uuidv5.DNS), description);
        }
        if (this.docs.indexOf(doc) < 0)
            this.docs.push(doc);
        doc.phrases = doc.phrases.concat(phrases);
        return doc;
    }
    scope(_scope) {
        _.defaults(_scope, {});
    }
    debug(message) {
        console.warn(">> %o", message);
    }
}
exports.Dialect = Dialect;
//# sourceMappingURL=dialect.js.map