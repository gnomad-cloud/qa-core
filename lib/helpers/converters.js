"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const yaml = require("js-yaml");
const parsers_1 = require("yadda/lib/parsers");
var csv2json = require("csvtojson").Converter;
const fs = require("fs");
const results_1 = require("../results");
class Converters {
    static js(raw, done) {
        done(null, raw.toString());
    }
    static feature(raw, done) {
        assert(raw, "Missing file data");
        var Parser = new parsers_1.FeatureParser();
        var feature = Parser.parse(raw);
        done && done(null, feature);
        return feature;
    }
    static json_or_yaml(filename, done) {
        let raw = fs.readFileSync(filename).toString();
        try {
            return this.json(raw, done);
        }
        catch (_not_json) {
            try {
                return this.yaml(raw, done);
            }
            catch (_not_yaml) {
                done(_not_yaml, null);
            }
        }
    }
    static load(raw, format, done) {
        switch (format.toLowerCase()) {
            case "json":
                return this.json(raw, done);
            case "csv":
                return this.json(raw, done);
            case "text":
                return this.text(raw, done);
            case "yaml":
                return this.yaml(raw, done);
        }
        throw new results_1.StepError("Unknown file format: " + format);
    }
    static json(raw, done) {
        done(null, JSON.parse(raw));
    }
    static text(raw, done) {
        done(null, raw.toString());
    }
    static yaml(raw, done) {
        done(null, yaml.safeLoad(raw));
    }
    static csv(raw, done) {
        var csv = new csv2json({});
        csv.fromString(raw, function (err, result) {
            done(err, result);
        });
    }
}
exports.Converters = Converters;
//# sourceMappingURL=converters.js.map