const klass    = require('klass');
const Geometry = require('../geometry');
const sharp    = require('sharp');

module.exports = klass(function(paperclip) {
  this.paperclip = paperclip;
}).methods({


  process: function(options, next) {
    var self         = this.paperclip;

    var geometry     = new Geometry({width: self.data.width, height: self.data.height})
    var strategy     = geometry.strategy(options);
    var image        = sharp((self.file.buffer ? self.file.buffer : self.file.path));

    switch(strategy.resize.modifier) {
      case '!':
        image = image.resize(strategy.resize.width, strategy.resize.height).ignoreAspectRatio();
        break;
      case '#':
        image = image.resize(strategy.resize.width, strategy.resize.height).crop(sharp.strategy.attention);
        break;
      case '>':
        image = image.resize(strategy.resize.width, strategy.resize.height).max();
        break;
      case '<':
        image = image.resize(strategy.resize.width, strategy.resize.height).min();
        break;
      default:
        image = image.resize(strategy.resize.width, strategy.resize.height);
    }

    if (strategy.extract) {
      image   = image.extract(strategy.extract);
    }

    image.toBuffer(function(err, outputBuffer) {
      if (err) {
        throw err;
      }
      if (next) {
        next(err, outputBuffer);
      }
    });
  }
})
