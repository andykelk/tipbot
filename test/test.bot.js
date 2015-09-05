describe('Bot', function() {
  var Bot = require('../main.js');
  it('load', function(){
    var Bot = require('../bot.js');

    test
      .function(Bot)
        .hasName('Bot')
      .object(Bot())
        .isInstanceOf(Bot)
    ;
  });
});
