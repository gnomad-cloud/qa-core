

import { Engine } from "./engine";
import { ResultSet, StepError } from "./results";
import { CommonDialect } from "./dialect/common";
import { ProcessesDialect } from "./dialect/processes";
import { FilesDialect } from "./dialect/files";
import { VarsDialect } from "./dialect/variables";
import { ScriptingDialect } from "./dialect/scripting";
import { WebAPIDialect } from "./dialect/webapi";
import { X509Dialect } from "./dialect/certs";
import { TCPDialect } from "./dialect/tcp";

let engine = new Engine({ started: Date.now() });

new X509Dialect(engine);
new CommonDialect(engine);
new FilesDialect(engine);
new ProcessesDialect(engine);
new ScriptingDialect(engine);
new TCPDialect(engine);
new VarsDialect(engine);
new WebAPIDialect(engine);


engine.run(`
feature: featuring
Scenario: test1
given I am testing1
given I set hello to world
given I mkdir tmp/tests
then I dump step

Scenario: test
given I am testing2
then I dump this
then I fail with prejudice
`
).then((_results: ResultSet) => {
    console.log("success");
}).catch((err: any) => {
    console.log("FAILED! %o", err instanceof StepError );

});
