const fs = require("fs");
const path = require("path");
const { assert, expect } = require("chai");
const Skemator = require(__dirname + "/../src/skemator.js");
const rimraf = require("rimraf");

class Samples {

	static get ROOT_TEST() {
		return path.resolve(__dirname);
	}

	static get FILES() {
		return {
			skemator1: path.resolve(this.ROOT_TEST, "1/1.skm"),
			skemator2: path.resolve(this.ROOT_TEST, "2/2.skm"),
			skemator3: path.resolve(this.ROOT_TEST, "3/3.skm"),
			skemator4: path.resolve(this.ROOT_TEST, "4/4.skm"),
			skematorSection1: path.resolve(this.ROOT_TEST, "section1"),
			skematorBook1: path.resolve(this.ROOT_TEST, "book1/index.md"),
			skematorBook2: path.resolve(this.ROOT_TEST, "book2/index.md"),
			skematorBook2Script: path.resolve(this.ROOT_TEST, "book2/book2.bkm"),
			skematorBook2Folder: path.resolve(this.ROOT_TEST, "book2"),
			skematorBook2Generated: path.resolve(this.ROOT_TEST, "book2/Book"),
			skematorBook3: path.resolve(this.ROOT_TEST, "book3/index.md"),
			skematorBook3Folder: path.resolve(this.ROOT_TEST, "book3"),
			skematorUml1: path.resolve(this.ROOT_TEST, "uml1/ejemplo1.uml"),
			skematorReadmeExample: path.resolve(this.ROOT_TEST, "example.skm"),
			skematorReadmeExamplePng: path.resolve(this.ROOT_TEST, "example.png"),
		};
	}

	static getContents(file) {
		return fs.readFileSync(this.FILES[file]).toString();
	}

	static clearAll() {
		rimraf.sync(__dirname + "/**/*.mmd");
		rimraf.sync(__dirname + "/**/*.png");
		rimraf.sync(__dirname + "/**/book.md");
		rimraf.sync(Samples.FILES.skematorBook3Folder);
		rimraf.sync(Samples.FILES.skematorBook2Generated);
		rimraf.sync(Samples.FILES.skematorBook3);
	}
}

describe("Skemator class", function() {
	this.timeout(10*1000);
	before(Samples.clearAll);
	it("can compile *.skm files as png image", function(pass) {
		const diagram = Samples.FILES.skemator1.replace(/\.skm$/g,".mmd");
		expect(fs.existsSync(diagram)).to.equal(false);
		Skemator.compile({files:[Samples.FILES.skemator1]}).then(files => {
			expect(fs.existsSync(diagram)).to.equal(true);
			return pass();
		}).catch(error => {throw error});
	});
	it("can compile *.plantuml files as png image", function(pass) {
		const umlimage = Samples.FILES.skematorUml1.replace(/\.(plant)?uml$/g,".png");
		expect(fs.existsSync(umlimage)).to.equal(false);
		Skemator.compileUML({files:[Samples.FILES.skematorUml1]}).then(files => {
			expect(fs.existsSync(umlimage)).to.equal(true);
			return pass();
		}).catch(error => {throw error});
	});
	it("can compile index.md file as md book", function(pass) {
		const bookmd = Samples.FILES.skematorBook1.replace(/index\.md$/g,"book.md");
		expect(fs.existsSync(bookmd)).to.equal(false);
		Skemator.compileBook({file:Samples.FILES.skematorBook1}).then(files => {
			expect(fs.existsSync(bookmd)).to.equal(true);
			return pass();
		}).catch(error => {throw error});
	});
	it("can create a new book [from script]", function(pass) {
		expect(fs.existsSync(Samples.FILES.skematorBook2Generated)).to.equal(false);
		Skemator.createBook({folder:Samples.FILES.skematorBook2Folder,script:Samples.FILES.skematorBook2Script}).then(files => {
			expect(fs.existsSync(Samples.FILES.skematorBook2Generated)).to.equal(true);
			return pass();
		}).catch(error => {throw error});
	});
	it("can compile the book (created from the script in the previous test)", function(pass) {
		const bookmd = Samples.FILES.skematorBook2Folder + "/book.md";
		const indexmd = Samples.FILES.skematorBook2;
		expect(fs.existsSync(bookmd)).to.equal(false);
		Skemator.compileBook({file:indexmd}).then(files => {
			expect(fs.existsSync(bookmd)).to.equal(true);
			return pass();
		}).catch(error => {throw error});
	});
	it("can create a new book [from name]", function(pass) {
		const indexmd = Samples.FILES.skematorBook3;
		expect(fs.existsSync(Samples.FILES.skematorBook3)).equals(false);
		Skemator.createBook({folder:Samples.FILES.skematorBook3Folder}).then(files => {
			expect(fs.existsSync(Samples.FILES.skematorBook3)).equals(true);
			return pass();
		}).catch(error => {throw error});
	});
	it("can compile the book (created from the name in the previous test)", function(pass) {
		const bookmd = Samples.FILES.skematorBook3Folder + "/book.md";
		const indexmd = Samples.FILES.skematorBook3;
		expect(fs.existsSync(bookmd)).to.equal(false);
		Skemator.compileBook({file:indexmd}).then(files => {
			expect(fs.existsSync(bookmd)).to.equal(true);
			return pass();
		}).catch(error => {throw error});
	});
	it("can generate the png for the README example of skm", function(pass) {
		const examplepng = Samples.FILES.skematorReadmeExamplePng;
		const exampleskm = Samples.FILES.skematorReadmeExample;
		expect(fs.existsSync(examplepng)).to.equal(false);
		Skemator.compile({files:exampleskm,png:true,index:true}).then(files => {
			expect(fs.existsSync(examplepng)).to.equal(true);
			return pass();
		}).catch(error => {throw error});
	});
});

