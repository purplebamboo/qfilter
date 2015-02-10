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

/**
 * 用来处理vm的渲染。
 * 默认情况下 请求 b.vm 会使用 b.js返回的变量来渲染vm。
 * 可以使用b.vm?ds=c.js来指定不同的数据源
 *
 * config.viewLocation  vm模板的目录，默认是当前根目录。
 * config.dataLocation  vm模板对应的渲染变量文件的目录，默认是当前根目录。
 * config.macros        全局的宏定义。在vm中使用  #xxx()  来使用。
 * config.dataInject    用于对返回的变量进行统一处理。这样可以注入一些全局统一的变量或者方法。
 */



qfilter.add({
  name: 'q_vm',
  config: {
    viewLocation: './vm/',
    dataLocation: './_context/',
    //全局的宏定义
    macros: {
      test:function(str){
        return "我是全局的宏，这次接收到的参数是"+str;
      }
    },
    //用于对返回的context进行统一处理
    dataInject: function(data) {
      data.Helper = {
        money: function(num){
          return num + '￥';
        }
      }
    }
  }
})


qfilter.run({
  port:4000
})