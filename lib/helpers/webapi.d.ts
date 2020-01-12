export declare class WebAPI {
    static EXT_TO_MIME: any;
    static ext2mime(file: string): any;
    static uploadFormFile(request: any, file: string, done: Function): void;
    static setFormField(request: any, name: string, value: string): any;
    static uploadFile(request: any, file: string, done: Function): void;
    static uploadFileByType(request: any, file: string, type: string, done: Function): void;
}
