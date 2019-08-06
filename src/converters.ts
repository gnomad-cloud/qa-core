import _ from "lodash";
import assert from "assert";
import yaml from "js-yaml";
import { FeatureParser } from "yadda/lib/parsers";
var csv2json = require("csvtojson").Converter;
// var yaml = require("js-yaml");

export class Converters {

    js(raw: string, done: Function) {
        done(null, raw.toString());
    }

    feature(raw: string, done: Function) {
        assert(raw, "Missing file data");
        var Parser = new FeatureParser();
        var feature = Parser.parse(raw);

        done && done(null, feature);
        return feature;
    }

    json(raw: string, done: Function) {
        done(null, JSON.parse(raw));
    }

    text(raw: string, done: Function) {

        done(null, raw.toString());

    }

    yaml(raw: string, done: Function) {
        done(null, yaml.load(raw));
    }

    csv(raw: any, done: Function) {
        var converter = new csv2json({});
        converter.fromString(raw, function (err: any, result: any) {
            done(err, result);
        });
    }


}