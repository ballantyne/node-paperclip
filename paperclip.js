// This file could probably be split into several classes that have related methods 
// but there is a lot of this/self and things would have to be rewritten. 
//
// Making this file into more classes would make it easier to write the code to 
// process different kinds of files.  This was just a first attempt to put together 
// the necessary code to make the very basic functions of paperclip working.
// I am very ok with suggestions and contributions that would extend the functionality
// and make in more complete compared to the original paperclip and also other types of
// constructive criticism that would lead to better code.
//
// I haven't written any tests yet, but I hope to to make contributing easier and
// more reliable.  
//
// I tried to make the code possible to extend easily to add other databases and data 
// stores.  If people think there would be a better way to organize that code then 
// please let me know.  This was just something that I thought that I needed for a project
// that turned out to be something that I thought other people might find useful.  This code 
// certainly isn't perfect and it also isn't finished.

const klass              = require('klass');
const fs                 = require('fs');
const request            = require('request');
const async              = require('async');
const Handlebars         = require('handlebars');
const crypto             = require('crypto');
const _                  = require('underscore');
const randomstring       = require('randomstring');
const pluralize          = require('pluralize');
const stream             = require('stream');
const sharp              = require('sharp');

const storage            = require('./storage');
const processors         = require('./processors');
const Geometry           = require('./geometry');

var declare = function(method, args) {
  var watch = [];
  var should_print       = (watch.indexOf(method) > -1)
  if (should_print) {
    console.log('');
    if (args) {
      console.log(method, args);
    } else {
      console.log(method);
    }
  }
}

