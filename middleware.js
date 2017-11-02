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

module.exports.parser    = function(options) { 
  
  if (options == undefined) options = {};
  return multer(options);

}

module.exports.transpose = function(req, res, next) {

  var files = [], file;

  if (req.file != undefined) {
    files.push(req.file);
    delete req.file;
  }  

  if (req.files != undefined) {
    files.concat(req.files);
    delete req.files;
  }  
  
  for (i = 0; i < files.length; i++) {
    file = files[i];
    var name           = file.fieldname;
    file.content_type  = file.mimetype;
    file.file_size     = file.size;
    file.original_name = file.originalname;
    file.extension     = file.originalname.split('.').pop();
    
    if (file.destination) {
      delete file.destination;
    }
    
    delete file.originalname;
    delete file.size;
    delete file.encoding;
    delete file.filename;
    delete file.mimetype;
    delete file.fieldname;
    
    req.body[name] = file;
  }

  next();

}
