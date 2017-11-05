// code adapted from https://github.com/thoughtbot/paperclip
//

const klass  = require('klass');
const sharp  = require('sharp');
const Parser = require('./parser');


var identifyOrientation = function(orientation) {
  switch(orientation) {
    case 'TopLeft':
      return 1;
    case 'TopRight':
      return 2;
    case 'BottomRight':
      return 3;
    case 'BottomLeft':
      return 4;
    case 'LeftTop':
      return 5;
    case 'RightTop':
      return 6;
    case 'RightBottom':
      return 7;
    case 'LeftBottom':
      return 8;
    default: 
      return orientation;
  }
}

module.exports = klass(function(file) {

  this.file    = file;

}).methods({

  make: function(next) {
    var self   = this;
    var image  = sharp((this.file.buffer ? this.file.buffer : this.file));
    image.metadata().then(function(data) {
      var orientation = identifyOrientation(data.orientation);
      var geometry = {width: data.width, 
                     height: data.height, 
                   modifier: undefined, 
                orientation: orientation}
      if (next) {
        next(null, geometry);
      } else {
        console.log(data);
      }
    })
  }

})

