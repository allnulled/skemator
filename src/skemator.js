const fs = require("fs");
const path = require("path");
const glob = require("glob");
const chokidar = require("chokidar");
const SkematorParser = require(__dirname + "/skemator.parser.js");
const exec = require("execute-command-sync");

class Skemator {
	static get Parser() {
		return SkematorParser;
	}
	static getSelectedFiles(filePatterns) {
		let allFiles = [];
		filePatterns.forEach(file => {
			allFiles = allFiles.concat(glob.sync(path.resolve(file)));
		});
		console.log("[*] Found files: " + allFiles.length);
		return allFiles;
	}
	static compile(opts) {
		const { files, pdf, png, mmd, svg } = opts;
		const selectedFiles = this.getSelectedFiles(files);
		selectedFiles.forEach(file => {
			const contents = fs.readFileSync(file).toString();
			let output;
			try {
				output = this.Parser.parse(contents);
			} catch(err) {
				console.log("Error parsing:", err);
				throw err;
			}
			const st = JSON.stringify;
			const fileSinExtension = file.replace(/\.skm$/g,"");
			const fileMmd = fileSinExtension + ".mmd";
			const fileExecutable = path.join("node_modules",".bin","mmdc");
			fs.writeFileSync(fileMmd, output.mmd, "utf8");
			if(pdf) {
				const filePdf = fileSinExtension + ".pdf";
				exec(`${st(fileExecutable)} -i ${st(fileMmd)} -o ${st(filePdf)}`, {
					cwd: path.resolve(__dirname + "/..")
				});
			}
			if(png) {
				const filePng = fileSinExtension + ".png";
				exec(`${st(fileExecutable)} -i ${st(fileMmd)} -o ${st(filePng)}`, {
					cwd: path.resolve(__dirname + "/..")
				});
			}
			if(svg) {
				const fileSvg = fileSinExtension + ".svg";
				exec(`${st(fileExecutable)} -i ${st(fileMmd)} -o ${st(fileSvg)}`, {
					cwd: path.resolve(__dirname + "/..")
				});
			}
		});
	}
	static watch(opts) {
		const { files, pdf, png, mmd } = opts;
		const selectedFiles = this.getSelectedFiles(files);
		chokidar.watch(selectedFiles).on("all", (event, file) => {
			console.log("[*] Changed file: " + file);
			this.compile({...opts, files:[file]});
		});
	}
}

module.exports = Skemator;