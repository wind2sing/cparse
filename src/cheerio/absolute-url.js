var url = require('url');

module.exports = function(responseUrl, $) {
  var parseUrl = url.parse(responseUrl);

  $('a').each(function() {
    //Change links
    var href = $(this).attr('href');
    $(this).attr('href', replacelink(href, parseUrl));
  });

  $('img').each(function() {
    //Change images
    var src = $(this).attr('src');
    $(this).attr('src', replacelink(src, parseUrl));
  });

  $('link').each(function() {
    //Change css
    var href = $(this).attr('href');
    $(this).attr('href', replacelink(href, parseUrl));
  });

  $('script').each(function() {
    //Change scripts
    var src = $(this).attr('src');
    $(this).attr('src', replacelink(src, parseUrl));
  });
};

function replacelink(path, fromUrl) {
  if (typeof path == 'string') {
    return url.resolve(fromUrl, path);
  } else {
    return path;
  }
}
