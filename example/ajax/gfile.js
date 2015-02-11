
//这里为了方便直接引用的相对路径，实际使用请使用 require('qfilter');
var qfilter = require('../../lib/index.js');




/**
 * 用来处理ajax请求，支持jsonp
 * config.dataLocation 接口模拟文件对应的主目录，默认为当前根目录
 * config.jsonpCallback jsonp的callback参数
 * config.map  接口路由。一个接口对应一个文件。匹配到的话，就加载对应数据，并且不再转给下个中间件而是返回。如果匹配不到就直接交给下一个中间件。
 */

qfilter.add({
  name: 'q_ajax',
  config: {
    dataLocation: './_json/',
    map: {
      //首页接口
      '/index/json.htm': 'index.js'
    }
  }

})
/**
 * 用来处理静态资源
 * config.root  静态资源根目录，默认是当前根目录。
 * config.skip  需要跳过处理的后缀，默认是 'vm|do|json'。以|分割。
 * config.combo 是否支持静态资源的comboo,默认是true。
 * config.comboType 支持comboo的静态资源类型,默认是'js|css|less'，以|分割。
 * config.prfix comboo的前缀 默认是 '??'。
 */

qfilter.add({
  name:'q_static',
  config:{
    root:'./public'
  }
})


qfilter.run({
  port:4000
})