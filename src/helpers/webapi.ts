import { Files } from "./files";
import * as _ from "lodash";
import { Vars } from "./vars";

let assert = require('assert');
let debug = require("debug")("qa-engine:helps:webapi");

export class WebAPI {

    static EXT_TO_MIME: any = {
        "json": "application/json",
        "xml": "text/xml",
        "txt": "plain/text"
    }

    static ext2mime(file: string) {
        let ext = Vars.suffix(file,".") || file;
        return this.EXT_TO_MIME[ext];
    }

    static uploadFormFile(request: any, file: string, done: Function) {
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

    static uploadFile(request: any, file: string, done: Function) {
        WebAPI.uploadFileByType(request, file, Vars.suffix(file, "."), done);
    }

    static uploadFileByType(request: any, file: string, type: string, done: Function) {
        assert(Files.exists(file), "Missing file: "+file);

        let mime = this.EXT_TO_MIME[type];
        assert(mime, "Unsupported file type: "+type);
        request.headers['Content-Type'] = mime;

        request.body = Files.load(file);
        debug("body from: %s, headers: %o ", file, request.headers);
        done();
    }

}