module.exports           = klass(function(options) {
  declare('initialize', options);
  
  this.has_attached_file = options.has_attached_file;
  this.plural            = pluralize(options.has_attached_file);
  
  if (options.document) {
    this.document        = options.document;
  }
  if (options.class_name) {
    this.class_name      = options.class_name;
  }
  this.styles            = options.styles;

  this.attachment        = (options.attachment ? options.attachment : options.has_attached_file);

  if (options.name_format) {
    this.name_format     = options.name_format;
  }

  if (options.prefix) {
    this.prefix          = options.prefix;
  }

  if (options.url && this.url.indexOf('hash_digest') > -1) {
    this.hash_digest     = this.generateHash()  
  }

  if (options.storage) {
    this.storage         = options.storage;
    this.fileSystem      = storage[options.storage];
  } else {
    this.storage         = 's3';
    this.fileSystem      = storage.s3;
  }

}).methods({

  toSave: function(save) {
    save.updated_at      = new Date();
    delete save.stream;
    delete save.path;
    delete save.buffer;
    delete save.path;
    delete save.extension;
    delete save.left;
    delete save.top; 
    
    return save;
  },

  // I don't think that this function is currently used.  I planned to use it to download 
  // files from the internet on before save so that you could pass a url to the model and
  // it would download and then upload it to your app.  That code isn't written yet.  I 
  // this that that code would want to download the file in the middleware so that all of 
  // the other processes are the same, but maybe that isn't a good idea.
  downloadUrl: function(uri, filename, next) {
    declare('downloadUrl', arguments);
    request.head(uri, function(err, res, body){
      request(uri).pipe(fs.createWriteStream(filename)).on('close', next);
    });
  },

  generateHash: function() {
    declare('generateHash');
    return crypto.createHmac('sha256', this.class_name).update(this.document._id).digest('hex'); 
  },

  originalNameToExt: function() {
    declare('originalNameToExt');
    var name             = this.document[this.has_attached_file].original_name
    var ext              = name.split('.').pop();
    return ext;
  },

  contentTypeToExt: function() {
    declare('contentTypeToExt');
    switch(this.document[this.has_attached_file].content_type) {
      case 'image/jpeg':
        return 'jpg';
      case 'image/png':
        return 'png';
      case 'image/gif':
        return 'gif';
    }
  },

  identifyDataToExtension: function() {
    declare('identifyDataToExtension');
    switch(this.data.format) {
      case 'JPEG':
	return 'jpg';
      case 'PNG':
	return 'png';
      case 'GIF':
	return 'gif';
    }
  }, 

  detectExtension: function() {
    declare('detectExtension');
    if (this.file && this.file.extension) {
      return this.file.extension;
    } else if (this.data && this.data.format) {
      return this.identifyDataToExtension();
    } else if (this.document && this.document[this.has_attached_file] && 
               this.document[this.has_attached_file].content_type) {
      return this.contentTypeToExt();
    } else if (this.document && this.document[this.has_attached_file] && 
               this.document[this.has_attached_file].original_name) {
      return this.originalNameToExt()
    }
  },

  identify: function(next) {
    declare('identify');
    var self             = this;
    var image            = sharp(self.file.buffer);
    image.metadata().then(function(data) {
      self.data          = data;
      if (next) {
        next(null, data);
      }
    })
  },

  generatePrefix: function() {
    declare('generatePrefix');
    if (this.prefix) {
      return this.prefix;
    } else {
      if (this.class_name == undefined) {
        this.class_name  = changeCase.snakeCase(this.document.contructor.modelName);
      }
      return '{{class_name}}/{{plural}}/{{document._id}}' 
    }
  },

  generateFileName: function() {
    declare('generateFileName');
    if (this.name_format) {
      return this.name_format;
    } else {
      return '{{style}}.{{extension}}';
    }
  },

  renderPrefix: function() {
    declare('renderPrefix');
    var template         = Handlebars.compile(this.generatePrefix());
    return template(this);
  },

  renderFileName: function(options) {
    declare('renderFileName', options);
    var template         = Handlebars.compile(this.generateFileName());
    return template(options);
  },

  render: function(options) {
    declare('render', options);
    if (options.extension == undefined) {
      options.extension  = this.detectExtension()
      options.extension  = options.extension.toLowerCase();
    }
    return this.renderPrefix() + "/" + this.renderFileName(options);
  },

  // currently not used.  was going to use it to delete temp files, but the library 
  // is configured to only use buffers by default and so I didn't take the time
  // to write the code to delete temp files.
  eraseFile: function(file, next) {
    declare('eraseFile', file);
    fs.unlink(file, function(err) {
      next(err);
    })
  },

  // currently not used.  was planning on using this function to download files from
  // s3 to reprocess them if the sizes change, but I haven't rewritten that code yet.
  download: function(key, path, next) {
    declare('download', {key: key, path: path});
    this.fileSystem.get(key, function(err, data) {
      fs.writeFile(path, data, function(err) {
        if (err) {
          console.log(err);
        }
        next(err, data); 
      });
    });
  },

  upload: function(key, data, next) {
    declare('upload', key);
    this.fileSystem.put(key, data, function(err, data) {
      if (err) {
        console.log(err);
      }
      next(err, data); 
    });
  },

  // I don't think that this function is used anymore because the default is a buffer 
  // and I stopped using imagemagick because sharp can take a buffer so we never have 
  // to write the file to the disk at all which will be really nice when using this on
  // platforms like heroku.
  uploadFile: function(path, key, next) {
    declare('uploadFile', {path: path, key: key});
    var self     = this;
    fs.readFile(path, function(err, data) {
      self.upload(key, data, function(err, data) {
        if (err) {
          console.log(err);
        }
        next(err, data); 
      });
    });
  },

  processUpload: function(next) {
    declare('processUpload');
    var self     = this;
    var results  = [];
    this.identify(function() {
      _.each(self.styles, function(style) {
        self.processAndUpload(style, function(err, result) {
	  results.push(result);
          if (_.keys(_.last(self.styles))[0] == _.keys(style)[0]) {
            next(err, results);
          }
        })
      });  
    });
  },

  processDelete: function(next) {
    declare('processDelete');
    var self             = this;
    var results          = [];
    _.each(self.styles, function(style) {
      self.deleteStyle(style, function(err, result) {
	results.push(result);
	if (_.keys(_.last(self.styles))[0] == _.keys(style)[0]) {
	  next(err, results);
	}
      })
    });  
  },

  // this is currently not used.  It is to process a url that is saved to a model and download
  // that file and prepare the parameters to save.  I am not sure where the best place to put 
  // this code, I was thinking of adding it to the middleware.
  processUrl: function(next) {
    declare('processUrl');
    var self             = this;
    var obj              = {};
    obj.path             = '/tmp/' + randomstring.generate();
    obj.original_name    = this.document[this.has_attached_file].original_url.split('/').pop();

    this.downloadUrl(this.document.original_url, obj.path, function() {
      self.identify({input: obj.path}, function(err, identity) {
        fs.stat(obj.path, function(err, stats) {
          obj.file_size = stats.size;
          obj.content_type = 'image/'+identity.format.toLowerCase();
          next(err, obj);
        })      
      })
    });
  },


  transform: function(options, next) {
    declare('transform', options);
    var self             = this;
    
    var processor = new processors.resize(this);
    processor.process(options, function(err, buffer) {
      if (next) {
        next(err, buffer);
      }   
    })
  },

  processOriginal: function(key, next) {
    var self = this;
    if (self.file.path) {
      self.fileSystem.stream(self.file.stream, key, function(err, result) {
        fs.unlink(self.file.path, function(err) {
          next(null, options);
        })
      });
    } else {
      self.upload(key, self.file.buffer, function(err, result) {
        next();
      });
    }
  },


  processAndUpload: function(style, next) {
    declare('processAndUpload', style);
    var self             = this;

    var name             = _.first(_.keys(style));
    var options          = style[name];
    var key              = this.render({style: name});
    
    if (name == 'original') {
      self.processOriginal(key, function() {
        next(null, options);
      });
    } else {
      // experimenting with streams
      // self.processAndStream(key, options, function(err, result) {
      //   next(null, options);
      // })
      
      self.transform(options, function(err, buffer) {
	self.upload(key, buffer, function(err, result) {
	  next(null, options);
	});
      });
    }
  },

  // experiementing with streams
  processAndStream: function(key, options, next) {
    declare('processAndStream', options);
    var self             = this;
    
    console.log(self);

    var upload           = new stream.PassThrough();
    var tmpWriteStream      = '/tmp/'+randomstring.generate();
    var processor        = new processors.resize(this);

    self.fileSystem.stream(self.file.stream.pipe(processor.stream(options)).pipe(upload.pipe(fs.createWriteStream(tmpWriteStream))), key, function(err, result) {
      next(err, result);
    })
  },

  deleteStyle: function(style, next) {
    declare('deleteStyle', style);
    var self             = this;
    var name             = _.first(_.keys(style));
    var key              = this.render({style: name, extension: this.contentTypeToExt() });

    this.fileSystem.delete(key, function(err, result) {
      next(result);
    });
  }

});

