//html
console.html = function(html) {
	var inline = ["a", "abbr", "acronym", "audio", "b", "bdi", "bdo", "big", "br", "button", "canvas", "cite", "code", "data", "datalist", "del", "dfn", "em", "embed", "i", "iframe", "img", "input", "ins", "kbd", "label", "map", "mark", "meter", "noscript", "object", "output", "picture", "progress", "q", "ruby", "s", "samp", "script", "select", "slot", "small", "span", "strong", "sub", "sup", "svg", "template", "textarea", "time", "u", "tt", "var", "video", "wbr"];
	var block = ["address", "article", "aside", "blockquote", "details", "dialog", "dd", "div", "dl", "dt", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hgroup", "hr", "li", "main", "nav", "ol", "p", "pre", "section", "table", "ul"];

	var styles = [];

	html = html.replace(/&nbsp;/gm, " ");

	html = html.replace(/<(.*?)>/gmi, (match, tag) => {
		tag = tag.toLowerCase();
		var text = "";

		if(block.includes(tag)) {
			//console.log(tag);
			text += "\n";
		}

		if(tag == "i") {
			text += "%c";
			styles.push("font-style: italic;");
		}

		return text;
	});

	this.log(html, ...styles);
}

console.html(`<ol><li>I can't stay up and watch this movie. &nbsp; &nbsp; &nbsp; &nbsp;<i>I wish I .....</i></li><li>It isn't sunny today. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <i>I wish it......</i></li><li>I don't have enough money to buy a coffee. &nbsp; &nbsp;<i>I wish I.......</i></li><li>I live in a really ugly city. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <i>I wish I........</i></li><li>I share my bedroom with my brother. &nbsp; &nbsp; &nbsp; <i>I wish I.......</i></li></ol>`);