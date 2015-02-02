/**
 * 用于处理静态资源的加载
 *
 */

var send = require('koa-send');
var _ = require('lodash');


var defaultConfig = {
  root: G_DIR + '/public',
  skip: 'vm|do'
}

/**
 * 用来处理静态资源
 * config.root  静态资源根目录，默认是当前根目录下的public目录
 * config.skip  需要跳过处理的后缀，默认是 'vm|do'。是一个正则串。
 */

exports.service = function*(next) {
  var ctx = this;
  //ctx.md_config = config;
  var path = this.path;
  var config = _.extend(defaultConfig, ctx.md_config);

  var trueUrl = path.replace(/\?.*/ig, '');
  if (!new RegExp(config.skip,'g').test(trueUrl)) {
    yield send(this, path, {
      root: config.root
    });
  }

  yield next;


}