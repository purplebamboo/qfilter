/**
 * 依赖zepto
 * 简单的队列
 * @author 瞿星 wb-qwmsing@taobao.com
 */
KISSY.add('wms.lego/queue/index', function(S) {

  var _op = function() {
    var that = this;
    var _i = setInterval(function() {
      if (that.Queue.length > 0 && !that.stop) {
        //console.log(that.Queue);
        var obj = that.Queue.shift()
        obj["fn"](obj.argument);
        if (obj["callBack"]) {
          obj["callBack"]()
        }
      } else {
        clearInterval(_i);
      }
    }, this.setTimeout);
  }
  var ret = {
    Queue: [],
    /* 异步队列 */
    syncQueue: [],
    /* 同步队列 */
    setTimeout: 500,
    /* 执行间隔 */
    add: function(fn, argument, callBack) { /* 添加队列 */
      this.Queue.push({
        fn: fn,
        argument: argument,
        callBack: callBack
      });
      return this;
    },
    addSync: function(fn, argument, callBack) { /* 添加队列 */
      this.syncQueue.push({
        fn: fn,
        argument: argument,
        callBack: callBack
      });
      return this;
    },
    clear: function() { /* 清空队列 */
      this.Queue = [];
      return this;
    },
    stop: false,
    //异步模式延时队列，按timeout执行，防连续触发。
    start: function() {
      this.stop = false;
      if (this.setTimeout > 0) {
        _op.apply(this);
      }
      return this;
    },
    shift: function() {

    },
    //同步模式先进先出
    dequeue: function() {
      var obj = this.syncQueue.shift();
      if (obj) {
        obj["fn"](obj.argument);
        obj["callBack"] && obj["callBack"]();
      }
    }
  }
  return ret;
});


/**
 *
 * 依赖zepto
 */

