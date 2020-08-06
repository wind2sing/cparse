const { loadCheerio, parse } = require("../index.js");
const html = `<html><head></head><body><h2 class="title welcome">Hello there!</h2><ul id="fruits">
<li class="apple">Apple</li>
<li class="orange">Orange</li>
<li class="pear">Pear</li></ul>
<ul id="number">
<li class="apple">123</li>
<li class="orange">sdf8989</li>
<li class="pear">344</li></ul>
<a class="next" href="/?page=2">Next page 2023-01-04</a>
</body></html>`;

test("loadCheerio", () => {
  const $ = loadCheerio(html, null, "https://example.com");
  expect($).toBeTruthy();
  expect($("h2").text()).toEqual("Hello there!");
  expect($("a.next").attr("href")).toEqual("https://example.com/?page=2");
});

test("parse-filters", () => {
  const $ = loadCheerio(html);
  expect($("a").attr("href")).toEqual("/?page=2");
  expect(parse("a.next | date:UTC", $)).toEqual(new Date("2023-01-04"));
  expect(parse("[#number li | int]", $)).toEqual([123, 8989, 344]);
});
