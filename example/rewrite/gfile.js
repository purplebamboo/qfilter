var qfilter = require('qfilter');





/**
 * 用来处理地址重写
 * config.map  [array] 重写配置。
 * 1.支持数组 [a,b]。会在匹配到a的时候使用b替换。因为内部使用url.replace(a,b)实现。所以支持a是正则，支持b是函数。
 * 2.支持单个方法。使用返回值替换原始的url。返回非true值，不会做任何修改。
 *
 */

qfilter.add({
  name: 'q_rewrite',
  config: {
    map: [
      //1.支持数组
      //会把第一个参数 替换为第二个。这边内部会使用replace。
      //所以第一个参数支持正则，第二个参数支持Function
      ['test.html','index.html'],
      //same as
      //[/test\.html/,function(match){return 'index.html'}],

      //2.支持单个的函数
      function(url){

      }
    ]
  }
})


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