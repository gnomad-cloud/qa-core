"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const engine_1 = require("./engine");
const common_1 = require("./dialect/common");
const processes_1 = require("./dialect/processes");
const files_1 = require("./dialect/files");
const variables_1 = require("./dialect/variables");
const scripting_1 = require("./dialect/scripting");
const webapi_1 = require("./dialect/webapi");
const certs_1 = require("./dialect/certs");
const tcp_1 = require("./dialect/tcp");
let engine = new engine_1.Engine({ started: Date.now });
new certs_1.X509Dialect(engine);
new common_1.CommonDialect(engine);
new files_1.FilesDialect(engine);
new processes_1.ProcessesDialect(engine);
new scripting_1.ScriptingDialect(engine);
new tcp_1.TCPDialect(engine);
new variables_1.VarsDialect(engine);
new webapi_1.WebAPIDialect(engine);
// Scenario: testing
// given I am testing
// given I set hello to world
// given I execute console.log('hello world');
// Scenario: exec
// given I run ls
// given I exec ls
// given I mkdir tmp/tests
// given I enable redirects
// when I GET https://google.com
// then status code is 200
// Scenario: final
// when I dump name
engine.run(`
feature: featuring
Scenario: test1
given I am testing1
given I set hello to world
given I mkdir tmp/tests
when I dump name

Scenario: test
given I am testing2
when I dump name
then I fail with prejudice
`).then((results) => {
    console.log("success: %o", results.passed());
}).catch((results) => {
    console.log("finished!: %o", results.passed());
});
//# sourceMappingURL=start.js.map