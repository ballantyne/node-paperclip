var resize = require('./resize');
var processors = {};

module.exports.load = function(processor) {
  if (processor == undefined) {
    processor = 'resize';
    processors['resize'] = resize; 
  }  
  
  if (processors[processor] == undefined) {
    processors[processor] = require('node-paperclip-'+processor);
  }
  return processors[processor];
}
