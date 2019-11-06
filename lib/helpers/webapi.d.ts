export declare class WebAPI {
    static EXT_TO_MIME: any;
    static uploadFormFile(request: any, path: string, filename: string, done: Function): void;
    static setFormField(request: any, name: string, value: string): any;
    static attachFile(request: any, path: string, file: string, done: Function): void;
    static attachFileByType(request: any, path: string, filename: string, type: string, done: Function): void;
}
