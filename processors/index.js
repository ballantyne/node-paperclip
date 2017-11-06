var crypto     = require('crypto');
var processors = { resize: require('./resize') };


var generateUniqueName = function(func) {
  var string = func;
  if (typeof string == 'function') {
    string = string.toString;
  }
  return crypto.createHmac('sha256', 'function')
    .update(string)
    .digest('hex');
}


module.exports.load = function(processor) {
  if (processor == undefined) {
    processor = 'resize';
  }  
  
  if (typeof processor == 'function') {
    var func = processor;
    var processor = generateUniqueName(func);
    processors[processor] = func; 
  }

  
  if (processors[processor] == undefined) {
    processors[processor] = require(processor);
  }
  return processors[processor];
}
