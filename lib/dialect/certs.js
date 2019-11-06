"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialect_1 = require("../Dialect");
const tcp_1 = require("../helpers/tcp");
const _ = require("lodash");
const vars_1 = require("../helpers/vars");
var assert = require('assert');
// var ping = require ("net-ping");
/**
 * X.509 Server Certificates
 * Configures the Yadda parser with phrases that support operations on HTTP Server Certificates
 *
 * @module Web API Dialect
 * @class X.509 Server Certificates
 *
 */
class X509Dialect extends Dialect_1.Dialect {
    constructor(engine) {
        super(engine);
        // ***** WHEN *****
        this.define(["I get a server certificate", "I get an SNI server certificate", "I get a server certificate using SNI"], function (done) {
            assert(this.peer, "scope not initialised");
            assert(this.target, "Missing an HTTP target");
            var hostname = this.target.hostname;
            assert(hostname, "Missing an target hostname");
            var port = this.target.port || 443;
            var self = this;
            tcp_1.TCP.getServerCert(hostname, port, {}, function (err, peer) {
                assert(!err, "TCP: " + err);
                _.extend(self.peer, peer);
                done && done();
            });
        });
        this.define(["I get $target server certificate", "I get $target SNI certificate"], function ($target, done) {
            assert(this.peer, "scope not initialised");
            assert(this.targets, "Missing HTTP targets");
            var target = this.targets[$target];
            assert(target, "Missing HTTP target: " + $target);
            var hostname = target.hostname;
            assert(hostname, "Missing an target hostname");
            var port = target.port || 443;
            var self = this;
            tcp_1.TCP.getServerCert(hostname, port, {}, function (err, peer) {
                assert(!err, "TCP: " + err);
                _.extend(self.peer, peer);
                done && done();
            });
        });
        this.define(["I trust $host", "I get a server certificate from $host", "I get SNI certificate from $host"], function (hostname, done) {
            assert(this.peer, "scope not initialised");
            assert(hostname, "Missing an target hostname");
            var port = 443;
            var self = this;
            tcp_1.TCP.getServerCert(hostname, port, {}, function (err, peer) {
                assert(!err, "TCP: " + err);
                _.extend(self.peer, peer);
                done && done();
            });
        });
        this.define(["I get a server certificate without SNI"], function (done) {
            assert(this.peer, "scope not initialised");
            assert(this.target, "Missing an HTTP target");
            var hostname = this.target.hostname;
            assert(hostname, "Missing an target hostname");
            var port = this.target.port || 443;
            var self = this;
            tcp_1.TCP.getServerCert(hostname, port, { legacy: true }, function (err, peer) {
                assert(!err, "TCP error: " + err.message);
                _.extend(self.peer, peer);
                done && done();
            });
        });
        // ***** THEN *****
        this.define(["server certificate is authorized", "server certificate must be authorized"], function (done) {
            assert(this.peer, "server cert missing");
            assert(this.peer.authorized, "Server cert not authorized");
            done && done();
        });
        this.define(["server certificate $varname must match $pattern", "$varname in server certificate must match $pattern"], function (name, pattern, done) {
            assert(this.peer, "server cert missing");
            assert(this.peer.authorized, "Server cert not authorized");
            var found = vars_1.Vars.findNamed(this.peer, name);
            assert(found, "Variable not found for: " + name);
            var regexp = new RegExp(pattern);
            assert(regexp.test(found), "Pattern /" + pattern + "/ not found");
            done && done();
        });
    }
}
exports.X509Dialect = X509Dialect;
//# sourceMappingURL=certs.js.map