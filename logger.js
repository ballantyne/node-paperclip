module.exports = function(watch) {
  if (watch == undefined) watch = [];

  return function(method, args) {
    var should_print       = (watch.indexOf(method) > -1)
    if (should_print) {
      console.log('');
      if (args) {
        console.log(method, args);
      } else {
        console.log(method);
      }
    }
  }
}
