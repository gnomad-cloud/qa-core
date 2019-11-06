import { Dialect } from "../Dialect";
import { Engine } from "../engine";
export declare class TCPDialect extends Dialect {
    constructor(engine: Engine);
    scope(scope: any): any;
}
