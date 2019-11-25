"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const yaml = require("js-yaml");
const parsers_1 = require("yadda/lib/parsers");
var csv2json = require("csvtojson").Converter;
// var yaml = require("js-yaml");
const fs = require("fs");
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
        var converter = new csv2json({});
        converter.fromString(raw, function (err, result) {
            done(err, result);
        });
    }
}
exports.Converters = Converters;
//# sourceMappingURL=converters.js.map