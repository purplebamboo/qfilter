/**
 * 用于处理静态资源的加载
 *
 */

var send = require('koa-send');
var _ = require('lodash');
var util = require('../util.js');
var url = require('url');
var path = require('path');

var defaultConfig = {
  root: G_DIR,
  skip: 'vm|do',
  combo: true,
  prfix: '\\?\\?'

}

var comboRead = function(ctx,urls){

  return function *(){
    var l = urls.length;
    var i = 0;
    var streams = [];

    //console.log(urls);

    for (; i < l; i++) {
      yield send(ctx, url.parse(urls[i]).pathname, { root: ctx.md_config.root });
      ctx.body && streams.push(ctx.body);
    }
    //异步同时开始读取流
    var strs = yield _.map(streams,function(stream){
      return util.stream2str(stream);
    })

    return strs.join('\n\n');

  }

}

/**
 * 用来处理静态资源
 * config.root  静态资源根目录，默认是当前根目录。
 * config.skip  需要跳过处理的后缀，默认是 'vm|do'。是一个正则串。
 * config.combo 是否支持静态资源的comboo,默认是true。
 * config.prfix comboo的前缀 默认是 '\\?\\?'。
 */

exports.service = function*(next) {
  var ctx = this;
  //ctx.md_config = config;
  var url = this.url;

  var config = ctx.md_config = _.extend(defaultConfig, ctx.md_config);

  if (new RegExp(config.skip,'g').test(url)){
    yield next;
    return;
  }

  var reg = new RegExp(config.prfix + '(.*)');
  var match = url.match(reg);

  var urls = [];

  if (!match) {
    urls = [url];
  }else{
    urls = match[1].split(',').map(function(u){
      //为了支持有前缀的combo,需要加上path
      ///app/??util/loader-min.js,util/common_api-min.js
      return path.resolve(ctx.path,u);
    });

  }

  ctx.body = yield comboRead(ctx,urls);
  yield next;

}