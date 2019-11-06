/**
 * Recursively walk a directory asynchronously and obtain all file names (with full path).
 *
 * @param dir Folder name you want to recursively process
 * @param done Callback function, returns all files with full path.
 * @param filter Optional filter to specify which files to include,
 *   e.g. for json files: (f: string) => /.json$/.test(f)
 * @see https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search/50345475#50345475
 */
export declare class walker {
    static walk(dir: string, done: (err: Error | null, results?: string[]) => void, filter?: (f: string) => boolean): void;
}
