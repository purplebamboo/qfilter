
var _ = require('lodash');

defaultConfig = {
  map:[]
}



/**
 * 用来处理地址重写
 * config.map  [array] 重写配置。
 * 1.支持数组 [a,b]。会在匹配到a的时候使用b替换。因为内部使用url.replace(a,b)实现。所以支持a是正则，支持b是函数。
 * 2.支持单个方法。使用返回值替换原始的url。返回非true值，不会做任何修改。
 *
 */

exports.service = function*(next) {
  var ctx = this;
  var url = this.url;
  var config = _.extend(defaultConfig,ctx.md_config);
  var reg = null;

  //参考seajs的map写法
  var map = config.map;

  if (!_.isArray(map)) {
    ctx.throw('[q_rewrite]: map 参数必须是一个数组。');
  }

  for (var i = 0, len = map.length; i < len; i++) {
    var rule = map[i];

    url = _.isFunction(rule) ?
        (rule(url) || url) :
        url.replace(rule[0], rule[1]);

    // Only apply the first matched rule
    if (url !== ctx.url) break;
  }

  this.url = url;

  yield next;

}