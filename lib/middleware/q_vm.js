var util = require('../util.js');
var velocity = require('velocityjs');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var Mock = require('mockjs');
var url = require('url');

var VIEW_DIR = G_DIR;
var DATA_DIR = G_DIR;
var DEFAULT_LAYOUT = null;

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

    viewPath = path.resolve(VIEW_DIR,'./'+viewPath);

    return fs.readFileSync(viewPath).toString();

}



layoutReg = /set[\s]*\([\s]*\$layout[\s]*=[\s]*"([^"]*)"\)[\s]*/;
function _parseLayout(template){

  var layoutPath = DEFAULT_LAYOUT;
  var m = template.match(layoutReg);

  if (m) {
    layoutPath = m[1];
  }

  if (layoutPath) {
    template = fetchTmpl(layoutPath).replace('$screen_content',template);
  }

  return template;
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
 * 用来处理vm的渲染。
 * 默认情况下 请求 b.vm 会使用 b.js返回的变量来渲染vm。
 * 可以使用b.vm?ds=c.js来指定不同的数据源
 *
 * config.viewLocation  vm模板的目录，默认是当前根目录。
 * config.dataLocation  vm模板对应的渲染变量文件的目录，默认是当前根目录。
 * config.macros        全局的宏定义。在vm中使用  #xxx()  来使用。
 * config.dataInject    用于对返回的变量进行统一处理。这样可以注入一些全局统一的变量或者方法。
 */

exports.factory = function (app,config) {

    if(config.viewLocation) VIEW_DIR = config.viewLocation;
    if(config.dataLocation) DATA_DIR = config.dataLocation;
    if(config.defaultLayout) DEFAULT_LAYOUT = config.defaultLayout;

    var macros = _.extend(defaultMacros,config.macros);


    return function *(next){
        //只有是vm才会渲染，否则跳过。
        var ctx = this;
        ctx.md_config = config;

        if (isVm(ctx.url)){
            var view = url.parse(ctx.url).pathname;

            var dataPath = this.query.ds || ctx.url.split('.')[0]+'.js';
            var data = yield fetchData(dataPath);

            if(config.dataInject) config.dataInject(data);

            var template = fetchTmpl(view);
            //解析layout，默认的vm里面是没有layout功能的
            template = _parseLayout(template);
            ctx.body = velocity.render(template, data, macros);
            ctx.type = 'text/html';

        };
        yield next;


    };
}



