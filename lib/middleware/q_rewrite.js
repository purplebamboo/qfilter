
var _ = require('lodash');

defaultConfig = {
  map:{}
}


exports.service = function*(next) {
  var ctx = this;
  var url = this.url;
  var config = _.extend(defaultConfig,ctx.md_config);
  var reg = null;
  _.forEach(config.map,function(m,key){

    reg = new RegExp(key,'g');
    if (!reg.test(url)) return;
    if (_.isString(m)){
      url = url.replace(reg,m);
    }

    if (_.isFunction(m)) {
      url = m.call(ctx,url);
    }

  })
  //console.log('====='+url);
  this.url = url;

  yield next;

}