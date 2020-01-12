import { EventEmitter } from "events";

let assert = require("assert");
let jsonPath = require('JSONPath');
let _ = require('lodash');
// let debug = require("debug")("qa-engine:helps:vars");
let hbs = require('handlebars');
let sha256 = require('js-sha256');

export class Vars {

    static $(source: string, ctx: any) {
        assert(source, "Missing source template");
        assert(ctx, "Missing context");
        assert(_.isString(source), "Template not string")
        assert(_.isObject(ctx), "Invalid context object");

        let template = hbs.compile(source);
        return template(ctx);
    }

    static scope(scope: any) {
        return _.extend({ vars: {} }, scope, new EventEmitter() );
    }

    static uuid(uid: string) {
        return sha256(uid);
    }

    static capitalize(text: string) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    static sanitize(txt: string, subst: string) {
        if (!txt) return "";
        subst = subst || "";
        return txt.replace(/[^A-Z0-9]/ig, subst);
    }

    static findNamed(scope: any, name: string) {
        name = name.toString().trim();
        let found = this.find(scope, name);
        if (found) return found;
        return this.findInPath(scope, name);
        // return this.get(scope, name);
    }

    static findInPath (body: any, path: string) {
        let json = _.isString(body)?JSON.parse(body):body;
        let found = jsonPath({resultType: 'all'}, path, json);
        return (found.length > 0) ? found[0].value : undefined;
    }

    static findAllInPath (body: any, path: string): {}[] {
        let json = _.isString(body)?JSON.parse(body):body;
        let found = jsonPath({resultType: 'all'}, path, json);
        let all: any[] = [];
        _.each(found, function(item: any) {
            all.push(item.value);
        })
        return all;
    }

    static find(scope: any, name: string) {
        assert(scope, "missing scope");
        assert(_.isObject(scope), "Invalid scope object");
        assert(name, "missing let name");

        return this.get(scope,name);
    }

    static synonym(model: any, synoyms: any) {
        assert(model, "Missing model");
        if (!synoyms) return false;

        for(let s in synoyms) {
            let v = synoyms[s];
            if (model[v]) {
                return true;
            }
        }
        return false;
    }

    static leaking(key: string) {
        Object.defineProperty(global, key, {
            set (_value: any) {
                throw new Error("Global Leak: "+key);
            }
        });
    }

    static split(s: string) {
        if (s.indexOf(".")<0) return [s];
        s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        s = s.replace(/^\./, '');           // strip a leading dot
        return s.split('.');
    }

    static get(o: any, s: string) {
        let a = this.split(s);
        if (!a.length) return false;

        for (let i = 0, n = a.length; i < n; ++i) {
            let k = a[i];
            if (o && o[k]!=undefined) {
                o = o[k];
            } else {
                return;
            }
        }
        return o;
    }

    static set(o: any, s: string, v: any) {
        let k, a = this.split(s);
        if (!a.length) return false;
        assert(o, "Can't set an empty object");

        for (let i = 0, n = a.length-1; i < n; ++i) {
            k = a[i];
            o = o[k] = o[k] || {};
        }
        k = a[a.length-1]
//	assert(o[k], "Missing key: "+k+" in "+JSON.stringify(o));
        o[k] = v;
        return o[k];
    }

    static env(prefix: string, env: any, config: any) {
        // iterate through 'env' adding prefixed properties to 'config'
        env = env || process.env || {};
        for(let k in env) {
            let v = env[k];if (k.indexOf(prefix)===0) {
                let key = k.toLowerCase().replace(/_/g, ".").substring(prefix.length);
                assert(v = this.set(config, key, v), "ENV path not set");
            }
        }
        return config;
    }

    static clean(mess: any) {
        let res: any = {};
        if (!mess) return res;

        Object.getOwnPropertyNames(mess).forEach(function(key) {
            res[key] = mess[key];
        }, mess);

        return res;
    }

    static suffix(text: string, char: string) {
        let ix = text.lastIndexOf(char);
        if (ix<1) return null;
        return text.substring(ix+1);
    }
};
