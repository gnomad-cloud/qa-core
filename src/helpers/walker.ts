/**
 * Recursively walk a directory asynchronously and obtain all file names (with full path).
 *
 * @param dir Folder name you want to recursively process
 * @param done Callback function, returns all files with full path.
 * @param filter Optional filter to specify which files to include, 
 *   e.g. for json files: (f: string) => /.json$/.test(f)
 * @see https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search/50345475#50345475
 */

import * as fs from "fs";
import * as path from "path";

export class walker {

  static walk(dir: string, done: (err: Error | null, results?: string[]) => void, filter?: (f: string) => boolean ) {
    let results: string[] = [];
    fs.readdir(dir, (err: Error, list: string[]) => {
      if (err) {
        return done(err);
      }
      let pending = list.length;
      if (!pending) {
        return done(null, results);
      }
      list.forEach((file: string) => {
        file = path.resolve(dir, file);
        fs.stat(file, (_err2, stat) => {
          if (stat && stat.isDirectory()) {
            this.walk(file, (_err3, res) => {
              if (res) {
                results = results.concat(res);
              }
              if (!--pending) {
                done(null, results);
              }
            }, filter);
          } else {
            if (typeof filter === 'undefined' || (filter && filter(file))) {
              results.push(file);
            }
            if (!--pending) {
              done(null, results);
            }
          }
        });
      });
    });

}
  };