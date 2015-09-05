const request = require('request');
const cheerio = require('cheerio');
const config = require('config');

function League() {
}
League.prototype.getLeaderboard = function(fn) {
  leagueConfig = config.get('league');
  request.get({uri: leagueConfig.url, jar: true}, function(err, response, page) {
    $ = cheerio.load(page);
    var csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
    request.post({
      uri: leagueConfig.url + 'accounts/login/',
      form: {
        username: leagueConfig.username,
        password: leagueConfig.password,
        csrfmiddlewaretoken: csrfToken
      },
      jar: true,
      followAllRedirects: true
    }, function(err, response, page) {
      request.get({uri: leagueConfig.url + 'league/' + leagueConfig.leagueId + '/standings/', jar: true}, function(err, response, page) {
        var leaderboard = [];
        $ = cheerio.load(page);
        $("tr").each(function() {
          $this = $(this);
          var name = $this.find("td:nth-child(3)").text();
          if (name) {
            var score = $this.find("td:nth-child(5)").text();
           leaderboard.push({name: name, totalScore: score});
          }
        });
        fn(leaderboard);
      });
    });
  });
};

module.exports = League;
