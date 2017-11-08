const os                    = require('os');
const path                  = require('path');
const express               = require('express');
const router                = express.Router();
const fs                    = require('fs');
const Busboy                = require('busboy');
const crypto                = require('crypto');
const _                     = require('underscore');
const storage               = require(path.join(__dirname, 'storage'));

module.exports.assets       = function(options) {
  
  if (options == undefined) {
    options                 = {}
    if (options.templates == undefined) {
      options.templates = 'handlebars';
    }
  }

  router.get('/assets/paperclip.js', function(req, res) {
    res.sendFile(__dirname + "/scripts/" + options.templates + ".js")  
  })

  return router;

}

module.exports.parse        = function(options) {

  if (options == undefined) options = {};
  
  var storageOptions        = { verbose_methods: options.verbose_methods, 
                                has_attached_file: options.has_attached_file }; 


  if (options.storage) {
    var Storage             = storage.load(options.storage);
    var fileSystem          = new Storage(storageOptions);
  } else {
    var Storage             = storage.load('file'); 
    var fileSystem          = new Storage(storageOptions);
  }

  var threshold;
  if (options.threshold == undefined) {
    threshold               = 50000000;
  } else {
    threshold               = options.threshold;
  }

  return function(req, res, next) {
  
    var files               = {};
    var completedFiles      = [];
    var startedFiles        = [];
    var busboy              = new Busboy({ headers: req.headers });
    var fields             = {};

    busboy.on('file', function(field, file, filename, encoding, mimetype) {
      var largeFile = ((threshold != false && (req.headers['content-length'] > threshold)) ? true : false);
      startedFiles.push(field);
 
      files[field] = {
        content_type: mimetype,
        original_name: filename,
        file_size: 0
      };

      if (options.stream) {
        files[field].stream            = file;
      }

      if (largeFile || options.stream) {     
        if (options.has_attached_file == undefined) {
          storageOptions.has_attached_file = field;
          fileSystem                       = new Storage(storageOptions);
        }
 
        files[field].path              = fileSystem.generateKey(field, filename);
        fileSystem.stream(file, files[field].path);
      }

      files[field].buffer              = [];
 
      file.on('data', function(data) {
        var buffer          = new Buffer(data);
        files[field].file_size += data.length;
        files[field].buffer.push(buffer);
      });
   
      file.on('end', function() {
        if (files[field]) {
          files[field].buffer            = Buffer.concat(files[field].buffer);
        }
        completedFiles.push(field);
      });
    });

    busboy.on('field', function (fieldname, val) {
     if (fields == undefined) fields = {};
      fields[field]                  = val;
    });

    busboy.on('finish', function() {

      if (startedFiles.length == completedFiles.length) {
	var body = {};
        
        if (_.keys(files).length > 0) {
	  _.extend(body, files);
	}

        _.extend(body, fields);
        var keys = _.keys(body);
        _.each(keys, function(key) {   
          if (key.indexOf('[') > -1) {
            var matches = key.match(/(.+)\[(.+)\]/)
            var class_name = matches[1];
            var field = matches[2];  
            if (req.body[class_name] == undefined) req.body[class_name] = {};
            req.body[class_name][field] = body[key];
          } else {
            req.body[key] = body[key]
          }
          
          if (_.last(keys) == key) {
            next();
          }
        })
        
      }
    });

    req.pipe(busboy);
  }
}

