
var path                = require('path');
var loader              = require(path.join(__dirname, '..', 'loader'));
var load                = loader();
module.exports.load     = load;

module.exports.mongoose = require(path.join(__dirname, 'mongoose'));;
