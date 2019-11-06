"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// var tls = require('tls');
// var assert = require('assert');
// var net = require("net");
const _ = require("lodash");
const net = require("net");
const assert = require("assert");
const tls = require("tls");
class TCP {
    static isOpen(hostname, port, done) {
        var client = new net.Socket();
        client.connect(port, hostname, function () {
            console.log("connected -> tcp://%s:%s", hostname, port);
            client.destroy();
            done && done();
        });
    }
    static isClosed(hostname, port, done) {
        var client = new net.Socket();
        try {
            client.connect(port, hostname, function () {
                client.destroy();
                throw "Port " + port + " @ " + hostname + " is open";
            }).on("error", function () {
                console.log("port not open-> tcp://%s:%s", hostname, port);
                done && done();
            });
        }
        catch (e) {
            console.log("disconnected -> tcp://%s:%s", hostname, port);
            done && done();
        }
    }
    static getServerCert(hostname, port, options, done) {
        assert(hostname, "Missing hostname");
        assert(port, "Missing port");
        assert(options, "Missing options");
        assert(done, "Missing callback");
        options = _.extend({ rejectUnauthorized: false }, options);
        if (!options.legacy) {
            options.servername = hostname;
        }
        var peer = { state: "unknown", authorized: false, cert: false };
        try {
            var socket = tls.connect(port, hostname, options, function () {
                peer.state = socket.authorized ? 'authorized' : 'unauthorized';
                peer.authorized = socket.authorized ? true : false;
                // peer.cert = self.getPeerCertificate(true);
                console.log("%s peer certificate -> https://%s:%s -> %j", peer.state, hostname, port, options);
                socket.destroy();
                done(null, peer);
            });
        }
        catch (e) {
            done(e, peer);
        }
    }
}
exports.TCP = TCP;
//# sourceMappingURL=tcp.js.map