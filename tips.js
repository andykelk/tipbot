const request = require('request');
const cheerio = require('cheerio');
const config = require('config');

function Tips() {
}

Tips.prototype.getTips = function(fn) {
  tipsConfig = config.get('tips');
  request.get({uri: tipsConfig.url}, function(err, response, page) {
    $ = cheerio.load(page);
    tips = [];
    $("div.lscell").each(function(i, elem) {
      $this = $(this);
      var matchUrl = $this.find("a").attr('href');
      request.get({uri: matchUrl}, function(err, response, page) {
        $ = cheerio.load(page);
        var tip = {
          home: $("div#predcontainer1 div.hometeam span.predteamname").html(),
          away: $("div#predcontainer1 div.awayteam span.predteamname").html(),
          tip:  $("div#predcontainer1 div.pcontent span.predteamname").html().replace('<br>',' '),
        };
        fn(tip);
      });
    });
  });
};

module.exports = Tips;
