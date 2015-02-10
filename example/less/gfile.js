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
      //把css后缀重写为less后缀。这样后面的静态资源就可以找到对应的less。并且编译返回。
      [/\.css/g,'.less']
    ]
  }
})


/**
 * 用于实时编译less返回给客户端
 * config.match [function] 用来设置白名单，只有在match返回true的才会编译
 * config.paths [array] less里面import查找的目录，默认是当前根目录
 *
 */
qfilter.add({
  name:'q_less',
  config:{
    //所有后缀是css,less的静态资源都会编译处理
    match:function(path){
      return /(.css)|(.less)/.test(path);
    },
    paths:['./public/less']
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