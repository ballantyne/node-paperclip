
const os                      = require('os');
const path                    = require('path');
const klass                   = require('klass');


module.exports = klass(function(name, data) {
  this.uploads = {};
}).methods({
  store: function(name, data) {
    data.fieldname = name;
    this.uploads[name] = data;
  },

  get: function(name) {
    return this.uploads[name];
  }
})

