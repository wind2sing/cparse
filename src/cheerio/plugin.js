function switchAttr(el, attr, $) {
  attr = attr || "text";
  switch (attr) {
    case "html":
      return $(el).html();
    case "outerHtml":
      return $.html(el);
    case "text":
      return $(el).text();
    case "string":
      return $(el).string();
    case "nextNode":
      return $(el).nextNode();
    default:
      return $(el).attr(attr);
  }
}

const plus = {
  string() {
    return this.contents()
      .filter((_, el) => el.type == "text")
      .text();
  },
  nextNode() {
    const el = this.get(0);
    if (el) return el.nextSibling.nodeValue;
  },
  extract(attr) {
    attr = attr || "text";
    const el = this.get(0);
    if (el) return switchAttr(el, attr, this.constructor);
  },
  extractAll(attr) {
    attr = attr || "text";
    return this.map((_, el) => {
      return switchAttr(el, attr, this.constructor);
    }).get();
  }
};
function plugin($) {
  for (const [key, value] of Object.entries(plus)) $.prototype[key] = value;
}

module.exports = plugin;
