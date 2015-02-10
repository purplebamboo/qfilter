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
  skip: 'vm|do|json',
  combo: true,
  prfix: '??'

}

var comboRead = function(ctx, urls) {

  return function*() {
    var l = urls.length;
    var i = 0;
    var streams = [];

    for (; i < l; i++) {
      //console.log(url.parse(urls[i]).pathname)
      yield send(ctx, url.parse(urls[i]).pathname, {
        root: ctx.md_config.root
      });
      ctx.body && streams.push(ctx.body);
    }
    //console.log(streams)
    if (streams.length == 0) {
      return null;
    }

    //异步同时开始读取流
    var strs =
      yield _.map(streams, function(stream) {
        return util.stream2str(stream);
      })

    return strs.join('\n\n');

  }

}

/**
 * 用来处理静态资源
 * config.root  静态资源根目录，默认是当前根目录。
 * config.skip  需要跳过处理的后缀，默认是 'vm|do|json'。多个以|分割。
 * config.combo 是否支持静态资源的comboo,默认是true。
 * config.prfix comboo的前缀 默认是 '??'。
 */

exports.service = function*(next) {
  var ctx = this;
  //ctx.md_config = config;
  var url = this.url;

  var config = ctx.md_config = _.extend(defaultConfig, ctx.md_config);

  //静态资源才有combo,所以可以认为skip过滤的时候只需要看最后一个资源的后缀
  var ext = path.extname(url);

  if (~config.skip.split('|').indexOf(ext)) {
    yield next;
    return;
  }

  var urls = [];

  var comboIndex = url.indexOf(config.prfix);
  var prefixLength = config.prfix.length;

  if (comboIndex === -1) {
    urls = [url];
  } else {
    urls = url.substring(comboIndex + prefixLength).split(',').map(function(u) {
      //为了支持有前缀的combo,需要加上path
      ///app/??util/loader-min.js,util/common_api-min.js
      return path.resolve(ctx.path, u);
    });

  }

  var resContent =
    yield comboRead(ctx, urls);

  if (resContent) ctx.body = resContent;

  yield next;

}