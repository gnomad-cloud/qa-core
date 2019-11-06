export declare class Vars {
    static $(source: string, ctx: any): any;
    static scope(scope: any): any;
    static uuid(uid: string): any;
    static capitalize(text: string): string;
    static sanitize(txt: string, subst: string): string;
    static findNamed(scope: any, name: string): any;
    static findInPath(body: any, path: string): any;
    static findAllInPath(body: any, path: string): {}[];
    static find(scope: any, name: string): any;
    static synonym(model: any, synoyms: any): boolean;
    static leaking(key: string): void;
    static split(s: string): string[];
    static get(o: any, s: string): any;
    static set(o: any, s: string, v: any): any;
    static env(prefix: string, env: any, config: any): any;
    static clean(mess: any): any;
}
