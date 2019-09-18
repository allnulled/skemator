if(typeof global === "object" && typeof process !== "undefined") {
	require("./skemator.js");
} else 
if(typeof window === "object" && typeof navigator === "object") {
	require("./skemator.browser.js");
}