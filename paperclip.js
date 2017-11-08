const path                    = require('path');
const _                       = require('underscore');
const klass                   = require('klass');
const Class                   = require(path.join(__dirname, 'class'));

module.exports                = klass(function(options) {
  _.extend(this, options);  
}).methods({


  toSave: function(save) {
    save.updated_at           = new Date();
    delete save.stream;
    delete save.path;
    delete save.buffer;
    return save;
  },

  beforeSave: function(class_name, name, next) {
    var self                  = this;
    var c = new Class(class_name, name, this) 
    c.beforeSave(next)
  },

  afterSave: function(class_name, name, next) {
    var self                  = this;
    var c = new Class(class_name, name, this) 
    c.afterSave(next)
  },

  afterRemove: function(class_name, name, next) {
    var self = this;
    var c = new Class(class_name, name, this) 
    c.afterRemove(next)
  },


});
 
