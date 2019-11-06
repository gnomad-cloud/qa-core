"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Dialect {
    constructor(engine) {
        this.engine = engine;
        this.engine.addDialect(this);
    }
    define(_pattern, _fn) {
        this.engine.library.define(_pattern, _fn, this.engine.ctx), {};
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