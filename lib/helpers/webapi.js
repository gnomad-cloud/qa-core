"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const files_1 = require("./files");
const http_1 = require("./http");
const _ = require("lodash");
let assert = require('assert');
let debug = require("debug")("meta4qa:helps:webapi");
class WebAPI {
    static uploadFormFile(request, path, filename, done) {
        let file = files_1.Files.root(request, path, filename);
        assert(files_1.Files.exists(file), "Missing " + path + " file: " + file);
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
    static attachFile(request, path, file, done) {
        assert(request, "Missing self");
        assert(path, "Missing path");
        assert(file, "Missing file");
        let type = http_1.HTTP.detectFileType(file);
        assert(type, "Invalid file type: " + file);
        WebAPI.attachFileByType(request, path, file, type, done);
    }
    static attachFileByType(request, path, filename, type, done) {
        let file = files_1.Files.root(request, path, filename);
        // let root = config.paths[path];
        // assert(root, "Path not found: "+path);
        // file = path.join(root, file);
        assert(files_1.Files.exists(file), "Unsupported file type: " + type);
        let mime = WebAPI.EXT_TO_MIME[type];
        assert(mime, "Unsupported file type: " + type);
        request.headers['Content-Type'] = mime;
        request.body = files_1.Files.load(file);
        debug("HTTP uploaded: %s", file);
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