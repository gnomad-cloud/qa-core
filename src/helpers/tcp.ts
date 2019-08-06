// var tls = require('tls');
// var assert = require('assert');
// var net = require("net");
import _ from "lodash";
import net from "net";
import assert from "assert";
import tls from "tls";

export class TCP {

    static isOpen(hostname: string, port: number, done: Function) {
        var client = new net.Socket();
        client.connect(port, hostname, function() {
            console.log("connected -> tcp://%s:%s", hostname,port);
            client.destroy();
            done && done();
        })
    }

    static isClosed(hostname: string, port: number, done: Function) {
        var client = new net.Socket();
        try {
            client.connect(port, hostname, function() {
                client.destroy();
                throw "Port "+port+" @ "+hostname+" is open";
            }).on("error", function() {
                console.log("port not open-> tcp://%s:%s", hostname,port);
                done && done();
            });
        } catch(e) {
            console.log("disconnected -> tcp://%s:%s", hostname,port);
            done && done();
        }
    }

    static getServerCert(hostname: string, port: number, options: any, done: Function) {
        assert(hostname, "Missing hostname");
        assert(port, "Missing port");
        assert(options, "Missing options");
        assert(done, "Missing callback");

        options = _.extend({ rejectUnauthorized: false }, options);
        let self = this;

        if (!options.legacy) {
            options.servername = hostname;
        }

        var peer = { state: "unknown", authorized: false, cert: false };

        try {
            var socket = tls.connect(port, hostname, options, function() {

                peer.state = socket.authorized ? 'authorized' : 'unauthorized';
                peer.authorized = socket.authorized?true:false;
                // peer.cert = self.getPeerCertificate(true);

                console.log("%s peer certificate -> https://%s:%s -> %j", peer.state, hostname, port, options);
                socket.destroy();
                done(null, peer);
            });
        } catch (e) {
            done(e, peer);
        }
    }

}
