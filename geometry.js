// code adapted from https://github.com/thoughtbot/paperclip
//

const klass         = require('klass');
const fs            = require('fs');

const Parser        = require('./parser');
const Detector      = require('./geometry_detector');

const EXIF_ROTATED_ORIENTATION_VALUES = [5, 6, 7, 8];

var Geometry = klass(function(width, height, modifier) {

  if (typeof(width) == 'object') {
    var options      = width;
    this.height      = options.height;
    this.width       = options.width;
    this.modifier    = options.modifier;
    this.orientation = options.orientation;
  } else {
    this.width    = width;
    this.height   = height;
    this.modifier = modifier;
  }

}).statics({
  
  from_file: function(file_name, next) {
    new Detector(file_name).make(function(err, geometry) {
      var geometry = new Geometry(geometry);
      if (next) {
        next(err, geometry);
      } else {
        console.log('err:', err);
        console.log('geometry:', geometry);
      }
    });
  },

  parse: function(string) {
    var parser = new Parser(string).match();
    return new Geometry(parser);
  }

}).methods({
  
  square:            function() {
    return this.height == this.width;
  },
  
  horizontal:        function() {
    return this.height > this.width;
  },
  
  vertical:          function() {
    return this.height < this.width;
  },
  
  aspect:            function() {
    return this.height / this.width;
  },
  
  smaller:           function() {
    return  Math.min(this.height, this.width);
  },
  
  larger:            function() {
    return  Math.max(this.height, this.width);
  },

  auto_orient:       function() {
    if (EXIF_ROTATED_ORIENTATION_VALUES.indexOf(this.orientation) > -1) {
      var h = this.height;
      var w = this.width;
      this.height = w;
      this.width = h;
      this.orientation -= 4;
    };
  },
  
  to_s: function() {
    var s = ""
    
    if (this.width > 0) {
      s += this.width.toString();
    }

    if (this.height > 0) {
      s += "x" + this.height.toString();
    }

    if (this.modifier) {
      s += this.modifier.toString();
    }
    return s;
  },

  strategy: function(dst) {
    var self = this;
    var crop         = (dst.modifer == '#' ? true : false);
    var new_geometry = new Geometry(dst);

    switch(new_geometry.modifier) {
      case '!':
        return { resize: new_geometry, extract: null };
      case '#':
        return self.transformation_to(new_geometry, crop);
      case '>':
        return { resize: self.resize_to(new_geometry), extract: null };
      case '<':
        return { resize: self.resize_to(new_geometry), extract: null };
      default: 
        return { resize: self.scale_to(new_geometry),  extract: null };
    }  
  },

  // These are the original functions that would decide the correct way to modify
  // the image.  I am not sure how much of them to keep and how much to add to the 
  // strategy function above.  It seems like the resize_to function and the strategy 
  // function are very similar and could be merged.  I haven't really spent a lot of 
  // time looking over the original code to see how it is all tied together.  
  //
  // If there are any suggestions as to how to better organize this code, please 
  // let me know and submit a pull request if you are feeling particularly
  // generous.
  //
  transformation_to: function(dst, crop) {
    var self = this;

    if (crop == undefined) {
      crop   = false;
    }
    
    if (crop) {
      var ratio = new Geometry(dst.width / self.width, dst.height / self.height);
 
      var scaling_result        = this.scaling(dst, ratio);
      var scale_geometry        = scaling_result[0];
      var scale                 = scaling_result[1];
      var crop_geometry         = this.cropping(dst, ratio, scale);

    } else {
      var scale_geometry = new Geometry(dst);
    }
    return { resize: scale_geometry, extract: crop_geometry }
  },

  resize_to:         function(geometry) {
    var self = this;
    
    if (typeof geometry == 'string') {
      var new_geometry = Geometry.parse(geometry);
    } else {
      var new_geometry = new Geometry(geometry);
    }

    switch(new_geometry.modifier) {
      case '!':
        return new_geometry;
      case '#':
        return new_geometry;
      case '<':
        if (new_geometry.width >= self.width && new_geometry.height >= self.height) {
          return self;
        } else {
          return self.scale_to(new_geometry);
        }
      case '>':
        if (new_geometry.width <= self.width || new_geometry.height <= self.height) {
          return self;
        } else {
          return self.scale_to(new_geometry);
        }
      default: 
        return self.scale_to(new_geometry);
    }
  },
  
  scaling:           function(dst, ratio) {
    if (typeof ratio == 'object') {
      ratio = new Geometry(ratio);
    }

    if (ratio.horizontal() || ratio.square()) {
      return [{width: dst.width, height: null}, ratio.width]
    } else {
      return [{width: null, height: dst.height}, ratio.height]
    }
  },

  cropping:          function(dst, ratio, scale) {
    var self = this;
    if (typeof ratio == 'object') {
      ratio = new Geometry(ratio);
    }
    if (ratio.horizontal() || ratio.square()) {
      return {width: dst.width, height: dst.height, left: 0, top: ((self.height * scale - dst.height) / 2)} 
    } else {
      return {width: dst.width, height: dst.height, left: ((self.width * scale - dst.width) / 2), top: 0}
    }
  },
  
  scale_to:          function(new_geometry) {
    var self = this;
    var scale = Math.min((new_geometry.width / self.width), (new_geometry.height / self.height));
    return new Geometry(Math.round(self.width * scale), Math.round(self.height * scale));
  }

});

module.exports = Geometry;

