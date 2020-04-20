"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialect_1 = require("../Dialect");
const webapi_1 = require("../helpers/webapi");
const http_1 = require("../helpers/http");
const vars_1 = require("../helpers/vars");
const files_1 = require("../helpers/files");
const speakeasy = require("speakeasy");
const _ = require("lodash");
const assert = require("assert");
const path = require("path");
const fs = require("fs");
const checks_1 = require("../helpers/checks");
const request = require("request");
let debug = require("debug")("qa:webapi");
/**
 * Web API
 * Configures the Yadda parser with phrases that support operations on HTTP APIs
 *
 * @module Web API Dialect
 * @class Web API
 *
 */
class WebAPIDialect extends Dialect_1.Dialect {
    constructor(engine) {
        super(engine);
        this.engine = engine;
        this.install();
    }
    install() {
        let _doc = null;
        /**
         * Add a client certificate to an HTTP request.
         * The certificate itself is defined in the config.json file.
         *
         *      I use a $CERT client certificate
         *
         *      I use an $CERT client certificate
         *
         * @example
         *
         *      I use a valid client certificate
         *
         * @method Use Client Certificate
         * @param {String} cert - certificate name
         */
        _doc = this.define([
            "I use a $CERT client certificate",
            "I use an $CERT client certificate"
        ], function (certName, done) {
            let cert = this.certificates[certName];
            assert(cert, "Missing a '" + certName + "' certificate");
            let cert_dir = this.engine.paths.certificates || this.engine.paths.files;
            assert(cert_dir, "Missing cert directory: " + cert_dir);
            assert(files_1.Files.exists(cert_dir), "client-certificate not found: " + cert_dir);
            http_1.HTTP.certificate(this.request, cert, {}, cert_dir);
            this.request.requestCert = true;
            debug("using client-certificate from %s", cert_dir);
            done();
        }, new Dialect_1.DialectDocs("webapi.certs", "TLS X.509 Certificates"));
        _doc = this.define(["I enable strict SSL", "I enable strict TLS"], function (done) {
            this.request.strictSSL = true;
            done();
        }, _doc);
        _doc = this.define(["I disable strict SSL", "I disable strict TLS"], function (done) {
            this.request.strictSSL = false;
            done();
        }, _doc);
        _doc = this.define(["I require client certificates"], function (done) {
            this.request.requestCert = true;
            done();
        });
        _doc = this.define(["I don't require client certificates"], function (done) {
            this.request.requestCert = false;
            done();
        });
        /**
         * Set an HTTP Header to a value
         *
         *      I set $header header to $value
         *
         *      I set header $header = $value
         *
         * @example
         *
         *      I set header Accept to application/json
         *
         * @method Set HTTP Request Header
         * @param {String} name - header name
         * @param {String} value - header value
         */
        _doc = this.define(["I set $header header to $value", "I set header $header = $value"], function (name, value, done) {
            // debug("HTTP header %s => %s", name, value);
            this.request.headers[name] = value;
            debug("set header %o to %o", name, value);
            done();
        }, new Dialect_1.DialectDocs("webapi.headers", "HTTP headers"));
        /**
         * Set an HTTP Header from a variable
         *
         *      I set $header header from $varname
         *
         * @example
         *
         *      I set test = 123
         *      I set header x-my-header from test
         *
         * @method Set HTTP Request Header
         * @param {String} name - header name
         * @param {String} varname - a scoped variable name
         */
        _doc = this.define([
            "I set $header header from $varname",
            "I set header $header from $varname"
        ], function (name, varname, done) {
            let value = vars_1.Vars.find(this, varname);
            // debug("HTTP header %s => (%s) %s", name, varname, value);
            this.request.headers[name] = value;
            debug("set header %o to %o from %s", name, value, varname);
            done();
        }, _doc);
        /**
         * Add an HTTP Query Parameter to the Request
         *
         *      I set parameter $key to $value
         *
         *      I set $key parameter to $value
         *
         *      I set $key param to $value
         *
         *      I set param $key to $value
         *
         * @example
         *
         *      I set parameter api_key to ABCD1234
         *
         * @method Set HTTP Request Parameter
         * @param {String} name - query parameter name
         * @param {String} value - query parameter value
         */
        _doc = this.define([
            "I set parameter $key to $value",
            "I set $key parameter to $value",
            "I set $key param to $value",
            "I set param $key to $value"
        ], function (key, value, done) {
            this.request.qs[key] = value;
            debug("set query string %o to %o", name, value);
            done();
        }, new Dialect_1.DialectDocs("webapi.params", "HTTP query parameter"));
        _doc = this.define([
            "I set parameter $key from $varname",
            "I set $key parameter from $varname",
            "I set $key param from $varname",
            "I set param $key from $varname"
        ], function (key, varname, done) {
            let value = vars_1.Vars.get(this, varname);
            this.request.qs[key] = value;
            debug("set query string %o to %o from %o", name, value, varname);
            done();
        }, _doc);
        // this.define(/^I set headers to$/, function (this: any, args: any[], done: Function) {
        // 	done();
        // });
        _doc = this.define(["I use basic authentication", "I login", "I authenticate"], function (done) {
            assert(this.agent, "Missing user agent - refer to config JSON");
            http_1.HTTP.authorize(this.request, this.agent);
            // debug("authorised: %s -> %s", this.agent.username, this.request.headers.Authorization);
            done();
        }, new Dialect_1.DialectDocs("webapi.auth", "HTTP Basic Authentication"));
        _doc = this.define(["I use basic authentication as $agent", "I login as $agent"], function (agent, done) {
            assert(this.agents, "Missing user agents - refer to config JSON");
            let credentials = this.agents[agent];
            assert(credentials, "Missing user agent: " + agent);
            http_1.HTTP.authorize(this.request, credentials);
            done();
        }, _doc);
        /**
         * Use OAUTH flow to authenticate using default agent
         *
         *      I use OAuth2
         *      I use oauth
         *
         * @example
         *
         *      I use oauth
         *
         * @method Use Client Credentials to authenticate as default agent
         *
         */
        _doc = this.define([
            "I use OAuth2",
            "I use oauth",
            "I use OAuth2 credentials",
            "I use oauth credentials"
        ], function (done) {
            assert(this.agent, "Missing default agent");
            let oauth = _.isObject(this.agent.oauth)
                ? this.agent.oauth
                : this.agent;
            let scope = this;
            if (oauth.access_token) {
                http_1.HTTP.bearer(this.request, oauth.access_token);
                done();
            }
            else {
                http_1.HTTP.client_credentials(this.agent, function (err, json) {
                    if (err) {
                        throw new Error(err);
                    }
                    vars_1.Vars.set(scope.agent, "access_token", json.access_token);
                    http_1.HTTP.bearer(scope.request, scope.agent.access_token);
                    done(err, json);
                });
            }
        }, new Dialect_1.DialectDocs("webapi.auth", "HTTP OAuth2 Authentication"));
        /**
         * Use OAUTH flow to authenticate using a named agent
         *
         *      I use OAuth2 credentials as $agent
         *
         *      I use oauth credentials as $agent
         *
         *      I use client-credentials as $agent
         *
         * @example
         *
         *      I use client-credentials as default
         *
         * @method Use Client Credentials to authenticate
         * @param {String} agent - named agent
         */
        _doc = this.define([
            "I use OAuth2 credentials as $agent",
            "I use oauth credentials as $agent",
            "I use client-credentials as $agent"
        ], function (agent, done) {
            let scope = this;
            http_1.HTTP.client_credentials(this.agents[agent], function (err, json) {
                vars_1.Vars.set(scope.agent, "access_token", json);
                http_1.HTTP.bearer(scope.request, scope.agent.access_token);
                done(err, json);
            });
        }, _doc);
        _doc = this.define([
            "I set oauth token from $var",
            "I set oauth access_token from $var"
        ], function (varname, done) {
            let token = vars_1.Vars.find(this, varname);
            assert(token != undefined, "Variable for token " + varname + " is undefined");
            assert(token, "Missing token");
            this.agent.oauth = this.agent.oauth || {};
            vars_1.Vars.set(this.agent.oauth, "access_token", token);
            done();
        }, _doc);
        /**
         * Set a named HTTP cookie to value
         *
         *     I set cookie $cookie to $value
         *
         *     I set cookie $cookie = $value
         *
         * @example
         *
         *     I set cookie my-tag = abc-1234
         *
         * @method Set named cookies
         * @param {String} name - cookie name
         * @param {String} value - cookie value
         */
        _doc = this.define(["I set cookie $cookie to $value", "I set cookie $cookie = $value"], function (name, value, done) {
            this.request.jar = this.cookies;
            this.request.cookie(name + "=" + value);
            done();
        }, new Dialect_1.DialectDocs("webapi.cookies", "HTTP cookies"));
        _doc = this.define("cookie $cookie should exist", function (_cookie, done) {
            this.request.jar = http_1.HTTP.cookies();
            done();
        }, _doc);
        /**
         * Set a named HTTP timeout to a time in milliseconds
         *
         *     I set request timeout to $time
         *
         * @example
         *
         *     define I set request timeout to 3000
         *
         * @method Set HTTP timeout
         * @param {String} timeout - duration in milliseconds
         */
        _doc = this.define(["I set request timeout to $time"], function (timeInMillis, done) {
            this.request.timeout = timeInMillis ? timeInMillis : 10000;
            done();
        }, new Dialect_1.DialectDocs("webapi.options", "HTTP options"));
        /**
         * Enable HTTP keep-alive
         *
         *     I enable keep-alive
         *
         * @example
         *
         *     define I enable keep-alive
         *
         * @method Enable HTTP keep alive
         */
        _doc = this.define(["I enable keep alive"], function (done) {
            this.request.forever = true;
            done();
        }, _doc);
        /**
         * Disable HTTP keep-alive
         *
         *     I disable keep-alive
         *
         * @example
         *
         *     define I disable keep-alive
         *
         * @method Disable HTTP keep alive
         */
        _doc = this.define(["I disable keep alive"], function (done) {
            this.request.forever = false;
            done();
        }, _doc);
        /**
         * Enable HTTP GZIP compression
         *
         *     I enable gzip
         *
         * @example
         *
         *     define I enable gzip
         *
         * @method Enable HTTP GZIP compression
         */
        _doc = this.define(["I enable gzip"], function (done) {
            this.request.gzip = true;
            done();
        }, _doc);
        /**
         * Disable HTTP GZIP compression
         *
         *     I disable gzip
         *
         * @example
         *
         *     define I disable gzip
         *
         * @method Disable HTTP GZIP compression
         */
        _doc = this.define(["I disable gzip"], function (done) {
            this.request.gzip = false;
            done();
        }, _doc);
        _doc = this.define(["I set encoding to $encoding"], function (encoding, done) {
            this.request.encoding = encoding ? encoding : "utf8";
            done();
        }, _doc);
        _doc = this.define(["I enable redirects"], function (done) {
            this.request.followRedirect = true;
            done();
        }, _doc);
        _doc = this.define(["I disable redirects"], function (done) {
            this.request.followRedirect = false;
            done();
        }, _doc);
        _doc = this.define(["I request JSON"], function (done) {
            this.request.headers["Content-Type"] =
                this.request.headers["Content-Type"] || "application/json";
            this.request.json = true;
            done();
        }, _doc);
        _doc = this.define(["I upload $file"], function (file, done) {
            let filename = files_1.Files.root(this.paths, "files", file);
            http_1.HTTP.header(this.request, "Content-Type", webapi_1.WebAPI.EXT_TO_MIME.json);
            webapi_1.WebAPI.uploadFormFile(this.request, filename, done);
        }, new Dialect_1.DialectDocs("webapi.files", "File upload/downlload"));
        _doc = this.define([
            "I send $file as body",
            "I upload $file as body",
            "I send $file as attachment",
            "I upload $file as attachment"
        ], function (file, done) {
            debug("upload %o via %o", file, this.request);
            webapi_1.WebAPI.uploadFile(this.request, file, done);
        }, _doc);
        /**
         * Set HTTP response to payload. Objects are sent as JSON, everything else as BODY text.
         *
         *     I set body to $payload
         *
         * @example
         *
         *     I set body to hello world
         *
         * @method Set HTTP response
         * @param {String} payload - JSON or text payload
         */
        _doc = this.define(["I set body to $payload"], function (value, done) {
            if (_.isString(value)) {
                this.request.body = value;
                // debug("set HTTP body: %j ", value);
            }
            else {
                this.request.json = value;
                // debug("set HTTP json body: %j ", value);
            }
            done();
        }, new Dialect_1.DialectDocs("webapi.files", "Sending data, forms and files"));
        /**
         * Set HTTP response to payload. Objects are sent as JSON, everything else as BODY text.
         *
         *     I set body from $varname
         *
         * @example
         *
         *     I set body from my_var
         *
         * @method Set HTTP response
         * @param {String} varname - name of variable containing body
         */
        _doc = this.define(["I set body from $varname"], function (name, done) {
            let value = vars_1.Vars.find(this, name);
            assert(value != undefined, "Variable " + name + " is undefined");
            if (_.isString(value)) {
                this.request.body = value;
            }
            else {
                this.request.json = value;
            }
            done();
        }, _doc);
        /**
         * Set HTTP response to payload. Objects are sent as JSON, everything else as BODY text.
         *
         *     I set body from $varname
         *
         * @example
         *
         *     I set body from my_var
         *
         * @method Set HTTP response
         * @param {String} varname - name of variable containing body
         */
        _doc = this.define(["I set text body from $varname"], function (name, done) {
            let value = vars_1.Vars.find(this, name);
            assert(value != undefined, "Variable " + name + " is undefined");
            this.request.body = JSON.stringify(value);
            // debug("set HTTP text body: %j ", value);
            done();
        }, _doc);
        _doc = this.define(["I set form $name to $value"], function (name, value, done) {
            webapi_1.WebAPI.setFormField(this, name, value);
            done();
        }, _doc);
        /**
         * Set HTTP response to CSV payload.
         *
         *     I set body to CSV:
         *     ------------
         *     $CSV
         *     ------------
         *
         *     I send CSV:
         *     ------------
         *     $CSV
         *     ------------
         *
         * @example
         *
         *     I set body to CSV:
         *     ------------
         *     what, who
         *     hello, world
         *     ------------
         *
         * @method Set HTTP response
         * @param {String} payload - JSON or text payload
         */
        _doc = this.define(["I set body to CSV:\n$CSV", "I send CSV:\n$CSV"], function (value, done) {
            this.request.json = value;
            done();
        }, _doc);
        /**
         * Set HTTP response to JSON payload.
         *
         *     I set body to JSON:
         *     ------------
         *     $JSON
         *     ------------
         *
         *     I send JSON:
         *     ------------
         *     $JSON
         *     ------------
         *
         * @example
         *
         *     I set body to JSON:
         *     ------------
         *     { "what": "hello", "who": "world" }
         *     ------------
         *
         * @method Set HTTP response
         * @param {String} payload - JSON or text payload
         */
        _doc = this.define(["I set body to JSON:\n$JSON", "I send JSON:\n$JSON"], function (value, done) {
            assert(this.request, "Missing HTTP request");
            this.request.json = value;
            done();
        }, _doc);
        /**
         * Set HTTP response to JSON payload.
         *
         *     I set body to JSON:
         *     ------------
         *     $JSON
         *     ------------
         *
         *     I send JSON:
         *     ------------
         *     $JSON
         *     ------------
         *
         * @example
         *
         *     I set body to JSON:
         *     ------------
         *     { "what": "hello", "who": "world" }
         *     ------------
         *
         * @method Set HTTP response
         * @param {String} payload - JSON or text payload
         */
        _doc = this.define(["I set body to XML:\n$XML", "I send XML:\n$XML"], function (value, done) {
            http_1.HTTP.header(this.request, "Content-Type", webapi_1.WebAPI.EXT_TO_MIME.xml);
            this.request.body = value;
            done();
        }, _doc);
        /**
         * Set HTTP response to raw (text) payload.
         *
         *     I set body to:
         *     ------------
         *     $TEXT
         *     ------------
         *
         *     I send:
         *     ------------
         *     $TEXT
         *     ------------
         *
         * @example
         *
         *     I set body to:
         *     ------------
         *     Hello World
         *     ------------
         *
         * @method Set HTTP response
         * @param {String} text payload
         */
        _doc = this.define(["I set body to:\n$TEXT", "I send:\n$TEXT"], function (value, done) {
            this.request.body = value;
            done();
        }, _doc);
        /**
         * Issue an HTTP GET request to default target or an absolute URL.
         * The @target annotation is used to select a target
         *
         *     I GET $resource
         *
         * @example
         *
         *     I GET /
         *     I GET http://example.com
         *
         * @method Send HTTP GET request
         * @param {String} resource - target resource path or full URL
         */
        _doc = this.define(["I GET $resource", "I GET from $resource"], function (resource, done) {
            let cmd = http_1.HTTP.operation("GET", resource, this.request, this.target);
            request(cmd, http_1.HTTP.handleResponse(this, done));
        }, _doc);
        _doc = this.define(["I GET JSON from $resource", "I GET JSON $resource"], function (resource, done) {
            let cmd = http_1.HTTP.operation("GET", resource, this.request, this.target);
            cmd.json = true;
            request(cmd, http_1.HTTP.handleResponse(this, done));
        }, new Dialect_1.DialectDocs("webapi.download", "Downloading data and files"));
        _doc = this.define(["I download $resource to $path $file"], function (resource, _path, filename, done) {
            let root = this.engine.paths[_path] ||
                vars_1.Vars.get(this, _path) ||
                vars_1.Vars.get(this, _path);
            let file = files_1.Files.path(root, filename);
            let basedir = path.dirname(file);
            assert(!files_1.Files.exists(file), "file already exists: " + file);
            this.request.followRedirect = true;
            let cmd = http_1.HTTP.operation("GET", resource, this.request, this.target);
            files_1.Files.mkdirp(basedir);
            request(cmd)
                .pipe(fs.createWriteStream(file))
                .on("close", function () {
                done();
            });
        }, _doc);
        /**
         * Issue an HTTP POST request to default target or an absolute URL.
         * The @target annotation is used to select a target
         *
         *     I POST $resource
         *
         * @example
         *
         *     I POST /
         *     I POST http://example.com
         *
         * @method Send HTTP POST request
         * @param {String} resource - target resource path or full URL
         */
        _doc = this.define(["I POST $resource", "I POST to $resource"], function (resource, done) {
            let self = this;
            this.request = http_1.HTTP.operation("POST", resource, this.request, this.target);
            request(this.request, http_1.HTTP.handleResponse(self, done));
        }, new Dialect_1.DialectDocs("webapi.operations", "Basic HTTP operations"));
        /**
         * Issue an HTTP PUT request to default target or an absolute URL.
         * The @target annotation is used to select a target
         *
         *     I PUT $resource
         *
         * @example
         *
         *     I PUT /
         *     I PUT http://example.com
         *
         * @method Send HTTP PUT request
         * @param {String} resource - target resource path or full URL
         */
        _doc = this.define("I PUT $resource", function (resource, done) {
            let cmd = http_1.HTTP.operation("PUT", resource, this.request, this.target);
            request(cmd, http_1.HTTP.handleResponse(this, done));
        }, _doc);
        /**
         * Issue an HTTP DELETE request to default target or an absolute URL.
         * The @target annotation is used to select a target
         *
         *     I DELETE $resource
         *
         * @example
         *
         *     I DELETE /
         *     I DELETE http://example.com
         *
         * @method Send HTTP DELETE request
         * @param {String} resource - target resource path or full URL
         */
        _doc = this.define("I DELETE $resource", function (resource, done) {
            let cmd = http_1.HTTP.operation("DELETE", resource, this.request, this.target);
            request(cmd, http_1.HTTP.handleResponse(this, done));
        }, _doc);
        //this.define("I $verb $resource", function(verb, resource, done: Function) {
        //    let cmd = HTTP.command(verb.toUpperCase(), resource, this.request, this.target );
        //    request(cmd, HTTP.handleResponse(this, done));
        //});
        /**
         * Issue an HTTP PATCH request to default target or an absolute URL.
         * The @target annotation is used to select a target
         *
         *     I PATCH $resource
         *
         * @example
         *
         *     I PATCH /
         *     I PATCH http://example.com
         *
         * @method Send HTTP PATCH request
         * @param {String} resource - target resource path or full URL
         */
        _doc = this.define("I PATCH $resource", function (resource, done) {
            let cmd = http_1.HTTP.operation("PATCH", resource, this.request, this.target);
            request(cmd, http_1.HTTP.handleResponse(this, done));
        }, _doc);
        /**
         * Issue an HTTP HEAD request to default target or an absolute URL.
         * The @target annotation is used to select a target
         *
         *     I request HEAD for $resource
         *
         * @example
         *
         *     I request HEAD for /
         *     I request HEAD for http://example.com
         *
         * @method Send HTTP HEAD request
         * @param {String} resource - target resource path or full URL
         */
        _doc = this.define("I request HEAD for $resource", function (resource, done) {
            let cmd = http_1.HTTP.operation("HEAD", resource, this.request, this.target);
            request(cmd, http_1.HTTP.handleResponse(this, done));
        }, _doc);
        /**
         * Issue an HTTP POST request to default target or an absolute URL.
         * The @target annotation is used to select a target
         *
         *     I request OPTIONS for $resource
         *
         * @example
         *
         *     I request OPTIONS for /
         *     I request OPTIONS for  http://example.com
         *
         * @method Send request for HTTP OPTIONS
         * @param {String} resource - target resource path or full URL
         */
        _doc = this.define("I request OPTIONS for $resource", function (resource, done) {
            let cmd = http_1.HTTP.operation("OPTIONS", resource, this.request, this.target);
            request(cmd, http_1.HTTP.handleResponse(this, done));
        }, _doc);
        /**
         * Set an OAUTH access_token both as scoped variable for use in subsequent requests.
         * The $path parameter is a JSON path used to access the (non-standard) access_token from the current HTTP response.
         *
         *     I store body path $path as access token
         *
         * @example
         *
         *     I store body path $.access_token as access token
         *
         * @method Set access_token
         * @param {String} token - valid oauth access token
         */
        _doc = this.define("I store body path $path as access token", function (path, done) {
            let access_token = http_1.HTTP.findInPath(this.response.body, path);
            assert(access_token, "Body path " + path + " does not contains an access_token");
            this.access_token = access_token;
            done();
        }, new Dialect_1.DialectDocs("webapi.vars", "Extract variables from body"));
        /**
         * Extra a value from the (JSON) body and store as a scoped variable
         *
         *     I store body path $path as $name
         *
         * @example
         *
         *     I store body path $.access_token as access-token
         *
         * @method Extract variable from a JSON response
         * @param {String} path - JSON Path to extract variable
         * @param {String} name - scoped variable to store result
         */
        _doc = this.define("I store body path $path as $name", function (path, name, done) {
            let value = http_1.HTTP.findInPath(this.response.body, path);
            assert(value, "Value for " + path + " is empty");
            vars_1.Vars.set(this, name, value);
            done();
        }, _doc);
        /**
         * Extract avalue from HTTP header and store as a scoped variable
         *
         *     I store header $header as $name
         *
         * @example
         *
         *     I store header ApiKey as client_id
         *
         * @method Extract variable from an HTTP header
         * @param {String} header - name of header to extract
         * @param {String} name - scoped variable to store result
         */
        _doc = this.define("I store header $header as $name", function (header, name, done) {
            header = header.toLowerCase();
            this[name] = this.response.headers[header];
            done();
        }, _doc);
        _doc = this.define(["I parse body as JSON", "I convert body to JSON"], function (done) {
            this.response.body = JSON.parse(this.response.body);
            done();
        }, _doc);
        _doc = this.define("response code should be $code", function (resp_code, done) {
            let codes = resp_code.split(",");
            let passed = false;
            let scope = this;
            _.each(codes, function (code) {
                passed =
                    passed ||
                        http_1.HTTP.IsStatusCodeXX(code.trim(), scope.response.statusCode);
            });
            assert(passed, "Status code is " + this.response.statusCode + " not " + codes);
            done();
        }, new Dialect_1.DialectDocs("webapi.status", "HTTP status / response codes"));
        _doc = this.define("response code should not be $code", function (resp_code, done) {
            let codes = resp_code.split(",");
            let failed = false;
            let scope = this;
            _.each(codes, function (code) {
                failed =
                    failed ||
                        !http_1.HTTP.IsStatusCodeXX(code.trim(), scope.response.statusCode);
            });
            checks_1.default.ok(failed, "Status code is " + this.response.statusCode);
            // assert(failed, "Status code is " + this.response.statusCode);
            done();
        }, _doc);
        _doc = this.define("header $header should be $value", function (header, value, done) {
            header = header.toLowerCase();
            assert(this.response.headers[header] == value, "Header " +
                header +
                " should match " +
                value +
                " but not " +
                this.response.headers[header]);
            done();
        }, new Dialect_1.DialectDocs("webapi.headers", "Test HTTP headers for values"));
        _doc = this.define("header $header should contain $value", function (header, value, done) {
            header = header.toLowerCase();
            assert(this.response.headers[header].indexOf(value) >= 0, "Header " +
                header +
                " should contain " +
                value +
                " but does not: " +
                this.response.headers[header]);
            done();
        }, _doc);
        _doc = this.define("header $header should not be $value", function (header, value, done) {
            header = header.toLowerCase();
            assert(this.response.headers[header] != value, "Header " + header + " should not match " + value);
            done();
        }, _doc);
        _doc = this.define("header $header should exist", function (header, done) {
            header = header.toLowerCase();
            assert(this.response.headers[header], "Missing " + header + " header");
            done();
        }, _doc);
        _doc = this.define("header $header should not exist", function (header, done) {
            header = header.toLowerCase();
            assert(this.response.headers[header] == undefined, "Found " + header + " header");
            done();
        }, _doc);
        _doc = this.define(/^response body should be valid (xml|json)$/, function (contentType, done) {
            let simpleType = http_1.HTTP.detectContentType(this.response.body);
            assert(simpleType == contentType, "Payload is " +
                simpleType +
                " not valid " +
                contentType.toUpperCase());
            done();
        }, new Dialect_1.DialectDocs("webapi.body", "Test HTTP body for values"));
        _doc = this.define("/^response body should not be valid (xml|json)$/", function (contentType, done) {
            let simpleType = http_1.HTTP.detectContentType(this.response.body);
            assert(simpleType != contentType, "Payload is valid " + contentType.toUpperCase());
            done();
        }, _doc);
        _doc = this.define("response body should contain $expression", function (expression, done) {
            let found = new RegExp(expression).test(this.response.body);
            assert(found, "Body does not contain /" + expression + "/");
            done();
        }, _doc);
        _doc = this.define("response body should not contain $expression", function (expression, done) {
            let found = new RegExp(expression).test(this.response.body);
            assert(!found, "Body contains /" + expression + "/");
            done();
        }, _doc);
        _doc = this.define(/^response body path (.*) should exist/, function (path, done) {
            let found = http_1.HTTP.findInPath(this.response.body, path);
            assert(found, "Body path " + path + " not found");
            done();
        }, _doc);
        _doc = this.define(/^response body path (.*) should not exist/, function (path, done) {
            let found = http_1.HTTP.findInPath(this.response.body, path);
            assert(!found, "Body path " + path + " was found");
            done();
        }, _doc);
        _doc = this.define([
            /^response body path (.*) should be ((?!of type).+)$/,
            /^response body path (.*) should contain ((?!of type).+)$/
        ], function (path, expression, done) {
            let found = http_1.HTTP.findInPath(this.response.body, path);
            let matched = new RegExp(expression).test(found);
            assert(matched, "Body path " +
                path +
                " does not contain /" +
                expression +
                "/");
            done();
        }, _doc);
        _doc = this.define([
            /^response body path (.*) should not be ((?!of type).+)$/,
            /^response body path (.*) should not contain ((?!of type).+)$/
        ], function (path, expression, done) {
            let found = http_1.HTTP.findInPath(this.response.body, path);
            let matched = new RegExp(expression).test(found);
            assert(!matched, "Body path " + path + " contains /" + expression + "/");
            done();
        }, _doc);
        /**
         * Generate a TOTP token based on the shared secret and current time.
         *
         * @example
         *
         *     I use totp
         *
         */
        _doc = this.define("I use totp", function (done) {
            let agent = this.agent;
            assert(agent.totp, "Missing agent.totp");
            assert(agent.totp.secret, "Missing agent.totp.secret");
            agent.totp.token = speakeasy.totp({
                secret: agent.totp.secret,
                encoding: agent.totp.encoding || "base32",
                step: agent.totp.step || 60
            });
            done();
        }, new Dialect_1.DialectDocs("webapi.totp", "One-time password"));
        _doc = this.define("I use totp as $actor", function (actor, done) {
            assert(this.agents, "Missing agents");
            assert(this.agents[actor], "Missing agent " + actor);
            let agent = this.agents[actor];
            agent.totp.token = speakeasy.totp({
                secret: agent.totp.secret,
                encoding: agent.totp.encoding || "base32",
                step: agent.totp.step || 60
            });
            done();
        });
    }
    scope(scope) {
        _.defaults(scope.properties, {
            peer: {
                authorized: false
            },
            request: {
                headers: {}
            },
            response: {},
            stopwatch: {
                start: 0
            },
            certificates: {},
            agents: {},
            cookies: {},
            credentials: {},
            target: {
                proxy: {}
            },
            targets: {
                default: {}
            },
            agent: {}
        });
        debug("scope %o", scope);
        return scope;
    }
}
exports.WebAPIDialect = WebAPIDialect;
//# sourceMappingURL=webapi.js.map