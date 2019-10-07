import { ScenarioExport } from "../node_modules/@types/yadda/lib/parsers/FeatureParser";

export class ScenarioResult {
    scenario: ScenarioExport;
    success: boolean = true;
    status: string = "pending";

    constructor(scenario: ScenarioExport) {
        this.scenario = scenario;
    }

    succeeded() {
        this.success = true;
        this.status = "success"
    }

    failed(msg: string) {
        this.success = false;
        this.status = msg;
    }
}

export class ResultSet {
    results: ScenarioResult[] = [];
    successes = 0;
    fails = 0;

    finished(result: ScenarioResult): void {
        this.successes += result.success?1:0;
        this.fails += result.success?0:1;
        this.results.push(result);
    }

    passed() {
        return this.results.length==this.successes;
    }

} 

export class StepError extends Error {

    constructor(msg: string) {
        super(msg);
    }
}