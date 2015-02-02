var less = require('less');
var _ = require('lodash');

var coLess = function(body,config){

  return function(cb){
    less.render(body,config, function (e, css) {
      cb(e,css.css);
    });
  }
}

var isCss = function(path){
  return /.css/.test(path);
}

defaultConfig = {
  map:function(path){
    return path.replace('.css','.less');
  },
  paths:[G_DIR]
}


var stream2str = function (stream){
  return function(cb){
    var str = '';
    stream.on('data',function(data){
      str += data.toString();
    })
    stream.on('end',function(){
      cb(null,str);
    })
  }

}


/**
 * 用于实时编译less返回给客户端
 * config.map 用来映射请求地址，默认情况下会将  xxx.css 映射到 xxx.less文件
 * config.paths import查找的目录，默认是当前根目录
 *
 */

exports.service = function*(next) {
  var ctx = this;
  var path = this.path;

  if (!isCss(path)){
    yield next;
    return;
  };

  var config = _.extend(defaultConfig,ctx.md_config);

  path = this.path = config.map(path);

  yield next;

  var body = yield stream2str(ctx.body);
  ctx.body = yield coLess(body,config);
  ctx.type = 'text/css';


}