import { Dialect } from "../Dialect";
import { Engine } from "../engine";
import { TCP } from "../helpers/tcp";
import * as _ from "lodash";
import { Vars } from "../helpers/vars";

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
export class X509Dialect extends Dialect {

    constructor(engine: Engine) {
        super(engine);

        // ***** WHEN *****

        this.define(["I get a server certificate", "I get an SNI server certificate", "I get a server certificate using SNI"], function (this: any, done: Function) {
            assert(this.peer, "scope not initialised");
            assert(this.target, "Missing an HTTP target");
            var hostname = this.target.hostname;
            assert(hostname, "Missing an target hostname");

            var port = this.target.port || 443;
            var self = this;

            TCP.getServerCert(hostname, port, {}, function (err: any, peer: any) {
                assert(!err, "TCP: " + err);
                _.extend(self.peer, peer);
                done && done();
            })
        });

        this.define(["I get $target server certificate", "I get $target SNI certificate"], function (this: any, $target, done: Function) {
            assert(this.peer, "scope not initialised");
            assert(this.targets, "Missing HTTP targets");
            var target = this.targets[$target];
            assert(target, "Missing HTTP target: " + $target);

            var hostname = target.hostname;
            assert(hostname, "Missing an target hostname");

            var port = target.port || 443;
            var self = this;

            TCP.getServerCert(hostname, port, {}, function (err: any, peer: any) {
                assert(!err, "TCP: " + err);
                _.extend(self.peer, peer);
                done && done();
            })
        });


        this.define(["I trust $host", "I get a server certificate from $host", "I get SNI certificate from $host"], function (this: any, hostname, done: Function) {
            assert(this.peer, "scope not initialised");
            assert(hostname, "Missing an target hostname");

            var port = 443;
            var self = this;

            TCP.getServerCert(hostname, port, {}, function (err: any, peer: any) {
                assert(!err, "TCP: " + err);
                _.extend(self.peer, peer);
                done && done();
            })
        });

        this.define(["I get a server certificate without SNI"], function (this: any, done: Function) {
            assert(this.peer, "scope not initialised");
            assert(this.target, "Missing an HTTP target");
            var hostname = this.target.hostname;
            assert(hostname, "Missing an target hostname");

            var port = this.target.port || 443;
            var self = this;

            TCP.getServerCert(hostname, port, { legacy: true }, function (err: any, peer: any) {
                assert(!err, "TCP error: " + err.message);
                _.extend(self.peer, peer);
                done && done();
            })

        });


        // ***** THEN *****

        this.define(["server certificate is authorized", "server certificate must be authorized"], function (this: any, done: Function) {
            assert(this.peer, "server cert missing");
            assert(this.peer.authorized, "Server cert not authorized");
            done && done();
        });

        this.define(["server certificate $varname must match $pattern", "$varname in server certificate must match $pattern"], function (this: any, name, pattern, done: Function) {
            assert(this.peer, "server cert missing");
            assert(this.peer.authorized, "Server cert not authorized");
            var found = Vars.findNamed(this.peer, name);
            assert(found, "Variable not found for: " + name);
            var regexp = new RegExp(pattern);
            assert(regexp.test(found), "Pattern /" + pattern + "/ not found");
            done && done();
        });
    }
}