const path                    = require('path');
const _                       = require('underscore');
const klass                   = require('klass');
const Class                   = require(path.join(__dirname, 'class'));

module.exports                = klass(function(options) {
  _.extend(this, options);  
}).methods({

  class: function(class_name, name) {
    return new Class(class_name, name, this);
  },

  toSave: function(save) {
    save.updated_at           = new Date();
    delete save.fieldname;
    delete save.stream;
    delete save.path;
    delete save.buffer;
    return save;
  },

  beforeSave: function(class_name, name, next) {
    var self                  = this;
    var c = this.class(class_name, name); 
    c.beforeSave(next)
  },

  afterSave: function(class_name, name, next) {
    var self                  = this;
    var c = this.class(class_name, name) 
    c.afterSave(next)
  },

  afterRemove: function(class_name, name, next) {
    var self = this;
    var c = this.class(class_name, name) 
    c.afterRemove(next)
  },


});
 
