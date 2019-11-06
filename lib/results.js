"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ScenarioResult {
    constructor(scenario) {
        this.success = true;
        this.status = "pending";
        this.scenario = scenario;
    }
    succeeded() {
        this.success = true;
        this.status = "success";
    }
    failed(msg) {
        this.success = false;
        this.status = msg;
    }
}
exports.ScenarioResult = ScenarioResult;
class ResultSet {
    constructor() {
        this.results = [];
        this.successes = 0;
        this.fails = 0;
    }
    finished(result) {
        this.successes += result.success ? 1 : 0;
        this.fails += result.success ? 0 : 1;
        this.results.push(result);
    }
    passed() {
        return this.results.length == this.successes;
    }
}
exports.ResultSet = ResultSet;
class StepError extends Error {
    constructor(msg) {
        super(msg);
    }
}
exports.StepError = StepError;
//# sourceMappingURL=results.js.map