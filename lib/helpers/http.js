"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const files_1 = require("./files");
let assert = require('assert');
let request = require('request'); // https://github.com/request/request
let _ = require('lodash');
let fs = require('fs');
let jsonPath = require('JSONPath');
let DOM = require('xmldom').DOMParser;
let path = require('path');
let files = require("./files");
// let debug = require("debug")("qa:http");
class HTTP {
    constructor() {
    }
    static cookies(name) {
        if (!name)
            return this._cookies;
        return this._cookies[name] = this._cookies[name] ? this._cookies[name] : request.jar();
    }
    static getClientAddress(req) {
        return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection ? req.connection.remoteAddress : null;
    }
    static authorize(request, agent) {
        assert(request, "missing request");
        assert(agent, "missing agent");
        assert(agent.username, "missing agent username");
        assert(agent.password, "missing agent password");
        let base64 = new Buffer(agent.username + ':' + agent.password).toString('base64');
        return request.headers.Authorization = 'Basic ' + base64;
    }
    static bearer(request, token) {
        return request.headers.Authorization = 'Bearer ' + token;
    }
    static client_credentials(agent, done) {
        assert(agent, "missing agent");
        assert(done, "missing callback done()");
        let oauth = agent.oauth || agent || {};
        assert(oauth, "missing agent oauth");
        assert(oauth.url, "missing agent oauth URL");
        request({
            url: oauth.url,
            method: oauth.method || 'POST',
            form: {
                'client_id': oauth.client_id || oauth.username,
                'client_secret': oauth.client_secret || oauth.password,
                'grant_type': oauth.grant_type || 'client_credentials'
            }
        }, function (err, res) {
            if (err) {
                throw err;
            }
            try {
                let json = JSON.parse(res.body);
                done(null, json);
            }
            catch (e) {
                done(e);
            }
        });
    }
    static url(resource, options, target) {
        assert(resource, "missing resource");
        assert(options, "missing options");
        assert(target, "missing target");
        let url = "";
        target = _.extend({ cookie: this.cookies(), protocol: "http", hostname: "localhost", basePath: "/" }, target);
        target.protocol = target.protocol.toLowerCase();
        if (!target.port && target.protocol == "https")
            target.port = 443;
        if (resource.indexOf("://") < 0) {
            let host = target.protocol + "://" + target.hostname + (target.port > 0 ? ":" + target.port : "");
            let basePath = (target.basePath || target.path || "");
            url = options.url || (host + (basePath + resource).replace(/\/+/g, "/"));
        }
        else {
            url = resource;
        }
        return url;
    }
    static proxyURL(oper, options) {
        assert(oper, "Missing HTTP command");
        if (!options || !options.hostname) {
            return;
        }
        // let proxyUser = options.username?encodeURIComponent(options.username):"";
        // let proxyPassword = options.password?encodeURIComponent(options.password):"";
        // let proxyCredentials = proxyUser + (proxyPassword?":"+proxyPassword:"");
        let proxyCredentials = options.username + ":" + options.password;
        //(proxyCredentials?proxyCredentials+"@":"") +
        let proxyUrl = options.protocol + "://" + options.hostname + (options.port ? ":" + options.port : "");
        oper.proxy = proxyUrl;
        options.url = options.proxyUrl;
        let token = 'Basic ' + new Buffer(proxyCredentials).toString('base64');
        oper.headers['Proxy-Authorization'] = token;
    }
    static operation(method, resource, options, target) {
        assert(method, "missing method");
        assert(resource, "missing resource");
        assert(options, "missing options");
        let oper = _.extend({
            uri: this.url(resource, options, target),
            method: method,
            jar: options.cookies || target.cookies || false,
            headers: {},
            strictSSL: true,
            followRedirect: false,
            qs: {}
        }, options);
        this.proxyURL(oper, _.extend({}, target.proxy, options.proxy)); // user options over-ride feature options as a security "feature"
        return oper;
    }
    static handleResponse(options, done) {
        options.stopwatch.start = _.now();
        // debug("handle-response: %o", options);
        return function (error, response) {
            // debug("handled-response: %o --> %o", error, response);
            if (error || !response) {
                // debug("RESP error: %o", error);
                return done(new Error(error.message));
            }
            // debug("RESP: %o --> %o", error, response?response.body:"NONE");
            options.stopwatch.stop = _.now();
            options.stopwatch.duration = options.stopwatch.stop - options.stopwatch.start;
            _.extend(options.response, response);
            if (error || options.response.statusCode == 500) {
                options.error = error;
                done(error, response);
                return;
            }
            //, (response.body || "No Response Body")
            //debug("BODY: %j", self.response);
            if (options.request.json) {
                //            self.response.body = JSON.parse(self.response.body);
            }
            // debug("http response: %o --> %o", vars, response?response.body:"NONE");
            done(false, response);
        };
    }
    static download(self, file, done) {
        assert(self, "missing self");
        assert(file, "missing file");
        assert(done, "missing done() callback");
        return function (error, response) {
            if (error) {
                self.error = error;
                done(error, response);
                return;
            }
            let payload = response.body;
            files_1.Files.save(file, JSON.stringify(payload));
            done(false, response);
        };
    }
    static isRawPEM(pem) {
        return pem.indexOf("-----BEGIN") == 0;
    }
    static certificate(request, cert, options, rootDir) {
        assert(cert.key, "Missing certificate key");
        assert(cert.cert, "Missing certificate");
        let certFile = path.join(rootDir, cert.cert);
        let certKeyFile = path.join(rootDir, cert.key);
        let certConfig = {
            agentOptions: {
                key: "",
                cert: "",
                ca: "",
                passphrase: ""
            },
            requestCert: true,
            strictSSL: false,
            rejectUnauthorized: false
        };
        if (this.isRawPEM(cert.key)) {
            certConfig.agentOptions.key = cert.key;
        }
        else {
            assert(files.exists(certKeyFile), "No certificate key: " + certKeyFile);
            certConfig.agentOptions.key = fs.readFileSync(certKeyFile, "UTF-8");
            // debug("Loaded certificate key: " + certKeyFile);
        }
        if (this.isRawPEM(cert.cert)) {
            certConfig.agentOptions.cert = cert.cert;
            // debug("Loaded certificate: " + certFile);
        }
        else {
            assert(files.exists(certFile), "No certificate: " + certFile);
            certConfig.agentOptions.cert = fs.readFileSync(certFile, "UTF-8");
            // debug("Loaded certificate: " + certFile);
        }
        if (cert.ca) {
            let caFile = path.join(rootDir, cert.ca);
            certConfig.agentOptions.ca = this.isRawPEM(cert.ca) ? cert.ca : fs.readFileSync(caFile, "UTF-8");
        }
        if (cert.passphrase) {
            certConfig.agentOptions.passphrase = cert.passphrase;
        }
        _.extend(request, certConfig, options);
        return certConfig;
    }
    static detectContentType(payload) {
        if (_.isObject(payload))
            return "json";
        try {
            JSON.parse(payload);
            return 'json';
        }
        catch (e_json) {
            try {
                //            new DOM().parseFromString(payload);
                return 'xml';
            }
            catch (e_xml) {
                return "string";
            }
        }
    }
    ;
    static parse(payload) {
        try {
            return JSON.parse(payload);
        }
        catch (e) {
            return new DOM().parseFromString(payload);
        }
    }
    ;
    static header(request, name, value) {
        request.headers[name] = value;
        return request.headers;
    }
    static findInPath(body, path) {
        let json = _.isString(body) ? JSON.parse(body) : body;
        let found = jsonPath({ resultType: 'all' }, path, json);
        return (found && found.length > 0) ? found[0].value : undefined;
    }
    ;
    /**
     * @return {boolean}
     */
    static IsStatusCodeXX(statusXX, statusCode) {
        if (statusXX.indexOf("xx") > 0) {
            return statusCode >= (statusXX[0] * 100) && statusCode <= 99 + (statusXX[0] * 100);
        }
        else
            return statusCode == statusXX;
    }
}
HTTP._cookies = {};
exports.HTTP = HTTP;
//# sourceMappingURL=http.js.map