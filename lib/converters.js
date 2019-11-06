"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const js_yaml_1 = require("js-yaml");
const parsers_1 = require("yadda/lib/parsers");
var csv2json = require("csvtojson").Converter;
// var yaml = require("js-yaml");
class Converters {
    js(raw, done) {
        done(null, raw.toString());
    }
    feature(raw, done) {
        assert(raw, "Missing file data");
        var Parser = new parsers_1.FeatureParser();
        var feature = Parser.parse(raw);
        done && done(null, feature);
        return feature;
    }
    json(raw, done) {
        done(null, JSON.parse(raw));
    }
    text(raw, done) {
        done(null, raw.toString());
    }
    yaml(raw, done) {
        done(null, js_yaml_1.default.load(raw));
    }
    csv(raw, done) {
        var converter = new csv2json({});
        converter.fromString(raw, function (err, result) {
            done(err, result);
        });
    }
}
exports.Converters = Converters;
//# sourceMappingURL=converters.js.map