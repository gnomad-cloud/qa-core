"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class TestResult extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.total = 0;
        this.fails = 0;
        this.status = "initial";
    }
    watch(result) {
        result.on("pass", (msg) => {
            this.pass(msg);
        });
        result.on("fail", (msg) => {
            this.fail(msg);
        });
    }
    pass(result) {
        this.emit("pass", result);
        this.total++;
        this.status = "success";
    }
    fail(message) {
        console.error(message);
        this.status = message;
        this.total++;
        this.fails++;
        this.emit("fail", { message: message });
    }
    passed() {
        return this.fails == 0;
    }
}
exports.TestResult = TestResult;
class FeatureResult extends TestResult {
    constructor(feature, _results) {
        super();
        this.results = [];
        this.title = feature.title;
    }
    scenario(scenario) {
        let result = new ScenarioResult(scenario, this);
        this.results.push(result);
        this.watch(result);
        return result;
    }
    fail(msg) {
        super.fail(msg);
        this.status = msg;
    }
}
exports.FeatureResult = FeatureResult;
class ScenarioResult extends TestResult {
    constructor(scenario, _feature) {
        super();
        this.scenario = scenario;
        this.status = "initial";
    }
}
exports.ScenarioResult = ScenarioResult;
class ResultSet extends TestResult {
    constructor() {
        super();
        this.features = [];
    }
    feature(feature) {
        let result = new FeatureResult(feature, this);
        this.watch(result);
        this.features.push(result);
        return result;
    }
}
exports.ResultSet = ResultSet;
class StepError extends Error {
    constructor(msg, ctx) {
        super(msg);
        this.ctx = ctx;
    }
}
exports.StepError = StepError;
//# sourceMappingURL=results.js.map