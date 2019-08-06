import { Files } from "./files";
import { HTTP } from "./http";
import * as _ from "lodash";

let assert = require('assert');
let debug = require("debug")("meta4qa:helps:webapi");

let tls = require('tls');
let net = require("net");

export class WebAPI {

    static EXT_TO_MIME: any = {
        "json": "application/json",
        "xml": "text/xml",
        "txt": "plain/text"
    }

    static uploadFormFile(request: any, path: string, filename: string, done: Function) {
        let file = Files.root(request, path, filename);
        assert(Files.exists(file), "Missing "+path+" file: "+file);
        request.headers['Content-Type'] = "multipart/form-data";
        request.formData = request.formData || {};
        request.formData.file = Files.stream(file);
        done && done();
    }

    static setFormField(request: any, name: string, value: string) {
        request.headers['Content-Type'] = "multipart/form-data";
        request.formData = _.extend({}, request.formData);
        request.formData[name] = value;
        return request.formData;
    }

    static attachFile(request: any, path: string, file: string, done: Function) {
        assert(request, "Missing self");
        assert(path, "Missing path");
        assert(file, "Missing file");
        let type = HTTP.detectFileType(file);
        assert(type, "Invalid file type: "+file);

        WebAPI.attachFileByType(request, path, file, type, done);
    }

    static attachFileByType(request: any, path: string, filename: string, type: string, done: Function) {
        let file = Files.root(request, path, filename);
        // let root = config.paths[path];
        // assert(root, "Path not found: "+path);
        // file = path.join(root, file);
        assert(Files.exists(file), "Unsupported file type: "+type);

        let mime = WebAPI.EXT_TO_MIME[type];
        assert(mime, "Unsupported file type: "+type);
        request.headers['Content-Type'] = mime;

        request.body = Files.load(file);
        debug("HTTP uploaded: %s", file);
        done();
    }

}
