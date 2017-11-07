var crypto     = require('crypto');
var container = {};


var generateUniqueName = function(func) {
  var string = func;
  if (typeof string == 'function') {
    string = string.toString();
  }
  return crypto.createHmac('sha256', 'function')
    .update(string)
    .digest('hex');
}


module.exports = function(_default, container) { 
  if (container == undefined) container = {};
  return function(_module) {
    if (_module == undefined) {
      _module = _default;
    }  

    if (typeof _module == 'function') {
      var func = _module;
      var _module = generateUniqueName(func);
      if (container[_module] == undefined) {
        container[_module] = func; 
      }
    }

    if (container[_module] == undefined) {
      container[_module] = require('node-paperclip-'+_module);
    }
    return container[_module];
  }
}
