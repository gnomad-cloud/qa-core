import { ScenarioExport } from "yadda/lib/parsers/FeatureParser";
export declare class ScenarioResult {
    scenario: ScenarioExport;
    success: boolean;
    status: string;
    constructor(scenario: ScenarioExport);
    succeeded(): void;
    failed(msg: string): void;
}
export declare class ResultSet {
    results: ScenarioResult[];
    successes: number;
    fails: number;
    finished(result: ScenarioResult): void;
    passed(): boolean;
}
export declare class StepError extends Error {
    constructor(msg: string);
}
