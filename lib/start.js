"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
const results_1 = require("./results");
const common_1 = require("./dialect/common");
const processes_1 = require("./dialect/processes");
const files_1 = require("./dialect/files");
const variables_1 = require("./dialect/variables");
const scripting_1 = require("./dialect/scripting");
const webapi_1 = require("./dialect/webapi");
const certs_1 = require("./dialect/certs");
const tcp_1 = require("./dialect/tcp");
let engine = new engine_1.Engine({ started: Date.now() });
new certs_1.X509Dialect(engine);
new common_1.CommonDialect(engine);
new files_1.FilesDialect(engine);
new processes_1.ProcessesDialect(engine);
new scripting_1.ScriptingDialect(engine);
new tcp_1.TCPDialect(engine);
new variables_1.VarsDialect(engine);
new webapi_1.WebAPIDialect(engine);
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
`).then((_results) => {
    console.log("success");
}).catch((err) => {
    console.log("FAILED! %o", err instanceof results_1.StepError);
});
//# sourceMappingURL=start.js.map