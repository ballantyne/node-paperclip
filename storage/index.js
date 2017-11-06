// I tried to make two examples of how storage could be configured.
// there need to be three functions, stream, put, get and delete.  
//
// STREAM takes a stream or a path to a file to a stream and key which is 
// where you want to put the file.
//
// PUT takes a buffer so you need to have read the file or have the 
// original buffer from the upload.
//
// GET takes a key and returns a buffer.
//
// DELETE takes a key will send a delete command to the api or it will unlink the 
// file on the server.
//
// I think that is probably all that is needed for the storage api for now.
// Maybe in the future we should add functions that can issue bulk commands.
// I noticed in the sequelize api documentation that there are hooks that
// will operate on bulk commands and I believe that there are probably storage 
// apis that also can respond to bulk commands, so if there is a thoughtful 
// way to implement that please let me know or submit a pull request.
//
//

var loader      = require('../loader');
var fileSystems = { s3: require('./s3'), file: require('./file') };

module.exports.load = loader('s3', fileSystems);

module.exports.s3   = fileSystems['s3'];
module.exports.file = fileSystems['file'];
