
const plus = {
  string() {
    return this.contents()
      .filter((_, el) => el.type == 'text')
      .text();
  },
  nextNode() {
    const el = this.get(0);
    if (el) return el.nextSibling.nodeValue;
  },
  extract(attr) {
    attr = attr || 'text';
    const el = this.get(0);
    if (el) {
      switch (attr) {
      case 'html':
        return this.eq(0).html();
      case 'outerHtml':
        return this.constructor.html(el);
      case 'text':
        return this.eq(0).text();
      case 'string':
        return this.eq(0).string();
      case 'nextNode':
        return this.eq(0).nextNode();
      default:
        return this.eq(0).attr(attr);
      }
    }
  },
  extractAll(attr) {
    attr = attr || 'text';
    return this.map((i, el) => {
      const $el = this.eq(i);
      switch (attr) {
      case 'html':
        return $el.html();
      case 'outerHtml':
        return this.constructor.html(el);
      case 'text':
        return $el.text();
      case 'string':
        return $el.string();
      case 'nextNode':
        return $el.nextNode();
      default:
        return $el.attr(attr);
      }
    }).get();
  }
};
function plugin($) {
  // 在cheerio 1.0+中，需要检查prototype是否存在
  if ($ && $.prototype) {
    for (const [key, value] of Object.entries(plus)) {
      $.prototype[key] = value;
    }
  }
}

module.exports = plugin;
