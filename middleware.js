// There has to be a way to combine the parser and the transpose middleware functions,
// but I am unaware of how to do that.  I was hoping to figure that out before
// I put this on github, but I probably won't spend a lot of time on that in the near future.  
// If anyone has suggestions as to how to do that or how this code could be better, 
// please let me know and feel free to submit a pull request with code that would make
// those improvements.

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

  var files = {};

  return function(req, res, next) {
    var busboy = new Busboy({ headers: req.headers });

    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      
      var new_file = {
        content_type: mimetype,
        original_name: filename,
        file_size: 0,
        extension: filename.split('.').pop(),
        buffer: []
      };
 
      file.on('data', function(data) {
        var buffer = new Buffer(data);
        new_file.file_size += data.length;
        new_file.buffer.push(buffer);
      });

    
      file.on('end', function() {
        new_file.buffer = Buffer.concat(files[fieldname].buffer);
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


