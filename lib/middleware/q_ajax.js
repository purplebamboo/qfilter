var _ = require('lodash');
var DATA_DIR = G_DIR;
var url = require('url');
var path = require('path');
var fs = require('fs');
var Mock = require('mockjs');

var defaultConfig = {
  dataLocation: G_DIR,
  map: {},
  jsonpCallback: 'callback'
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

    var filePath = path.resolve(DATA_DIR, dataSource);

    if (fs.existsSync(filePath)) {

      try {
        var mock = require(filePath);
        callback(null, Mock.mock(mock));
      } catch (e) {
        callback(e);
      }
      return;
    }

    callback(null, {});

  }

  return fetch;
}

/**
 * 用来处理ajax请求
 * config.dataLocation 接口模拟文件对应的主目录，默认为当前根目录
 * config.jsonpCallback jsonp的callback参数
 * config.map  接口路由。一个接口对应一个文件。匹配到的话，就加载对应数据，并且不再转给下个中间件而是返回。如果匹配不到就直接交给下一个中间件。
 */

exports.service = function*(next) {
  var ctx = this;
  //ctx.md_config = config;
  var _url = this.url;
  var config = _.extend(defaultConfig, ctx.md_config);

  DATA_DIR = config.dataLocation;

  var dataPath = config.map[url.parse(_url).pathname];
  var jsonpCb = ctx.query[config.jsonpCallback];

  var _res = function() {
    if (jsonpCb) {
      ctx.body = jsonpCb + '(' + JSON.stringify(data) + ')';
      ctx.type = 'application/javascript';
    } else {
      ctx.body = data;
    }
  }

  if (dataPath) {
    var data = {};
    var emitData = null;


    //emit 返回一个promise对象
    emitData = yield ctx.emit('ajax.beforeFetchData',data);

    if (_.isArray(emitData) && emitData.length > 0) {
      _.last(emitData) && (data = _.last(emitData));
    }else{

      data = yield fetchData(dataPath);
    }

    //emit 返回一个promise对象
    emitData = yield ctx.emit('ajax.afterFetchData',data);
    if (_.isArray(emitData) && emitData.length > 0) {
      _.last(emitData) && (data = _.last(emitData));
    }

    _res(data);
    //ajax中间件不会往后面继续调用，除非没有map到结果
    //ctx.body = data;
    return;
  }

  yield next;

}