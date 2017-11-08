var crypto                 = require('crypto');
var container              = {};
var _                      = require('underscore');

var generateUniqueName     = function(func) {
  var string = func;
  if (typeof string == 'function') {
    string = string.toString();
  }
  return crypto.createHmac('sha256', 'function')
    .update(string)
    .digest('hex');
}

var hashObjectOfFunctions  = function(_module) {
  var strings = hashPartsOfObject(_module);
  return generateUniqueName(strings);
}
var hashKey = function(key, _module) {
  var keyType = typeof _module[key];
  if (keyType == 'object') {
    if (_.keys(_module[key]).length == 0) {
      return _module[key];
    } else {
      return hashKeys(_module[key]);
    }
  } else {
    return _module[key].toString();
  }
}

var hashKeys               = function(_module) {
  var hash_obj = {};
  var keys = _.keys(_module);
  for (i = 0; i < keys.length; i++) { 
    key = keys[i];
    hash_obj[key]          = hashKey(key, _module);
  }
  return hash_obj;
}

var hashPartsOfObject      = function(_module, inner) {
  var hash_obj             = hashKeys(_module);
  var obj                  = JSON.stringify(hash_obj);
  return obj;
}

module.exports             = function(_default, container) { 
  if (container == undefined) container = {};
  
  return function(_module) {
    if (_module == undefined) {
      _module              = _default;
    }  

    if (typeof _module == 'function') {
      var func             = _module;
      var _module = generateUniqueName(func);
      if (container[_module] == undefined) {
        container[_module] = func; 
      }
    }

    if (typeof _module == 'object') {
      var obj              = _module;
      _module              = hashObjectOfFunctions(_module);
      if (container[_module] == undefined) {
        container[_module] = obj; 
      }
    }

    if (container[_module] == undefined) {
      var name             = generateUniqueName(_module);
      container[name]      = require('node-paperclip-' + _module);
      _module              = name;
    }

    return container[_module];
  }

}

