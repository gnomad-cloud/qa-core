"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const results_1 = require("../results");
class Checks {
    static ok(passed, message) {
        if (!passed)
            throw new results_1.StepError(message);
    }
}
exports.default = Checks;
//# sourceMappingURL=checks.js.map