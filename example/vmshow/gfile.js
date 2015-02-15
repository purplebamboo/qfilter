//这里为了方便直接引用的相对路径，实际使用请使用 require('qfilter');
var qfilter = require('../../lib/index.js');



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
      //重写后，就可以直接使用index.html来访问啦
      ['index.html','index.vm']

    ]
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

/**
 * 用来处理vm的渲染。
 * 默认情况下 请求 b.vm 会使用 b.js返回的变量来渲染vm。
 * 可以使用b.vm?ds=c.js来指定不同的数据源
 *
 * config.viewLocation  vm模板的目录，默认是当前根目录。
 * config.dataLocation  vm模板对应的渲染变量文件的目录，默认是当前根目录。
 * config.macros        全局的宏定义。在vm中使用  #xxx()  来使用。
 * config.dataInject    用于对返回的变量进行统一处理。这样可以注入一些全局统一的变量或者方法，支持返回promise对象处理异步。return的值如果不为空，就会整个替换（同理promise的情况下，就是resolve的值不为空）
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
    //参数为dataLocation返回的对应数据
    //此外支持返回一个promise对象。用来处理异步。
    dataInject: function(data) {

      data.Helper = {
        money: function(num){
          return num + '￥';
        }
      }
      //es6原生支持promise
      return new Promise(function(resolve, reject) {
        setTimeout(function(){
            data.asyncdata = "我是异步获取的数据";
            resolve();
            //可以resolve一个新的值作为最终的data
            //resolve({asyncdata:'我是异步数据，但是被强制修改了'});
        },100)
      });
    }
  }
})


qfilter.run({
  port:4000
})