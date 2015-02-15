var _path = require('path');
var request = require('request');
var chalk = require('chalk');
var fs = require('fs');
var _ = require('lodash');



exports.info = function(msg) {
  console.info(msg);
}
exports.log = function(msg) {
  console.log('  [log:]' + chalk.blue(msg));
}
exports.error = function(err) {
  var errStr = '';

  if (err.stack) {
    errStr = err.stack.replace(/^/gm, '  ')+'\n\n';
  }else{
    errStr = err.toString();
  }
  console.error('[error:]'+chalk.red(errStr));

}


exports.stream2str = function (stream){
  return function(cb){
    var str = '';
    stream.on('data',function(data){
      str += data.toString();
    })
    stream.on('end',function(){
      cb(null,str);
    })
  }

}


exports.require = function(path,data){
  var filePath = _path.resolve(process.cwd(),path);

  if (!fs.existsSync(filePath)) return {};

  var fnStr = fs.readFileSync(filePath).toString();
  var mod = _.extend({exports:{}},data);

  var fn = new Function("require","exports","module",fnStr);

  var _require = function(path){
    // if (path.indexOf('/')) {
    //   return require(_path.resolve(filePath))
    // }
  }
  fn(require,mod.exports,mod);

  return mod.exports;

}
