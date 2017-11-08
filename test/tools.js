var path         = require('path');

const fileType   = require('file-type');
const fs         = require('fs');


module.exports.upload = function(filename) {
  if (filename == undefined) filename = 'cst.jpg';

  var file             = {};
  file.original_name   = filename;
  file.stream          = fs.createReadStream(path.join(__dirname, 'data', filename));
  file.buffer          = fs.readFileSync(path.join(__dirname, 'data', filename));
  file.content_type    = fileType(file.buffer);
  file.file_size       = file.buffer.length;

  return file;
}
