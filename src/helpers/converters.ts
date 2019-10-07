import * as _ from "lodash";
import * as assert from "assert";
import * as yaml from "js-yaml";
import { FeatureParser } from "yadda/lib/parsers";
var csv2json = require("csvtojson").Converter;
// var yaml = require("js-yaml");

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

    static json_or_yaml(raw: any, done: Function) {
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
        var converter = new csv2json({});
        converter.fromString(raw, function (err: any, result: any) {
            done(err, result);
        });
    }


}