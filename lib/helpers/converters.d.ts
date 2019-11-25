import { FeatureParser } from "yadda/lib/parsers";
export declare class Converters {
    static js(raw: string, done: Function): void;
    static feature(raw: string, done: Function): FeatureParser.FeatureExport;
    static json_or_yaml(filename: any, done: Function): void;
    static load_feature(filename: any, done: Function): void;
    static load(raw: string, format: string, done: Function): void;
    static json(raw: string, done: Function): void;
    static text(raw: string, done: Function): void;
    static yaml(raw: string, done: Function): void;
    static csv(raw: any, done: Function): void;
}
