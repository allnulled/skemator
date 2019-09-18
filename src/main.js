if(typeof global === "object" && typeof process !== "undefined") {
	module.exports = require("./skemator.js");
} else 
if(typeof window === "object" && typeof navigator === "object") {
	window.Skemator = require("./skemator.browser.js");
}