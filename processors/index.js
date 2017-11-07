var loader     = require('../loader');
var processors = { resize: require('./resize') };
module.exports.load = loader('resize', processors);
