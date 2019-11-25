import * as _ from "lodash";
import * as assert from "assert";
import * as yaml from "js-yaml";
import { FeatureParser } from "yadda/lib/parsers";
var csv2json = require("csvtojson").Converter;
import * as fs from "fs";
import { StepError } from "../results";
import { Vars } from "./vars";
import { FeatureExport } from "yadda/lib/parsers/FeatureParser";

export class Converters {

    static js(raw: string, done: Function) {
        done(null, raw.toString());
    }

    static feature(raw: string, done: Function) {
        assert(raw, "Missing file data");
        var Parser = new FeatureParser();
        var feature = Parser.parse(raw);

        done && done(null, feature);
        return feature;
    }

    static json_or_yaml(filename: any, done: Function) {
        let raw: string = fs.readFileSync(filename).toString();
        try {
            return this.json(raw, done);
        } catch(_not_json) {
            try {
                return this.yaml(raw, done);
            } catch(_not_yaml) {
                done(_not_yaml, null);
            }
        }
    }

    static load_feature(filename: any, done: Function) {
        let type = Vars.suffix(filename, ".");
        if (!type) done( "invalid file", null);
        if (type == "feature") {
            let fp = new FeatureParser();
            let raw: string = fs.readFileSync(filename).toString();
            fp.parse(raw, (feature: FeatureExport) => {
                done(null, feature);
            });
        } else this.json_or_yaml(filename, done);
    }

    public static load(raw: string, format: string, done: Function) {
        switch(format.toLowerCase()) {
            case "json":
                return this.json(raw, done);
            case "csv":
                return this.json(raw, done);
            case "text":
                return this.text(raw, done);
            case "yaml":
                return this.yaml(raw, done);
        }
        throw new StepError("Unknown file format: "+format);
    }

    static json(raw: string, done: Function) {
        done(null, JSON.parse(raw));
    }

    static text(raw: string, done: Function) {
        done(null, raw.toString());
    }

    static yaml(raw: string, done: Function) {
        done(null, yaml.safeLoad(raw));
    }

    static csv(raw: any, done: Function) {
        var csv = new csv2json({});
        csv.fromString(raw, function (err: any, result: any) {
            done(err, result);
        });
    }


}