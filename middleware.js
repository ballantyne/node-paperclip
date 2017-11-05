
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
    var fileSystem = storage.s3;
  }

  return function(req, res, next) {
    // console.log(req.headers);
    // console.log('');
  
    var files = {};

    var busboy = new Busboy({ headers: req.headers });
    console.log(req.headers);
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      
      var new_file = {
        content_type: mimetype,
        original_name: filename,
        file_size: 0,
        extension: filename.split('.').pop()
      };
      // new_file.original_upload = fileSystem.generateKey(fieldname, filename)
      new_file.buffer = [];
 
      file.on('data', function(data) {
        var buffer = new Buffer(data);
        new_file.file_size += data.length;
        new_file.buffer.push(buffer);

      });

      // fileSystem.stream(new_file.original_upload, file);
   
      file.on('end', function() {
        new_file.buffer = Buffer.concat(new_file.buffer);
        files[fieldname] = new_file;
      });
    });

    busboy.on('field', function (fieldname, val) {
      req.body[fieldname] = val;
    });

    busboy.on('finish', function() {
      _.extend(req.body, files);
      next();
    });

    req.pipe(busboy);
  }
}


