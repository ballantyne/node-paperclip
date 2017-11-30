const os                      = require('os');
const path                    = require('path');
const klass                   = require('klass');
const fs                      = require('fs');
const request                 = require('request');
const Handlebars              = require('handlebars');
const crypto                  = require('crypto');
const _                       = require('underscore');
const randomstring            = require('randomstring');
const changeCase              = require('change-case');
const pluralize               = require('pluralize');
const fileType                = require('file-type');

const storage                 = require(path.join(__dirname, 'storage'));
const tasks                   = require(path.join(__dirname, 'tasks'));
const TypeUtils               = require(path.join(__dirname, 'type_utilities'));

module.exports                = klass(function(class_name, name, paperclip) {
  this.file_name              = name
  
  this.paperclip              = paperclip;
  this.class_name             = class_name;
  var Storage                 = storage.load(this.file().storage);
  this.fileSystem             = new Storage(this.file());

  if (this.file().styles == undefined) {
    this.file('styles', [{original: true }]);
  }

}).methods({
  attributes: function() {

    if (this.file().parameterize_field != undefined) {
      var parameterize = changeCase.paramCase(this.class().document[this.parameterize_field])
    }

    var attrs = {plural: pluralize(this.file_name), class_name: this.class_name, attachment: this.file_name, 
      document: this.class().document, parameterize: parameterize}


    if (this.file().hash_field) {
      attrs.hash_digest = this.generateHash(this.file().hash_field); 
    }


    return attrs;

  },

  class: function(file) {
    if (file != undefined) {
      this.paperclip[this.class_name][file] = val;
    } else {
      return this.paperclip[this.class_name];
    }
  },
  
  file: function(attr, val) {
    if (attr != undefined) {
      if (val != undefined) {  
        this.paperclip[this.class_name][this.file_name][attr] = val;
      } else {
        return this.paperclip[this.class_name][attr];
      }
    } else {
      return this.paperclip[this.class_name][this.file_name];
    }
  },

  fileDocument: function(attr) {
    if (attr == undefined) attr = this.file_name;
    return this.class().document[attr]
  },

  generateHash: function(field) {
    return crypto.createHmac('sha256', this.class_name).update(this.class().document[field]).digest('hex'); 
  },

  contentTypeToExt: function(name) {
    var self = this;
    return TypeUtils.extFromMimeType(self.fileDocument().content_type);
  },

  identify: function(next) {
    var self                  = this;
    var type                  = fileType(self.file().file.buffer);
    self.file('data', type);
    next(null, type);
  },

  generatePrefix: function() {
    if (this.file().prefix) {
      return this.file().prefix;
    } else {
      if (this.class_name == undefined) {
        this.class_name       = changeCase.snakeCase(this.class().document.contructor.modelName);
      }
      if (this.file().storage == 'file') {
        return path.join('{{class_name}}','{{plural}}','{{document._id}}');
      } else {
        return '{{class_name}}/{{plural}}/{{document._id}}';
      }
    }
  },

  generateFileName: function() {
    if (this.name_format) {
      return this.file().name_format;
    } else {
      return '{{style}}.{{extension}}';
    }
  },

  renderPrefix: function(options) {
    var template              = Handlebars.compile(this.generatePrefix());
    return template(options);
  },

  renderFileName: function(options) {
    var template              = Handlebars.compile(this.generateFileName());
    return template(options);
  },

  render: function(options) {
    var key = path.join(this.renderPrefix(options) , this.renderFileName(options));
    return key;
  },

  thumbnail: function(style) {
    var renderOptions         = this.attributes();
    renderOptions.style       = style;
    renderOptions.extension   = this.contentTypeToExt();
    return this.render(renderOptions);
  },


  // currently not used.  was planning on using this function to download files from
  // s3 to reprocess them if the sizes change, but I haven't rewritten that code yet.
  download: function(key, path, next) {
    this.fileSystem.get(key, function(err, data) {
      fs.writeFile(path, data, function(err) {
        if (err) {
          console.log(err);
        }
        next(err, data); 
      });
    });
  },

  beforeSave: function(next) {
    var self                  = this;
    var count                 = 0;
    var results               = {};
    if (self.file().before_save == undefined || self.file().before_save.length == 0) {
      next(null, results);
    } else {
      _.each(self.file().before_save, function(options) {
        var Task              = ((typeof options.task == 'string') ? task.load(options.task) : options.task)
        var task              = new Task(self);
        task.perform(options, function(err, result) {
          _.extend(results, result);
          count += 1;
          if (self.file().before_save.length == count) {
            next(err, results);
          }
        })  
      });  
    
    }
  },

  configureTransformTasks: function(opts) {
    var pendingTasks;
    if (opts.task == undefined) {
      var resize              = _.clone(opts);
      var convert             = _.clone(opts);
      resize.task             = 'resize-image';
      convert.task            = 'convert-image';
      pendingTasks            = [resize, convert];
    } else {
      var pendingTask         = _.clone(opts);
      if (typeof opts.task == 'array') {
        pendingTasks          = opts.task;
      } else {
        pendingTasks          = [pendingTask];
      }
    } 

    return pendingTasks;
  },

  transform: function(opts, next) {
    var self                  = this;

    var count                 = 0;
    var buffer                = Buffer.from(self.file().file.buffer);
    var pendingTasks          = self.configureTransformTasks(opts);
    
    if (pendingTasks.length == 0) {
      next(null, buffer);
    } else {
      _.each(pendingTasks, function(options) {

        var Task                = tasks.load(options.task);
        var task                = new Task(self);
        task.buffer             = buffer;

        task.perform(options, function(err, outputBuffer) {
          count += 1;
          buffer                = outputBuffer;
          if (pendingTasks.length == count) {
            next(err, buffer);
          }
        })  
      })  
    }
  },

  afterSave: function(next) {
    var self                  = this;
    var results               = [];
    this.identify(function() {
      _.each(self.file().styles, function(style) {
        self.transformAndUpload(style, function(err, result) {
	  results.push(result);
          if (_.first(_.keys(_.last(self.file().styles))) == _.first(_.keys(style))) {
            next(err, results);
          }
        })
      });  
    });
  },

  afterRemove: function(next) {
    var self = this;
    var results               = [];
    _.each(self.file().styles, function(style) {
      self.deleteStyle(style, function(err, result) {
	results.push(result);
	if (_.first(_.keys(_.last(self.styles))) == _.first(_.keys(style))) {
	  next(err, results);
	}
      })
    });  
  },

  // this is currently not used.  It is to download a url that is saved to a model and download
  // that file and prepare the parameters to save.  I am not sure where the best place to put 
  // this code, I was thinking of adding it to the middleware.
  onUrl: function(next) {
    var self = this;
    var obj                   = {};
    obj.path                  = path.join(os.tmpdir,  randomstring.generate());
    obj.original_name         = self.document[self.has_attached_file].original_url.split('/').pop();

    this.downloadUrl(self.document[self.has_attached_file].original_url, obj.path, function() {
      self.identify({input: obj.path}, function(err, identity) {
        fs.stat(obj.path, function(err, stats) {
          obj.file_size       = stats.size;
          obj.content_type    = 'image/'+identity.format.toLowerCase();
          next(err, obj);
        })      
      })
    });
  },

  saveOriginal: function(key, next) {
    var self = this;

    if (self.file().file.path) {
      self.fileSystem.stream(self.file().file.path, key, function(err, result) {
        fs.unlink(self.file().file.path, function(err) {
          next();
        });
      });
    } else {
      self.fileSystem.put(key, Buffer.from(self.file().file.buffer), function(err, result) {
        next();
      });
    }
  },
  
  getTransformOptions: function(style, next) {
    var stylename             = _.first(_.keys(style));
    var options               = style[stylename];
    var renderOptions         = this.attributes();
    renderOptions.style       = stylename;
    renderOptions.extension   = this.contentTypeToExt();
    next(null, stylename, options, renderOptions);
  },

  transformAndUpload: function(style, next) {
    var self                = this;
    self.getTransformOptions(style, function(err, stylename, options, renderOptions) {
      if (stylename == 'original') {
       self.saveOriginal(self.render(renderOptions), function() {
          next(null, options);
        });
      } else {
        self.transform(options, function(err, buffer) {
          if (options.store != undefined && options.store == false) {
            next(null, options);
          } else {
            self.fileSystem.put(self.render(renderOptions), buffer, function(err, result) {
              next(null, options);
            });
          }
        });
      }
    })
  },

  deleteStyle: function(style, next) {
    var self                = this;
    self.getTransformOptions(style, function(err, name, options, renderOptions) {
      self.fileSystem.delete(self.render(renderOptions), function(err, result) {
        next(result);
      });
    });
  }

})
