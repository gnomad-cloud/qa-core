import { ScenarioExport, FeatureExport } from "yadda/lib/parsers/FeatureParser";
import { EventEmitter } from "events";

export class TestResult extends EventEmitter {
    total = 0;
    fails = 0;
    status: string = "initial";

    watch(result: TestResult) {
        result.on("pass", (msg?: any) => {
            this.pass(msg);
        });
        result.on("fail", (msg?: any) => {
            this.fail(msg);
        });
    }

    pass(result?: any): void {
        this.emit("pass", result);
        this.total++;
        this.status = "success";
    }

    fail(message?: string): void {
        console.error(message);
        this.status = message;
        this.total++;
        this.fails++;
        this.emit("fail", { message: message } );
    }
    
    passed(): boolean {
        return this.fails == 0;
    }
}

export class FeatureResult extends TestResult {
    title: string;
    results: ScenarioResult[] = [];

    constructor(feature: FeatureExport, _results: ResultSet) {
        super();
        this.title = feature.title;
    }

    scenario(scenario: ScenarioExport): ScenarioResult {
        let result = new ScenarioResult(scenario, this);
        this.results.push(result);
        this.watch(result);
        return result;
    }


    fail(msg: string) {
        super.fail(msg);
        this.status = msg;
    }
}

export class ScenarioResult  extends TestResult {
    status: string = "initial";

    constructor(protected scenario: ScenarioExport, _feature: FeatureResult) {
        super();
    }
}

export class ResultSet extends TestResult {
    features: FeatureResult[] = [];

    constructor() {
        super();
    }

    feature(feature: FeatureExport):FeatureResult {
        let result = new FeatureResult(feature, this);
        this.watch(result);
        this.features.push( result );
        return result;
    }

} 

export class StepError extends Error {

    constructor(msg: string, protected ctx?: any) {
        super(msg);
    }
}