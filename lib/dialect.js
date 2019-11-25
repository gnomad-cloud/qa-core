"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const uuidv5 = require("uuid/v5");
class DialectDocs {
    constructor(id, description, phrases) {
        this.id = id;
        this.description = description;
        this.phrases = phrases;
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
        if (!doc)
            doc = new DialectDocs(uuidv5(_pattern.toString(), uuidv5.DNS), _pattern.toString());
        doc.phrases = _.isArray(_pattern) ? _pattern : [_pattern];
        this.docs.push(doc);
    }
    scope(_scope) {
        // to be extended
    }
    debug(message) {
        console.warn(">> %o", message);
    }
}
exports.Dialect = Dialect;
//# sourceMappingURL=dialect.js.map