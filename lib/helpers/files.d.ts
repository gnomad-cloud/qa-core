export declare class Files {
    static FILE_ENCODING: string;
    static path(dir: string, file: string): any;
    static root(paths: any, path: string, file?: string): any;
    static config(configFile: string | [], options: any): any;
    static load(file: string, options?: any): any;
    static stream(file: string, options?: any): any;
    static save(file: string, data: any): boolean;
    static saveYAML(file: string, data: any): boolean;
    static parse(file: string, onFound: Function): void;
    static convert(file: string, raw: string, onFound: Function): void;
    static mkdirp(path: string): void;
    static rmrf(path: string): void;
    static isDirectory(file: string): boolean;
    static isFolder(file: string): boolean;
    static isFile(file: string): boolean;
    static dirname(file: string): string;
    static basename(file: string): string;
    static extension(path: string): string;
    static matches(path: string, filter: string): boolean;
    static walk(from: string, _filter: string): Promise<string[]>;
    static find(from: string, filter: string, onFound: Function): any;
    static follow(path: string, onFound: Function, allDone?: Function): void;
    static exists(file: string): boolean;
    static size(file: string): any;
}
