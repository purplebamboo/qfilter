var less = require('less');
var _ = require('lodash');

var coLess = function(body,config){

  return function(cb){
    less.render(body,config, function (e, css) {
      if (e){
        cb(e);
        return;
      }

      cb(e,css.css);


    });
  }
}


defaultConfig = {
  match:function(path){
    return /(.css)|(.less)/.test(path);
  },
  paths:[G_DIR]
}


/**
 * 用于实时编译less返回给客户端
 * config.match 用来设置白名单，只有在白名单里面的才会过滤
 * config.paths import查找的目录，默认是当前根目录
 *
 */

exports.service = function*(next) {
  var ctx = this;
  var url = this.url;
  var config = _.extend(defaultConfig,ctx.md_config);

  if (!config.match(url)){
    yield next;
    return;
  };


  //url = this.url = config.map(url);

  yield next;

  ctx.body = yield coLess(ctx.body,config);
  ctx.type = 'text/css';


}