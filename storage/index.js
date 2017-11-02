// I tried to make two examples of how storage could be configured.
// there need to be three functions, put, get and delete.  
//
// PUT takes a buffer so you need to have read the file or have the 
// original buffer from the upload.
//
// GET returns a buffer.
//
// DELETE will send a delete command to the api or it will unlink the 
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


module.exports.s3   = require('./s3');
module.exports.file = require('./file');
