import { Engine } from "../engine";
import { Dialect } from "../Dialect";
import { Files } from "../helpers/files";
import { Vars } from "../helpers/vars";
import * as _ from "lodash";
import * as assert from "assert";
import * as mkdirp from "mkdirp";

/**
 * File System
 * Configures the Gherkin parser with phrases that support operations on File System
 *
 * @module Default Dialect
 * @class File System
 *
 */


export class FilesDialect extends Dialect {
	FILE_ENCODING = "UTF-8";
	converts: any = {};

	constructor(engine: Engine) {
		super(engine);

		this.define(["I load $varname as $format from $file", "I read $varname as $format from $file"], function (this: any, name: string, format: string, filename: string, done: Function) {
			let file = Files.root(engine.vars, filename);
			assert(Files.exists(file), format + " file not found: " + file);
			// let converter = converts[format];
			// assert(converter, format + " files are not supported: " + file);

			format = format.toLowerCase();
			let raw = Files.load(file);
			assert(raw, format + " file is empty: " + file);

			// converter(raw, function (err, json) {
			// 	assert(!err, format + " not valid: " + file);
			// 	helps.vars.set(self.vars, name, json);
			// 	debug("%s loaded: %j", format, file);
			// 	done();
			// })

			Vars.set(engine.vars, name, raw);
			engine.debug("%s loaded: %j", format, file);
			done();
		});

		this.define(["I mkdir $folder"], function (this: any, folder: string, done: Function) {
			let path = Files.root(engine.paths, folder);
			mkdirp.sync(path);
			done();
		});

	}

}

// let self = module.exports = function (meta4qa, learn, config, dialect) {
// 	assert(meta4qa, "missing meta4qa");
// 	assert(learn, "missing learn");
// 	assert(config, "missing config");
// 	assert(dialect, "missing dialect");
// 	assert(helps, "missing helpers");
// 	assert(converts, "missing converters");

// 	assert(config.paths, "missing file paths");
// 	assert(config.paths.files, "missing default file path");

// 	let FILE_ENCODING = "UTF-8";

// 	this.define(["I load $varname as $format from $file", "I read $varname as $format from $file"], function (name, format, filename, done) {
// 		let file = Files.root(this, filename);
// 		assert(Files.exists(file), format + " file not found: " + file);

// 		format = format.toLowerCase();
// 		let converter = converts[format];
// 		assert(converter, format + " files are not supported: " + file);
// 		let raw = Files.load(file);
// 		assert(raw, format + " file is empty: " + file);
// 		let self = this;
// 		converter(raw, function (err, json) {
// 			assert(!err, format + " not valid: " + file);
// 			helps.vars.set(self.vars, name, json);
// 			debug("%s loaded: %j", format, file);
//             done();
// 		})

// 	});

// 	this.define(["I load $varname as $format from $folder $file", "I read $varname as $format from $folder $file"], function (name, format, folder, filename, done) {
// 		let file = Files.root(this, folder, filename);
// 		assert(Files.exists(file), format + " file not found: " + file);

// 		format = format.toLowerCase();
// 		let converter = converts[format];
// 		assert(converter, format + " files are not supported: " + file);
// 		let raw = Files.load(file);
// 		assert(raw, format + " file is empty: " + file);
// 		let self = this;
// 		converter(raw, function (err, json) {
// 			assert(!err, format + " not valid: " + file);
// 			helps.vars.set(self.vars, name, json);
// 			debug("%s converted to %s: %j", file, format, json);
//             done();
// 		})

// 	});

// 	this.define(["I load $varname from $file", "I read $varname from $file"], function (name, filename, done) {
//         assert(name, "Missing $varname");
//         assert(filename, "Missing $filename");
//         assert(done, "Missing callback");

// 		let file = Files.root(this, filename);
// 		let format = path.extname(file);
// 		assert(format, "missing file extension: " + file);
// 		assert(Files.exists(file), format + " file not found: " + file);

// 		format = format.substring(1).toLowerCase();
// 		let converter = converts[format];
// 		assert(converter, format + " files are not supported: " + file);
// 		let raw = Files.load(file);
// 		assert(raw, format + " file is empty: " + file);
// 		let self = this;
// 			converter(raw, function (err, json) {
// 				assert(!err, format + " not valid: " + file);
// 				helps.vars.set(self.vars, name, json);
// 				debug("%s loaded %s %s items from %s", format, _.keys(json).length, name, file);
// 		});
//                 done();

// 	});

