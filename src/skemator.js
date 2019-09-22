const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const chokidar = require("chokidar");
const plantuml = require("node-plantuml");
const exec = require("execute-command-sync");
const SkematorParser = require(__dirname + "/skemator.parser.js");
const BookmatorParser = require(__dirname + "/bookmator.parser.js");

class Skemator {
	static get DEFAULT_OPTIONS() {
		return {
			title: true,
			index: false,
			watch: false,
			verbose: false,
		};
	}
	static log(opts, ...msgs) {
		if(opts.verbose) {
			console.log(...msgs);
		}
	}
	static get Parser() {
		return SkematorParser;
	}
	static get BookParser() {
		return BookmatorParser;
	}
	static getSelectedFiles(filePatterns) {
		return new Promise((resolve, reject) => {
			let allFiles = [].concat(filePatterns).reduce((result, file) => {
				return result.concat(path.resolve(file));
			}, []);
			glob(allFiles.join("|"), {}, (err, files) => {
				if (err) {
					return reject(err);
				}
				return resolve(files);
			});
		});
	}
	static watch(optParams) {
		const opts = Object.assign({}, this.DEFAULT_OPTIONS, optParams);
		const { files, command } = opts;
		const opts2 = {...opts};
		delete opts2.watch;
		chokidar.watch(files).on("change", (file, fstat) => {
			this.log(opts, "[skemator] a file changed, skemator working... " + file);
			try {
				this[command]({ 
					...opts2,
					files: [file]
				});
			} catch(error) {
				console.log(opts, error);
			}
		});
	}
	static compile(optParams) {
		const opts = Object.assign({}, this.DEFAULT_OPTIONS, optParams);
		return new Promise((resolve, reject) => {
			const {
				files,
				pdf,
				png,
				mmd,
				svg
			} = opts;
			let isDone = false;
			const done = (data = undefined) => {
				if(isDone === false) {
					isDone = true;
					if(opts.watch) {
						this.watch(opts);
					}
					return resolve(data);
				}
			};
			this.getSelectedFiles(files).then(selectedFiles => {
				if(selectedFiles.length === 0) {
					this.log(opts, "[*] No files found as skemator.");
					return done(selectedFiles);
				}
				this.log(opts, "[*] Files found:");
				selectedFiles.forEach((file,index) => this.log(opts, `[*] - (${index+1}) ${file}`));
				let filesDone = 0;
				selectedFiles.forEach(file => {
					fs.readFile(file, "utf8", (error, contents) => {
						let output;
						try {
							output = this.Parser.parse(contents);
						} catch (err) {
							throw err;
						}
						const st = JSON.stringify;
						const fileSinExtension = file.replace(/\.skm$/g, "");
						const fileMmd = fileSinExtension + ".mmd";
						const fileExecutable = path.join("node_modules", ".bin", "mmdc");
						fs.writeFileSync(fileMmd, output.mmd, "utf8");
						if (pdf) {
							const filePdf = fileSinExtension + ".pdf";
							exec(`${st(fileExecutable)} -i ${st(fileMmd)} -o ${st(filePdf)}`, {
								cwd: path.resolve(__dirname + "/..")
							});
						}
						if (png) {
							const filePng = fileSinExtension + ".png";
							exec(`${st(fileExecutable)} -i ${st(fileMmd)} -o ${st(filePng)}`, {
								cwd: path.resolve(__dirname + "/..")
							});
						}
						if (svg) {
							const fileSvg = fileSinExtension + ".svg";
							exec(`${st(fileExecutable)} -i ${st(fileMmd)} -o ${st(fileSvg)}`, {
								cwd: path.resolve(__dirname + "/..")
							});
						}
						filesDone++;
						if(filesDone === selectedFiles.length) {
							return done(selectedFiles);
						}
					});
				});
			});
		});
	}
	static compileUML(optParams) {
		const opts = Object.assign({}, this.DEFAULT_OPTIONS, optParams);
		const { files } = opts;
		return new Promise((resolve, reject) => {
			let isDone = false;
			const done = (data = undefined) => {
				if(isDone === false) {
					isDone = true;
					if(opts.watch) {
						this.watch(opts);
					}
					return resolve(data);
				}
			};
			let filesDone = 0;
			this.getSelectedFiles(files).then(selectedFiles => {
				if(selectedFiles.length === 0) {
					this.log(opts, "[*] No files found as uml.");
					return done(selectedFiles);
				}
				this.log(opts, "[*] Files found:");
				selectedFiles.forEach((file,index) => this.log(opts, `[*] - (${index+1}) ${file}`));
				selectedFiles.forEach(file => {
					const filename = file.replace(/\.(plant)?uml/g, ".png");
					const fileStream = fs.createWriteStream(filename);
					const generator = plantuml.generate(file, {
						format:"png",
						charset: "utf8"
					});
					const chunks = [];
					generator.out.on("data", (chunk) => {
						fileStream.write(chunk, "utf16le");
					});
					generator.out.on("end", () => {
						fileStream.end();
						filesDone++;
						if(filesDone === files.length) {
							return done(files);
						}
					});
				});
			});
		});
	}
	static toIndexTitle(file) {
		return path.basename(file).replace(/\.md/g, "").replace(/^[0-9][0-9]+\./g, "");
	}
	static compileBook(optParams) {
		const opts = Object.assign({}, this.DEFAULT_OPTIONS, optParams);
		const { file } = opts;
		const indexFile = file;
		if(!fs.existsSync(indexFile)) {
			throw new Error("Unique argument <file> must be an existing filepath.");
		}
		const filepath = path.resolve(indexFile);
		if(path.basename(filepath) !== "index.md") {
			throw new Error("Unique argument <file> must be a 'index.md' filepath.");
		}
		const hasIndex = directory => {
			const indexPath = path.resolve(directory, "index.md");
			return fs.existsSync(indexPath) && fs.lstatSync(indexPath).isFile();
		};
		return new Promise((resolve, reject) => {
			const done = (...args) => {
				if(opts.watch) {
					this.watch(Object.assign(opts, {files: file}));
				}
				return resolve(...args);
			};
			const processFile = (file) => {
				let out = "";
				const isMarkdown = path.extname(file) !== ".md";
				const filename = path.basename(file);
				const isIndex = filename === "index.md";
				const directory = path.dirname(file);
				if(filename === "book.md") {
					return out;
				}
				if(opts.index || opts.title) {
					out += `## ${!isIndex ? this.toIndexTitle(filename) : this.toIndexTitle(path.basename(directory))}\n\n`;
				}
				if(opts.index && isIndex) {
					const titles = [];
					fs.readdirSync(directory).forEach(nodename => {
						if(nodename === "index.md") return;
						const node = path.resolve(directory, nodename);
						const isFile = fs.existsSync(node) && fs.lstatSync(node).isFile();
						const title = this.toIndexTitle(node);
						if(isFile && path.extname(node) === "md") {
							titles.push(title);
						} else if(!isFile) {
							const innerIndex = path.resolve(node, "index.md");
							const isFileInnerIndex = fs.existsSync(innerIndex) && fs.lstatSync(innerIndex).isFile();
							if(innerIndex && isFileInnerIndex) {
								titles.push(title);
							}
						}
					});
					if(titles.length) {
						out += " - " + titles.join("\n - ") + "\n\n";
					}
				}
				out += fs.readFileSync(file).toString();
				if(isIndex) {
					fs.readdirSync(directory).forEach(otherFile => {
						if(otherFile === "index.md") {
							return;
						}
						const otherFilePath = path.resolve(directory, otherFile);
						const isDirectory = fs.existsSync(otherFilePath) && fs.lstatSync(otherFilePath).isDirectory();
						if(!isDirectory && isMarkdown) {
							out += "\n\n" + processFile(otherFilePath);
						} else if(hasIndex(otherFilePath)) {
							out += "\n\n" + processFile(path.resolve(otherFilePath, "index.md"));
						}
					});
				}
				return out;
			};
			this.compileUML({
				files: [
					path.dirname(filepath) + "/**/*.uml",
					path.dirname(filepath) + "/**/*.plantuml"
				]
			});
			this.compile({
				files: path.dirname(filepath) + "/**/*.skm",
				png: true,
			});
			const contents = processFile(filepath);
			const filedest = path.resolve(path.dirname(filepath), "book" + ".md");
			fs.writeFileSync(filedest, contents, "utf8");
			return done();
		});
	}
	static createBook(optParams) {
		const opts = Object.assign({}, this.DEFAULT_OPTIONS, optParams);
		const { folder } = opts;
		const folderDst = path.resolve(folder);
		const folderDstIndex = path.resolve(folderDst, "index.md");
		const hasIndex = fs.existsSync(folderDstIndex) && fs.lstatSync(folderDstIndex).isFile();
		const createPath = (...p) => path.resolve(folderDst, ...p);
		return new Promise((resolve, reject) => {
			const done = () => {
				if(opts.watch && opts.script) {
					this.watch({...opts, files: [opts.script]});
				}
				return resolve();
			};
			if(!hasIndex) {
				fs.outputFileSync(folderDstIndex, "", "utf8");
			}
			if(opts.script) {
				const scriptSrc = path.resolve(opts.script);
				const scriptContents = fs.readFileSync(scriptSrc).toString();
				let ast = undefined;
				try {
					ast = this.BookParser.parse(scriptContents);
				} catch(error) {
					// @handle error.
					throw error;
				}
				ast.nodes.forEach(node => {
					const indexPath = createPath(node.file.replace("@/", ""));
					fs.outputFileSync(indexPath, node.contents, "utf8");
				});
				return done();
			} else {
				fs.outputFileSync(createPath("index.md"), "## " + this.toIndexTitle(folderDst), "utf8");
				return done();
			}
		});
	}
}

module.exports = Skemator;