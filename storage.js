const path      = require('path');
var loader      = require(path.resolve(__dirname, 'loader'));
var fileSystems = { file: require('node-paperclip-file') };

var load = loader('file', fileSystems);
module.exports.load = load;
module.exports.file = fileSystems['file'];
