"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const files_1 = require("./files");
const _ = require("lodash");
const vars_1 = require("./vars");
let assert = require('assert');
let debug = require("debug")("qa-engine:helps:webapi");
class WebAPI {
    static ext2mime(file) {
        let ext = vars_1.Vars.suffix(file, ".") || file;
        return this.EXT_TO_MIME[ext];
    }
    static uploadFormFile(request, file, done) {
        request.headers['Content-Type'] = "multipart/form-data";
        request.formData = request.formData || {};
        request.formData.file = files_1.Files.stream(file);
        done && done();
    }
    static setFormField(request, name, value) {
        request.headers['Content-Type'] = "multipart/form-data";
        request.formData = _.extend({}, request.formData);
        request.formData[name] = value;
        return request.formData;
    }
    static uploadFile(request, file, done) {
        WebAPI.uploadFileByType(request, file, vars_1.Vars.suffix(file, "."), done);
    }
    static uploadFileByType(request, file, type, done) {
        assert(files_1.Files.exists(file), "Missing file: " + file);
        let mime = this.EXT_TO_MIME[type];
        assert(mime, "Unsupported file type: " + type);
        request.headers['Content-Type'] = mime;
        request.body = files_1.Files.load(file);
        debug("body from: %s, headers: %o ", file, request.headers);
        done();
    }
}
WebAPI.EXT_TO_MIME = {
    "json": "application/json",
    "xml": "text/xml",
    "txt": "plain/text"
};
exports.WebAPI = WebAPI;
//# sourceMappingURL=webapi.js.map