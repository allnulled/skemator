const { assert, expect } = require("chai");

describe("Skemator class", function() {
	this.timeout(10*1000);
	it("is a class", function(pass) {
		const Skemator = require(__dirname + "/../src/main.js");
		expect(typeof Skemator).to.equal("function");
		pass();
	});
});
