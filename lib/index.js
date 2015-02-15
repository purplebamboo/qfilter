var koa = require('koa');
var path = require('path');
var fs = require('fs');
var Event = require('./event');

var app = koa();
var logger = require('koa-logger');
var _ = require('lodash');
var util = require('./util.js');

var _midCache = [];


global.G_CONFIG = {
  debug:true,
  port:3000
};
global.G_DIR = process.cwd();

app.on('error', function(error, ctx) {
  util.error(error);
});


function _injectMiddlewares() {

  //为context对象增加事件机制
  //不使用原生的，因为需要支持promise
  //每个请求都有自己的事件缓存，虽然影响些性能。但是可以针对不同的请求添加不同的处理。
  Event.mixTo(app.context);

  _midCache.forEach(function(mod, k) {
    app.use(mod.factory(app, mod.config));
  })

}

function _runServer() {
  app.listen(G_CONFIG.port, function() {
    util.info('server running on ' + G_CONFIG.port);
  })
}

function _resolveModPath(mod){

  if(mod.path) return mod.path;

  var oPath = path.resolve(__dirname,'./middleware/', mod.name) + '.js';
  var gPath = path.resolve(G_DIR,'lib',mod.name) + '.js';


  if (fs.existsSync(oPath)) {

    mod.path = oPath;
  }

  if (fs.existsSync(gPath)) {
    mod.path = gPath;
  }

  return mod.path;

}


function _generateFactory(page){

  return page.factory || function(app, mdconfig) {

    return function *(next) {
      var ctx = this;
      ctx.md_config = mdconfig;
      //前面的拿到后面的generator对象的引用
      next = page.service.call(ctx, next);
      yield next;
    }
  }
}

exports.add = function(options) {

  if (!options.name) {
    util.error('当前模块未命名，请检查。'+JSON.stringify(options));
    return;
  }

  if (_.where(_midCache, {'name': options.name}).length) return;

  var mod = {
    name: options.name,
    path: options.path,
    config: options.config
  }

  if (options.factory || options.service) {

    mod.factory = _generateFactory(options);

  }else{

    try{
      var page = require(_resolveModPath(mod));
    }catch(e){

      util.error(e);
      return;
    }
    mod.factory = _generateFactory(page);

  }


  _midCache.push(mod);

}

/**
 * 启动服务
 * @param  {object} gconfig 服务的全局配置
 * gconfig.debug 是否开启debug模式，在debug模式下会打印出各种信息。默认开启
 * gconfig.port  设置启动的端口，默认为3000
 */
exports.run = function(gconfig) {

  G_CONFIG = _.extend(G_CONFIG,gconfig);

  G_CONFIG.debug && app.use(logger());

  _injectMiddlewares();
  _runServer();

}