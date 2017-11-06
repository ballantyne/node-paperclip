
const express            = require('express');
const router             = express.Router();
const fs                 = require('fs');
const multer             = require('multer')
const Busboy             = require('busboy');
const crypto             = require('crypto');
const _                  = require('underscore');
const storage            = require('./storage');

module.exports.assets    = function(options) {
  
  if (options == undefined) {
    options = {}
    if (options.templates == undefined) {
      options.templates = 'handlebars';
    }
  }

  router.get('/assets/paperclip.js', function(req, res) {
    res.sendFile(__dirname + "/scripts/" + options.templates + ".js")  
  })

  return router;

}

module.exports.parse          = function(options) {
  if (options == undefined) options = {};

  if (options.storage) {
    var fileSystem = storage[options.storage];
  } else {
    var fileSystem = storage.file;
  }

  if (options.writeIf == undefined) {
    options.writeIf = 5000000;
  }

  return function(req, res, next) {
  
    var files = {};

    var busboy = new Busboy({ headers: req.headers });
    
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      var largeFile = (req.headers['content-length']) > options.writeIf;
 
      var new_file = {
        content_type: mimetype,
        original_name: filename,
        file_size: 0,
        extension: filename.split('.').pop(),
        stream: file
      };

      if (largeFile) {      
        new_file.path = fileSystem.generateKey(fieldname, filename);
        fileSystem.stream(new_file.original_upload, file);
      }
      new_file.buffer = [];
 
      file.on('data', function(data) {
        var buffer = new Buffer(data);
        new_file.file_size += data.length;
        new_file.buffer.push(buffer);

      });

   
      file.on('end', function() {
        new_file.buffer = Buffer.concat(new_file.buffer);
        files[fieldname] = new_file;
      });
    });

    busboy.on('field', function (fieldname, val) {
      req.body[fieldname] = val;
    });

    busboy.on('finish', function() {
      console.log(files);
      _.extend(req.body, files);
      next();
    });

    req.pipe(busboy);
  }
}


