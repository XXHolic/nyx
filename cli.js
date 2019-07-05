#! /usr/bin/env node
const program = require("commander");
const package = require("./package.json");

program.version(package.version);

program.command("ls").description("List all command line");

program.parse(process.argv);

console.info("program.args", program.args);
// 这个是放在 parse 之后值是 [], 放之前是 undefined
if (!program.args.length) {
  program.help();
}