// 	this.define(["I find $filter in folder $folder"], function (filter, folder, done) {
// 		if (filter == "files") filter = ".";
// 		let file = Files.root(this, folder);
// 		let files = Files.find(file, filter);
// 		helps.vars.set(this.vars, "files", files);
// 		done();
// 	});

// 	this.define(["I find $filter in $type folder $folder"], function (filter, type, folder, done) {
// 		if (filter == "files") filter = ".";
// 		let root = this.paths[type] || config.paths[type];
// 		let file = Files.path(root, folder);

// 		let files = Files.find(file, filter);
// 		helps.vars.set(this.vars, "files", files);
// 		done();
// 	});

// 	this.define(["I find $filter in folder $folder as $varname"], function (filter, folder, varname, done) {
// 		if (filter == "files") filter = ".";
// 		let file = Files.root(this, folder);
// 		// console.log("FIND (%s): %s -> %s", filter, folder);
// 		let files = Files.find(file, filter, function (filename, json) {
// 			let name = path.basename(filename, filter);
// 			json.name = json.name || name;
// 			json.id = json.id || helps.vars.uuid(filename);
// 			return json;
// 		});
// 		helps.vars.set(this.vars, varname, files);
// 		done();
// 	});

// 	this.define(["I find $filter in $type folder $folder as $varname"], function (filter, type, folder, varname, done) {
// 		if (filter == "files") filter = ".";
// 		let root = this.paths[type] || config.paths[type];
// 		let file = Files.path(root, folder);
// 		// console.log("FIND (%s): %s -> %s", filter, folder);
// 		let files = Files.find(file, filter, function (filename, json) {
// 			let name = path.basename(filename, filter);
// 			json.name = json.name || name;
// 			json.id = json.id || helps.vars.uuid(filename);
// 			return json;
// 		});
// 		helps.vars.set(this.vars, varname, files);
// 		done();
// 	});

// 	this.define(["I save $varname to $file", "I write $varname to $file"], function (name, filename, done) {
//         assert(name, "Missing $varname");
//         assert(filename, "Missing filename");
// 		let file = Files.root(this, filename);
//         let value = helps.vars.get(this, name);
//         Files.save(file, JSON.stringify(value || {}));
// 		debug("file saved: " + file);
// 		done();
// 	});

//     this.define(["I save $varname to $path $file", "I write $varname to $path $file"], function (name, path, filename, done) {
//         assert(name, "Missing $varname");
//         assert(path, "Missing $path");
//         assert(filename, "Missing filename");
//         let root = this.paths[path] || config.paths[path] || helps.vars.get(this.vars, path) || helps.vars.get(this, path);
//         let file = Files.path(root, filename);
//         assert(!Files.exists(file), path + " file already exists: " + file);
//         let payload = this.vars[name]  || {};
//         Files.save(file, JSON.stringify(payload));
//         debug("saved: %s" , file);
//         done();
//     });

// 	this.define(["I delete file $file", "I delete folder $file"], function (filename, done) {
// 		assert(filename, "Missing filename");
// 		let file = Files.root(this, filename);
// 		Files.rmrf(file);
// 		done();
// 	});

// 	this.define(["I delete $path $file_folder $file"], function (path, type, filename, done) {
// 		assert(path, "Missing path");
// 		assert(type, "Missing type (file or folder)");
// 		assert(filename, "Missing filename");
// 		let root = this.paths[path] || config.paths[path] || helps.vars.get(this.vars, path) || helps.vars.get(this, path);
// 		assert(root, "Missing root folder: " + path);
// 		let file = Files.path(root, filename);
// 		debug("deleting %s -> %s (%s)", type, file, filename);
//         let was = false;
// 		Files.rmrf(file);
// 		done();
// 	});

// 	this.define(["I mkdir $folder"], function (folder, done) {
// 		let path = Files.root(this, folder);
// 		mkdirp.sync(path);
// 		done();
// 	});

// 	// ***** THEN *****

// 	this.define(["file $file exists", "file $file should exist", "file $file must exist"], function (filename, done) {
// 		let file = Files.root(this, filename);
//         let file_exists = Files.exists(file);
// 		assert(file_exists, "File " + file + " does not exist")
// 		done();
// 	});


// 	this.define(["$path file $file exists", "$path file $file should exist", "$path file $file must exist"], function (path, filename, done) {
// 		let root = this.paths[path] || this.paths[path] || helps.vars.get(this.vars, path) || helps.vars.get(this, path);
// 		assert(root, "Missing root folder: " + path);
// 		let file = Files.path(root, filename);
//         let file_exists = Files.exists(file);

