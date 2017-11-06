const klass    = require('klass');
const Geometry = require('../geometry');
const sharp    = require('sharp');
const Jimp     = require('jimp')

module.exports = klass(function(paperclip) {
  this.paperclip = paperclip;
}).methods({

  process: function(options, next) {
    var self = this;

    var geometry     = new Geometry({width: self.paperclip.data.width, height: self.paperclip.data.height})
    var strategy     = geometry.strategy(options);
    var image        = sharp((self.paperclip.file.buffer ? self.paperclip.file.buffer : self.paperclip.file.path));

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
      self.convert(outputBuffer, self.paperclip.file.content_type, options.extension, function(err, buffer) {
	if (next) {
	  next(err, buffer);
	}
      })
    });
  },

  convert: function(buffer, currentMime, target, next) {
    var mime;

    if (target == 'png') {
      mime = Jimp.MIME_PNG;
    }

    if (target == 'jpg') {
      mime = Jimp.MIME_JPG;
    }

    if (target == 'bmp') {
      mime = Jimp.MIME_BMP;
    }   

 
    if (target != undefined && (['jpg', 'png', 'bmp'].indexOf(target) > -1) && mime != currentMime) {
      Jimp.read(buffer, function (err, image) {
	image.getBuffer(mime, function(err, buffer) {
	  next(err, buffer);
	});
      }); 
    } else {
      next(null, buffer);
    }
  }
})
