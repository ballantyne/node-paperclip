// code adapted from https://github.com/thoughtbot/paperclip
//
// I'm planning on using objects rather than strings hopefully, so this
// is more just for convienience in case people used to paperclip want to
// use the original way of configuration.

const klass    = require('klass');
const Geometry = require('./geometry');
const PARSER   = new RegExp(/\b(\d*)x?(\d*)\b(?:,(\d?))?(\@\>|\>\@|[\>\<\#\@\%^!])?/i);

module.exports = klass(function(string) {

  this.string  = string;

}).methods({
  
  make: function() {
    return new Geometry(this);
  },

  match: function() {
    var m            = this.string.match(PARSER);
    this.width       = parseInt(m[1]);
    this.height      = parseInt(m[2]);
    this.orientation = (m[3] == '' ? undefined : m[3]);
    this.modifier    = m[4];
    return this;
  }

})
