# 前端服务过滤器


qfilter是一个基于koa开发的中间件服务。用来解决一系列的开发，调试问题。

只需要一个命令行，就可以生成一套好用的开发环境。

主要思路是，使用koa开一个服务，我们使用若干个中间件对内容进行各种处理。

目前支持的特性：

* 支持简单静态资源服务器，支持combo特性。
* 支持less实时编译返回。开发时直接改less。中间件负责编译返回css。
* 支持rewrite规则，修改url对应关系。类似apache里面的rewrite。
* 支持ajax环境模拟，支持mockjs写法，支持jsonp。
* 支持java里面的velocity模板的渲染。支持layout。


## Getting started

### 1.install globally

```
sudo npm install -g qfilter
```

### 2.install in project devDependencies

```
npm install --save-dev qfilter
```

### 3.config

在项目根目录下新建gfile.js文件。
在gfile.js里面配置各种中间件，可以参考example里面的。

最简单的例子:

```
var qfilter = require('qfilter');

/**
 * 用来处理静态资源
 * config.root  静态资源根目录，默认是当前根目录。
 * config.skip  需要跳过处理的后缀，默认是 'vm|do|json'。以|分割。
 * config.combo 是否支持静态资源的comboo,默认是true。
 * config.comboType 支持comboo的静态资源类型,默认是'js|css|less'，以|分割。
 * config.prfix comboo的前缀 默认是 '??'。
 */
//添加中间件
qfilter.add({
  name:'q_static',
  config:{
    root:'./public'
  }
})

/**
 * 启动服务
 * @type {number} 运行的端口号
 */
qfilter.run({
  port:4000
})

```

qfilter.add用于添加中间件。name是中间件名称，config是对应的配置项。
qfilter.run开始运行中间件。
以q_开头的都是官方中间件，具体见下面自定义中间件部分。


### 4.run

在项目根目录下，运行

```
qf s //访问对应地址即可。

```




## example

安装好qfilter后，clone项目代码。

请确保node版本号支持harmony特性generator。运行

```
cd example/simple //或者其他例子
qf s

```
访问 localhost:4000/index.html


1. simple:最简单的使用`q_static`实现的最简单的静态资源服务。支持`combo`。
2. rewrite:使用`q_rewrite`和`q_static`合在一起实现的具有重写的服务。
3. less:使用`q_rewrite`，`q_less`，`q_static`实现的实时编译less的服务环境。
4. ajax:使用 `q_ajax`和`q_static`实现的模拟ajax请求的服务，支持jsonp。支持mockjs写法。
5. vmshow:使用`q_vm`和`q_static`实现的可以渲染vm模板的服务环境。




## 官方中间件列表



### static中间件

用来提供基本的静态文件http服务。支持combo。

* config.root  静态资源根目录，默认是当前根目录。
* config.skip  需要跳过处理的后缀，默认是 'vm|do|json'。多个以|分割。
* config.combo 是否支持静态资源的comboo,默认是true。
* config.comboType 支持comboo的静态资源类型,默认是'js|css|less'，以|分割。
* config.prfix comboo的前缀 默认是 '??'。


### rewrite中间件

用来重写请求的url,类似apache的rewrite作用。可以用来实现比较简单的路由，或者文件重定向。

config.map  [array] 映射配置。是个数组，每个值是个配置项，支持下面的类型：

* 数组 [a,b]。会在匹配到a的时候使用b替换。因为内部使用url.replace(a,b)实现。所以支持a是正则，支持b是函数。
* 单个方法。使用返回值替换原始的url。返回非true值，不会做任何修改。




### ajax中间件

用来提供基本的ajax请求服务。支持mockjs，支持jsonp。

* config.dataLocation 接口模拟文件对应的主目录，默认为当前根目录
* config.jsonpCallback jsonp的callback参数
* config.map  接口路由。一个接口对应一个文件。匹配到的话，就加载对应数据，并且不再转给下个中间件而是返回。如果匹配不到就直接交给下一个中间件。



### less中间件

用来提供实时less编译服务,请求css的时候会自动抓取对应的less文件并且编译后返回。


* config.match 用来设置白名单，只有在白名单里面的才会编译
* config.paths import查找的目录，默认是当前根目录



### vm中间件

用来处理vm的渲染。
默认情况下 请求 b.vm 会使用 b.js返回的变量来渲染vm。
可以使用b.vm?ds=c.js来指定不同的数据源

* config.viewLocation  vm模板的目录，默认是当前根目录。
* config.dataLocation  vm模板对应的渲染变量文件的目录，默认是当前根目录。
* config.macros        全局的宏定义。在vm中使用  #xxx()  来使用。
* config.dataInject    用于对返回的变量进行统一处理。这样可以注入一些全局统一的变量或者方法，支持返回promise对象处理异步。return的值如果不为空，就会整个替换（同理promise的情况下，就是resolve的值不为空）。


## 自定义中间件

我们可以自定义中间件，做一些自己的过滤处理。

eg：

```
qfilter.add({
  name:'test',
  config:{
  },
  service:function *(next){
    var context = this;
    console.log(context.md_config);
  }
  // service same as
  //factory:function(app,config){
    //return function*(next){
    //}
  //}
})

```

name代表你的中间件名称。注意所有q_开头的都是官方中间件。

config是以后的配置项。

service就是koa里面的app.use()会使用的函数。默认会app.use(service)。所以koa里面的中间件怎么用，这边就怎么用。另外，系统默认会把当前中间件的config配置注入到当前context的md_config属性上。便于处理。

factory用于生成一个中间件service函数。factory只在初始化的时候调用一次，所以可以做一些初始化的操作。这边注意的是此时context的md_config属性需要自己注入了。


此外还支持 path属性，用于把service或者factory写到其他文件里。

eg:

```
qfilter.add({
  name:'test',
  config:{
  },
  path:'t.js'
})

//t.js
exports.service = function *(next){
  var context = this;
  console.log(context.md_config);
}

```



