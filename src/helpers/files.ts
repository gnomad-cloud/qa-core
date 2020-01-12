import { converters } from "yadda";

let assert = require("assert");
let fs = require("fs");
let path = require("path");
let _ = require('lodash');
let mkdirp = require("mkdirp");
let async = require("async");
let yaml = require("js-yaml");

let debug = require("debug")("qa-engine:helps:files");
// let converts = require('../converter');

export class Files {
    static FILE_ENCODING = "UTF-8";

    static path(dir: string, file: string) {
        let filename = path.normalize(dir+"/"+file);
        // if (filename.indexOf(dir)!=0) throw new Error("File before root: "+filename);
        return filename;
    }

    static root(paths: object, path: string, file?: string) {
        if (!file) {
            file = path;
            path = "files";
        }

        let dir = paths[path];
        assert(dir, "Missing root folder: "+path);
        let filename = this.path(dir, file);
        return filename;
    }

    static config(configFile: string|[], options: any) {
        assert(configFile, "Missing configFile");
        options = options || {};
        let configFiles = [];
        let self = this;

        if (_.isString(configFile)) configFiles.push(configFile);
        else if (_.isArray(configFile)) configFiles = configFile as [];
        else throw "Invalid config file: "+configFile;

        let config = _.extend({ paths: {} }, options);
        let configured = false;
        async.everySeries(configFiles, function(file: string, iteratee: Function) {
            if (self.exists(file)) {
                self.parse(file, function(_filename: string, json: any, _err: any) {
                    _.extend(config, json);
                    _.extend(config.paths, json.paths);
                    configured = true;
                    iteratee(null, true );
                });
            } else {
                iteratee(null, true );
            }
        });
        if (!configured) return false;
        debug("configured: %j\n%j\n" , configFiles, config)
        return config;
    }

    static load(file: string, options?: any) {
        assert(file, "Missing file");
        assert(this.exists(file), "File not found: "+file);
        options = options || {};
        debug("load %s: %s", this.FILE_ENCODING, file);
        let raw = fs.readFileSync(file, this.FILE_ENCODING);
        return raw;
    }

    static stream(file: string, options?: any) {
        assert(file, "Missing file");
        assert(this.exists(file), "File not found: "+file);
        options = options || {};
        debug("streaming: %s", file);
        return fs.createReadStream(file, options);
    }

    static save(file: string, data: any) {
        assert(file, "Missing file");
        assert(data, "Missing data");
        fs.writeFileSync(file, data);
        return true;
    }

    static saveYAML(file: string, data: any) {
        assert(file, "Missing file");
        assert(data, "Missing data");
        assert(_.isObject(data) || _.isArray(), "Invalid data");

        fs.writeFileSync(file, yaml.safeDump(data) );
        return true;
    }

    static parse(file: string, onFound: Function) {
        assert(file, "Missing file");
        assert(this.exists(file), "File not found: "+file);
        let raw = this.load(file);
        return this.convert(file, raw, onFound);
    }

    static convert(file: string, raw: string, onFound: Function) {
        let format = this.extension(file);
        let convert = converters as any;
        let converter = convert[format] as Function;
        if (!converter) {
            onFound?onFound(file, raw):raw;
        } else {
            converter(raw, function(err: any, json: any) {
                assert(!err, format+" not valid: "+file+" --> ");
                onFound?onFound(file, json, err):json;
            })
        }
    }

    static mkdirp(path: string) {
        mkdirp.sync(path);
    }

    static rmrf(path: string) {
        let self = this;
        debug("rm -rf %s [%s]", path, this.exists(path));
        if( this.exists(path) ) {
            if(this.isDirectory(path)) {
                fs.readdirSync(path).forEach(function(file: string){
                    let curPath = path + "/" + file;
                    self.rmrf(curPath);
                });
                fs.rmdirSync(path);
            } else {
                fs.unlinkSync(path);
            }
        }
    }

    static isDirectory(file: string): boolean {
        try {
            let stat = fs.statSync(file);
            return stat?stat.isDirectory():false;
        } catch(e) {
            return false;
        }
    }

    static isFolder(file: string): boolean {
        return this.isDirectory(file);
    }

    static isFile(file: string): boolean {
        return !this.isDirectory(file);
    }

    static dirname(file: string): string {
        return path.dirname(file);
    }

    static basename(file: string): string {
        return path.basename(file);
    }

    static extension(path: string): string {
        let ix = path.lastIndexOf(".");
        if (ix<0) return "";
        return path.substring(ix+1).toLowerCase();
    }

    static matches(path: string, filter: string): boolean {
        assert(path, "Missing path");
        if (!filter) return true;
        return path.indexOf(filter)>=0;
    }

    // static walk(from: string, _filter: string): Promise<string[]> {
    //     return new Promise<string[]>( (resolve, reject) => {
    //         walker.walk(from, (err, results) => {
    //             if (err) reject([ err.message ]);
    //             else resolve(results);
    //         });
    //     });
    // }

    static find(from: string, filter: string, onFound: Function) {
        if (!this.exists(from)) return {};
        from = path.normalize(from);
        let dirs: any = {};
        let self = this;
        this.follow(from, function(dir: string) {
            let file = dir;

            if (self.isFile(dir) && self.matches(file, filter)) {
                self.parse(dir, function(filename: String,json: any) {
                    let name = filename.substring(from.length);
                    dirs[name] = onFound?onFound(dir, json):json;
                });
            }
        })
        return dirs;
    }

    static follow(path: string, onFound: Function, allDone?: Function) {
        if (!this.exists(path)) return;
        let self = this;

        let found = fs.readdirSync(path);
        // breadth-first
        _.each(found, function(dir: string) {
            dir = self.path(path, dir);
            if (self.isFile(dir)) {
                onFound(dir);
            }
        });

        _.each(found, function(dir: string) {
            dir = self.path(path, dir);
            if (self.isDirectory(dir)) {
                self.follow(dir, onFound);
            }
        });

        allDone && allDone();
    }

    static exists(file: string) {
        try {
            let stat = fs.statSync(file);
            return stat?true:false;
        } catch(e) {
            return false;
        }
    }

    static size(file: string) {
        try {
            let stat = fs.statSync(file);
            return stat?stat.size:-1;
        } catch(e) {
            return -1;
        }
    }

}
