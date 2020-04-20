"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Dialect_1 = require("../Dialect");
const tcp_1 = require("../helpers/tcp");
const _ = require("lodash");
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
class TCPDialect extends Dialect_1.Dialect {
    constructor(engine) {
        super(engine);
        // ***** WHEN *****
        let doc = this.define(["port $port at $target is open", "I open port $port at $target"], function (port, address, done) {
            var target = this.targets[address] || { hostname: address };
            assert(target.hostname, "Missing target hostname: " + address);
            tcp_1.TCP.isOpen(target.hostname, port, done);
        }, new Dialect_1.DialectDocs("tcp.ports", "Check TCP ports"));
        this.define(["port $port is open", "I open port $port"], function (port, done) {
            assert(this.target.hostname, "Missing target hostname");
            var hostname = this.target.hostname;
            tcp_1.TCP.isOpen(hostname, port, done);
        }, doc);
        this.define(["port $port at $address is closed"], function (port, address, done) {
            assert(this.targets, "Missing target");
            var target = this.targets[address] || { hostname: address };
            assert(target, "Missing target: " + address);
            assert(target.hostname, "Missing target hostname: " + address);
            assert(port, "Missing target port: " + address);
            tcp_1.TCP.isClosed(target.hostname, port, done);
        }, doc);
        this.define(["port $port is closed"], function (port, done) {
            var hostname = this.target.hostname;
            assert(hostname, "Missing target hostname");
            tcp_1.TCP.isClosed(hostname, port, done);
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
        doc = this.define(["I lookup DNS"], function (done) {
            assert(this.target, "Missing an HTTP target");
            var hostname = this.target.hostname;
            assert(hostname, "Missing an target hostname");
            assert(this.dns, "Missing DNS");
            var self = this;
            dns.lookup(hostname, { all: true }, function (err, addresses) {
                assert(!err, "Lookup failed: " + hostname);
                self.dns.addresses = addresses;
                console.log("DNS Lookup: %s -> %j", hostname, self.dns);
                done();
            });
        }, new Dialect_1.DialectDocs("tcp.dns", "Test DNS lookup"));
        this.define(["I lookup DNS $address", "I lookup DNS for $address", "I lookup $address"], function (hostname, done) {
            assert(hostname, "Missing an target hostname");
            assert(this.dns, "Missing DNS");
            var self = this;
            dns.lookup(hostname, { all: true }, function (err, addresses) {
                assert(!err, "Lookup failed: " + hostname);
                self.dns.addresses = addresses;
                console.log("DNS Lookup: %s -> %j", hostname, self.dns);
                done();
            });
        }, doc);
        this.define(["I resolve DNS $type for $address", "I resolve DNS $type record for $address", "I resolve $type for $address"], function (type, hostname, done) {
            assert(type, "Missing an DNS record type");
            assert(hostname, "Missing an target hostname");
            assert(this.dns, "Missing DNS");
            var self = this;
            self.dns = {};
            type = type.toUpperCase();
            dns.resolve(hostname, type, function (err, addresses) {
                assert(!err, "Resolve failed (" + err + "): " + hostname);
                self.dns.addresses = addresses;
                console.log("DNS Resolved: %j", self.dns);
                done();
            });
        }, doc);
        this.define(["I resolve DNS for $address", "I resolve for $address"], function (hostname, done) {
            assert(hostname, "Missing an target hostname");
            assert(this.dns, "Missing DNS");
            var self = this;
            async.eachSeries(DNS_TYPES, function (type, callback) {
                self.dns[type] = self.dns[type] || {};
                try {
                    dns.resolve(hostname, type, function (err, addresses) {
                        if (err)
                            callback(err);
                        else {
                            self.dns[type].addresses = addresses;
                            console.log("DNS %s Resolved: %j", type, self.dns);
                            callback();
                        }
                    });
                }
                catch (err) {
                    self.dns[type].error = err;
                }
            }, function (_err) {
                done();
            });
        }, doc);
        false && doc;
    }
    scope(scope) {
        _.defaults(scope.properties, {
            target: {
                proxy: {}
            },
            agent: {},
        });
    }
}
exports.TCPDialect = TCPDialect;
//# sourceMappingURL=tcp.js.map