const Slack = require('slack-client');
const config = require('config');

var League = require('./league');
var Tips = require('./tips');

function Bot() {
  this.slackConfig = config.get('slack');
  this.slack = new Slack(this.slackConfig.token, true, true);
  this.league = new League();
  this.tips = new Tips();
}

Bot.prototype.login = function() {
  that = this;
  this.slack.on('open', this.onClientOpened);
  this.slack.on('message', this.handleMessage);
  this.slack.login();
};

Bot.prototype.onClientOpened = function (){
  var channels = Object.keys(that.slack.channels)
      .map(function (k) { return that.slack.channels[k]; })
      .filter(function (c) { return c.is_member; })
      .map(function (c) { return c.name; });

  var groups = Object.keys(that.slack.groups)
      .map(function (k) { return that.slack.groups[k]; })
      .filter(function (g) { return g.is_open && !g.is_archived; })
      .map(function (g) { return g.name; });

  console.log('Welcome to Slack. You are ' + that.slack.self.name + ' of ' + that.slack.team.name);

  if (channels.length > 0) {
      console.log('You are in: ' + channels.join(', '));
  }
  else {
      console.log('You are not in any channels.');
  }

  if (groups.length > 0) {
     console.log('As well as: ' + groups.join(', '));
  }
};

Bot.prototype.handleMessage = function (message) {
  var channel = that.slack.getChannelGroupOrDMByID(message.channel);
  var user = that.slack.getUserByID(message.user);

  if (Bot.isDirect(that.slack.self.id, message)) {
    if (found = message.text.match(/\btop (\d+)\b/i)) {
      console.log(channel.name + ':' + user.name + ':' + message.text);
      that.league.getLeaderboard(function(leaderboard) {
        message = "Here's the current top " + found[1]  + ":\n";
        message += leaderboard.slice(0,parseInt(found[1]))
          .map(function(obj) {
            return obj.name + ' with ' + obj.totalScore + ' points';
          })
          .join("\n");
        channel.send(message);
      });
    }
    else if (found = message.text.match(/\bbottom (\d+)\b/i)) {
      console.log(channel.name + ':' + user.name + ':' + message.text);
      that.league.getLeaderboard(function(leaderboard) {
        message = "Here's the current bottom " + found[1] + ":\n";
        message += leaderboard.slice(parseInt('-' + found[1]))
          .map(function(obj) {
            return obj.name + ' with ' + obj.totalScore + ' points';
          })
          .join("\n");
        channel.send(message);
      });
    }
    else if (message.text.match(/\bleague\b/i)) {
      console.log(channel.name + ':' + user.name + ':' + message.text);
      that.league.getLeaderboard(function(leaderboard) {
        message = "Here's the current league:\n";
        message += leaderboard.map(function(obj) {
            return obj.name + ' with ' + obj.totalScore + ' points';
          })
          .join("\n");
        channel.send(message);
      });
    }
    else if (message.text.match(/\btips\b/i)) {
      console.log(channel.name + ':' + user.name + ':' + message.text);
      that.tips.getTips(function(tip) {
        message = "Here's my tip for " + tip.home + " vs. " + tip.away + ": ";
        message += tip.tip;
        channel.send(message);
      });
    }
  }
};

Bot.isDirect = function (userId, message) {
  var mention = '<@' + userId + '>';

  return message.type === 'message'
  && (message.text.indexOf(mention) > -1);
};

module.exports = Bot;
