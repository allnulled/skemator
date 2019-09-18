const mermaid = require("mermaid");
const SkematorParser = require("./skemator.browser.parser.js");

class Skemator {
	static fromSkematorToSvg(skm, tag) {
		mermaid.initialize({
			startOnLoad: true,
			flowchart: {
				useMaxWidth: true,
				htmlLabels: true,
				curve: "basis",
			},
			securityLevel: "loose",
		});
		const mmdSource = SkematorParser.parse(skm).mmd;
		return new Promise((resolve, reject) => {
			mermaid.render(tag.replace(/^\#/g,""), mmdSource, svgSource => {
				resolve(svgSource);
			});
		});
	}
}

module.exports = Skemator;