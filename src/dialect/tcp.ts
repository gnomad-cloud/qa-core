import { Dialect, DialectDocs } from "../Dialect";
import { Engine } from "../engine";
import { TCP } from "../helpers/tcp";
import * as _ from "lodash";

var assert = require('assert');
var async = require('async');
var dns = require('dns');
// var ping = require ("net-ping");

/**
 * TCP Network Toolkit
 * Configures the Yadda parser with phrases that support operations on HTTP APIs
 *
 * @module Web API Dialect
 * @class TCP Toolkit
 *
 */

const DNS_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'SRV', 'PTR', 'NS', 'CNAME', 'SOA'];

export class TCPDialect extends Dialect {

    constructor(engine: Engine) {
        super(engine);
        // ***** WHEN *****

        let doc = this.define(["port $port at $target is open", "I open port $port at $target"], function (this: any, port: number, address: string, done: Function) {
            var target = this.targets[address] || { hostname: address };
            assert(target.hostname, "Missing target hostname: " + address);
            TCP.isOpen(target.hostname, port, done);
        }, new DialectDocs("tcp.ports", "Check TCP ports"));

        this.define(["port $port is open", "I open port $port"], function (this: any, port: number, done: Function) {
            assert(this.target.hostname, "Missing target hostname");
            var hostname = this.target.hostname;
            TCP.isOpen(hostname, port, done);
        }, doc);

        this.define(["port $port at $address is closed"], function (this: any, port: number, address: string, done: Function) {
            assert(this.targets, "Missing target");
            var target = this.targets[address] || { hostname: address };
            assert(target, "Missing target: " + address);
            assert(target.hostname, "Missing target hostname: " + address);
            assert(port, "Missing target port: " + address);

            TCP.isClosed(target.hostname, port, done);
        }, doc);

        this.define(["port $port is closed"], function (this: any, port: number, done: Function) {
            var hostname = this.target.hostname;
            assert(hostname, "Missing target hostname");
            TCP.isClosed(hostname, port, done);
        }, doc);


        // this.define(["I ping"], function(this: any, done: Function) {
        //     var hostname = this.target.hostname;
        //     assert(hostname, "Missing target hostname: "+$target);
        //
        //     session.pingHost (hostname, function (error, target) {
        //         assert(!error, "Ping failed: "+hostname);
        //         done();
        //     });
        //
        // });
        //
        // this.define(["I ping $target"], function(this: any, $target, done: Function) {
        //     assert($target, "Missing target");
        //     var session = ping.createSession ();
        //     var target = this.targets[$target];
        //     assert($target, "Unknown target: "+$target);
        //     var hostname = target.hostname;
        //     assert(hostname, "Missing target hostname: "+$target);
        //
        //     session.pingHost (hostname, function (error, target) {
        //         assert(!error, "Ping failed: "+hostname);
        //         done();
        //     });
        // });
        //

        doc = this.define(["I lookup DNS"], function (this: any, done: Function) {
            assert(this.target, "Missing an HTTP target");
            var hostname = this.target.hostname;
            assert(hostname, "Missing an target hostname");
            assert(this.dns, "Missing DNS")
            var self = this;

            dns.lookup(hostname, { all: true }, function (err: any, addresses: any) {
                assert(!err, "Lookup failed: " + hostname);
                self.dns.addresses = addresses;
                console.log("DNS Lookup: %s -> %j", hostname, self.dns);
                done();
            });
        }, new DialectDocs("tcp.dns", "Test DNS lookup"));

        this.define(["I lookup DNS $address", "I lookup DNS for $address", "I lookup $address"], function (this: any, hostname, done: Function) {
            assert(hostname, "Missing an target hostname");
            assert(this.dns, "Missing DNS")

            var self = this;

            dns.lookup(hostname, { all: true }, function (err: any, addresses: any) {
                assert(!err, "Lookup failed: " + hostname);
                self.dns.addresses = addresses;
                console.log("DNS Lookup: %s -> %j", hostname, self.dns);
                done();
            });
        }, doc);

        this.define(["I resolve DNS $type for $address", "I resolve DNS $type record for $address", "I resolve $type for $address"], function (this: any, type, hostname, done: Function) {
            assert(type, "Missing an DNS record type");
            assert(hostname, "Missing an target hostname");
            assert(this.dns, "Missing DNS")

            var self = this;
            self.dns = {};
            type = type.toUpperCase();

            dns.resolve(hostname, type, function (err: any, addresses: any) {
                assert(!err, "Resolve failed (" + err + "): " + hostname);
                self.dns.addresses = addresses;
                console.log("DNS Resolved: %j", self.dns);
                done();
            });
        }, doc);

        this.define(["I resolve DNS for $address", "I resolve for $address"], function (this: any, hostname, done: Function) {
            assert(hostname, "Missing an target hostname");
            assert(this.dns, "Missing DNS")

            var self = this;

            async.eachSeries(DNS_TYPES, function (type: string, callback: Function) {
                self.dns[type] = self.dns[type] || {};
                try {
                    dns.resolve(hostname, type, function (err: any, addresses: any) {
                        if (err) callback(err);
                        else {
                            self.dns[type].addresses = addresses;
                            console.log("DNS %s Resolved: %j", type, self.dns);
                            callback();
                        }
                    });
                } catch (err) {
                    self.dns[type].error = err;
                }
            }, function (_err: any) {
                done();
            });
        }, doc);

        false && doc
    }

	scope(scope: any): any {
		_.defaults(scope.properties, {
			target: {
				proxy: {}
			},
			agent: {},
        });
    }
}
