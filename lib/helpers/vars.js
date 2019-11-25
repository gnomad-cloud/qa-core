"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
let assert = require("assert");
let jsonPath = require('JSONPath');
let _ = require('lodash');
// let debug = require("debug")("meta4qa:helps:vars");
let hbs = require('handlebars');
let sha256 = require('js-sha256');
class Vars {
    static $(source, ctx) {
        assert(source, "Missing source template");
        assert(ctx, "Missing context");
        assert(_.isString(source), "Template not string");
        assert(_.isObject(ctx), "Invalid context object");
        let template = hbs.compile(source);
        return template(ctx);
    }
    static scope(scope) {
        return _.extend({ vars: {} }, scope, new events_1.EventEmitter());
    }
    static uuid(uid) {
        return sha256(uid);
    }
    static capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    static sanitize(txt, subst) {
        if (!txt)
            return "";
        subst = subst || "";
        return txt.replace(/[^A-Z0-9]/ig, subst);
    }
    static findNamed(scope, name) {
        name = name.toString().trim();
        let found = this.find(scope, name);
        if (found)
            return found;
        return this.findInPath(scope, name);
        // return this.get(scope, name);
    }
    static findInPath(body, path) {
        let json = _.isString(body) ? JSON.parse(body) : body;
        let found = jsonPath({ resultType: 'all' }, path, json);
        return (found.length > 0) ? found[0].value : undefined;
    }
    static findAllInPath(body, path) {
        let json = _.isString(body) ? JSON.parse(body) : body;
        let found = jsonPath({ resultType: 'all' }, path, json);
        let all = [];
        _.each(found, function (item) {
            all.push(item.value);
        });
        return all;
    }
    static find(scope, name) {
        assert(scope, "missing scope");
        assert(_.isObject(scope), "Invalid scope object");
        assert(name, "missing let name");
        return this.get(scope, name);
    }
    static synonym(model, synoyms) {
        assert(model, "Missing model");
        if (!synoyms)
            return false;
        for (let s in synoyms) {
            let v = synoyms[s];
            if (model[v]) {
                return true;
            }
        }
        return false;
    }
    static leaking(key) {
        Object.defineProperty(global, key, {
            set(_value) {
                throw new Error("Global Leak: " + key);
            }
        });
    }
    static split(s) {
        if (s.indexOf(".") < 0)
            return [s];
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, ''); // strip a leading dot
        return s.split('.');
    }
    static get(o, s) {
        let a = this.split(s);
        if (!a.length)
            return false;
        for (let i = 0, n = a.length; i < n; ++i) {
            let k = a[i];
            if (o && o[k] != undefined) {
                o = o[k];
            }
            else {
                return;
            }
        }
        return o;
    }
    static set(o, s, v) {
        let k, a = this.split(s);
        if (!a.length)
            return false;
        assert(o, "Can't set an empty object");
        for (let i = 0, n = a.length - 1; i < n; ++i) {
            k = a[i];
            o = o[k] = o[k] || {};
        }
        k = a[a.length - 1];
        //	assert(o[k], "Missing key: "+k+" in "+JSON.stringify(o));
        o[k] = v;
        return o[k];
    }
    static env(prefix, env, config) {
        // iterate through 'env' adding prefixed properties to 'config'
        env = env || process.env || {};
        for (let k in env) {
            let v = env[k];
            if (k.indexOf(prefix) === 0) {
                let key = k.toLowerCase().replace(/_/g, ".").substring(prefix.length);
                assert(v = this.set(config, key, v), "ENV path not set");
            }
        }
        return config;
    }
    static clean(mess) {
        let res = {};
        if (!mess)
            return res;
        Object.getOwnPropertyNames(mess).forEach(function (key) {
            res[key] = mess[key];
        }, mess);
        return res;
    }
    static suffix(text, char) {
        let ix = text.lastIndexOf(char);
        if (ix < 1)
            return null;
        return text.substring(ix + 1);
    }
}
exports.Vars = Vars;
;
//# sourceMappingURL=vars.js.map