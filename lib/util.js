var path = require('path');
var request = require('request');
var Mock = require('mockjs');
var chalk = require('chalk');
var fs = require('fs');



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

exports.mock = function(dataSource) {

  dataSource = dataSource || '';

  if (!dataSource) return;

  function JSONParse(s) {
    if (s) {
      return (new Function('return ' + s))();
    } else {
      return {};
    }
  }

  function fetchData(callback) {

    if (this.md_config && this.md_config.remoteUrl) {
      var fetchUrl = this.md_config.remoteUrl + dataSource.replace(/^\//, '');
      request(fetchUrl, function(err, response, body) {
        if (err) {
          callback(err);
        } else if (response.statusCode == 200) {
          // 返回的json数据有可能包含function，所以不能用JSON.parse
          callback(null, Mock.mock(JSONParse(body)));
        }
      });
      return;
    }

    var filePath = path.resolve(process.cwd(), dataSource);
    if (fs.existsSync(filePath)) {
      try {

        var mock = require(filePath);

        callback(null,Mock.mock(mock));
      } catch (e) {
        callback(e);
      }
      return;
    }

    callback({});

  }

  return fetchData;
}