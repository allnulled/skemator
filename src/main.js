if(typeof window === "object" && typeof navigator === "object" && typeof HTMLElement === "function") {
	window.Skemator = require("./skemator.browser.js");
} else if(typeof global === "object" && typeof process !== "undefined") {
	module.exports = require("./skemator.js");
}