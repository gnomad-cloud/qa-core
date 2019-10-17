

import { Engine } from "./engine";
import { ResultSet } from "./results";
import { CommonDialect } from "./dialect/common";
import { ProcessesDialect } from "./dialect/processes";
import { FilesDialect } from "./dialect/files";
import { VarsDialect } from "./dialect/variables";
import { ScriptingDialect } from "./dialect/scripting";
import { WebAPIDialect } from "./dialect/webapi";
import { X509Dialect } from "./dialect/certs";
import { TCPDialect } from "./dialect/tcp";

let engine = new Engine({ started: Date.now });

new X509Dialect(engine);
new CommonDialect(engine);
new FilesDialect(engine);
new ProcessesDialect(engine);
new ScriptingDialect(engine);
new TCPDialect(engine);
new VarsDialect(engine);
new WebAPIDialect(engine);


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
`
).then((results: ResultSet) => {
    console.log("success: %o", results.passed());
}).catch((results: ResultSet) => {
    console.log("finished!: %o", results.passed());

});
