var util = require('../util.js');
var velocity = require('velocityjs');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var Mock = require('mockjs');

var VIEW_DIR = G_DIR;

var defaultMacros = {
    parse: function (file) {
        var viewPath = path.join(VIEW_DIR, file);
        var template = fs.readFileSync(viewPath).toString();
        return this.eval(template);
    }
}

function isVm(url, extReg) {
  extReg = extReg || /vm/;

  var trueUrl = url.replace(/\?.*/ig, '');
  var ext = path.extname(trueUrl);

  return extReg.test(ext);

}

var fetchTmpl = function(viewPath) {

    return function(callback){
        fs.readFile(viewPath, function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback (null, data.toString());
            }
        });
    }
}

var fetchData = function(dataSource) {

  dataSource = dataSource || '';

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

  return fetch;
}


/**
 * 用来渲染vm模板
 * config.viewLocation  vm模板所在目录,默认是当前根目录
 * config.macros        一些宏的定义
 * config.remoteUrl     远程接口地址,可选
 */

exports.factory = function (app,config) {

    if(config.viewLocation) VIEW_DIR = config.viewLocation;

    var macros = _.extend(defaultMacros,config.macros);

    return function *(next){
        //只有是vm才会渲染，否则跳过。
        var ctx = this;
        ctx.md_config = config;

        if (isVm(ctx.url)){
            var view = ctx.path;
            var viewPath = path.resolve(VIEW_DIR,'./'+view);

            var template = yield fetchTmpl(viewPath);
            var dataPath = this.query.ds || ctx.path.split('.')[0]+'.json';
            var data = yield fetchData(dataPath);

            ctx.body = velocity.render(template, data, macros);
            ctx.type = 'text/html';

        };
        yield next;


    };
}



