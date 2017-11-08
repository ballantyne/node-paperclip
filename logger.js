var line          = '-----------------------------------------------------------------------';
var _             = require('underscore');
var chalk         = require('chalk');

var prepareObj    = function(obj) {
  hash_obj        = {}
  item = JSON.parse(JSON.stringify(obj));
  var keys        = _.keys(obj);
  var key;
  for (i = 0; i < keys.length; i++) { 
    key = keys[i];
    hash_obj[key] = item
  }
  return hash_obj;
}

var prepareArgs   = function(args) {
  var keys        = _.keys(args);
  var array       = [];

  for (i = 0; i < keys.length; i++) { 
    var item = args[keys[i]];
    var itemType  = typeof item;
    if (item != undefined) {
      if (itemType == 'object') {
        item      = JSON.stringify(item, null, 2)
        array.push(item);
      } else {
        array.push(item)
      }
    }
    if (item == undefined) {
      array.push('undefined');
    }
  }
  array.shift();
  return array.join(' ');

}



module.exports    = function(watch, file) {
  if (watch == undefined) watch = [];
  if (watch == false)     watch = [];


  return function(method, args) {
    var methodType = typeof method;
    if (methodType == 'object') {
      extendedMethod = method;
      method = method.name;
    } else {
      if (file) {
        extendedMethod = { file: file };
      } else {
        extendedMethod = false;
      }
    }

    var shouldPrint
    if (watch == true) {
      shouldPrint       = watch;
    } else {
      shouldPrint       = (watch.indexOf(method) > -1)
    }
    if (shouldPrint) {

      if (extendedMethod) {
        console.log(chalk.green.bold(method) + " " + extendedMethod.file);
      } else {
        console.log(chalk.green.bold(method));
      }

      if (args) {
        console.log(chalk.yellowBright.bold.bgBlackBright(line))
        
        args = prepareArgs(arguments);        
        console.log(chalk.cyan(args))
        console.log('');
        console.log(chalk.yellowBright.bold.bgBlackBright(line))
        console.log('');

      }
    }
  }
}
