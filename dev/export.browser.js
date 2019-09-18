//const fs = require("fs");
//const path = require("path");
//const file = path.resolve(__dirname + "/../src/skemator.browser.parser.js");

//const contents = fs.readFileSync(file).toString();
//const output = contents.replace(/module\.exports[\n\r\t ]*\=[\n\r\t ]*\{[\n\r\t ]*SyntaxError\:[\n\r\t ]*peg\$SyntaxError,[\n\r\t ]*parse\:[\n\r\t ]*peg\$parse[\n\r\t ]*\};/gi, `export default {SyntaxError:peg\$SyntaxError,parse:peg\$parse};`);
//fs.writeFileSync(file, output, "utf8");