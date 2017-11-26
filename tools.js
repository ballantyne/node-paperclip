const os         = require('os');
const path       = require('path');
const fileType   = require('file-type');
const fs         = require('fs');
const sharp      = require('sharp');
const validUrl   = require('valid-url');
const request    = require('request');
const crypto     = require('crypto');

const TypeUtilities = require(path.join(__dirname, 'type_utilities'));

var uniqueLocation = function(url) {
  var filename     = path.basename(url);
  var extension    = path.extname(filename);
  var hash         = crypto.createHmac('sha256', url).update(filename).digest('hex');
  var key          = path.join(os.tmpdir(), hash)
  var filepath     = path.join(key, filename);
  if (fs.existsSync(key) == false) fs.mkdirSync(key); 
  return filepath;
}


var download = function(url, location, next) {

  if (typeof location == 'function') {
    next = location;
    location = uniqueLocation(url);
  }
   // console.log(location); 
  if (fs.existsSync(location)) {
    next(null, location);
  } else {
    var write = fs.createWriteStream(location);
    write.on('close', function() {
      next(null, location);
    })
    request(url).pipe(write)
  }
}

module.exports.download = download;

var prepareFileObject = function(filepath) {
  var file             = {};
  file.original_name   = path.basename(filepath);
  file.stream          = fs.createReadStream(filepath);
  file.buffer          = fs.readFileSync(filepath);
  file.content_type    = fileType(file.buffer).mime;
  file.file_size       = file.buffer.length;
  return file;
}

module.exports.prepareFileObject = prepareFileObject;

var copyTempFile = function() {
  testFile = path.join(__dirname, 'test', 'data', 'cst.jpg');
  filepath = path.join(os.tmpdir(), 'cst.jpg');
  fs.writeFileSync(filepath, fs.readFileSync(testFile));
  return filepath;
}

module.exports.fromFile = function(filepath, next) {
  var file;
  if (validUrl.isUri(filepath)) {
    if (typeof next == 'undefined') console.error('If the file is a url you must use a callback.');
    
    download(filepath, function(err, location) {
      file = prepareFileObject(location);
      next(err, file);
    })      
  } else {
    
    if (filepath == undefined) filepath = copyTempFile();
    
    file = prepareFileObject(filepath);

    if (next) {
      next(null, file);
    } else {
      return file;
    }
  }
}

module.exports.identify = function(buffer, next) {
  const image = sharp(buffer);
  image
    .metadata()
    .then(function(metadata) {
      next(null, metadata);  
    })
}
