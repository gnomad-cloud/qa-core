import { ScenarioExport } from "../node_modules/@types/yadda/lib/parsers/FeatureParser";

export class ScenarioResult {
    scenario: ScenarioExport;
    _success: boolean = true;
    _status: string = "pending";

    constructor(scenario: ScenarioExport) {
        this.scenario = scenario;
    }

    success() {
        this._success = true;
        this._status = "success"
    }

    failed(msg: string) {
        this._success = false;
        this._status = msg;
    }
}

export class ResultSet {
    results: ScenarioResult[] = [];
    _successes = 0;

    finished(result: ScenarioResult): void {
        this._successes += result._success?1:0;
        this.results.push(result);
    }

    passed() {
        return this.results.length==this._successes;
    }

} 

export class StepError extends Error {

    constructor(msg: string) {
        super(msg);
    }
}