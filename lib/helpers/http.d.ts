export declare class HTTP {
    static _cookies: any;
    constructor();
    static cookies(name?: string): any;
    static getClientAddress(req: any): any;
    static authorize(request: any, agent: any): string;
    static bearer(request: any, token: string): string;
    static client_credentials(agent: any, done: Function): void;
    static url(resource: string, options: any, target: any): string;
    static proxyURL(cmd: any, options: any): void;
    static command(method: string, resource: string, options: any, target: any): any;
    static handleResponse(vars: any, done: Function): (error: any, response: any) => any;
    static download(self: any, file: string, done: Function): (error: string, response: any) => void;
    static isRawPEM(pem: string): boolean;
    static certificate(request: any, cert: any, options: any, rootDir: string): {
        agentOptions: {
            key: string;
            cert: string;
            ca: string;
            passphrase: string;
        };
        requestCert: boolean;
        strictSSL: boolean;
        rejectUnauthorized: boolean;
    };
    static detectContentType(payload: string): "json" | "xml" | "string";
    static parse(payload: string): any;
    static detectFileType(file: string): string;
    static header(request: any, name: string, value: string): any;
    static findInPath(body: any, path: string): any;
    /**
     * @return {boolean}
     */
    static IsStatusCodeXX(statusXX: any, statusCode: number): boolean;
}
