module.exports.extFromFilename = function(name) {
  var name             = this.document[this.has_attached_file].original_name
    var ext              = name.split('.').pop();
  return ext;
}

module.exports.extFromMimeType = function(mime) {
  switch(mime) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
  }
}

module.exports.extFromIdentify = function(format) {
  switch(format) {
    case 'JPEG':
      return 'jpg';
    case 'PNG':
      return 'png';
    case 'GIF':
      return 'gif';
  }
}

module.exports.isImage = function(mime) {
  return (['image/png', 
           'image/jpg', 
           'image/gif', 
           'image/jpeg', 
           'image/tif', 
           'image/bmp', 
           'image/jp2', 
           'image/jpm',
           'image/jpx'].indexOf(mime) > -1)
}