// 		assert(file_exists, path + " file does not exist: " + file);
// 		assert(!Files.isDirectory(file), path + " filename is a folder: " + file);

// 		done();
// 	});


// 	this.define(["file $file doesn't exist", "file $file does not exist",
//         "folder $file doesn't exist", "folder $file does not exist"], function (filename, done) {

// 		let file = Files.root(this, filename);
// 		try {
// 			let stat = fs.statSync(file);
// 			assert(!stat, "File " + file + " exist")
// 		} catch (e) {
// 			debug("file not found: " + file);
// 			done();
// 		}
// 	});

// 	this.define(["folder $file exists", "folder $file should exist"], function (filename, done) {
// 		let file = Files.root(this, filename);
//         let file_exists = Files.exists(file);
//         debug("folder exists?: %s == %s", file, file_exists);

// 		assert(file_exists, "Folder does not exist: " + file);
// 		assert(Files.isDirectory(file), "File is not folder: " + file);
// 		done();
// 	});


// 	this.define(["folder $file should not exist", "$file folder should not exist"], function (filename, done) {
// 		let file = Files.root(this, filename);

// 		assert(!Files.exists(file), "Folder exists: " + file);
// 		debug("Folder does not exist: " + file);
// 		done();
// 	});

// 	this.define(["$name $type $file exists", "$name $type $file should exist"], function (name, type, filename, done) {
// 		let root = this.paths[name] || config.paths[name] || helps.vars.get(this.vars, name) || helps.vars.get(this, name);
// 		assert(root, "Missing root folder: " + name);
// 		let file = Files.path(root, filename);

// 		assert(Files.exists(file), "File does not exist: " + file);
// 		if (type == "folder") {
// 			assert(Files.isDirectory(file), "File is not folder: " + file);
// 			debug("Folder '%s' exists: %s", name, file);
// 		}
// 		done();
// 	});

// 	this.define(["file $file is not empty"], function (filename, done) {
// 		let file = Files.root(this, filename);
// 		assert(Files.exists(file), "File does not exist: " + file);
// 		assert(Files.size(file) > 0, "File is empty: " + file);
// 		done();
// 	});


// 	this.define("file $file should contain $expression", function (filename, expression, done) {
// 		let file = Files.root(this, filename);
// 		assert(Files.exists(file), "File does not exist: " + file);

// 		let data = Files.load(file);
// 		let found = new RegExp(expression).test(data);
// 		assert(found, "File " + file + " does not contain /" + expression + "/");
// 		done();
// 	});

// 	this.define("$name $type $file should contain $expression", function (name, type, filename, expression, done) {
// 		let root = this.paths[name] || config.paths[name] || helps.vars.get(this.vars, name) || helps.vars.get(this, name);
// 		assert(root, "Missing root folder: " + name);
// 		let file = Files.path(root, filename);

// 		assert(Files.exists(file), "File does not exist: " + file);

// 		let data = Files.load(file);
// 		let found = new RegExp(expression).test(data);
// 		assert(found, "File " + file + " does not contain /" + expression + "/");
// 		done();
// 	});


// 	this.define("file $file should not contain $expression", function (filename, expression, done) {
// 		let file = Files.root(this, filename);
// 		assert(Files.exists(file), "File does not exist: " + file);

// 		let data = Files.load(file);
// 		let found = new RegExp(expression).test(data);
// 		assert(!found, "File contains /" + expression + "/");
// 		done();
// 	});

// 	this.define("$name $type $file should not contain $expression", function (name, type, filename, expression, done) {
// 		let root = this.paths[name] || config.paths[name] || helps.vars.get(this.vars, name) || helps.vars.get(this, name);
// 		assert(root, "Missing root folder: " + name);
// 		let file = Files.path(root, filename);
// 		assert(Files.exists(file), "File does not exist: " + file);

// 		let data = Files.load(file);
// 		let found = new RegExp(expression).test(data);
// 		assert(!found, "File contains /" + expression + "/");
// 		done();
// 	});

// 	// **********************************************************************
// 	// * Dialect Controller
// 	// **********************************************************************

// 	self.feature = function (dialect, scope) {
// 		assert(dialect, "missing dialect");
// 		assert(scope, "missing scope");

// 	};

// 	self.scenario = function (dialect, scope) {
// 		assert(dialect, "missing dialect");
// 		assert(scope, "missing scope");

// 	};

// 	self.annotations = function (dialect, annotations, scope) {}

// 	debug("understands files & folders - v%s", pkg.version);
// 	return self;
// }
