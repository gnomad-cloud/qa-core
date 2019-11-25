/// <reference types="node" />
import { ScenarioExport, FeatureExport } from "yadda/lib/parsers/FeatureParser";
import { EventEmitter } from "events";
export declare class TestResult extends EventEmitter {
    total: number;
    fails: number;
    status: string;
    watch(result: TestResult): void;
    pass(result?: any): void;
    fail(message?: string): void;
    passed(): boolean;
}
export declare class FeatureResult extends TestResult {
    title: string;
    results: ScenarioResult[];
    constructor(feature: FeatureExport, _results: ResultSet);
    scenario(scenario: ScenarioExport): ScenarioResult;
    fail(msg: string): void;
}
export declare class ScenarioResult extends TestResult {
    protected scenario: ScenarioExport;
    status: string;
    constructor(scenario: ScenarioExport, _feature: FeatureResult);
}
export declare class ResultSet extends TestResult {
    features: FeatureResult[];
    constructor();
    feature(feature: FeatureExport): FeatureResult;
}
export declare class StepError extends Error {
    protected ctx?: any;
    constructor(msg: string, ctx?: any);
}