KISSY.add('wms.lego/autocomplete/index', function(S, queue, Node) {

  //var $ = require('zepto');
  //var queue = require('./queue');
  var $ = Node.all
  queue.setTimeout = 100;
  //autoComplete组件 2011.1.07
  return autoComplete = function(options) {
    var setting = {
      ajaxUrl: "http://m.taobao.com", //ajax路径
      operator: '.J_autocomplete', //触发搜索文本框
      wrapEl: '.wrap', //内容展示层
      meatEl: '.meat', //用来包裹列表内层元素的层
      childEl: 'li', //列表内层元素
      submit: '.btn', //提交表单的按钮
      close: '.close', //关闭内容展示层
      collapse: 'collapse', //收缩状态class
      expand: 'expand', //展开状态class
      delay: 0, //延迟时间，2012.6.28暂时引入了队列，来阻止异步的时候，出现的bug，异步的设置里有timeout
      anim: true, //是否动画
      isUseKey: true, //用于开启或者关闭---检测用户是否使用了搜索联想词进行搜索功能
      history: false, //历史记录请求的url，支持字符串和数组
      localStorage: "searchhistory", //历史从本地读取,false自动从网上获取。设置为本地的key
      clearHistory: "clear", //清除历史的url
      addition: false, //是否有附加功能
      additionClass: ".addition", //附加按钮的样式
      max: 7, //最多记录数
      //点击列表项时执行
      afterItemClick: function(n) {
        console.log(n);
      },
      //历史加载完成
      onHisLoad: function() {
        console.log("history ready.")
      }
    }
    if (options) {
      S.mix(setting, options);
    };
    var self = this;


    var autoComplete = {
      //存放发生ajax请求，用于清除
      ajax: [],
      //历史数据的数组
      hisList: [],
      //用于设置历史数据的索引
      hisIndex: 0,
      //历史加载完成
      onHisLoad: setting.onHisLoad
    };

    $(this).each(function() {
      var self = $(this);
      //console.log(self);
      /* 优先请求历史记录 支持数组*/
      if (setting.history) {

        //是否从本地读取
        if (setting.localStorage) {
          window.localStorage && (autoComplete.hisList = eval(localStorage.getItem(setting.localStorage) || []));
        } else {

          var hisArray = typeof(setting.history) == "string" ? [setting.history] : setting.history;

          for (var i = 0; i < hisArray.length; i++) {
            queue.addSync($.ajax, {
              url: hisArray[i],
              type: "GET",
              dataType: "jsonp",
              error: function() {
                console.log('网络连接失败，请刷新页面重试');
                return false;
              },
              success: function(json, status, xhr) {
                autoComplete.hisList.push(json);
                queue.dequeue();
              }
            });
          };
          queue.addSync(autoComplete.onHisLoad);

          queue.dequeue();

        }
      }
      var operator = $(this).one(setting.operator);
      var $close = self.one(setting.close).addClass('c-btn-grey-small');
      //设置文本框的autocomplete
      operator.attr('autocomplete', 'off');
      //解决HTML5 placeholder属性在Android Webkit上的交互细节BUG
      operator.on("focus", function() {
        if ($(this).val() == '') {
          $(this).val('');
        }
      });

      //文本框上的事件
      ///UC/.test(navigator.userAgent) && operator.keyup(initInput); 现在uc又支持oninput了。
      operator.on("input", initInput);
      operator.on("focus", function(e) {
        var data;
        data = $(this).val().replace(/(^\s+)|(\s+$)/g, '');
        if (data.length == 0 && setting.history) {
          //self.one(setting.wrapEl).slideUp();
          queue.clear();
          queue.add(getHistory);
          queue.start();
          return;
        }
      });

      function initInput(e) {
        var e = e || window.event;
        var data;
        data = $(this).val().replace(/(^\s+)|(\s+$)/g, '');
        //文本为空时返回
        if (data.length == 0 && setting.history) {
          //self.one(setting.wrapEl).slideUp();
          queue.clear();
          queue.add(getHistory);
          queue.start();
          return;
        }
        if (e.keyCode == 13 || e.keyCode == 32) return;
        //首次触发滚动屏幕，让文本框置顶
        if (!this.onceScroll) toTop();
        this.onceScroll = true;

        //搜索店铺，关闭浮

        var st = self.one('#J_ST');
        var st_name = st ? st.attr('name') : undefined;


        if ((st && st.length > 0) && st_name == "event_submit_do_search_shop") {

          //self.one(setting.wrapEl).slideUp('normal');
          self.one(setting.wrapEl).hide();
          return false;
        }

        queue.clear();
        queue.add(getList, data);
        queue.start();

      };

      //异步请求数据
      function getList(text) {
        var ajaxurl = setting.ajaxUrl;
        autoComplete.ajax.push(S.IO({
          url: ajaxurl,
          type: "GET",
          dataType: "jsonp",
          data: "code=utf-8&extras=1&q=" + text,
          error: function() {
            //alert('网络连接失败，请刷新页面重试');
            return false;
          },
          success: function(json) {
            pack(json);
            $close.html("关闭").removeClass("clear");
          }
        }));
      }
      //获得历史记录
      function getHistory() {
        var json = autoComplete.hisList[autoComplete.hisIndex];
        pack(json);
        $close.html("清除历史记录").addClass("clear");
      }

      //清除历史记录
      function clearHistory() {
        if (setting.localStorage) {
          localStorage.removeItem(setting.localStorage);
        } else {

          var clearArray = typeof(setting.clearHistory) == "string" ? [setting.clearHistory] : setting.clearHistory;



          //这里也要用到同步来清除，同一时间删cookie会有问题。
          queue.clear();
          for (var i = 0; i < clearArray.length; i++) {
            queue.addSync($.ajax, {
              url: clearArray[i],
              dataType: "jsonp",
              success: function(data) {
                queue.dequeue();
              }
            });
          };
          queue.dequeue();

        }
        autoComplete.hisList = [];
      }

      //DOM组装联想搜索数据
      function pack(json) {
        if (json && json.result != false && json.result.length > 0) { //请求结果成功
          if (setting.isUseKey) {
            var J_StatisticsKeyword = self.one('#J_IsUseSearchSuggest');
            J_StatisticsKeyword && J_StatisticsKeyword.val('');
          }
          var html = '';
          var num = json.result.length > setting.max ? setting.max : json.result.length;
          for (var i = 0; i < num; i++) {
            render(i);
          }
          self.one(setting.meatEl).html(html);
          effect();
        } else {
          //self.one(setting.wrapEl).slideUp('normal');
          self.one(setting.wrapEl).hide();
          return;
        }

        function render(loop) {
          var addition = setting.addition ? "<div class='" + setting.additionClass.slice(1) + "'></div>" : "";
          html += '<li key="' + json.result[loop][0] + '">' + "<div>" + json.result[loop][0] + "</div>" + addition + '</li>';
        }
      }

      //组装内容后操作
      function effect() {
        var timer = null;
        //展开联想搜索内容
        timer = setTimeout(function() {
          if (!setting.anim) {
            self.removeClass(setting.collapse).addClass(setting.expand);
          } else {
            self.one(setting.wrapEl).show();
          }
        }, setting.delay);

        //避免重复绑定
        self.one(setting.close).detach('click');
        self.one(setting.childEl).detach('click');

        //点击关闭联想内容
        self.one(setting.close).on("click", function() {
          var interval = 0;
          var timer = null;
          timer = setTimeout(function() {
            if (!setting.anim) {
              self.removeClass(setting.expand).addClass(setting.collapse);
            } else {
              self.one(setting.wrapEl).hide();
            }
          }, setting.delay);

          //interval = $(window).scrollTop() - operator.offset().top;
          if (interval > 0) toTop();
          if ($close.hasClass("clear")) {
            clearHistory();
          }
        });

        //搜索提交表单
        //uc下有点击反馈，不用代理了。
        //self.on("click",setting.childEl,function(){

        self.all(setting.childEl).on("click", function() {

          var $this = $(this);
          setting.afterItemClick.call(this, Number($this.index()) + 1);
          //暂时注释
          //if(setting.isUseKey){
          //    self.one('#J_IsUseSearchSuggest').val($('#J_StatisticsKeyword').val());
          //}
          var text = $this.attr('key');
          //console.log(text);
          operator.val(text); //赋值给文本框

          //触发提交
          //var evt = document.createEvent("MouseEvents");  
          //evt.initEvent("click", true, true);  
          //self.one(setting.submit)[0].dispatchEvent(evt);
          var submitBtn = self.one(setting.submit)[0];
          submitBtn && submitBtn.click();
        });
      }

      //让文本框位置移到顶部
      function toTop() {
        var offsetTop = operator.offset().top;
        setTimeout(function() {
          window.scrollTo(0, offsetTop)
        }, 1000);
      }

      //添加联想词附加到关键词上的功能
      setting.addition && self.one(setting.meatEl).on("touchstart click", "div" + setting.additionClass, function(e) {
        var $this = $(this);
        operator.focus();
        operator.val($this.parent().attr("key"));

        //聚焦到最后，无法成功，只能选到最后的前一个字符
        //var length = operator[0].value.length;
        //console.log(length);
        //operator[0].setSelectionRange(length,length); 
        initInput.call(operator);
        e.preventDefault();
        e.stopPropagation();
      });


      //是否历史功能
      if (setting.history) {
        autoComplete.getHistory = function() {
          queue.clear();
          queue.add(getHistory);
          queue.start();
        };
      } else {
        autoComplete.getHistory = function() {};
      };
      autoComplete.close = function() {
        queue.clear();
        if (autoComplete.ajax.length) {
          for (i = 0; i < autoComplete.ajax.length; i++) {
            autoComplete.ajax[i].abort();
          }
          autoComplete.ajax = [];
        }
        self.one(setting.wrapEl).hide();
      }
    });
    return autoComplete;
  };

}, {
  requires: ['wms.lego/queue/index', 'node','ajax']
});

KISSY.add('wms.lego/search/index', function(S, queue, autoc, Node) {
  var $ = Node.all;
  var exports = {};
  exports.init = function(config) {
    config = config || {};
    var elSearch = config.node || $('#J_Search');
    var elInput = $('.inp-search', elSearch);
    var autoComplete = autoc.call(elSearch, {
      ajaxUrl: 'http://suggest.taobao.com/sug',
      wrapEl: '.suggest',
      meatEl: '.suggest .meat',
      close: '.suggest .close',
      submit: '.bton-search',
      anim: true,
      addition: true,
      additionClass: ".addition",
      afterItemClick: function(n) {
        $('#J_Search .J_autocomplete').val($(this).attr('key'));
        $('#J_Search form')[0].submit();
      }
    });
  }
  return exports
}, {
  requires: ['wms.lego/queue/index', 'wms.lego/autocomplete/index', 'node']
})