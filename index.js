const path                         = require('path');

module.exports.storage             = require(path.join(__dirname, 'storage'));
module.exports.paperclip           = require(path.join(__dirname, 'paperclip'));
module.exports.middleware          = require(path.join(__dirname, 'middleware'));
module.exports.plugins             = require(path.join(__dirname, 'adapters', 'index'));
module.exports.logger              = require(path.join(__dirname, 'logger'));
module.exports.class               = require(path.join(__dirname, 'class'));
