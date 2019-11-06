export declare class TCP {
    static isOpen(hostname: string, port: number, done: Function): void;
    static isClosed(hostname: string, port: number, done: Function): void;
    static getServerCert(hostname: string, port: number, options: any, done: Function): void;
}
