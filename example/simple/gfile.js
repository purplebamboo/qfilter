var qfilter = require('qfilter');




/**
 * 用来处理静态资源
 * config.root  静态资源根目录，默认是当前根目录。
 * config.skip  需要跳过处理的后缀，默认是 'vm|do'。是一个正则串。
 * config.combo 是否支持静态资源的comboo,默认是true。
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