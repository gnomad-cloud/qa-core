import { FeatureParser } from "yadda/lib/parsers";
export declare class Converters {
    js(raw: string, done: Function): void;
    feature(raw: string, done: Function): FeatureParser.FeatureExport;
    json(raw: string, done: Function): void;
    text(raw: string, done: Function): void;
    yaml(raw: string, done: Function): void;
    csv(raw: any, done: Function): void;
}
