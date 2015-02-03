
var _ = require('lodash');
var DATA_DIR = G_DIR;
var url = require('url');
var path = require('path');
var fs = require('fs');
var Mock = require('mockjs');

var defaultConfig = {
}

var fetchData = function(dataSource) {

  dataSource = dataSource || '';
  dataSource = dataSource.replace(/^\//, '');

  if (!dataSource) return;

  function JSONParse(s) {
    if (s) {
      return (new Function('return ' + s))();
    } else {
      return {};
    }
  }

  function fetch(callback) {

    if (this.md_config && this.md_config.remoteUrl) {
      var fetchUrl = this.md_config.remoteUrl + dataSource;
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

    var filePath = path.resolve(DATA_DIR, dataSource);

    if (fs.existsSync(filePath)) {

      try {
        var mock = require(filePath);
        callback(null,Mock.mock(mock));
      } catch (e) {
        callback(e);
      }
      return;
    }

    callback(null,{});

  }

  return fetch;
}

/**
 * 用来处理ajax请求
 */

exports.service = function*(next) {
  var ctx = this;
  //ctx.md_config = config;
  var _url = this.url;
  var config = _.extend(defaultConfig, ctx.md_config);

  DATA_DIR = config.dataLocation;

  var dataPath = config.map[url.parse(_url).pathname]

  if (dataPath) {

    var data = yield fetchData(dataPath);
    ctx.body = data;
    return;
  }

  yield next;

}