var crypto     = require('crypto');
var container = {};
var _ = require('underscore');

var generateUniqueName = function(func) {
  var string = func;
  if (typeof string == 'function') {
    string = string.toString();
  }
  return crypto.createHmac('sha256', 'function')
    .update(string)
    .digest('hex');
}

var hashObjectOfFunctions = function(_module) {
  var hash_obj = {};
  var keys = _.keys(_module);
  for (i = 0; i < keys.length; i++) { 
    key = keys[i];
    hash_obj[key] = _module[key].toString();
  }
  var obj = JSON.stringify(hash_obj);
  return generateUniqueName(obj);
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

    if (typeof _module == 'object') {
      var obj = _module;
      _module = hashObjectOfFunctions(_module);
      if (container[_module] == undefined) {
        container[_module] = obj; 
      }
    }

    if (container[_module] == undefined) {
      container[_module] = require('node-paperclip-'+_module);
    }
    return container[_module];
  }
}
