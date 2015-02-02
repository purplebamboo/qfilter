// 回调传入了S（KISSY对象）和Slide构造器
/*
combined files :

gallery/slide/1.1/slide-util
gallery/slide/1.1/kissy2yui
gallery/slide/1.1/base
gallery/slide/1.1/index

*/
KISSY.add('gallery/slide/1.1/slide-util', function(S) {

  "use strict";

  // Node 澧炶ˉ鏂规硶

  S.mix(S, {
    setHash: function(sUrl, data) {
      var url;
      var i;
      if (typeof sUrl == 'object') {
        url = window.location.href;
        data = sUrl;
      } else {
        url = sUrl;
      }
      if (url.indexOf("#") < 0) {
        url += '#';
      }
      var o = this.getHash(url);
      for (i in data) {
        o[i] = data[i];
      }
      url = url.split("#")[0] + '#';
      for (i in o) {
        url += i + '=' + o[i] + '&';
      }
      url = url.substr(0, url.length - 1);
      return url;
    },
    getHash: function(sUrl) {
      var url = sUrl || window.location.href;
      if (url.indexOf("#") < 0) {
        return {};
      } else {
        var hash = url.split('#')[1];
        if (hash === '') return {};
        if (hash[hash.length - 1] == '&') hash = hash.substr(0, hash.length - 1);
        hash = hash.replace(/"/ig, '\'');
        // hash = hash.replace(/=/ig,'":"');
        hash = hash.replace(/=/ig, '":"');
        hash = hash.replace(/&/ig, '","');
        hash += '"';
        hash = "{\"" + hash + "}";
        var o = S.JSON.parse(hash);
        return o;
      }
    },

    _globalEval: function(data) {
      if (data && /\S/.test(data)) {
        var head = document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0],
          script = document.createElement('script');

        // 绁炲鐨勬敮鎸佹墍鏈夌殑娴忚鍣�
        script.text = data;

        head.insertBefore(script, head.firstChild);
        setTimeout(function() {
          head.removeChild(script);
        }, 1);
      }
    },
    // 涓€娈垫潅涔辩殑html鐗囨锛屾墽琛屽叾涓殑script鑴氭湰
    execScript: function(html) {
      var self = this;
      var re_script = new RegExp(/<script([^>]*)>([^<]*(?:(?!<\/script>)<[^<]*)*)<\/script>/ig); // 闃叉杩囨护閿欒

      var hd = S.one('head').getDOMNode(),
        match, attrs, srcMatch, charsetMatch,
        t, s, text,
        RE_SCRIPT_SRC = /\ssrc=(['"])(.*?)\1/i,
        RE_SCRIPT_CHARSET = /\scharset=(['"])(.*?)\1/i;

      re_script.lastIndex = 0;
      while ((match = re_script.exec(html))) {
        attrs = match[1];
        srcMatch = attrs ? attrs.match(RE_SCRIPT_SRC) : false;
        // 閫氳繃src鎶撳彇鍒拌剼鏈�
        if (srcMatch && srcMatch[2]) {
          s = document.createElement('script');
          s.src = srcMatch[2];
          // 璁剧疆缂栫爜绫诲瀷
          if ((charsetMatch = attrs.match(RE_SCRIPT_CHARSET)) && charsetMatch[2]) {
            s.charset = charsetMatch[2];
          }
          s.async = true; // hack gecko
          hd.appendChild(s);
        }
        // 濡傛灉鏄唴鑱旇剼鏈�
        else if ((text = match[2]) && text.length > 0) {
          self._globalEval(text);
        }
      }
    },
    // 鍒ゆ柇褰撳墠鐜鏄惁鏄痙aily鐜
    isDaily: function() {
      var self = this;
      if (/daily\.taobao\.net/.test(window.location.hostname)) {
        return true;
      } else {
        return false;
      }
    }

  });

}, {
  requires: [
    'node',
    'sizzle',
    'json',
    'event'
  ]
});

/*jshint browser:true,devel:true */

KISSY.add('gallery/slide/1.1/kissy2yui', function(S) {

  "use strict";

  // KISSY 2 YUI3
  S.augment(S.Node, {

    _delegate: function() {
      var self = this;
      if (S.isFunction(arguments[1])) {
        self.delegate(arguments[0], arguments[2], arguments[1]);
      } else {
        self.delegate.apply(self, arguments);
      }
      return self;
    },

    // IndexOf 鍘熺敓鑺傜偣
    indexOf: function(node) {
      var self = this;
      if (S.isUndefined(node)) {
        return null;
      }
      if (node[0]) {
        node = node[0];
      }
      var i = 0;
      self.each(function(el, index) {
        if (el[0] === node) {
          i = index;
        }
      });
      return i;

    },

    size: function() {
      return this.length;
    },

    set: function(k, v) {
      if (k === 'innerHTML') {
        this.html(v);
      } else {
        this.attr(k, v);
      }
      return this;
    },

    get: function(k) {
      var self = this;
      var o = {
        'innerHTML': function() {
          return self.html();
        },
        'region': function() {
          return {
            'height': self.height(),
            'width': self.width()
          };
        }

      };
      if (k in o) {
        return o[k]();
      }
    },

    appendChild: function() {
      this.append.apply(this, arguments);
      return this;
    },

    setStyle: function(k, v) {
      this.css.apply(this, arguments);
      return this;
    },

    setStyles: function(o) {
      this.css.apply(this, arguments);
      return this;
    },

    cloneNode: function() {
      return this.clone.apply(this, arguments);
    }
  });

  S.Node.create = function(str) {
    return S.Node(str);
  };

}, {
  requires: ['node', 'event']
});


/**
 * @file base.js
 * @brief Slide
 * @author jayli, bachi@taobao.com
 * @version
 * @date 2013-01-08
 */

/*jshint smarttabs:true,browser:true,devel:true,sub:true,evil:true */

KISSY.add('gallery/slide/1.1/base', function(S) {

  "use strict";

  // $ is $
  var $ = S.Node.all;

  // BSlide鏋勯€犲櫒
  // TODO BSlide宸ュ巶
  var BSlide = function() {

    // TODO 濡備綍浼犲弬?
    if (!(this instanceof BSlide)) {
      throw new Error('please use "new Slide()"');
    }

    this.init.apply(this, arguments);
  };

  // TODO 鎶界鍒囨崲鈥滄満鍒垛€濆拰瀹炵幇鐨勬柟娉�
  BSlide.plug = function(fn) {
    var self = this;
  };

  // 鎵╁厖BSlide
  S.augment(BSlide, S.Event.Target, {

    // 鏋勯€犲嚱鏁�
    init: function(selector, config) {

      var self = this;

      if (S.isObject(selector)) {
        self.con = selector;
      } else if (/^#/i.test(selector)) {
        self.con = S.one(selector);
      } else if (/^\./i.test(selector)) {
        self.con = S.one(selector);
      } else if (S.one("#" + selector)) {
        self.con = S.one("#" + selector);
      } else if (S.one(selector)) {
        self.con = S.one(selector);
      } else {
        throw new Error('Slide Container Hooker not found');
      }
      //鎺ュ彈鍙傛暟
      self.buildParam(config);
      //鏋勯€犲嚱鏁�
      self.buildHTML();
      //缁戝畾浜嬩欢
      self.bindEvent();

      // TODO:杩欏彞璇濇案杩滄棤娉曡Е鍙憆eady浜嬩欢
      self.fire('ready', {
        index: 0,
        navnode: self.tabs.item(0),
        pannelnode: self.pannels.item(0)
      });

      if (self.reverse) {
        var _t;
        _t = self.previous;
        self.previous = self.next;
        self.next = _t;
      }

      // 鍦ㄧЩ鍔ㄧ粓绔腑鐨勪紭鍖�
      if (self.carousel) {
        for (var i = 0; i < self.colspan; i++) {
          self.fix_for_transition_when_carousel(i * 2);
        }
      }

      self.fixSlideSize();

      // LayerSlide 鏁堟灉澧炲己
      if (self.layerSlide) {
        self.initLayer();
      }

      // 娓叉煋褰撳墠甯х殑lazyload鐨勫唴瀹�
      self.renderPannelTextarea(self.currentTab);

      return this;
    },

    // offset 1,-1
    setWrapperSize: function(offset) {
      var self = this;

      if (S.isUndefined(offset)) {
        offset = 0;
      }

      self.pannels = self.con.all('.' + self.contentClass + ' .' + self.pannelClass);
      self.length = self.pannels.length;

      var reHandleSize = {
        'none': function() {},
        'vSlide': function() {
          //缁熶竴瀹瑰櫒鍜宨tem鐨勫楂樺強閫変腑榛樿鍊�
          var animconRegion = self.animcon.get('region');
          self.animwrap.setStyles({
            'height': (self.length + offset) * animconRegion.height / self.colspan + 'px'
          });

        },
        'hSlide': function() {
          //缁熶竴瀹瑰櫒鍜宨tem鐨勫楂樺強閫変腑榛樿鍊�
          var animconRegion = self.animcon.get('region');
          self.animwrap.setStyles({
            'width': (self.length + offset) * animconRegion.width / self.colspan + 'px'
          });
        },
        'fade': function() {}

      };

      reHandleSize[self.effect]();

      // 濡傛灉浼犲叆offset 璇存槑浠呬粎璁＄畻wrapper鐨勫搴�
      if (!S.isUndefined(offset)) {
        self.relocateCurrentTab();
      }

      return this;
    },

    // 娣诲姞涓€涓抚锛宨ndex涓烘坊鍔犲埌鐨勭储寮曪紝榛樿娣诲姞鍒版渶鍚�
    add: function(node, index) {
      var self = this;

      if (S.isUndefined(index) || index > self.length) {
        index = self.length;
      }

      if (S.isString(node)) {
        node = S.one(node);
      }

      /*
      node.css({
        float:'left'
      });
      */

      // bugfix pad/phone涓伩鍏嶉棯灞�
      /*
       * pad/phone涓鍣ㄥ搴�>=641鏃讹紝dom涓婄殑鏍峰紡鏀瑰彉浼氭湁reflow锛屽皬浜庢椂锛屾病鏈塺eflow
       * 鍦╬hone涓細姣旇緝骞虫粦锛屼笉浼氭湁闂睆
       *
       */
      if (self.transitions) {
        node.css({
          visibility: 'hidden'
        });
      }

      if (index == self.length) {
        // bugfix锛岄槻姝㈠湪webkit涓洜涓鸿缃簡backface灞炴€э紝瀵艰嚧dom鎿嶄綔娓叉煋寤惰繜锛宻lide鎿嶄綔浼氭湁闂儊
        setTimeout(function() {
          self.setWrapperSize(1);
        }, 0);
        node.insertAfter(self.pannels[index - 1]);
      } else {
        node.insertBefore(self.pannels[index]);
      }

      self.setWrapperSize();

      self.fixSlideSize(self.currentTab);

      // bugfix pad/phone涓伩鍏嶉棯灞�
      if (self.transitions) {
        node.css({
          visibility: ''
        });
      }

      if (self.transitions) {}

      return this;

      // TODO 娣诲姞闈㈡澘鐨勬椂鍊欙紝娌℃湁娣诲姞瀵艰埅
    },
    remove: function(index) {
      var self = this;

      if (self.length === 1) {
        return;
      }

      // 鍒犻櫎褰撳墠甯у拰涔嬪墠甯ф椂锛宑urrentTab闇€-1
      if (index <= self.currentTab) {
        self.currentTab--;
        self.length--;
      }

      // bugfix,闃叉绉诲姩璁惧涓殑闂睆
      if (self.transitions) {
        self.con.css({
          display: 'none'
        });
      }

      S.one(self.pannels[index]).remove();

      self.setWrapperSize();

      // bugfix,闃叉绉诲姩璁惧涓殑闂睆
      if (self.transitions) {
        self.con.css({
          display: 'block'
        });
      }

      self.fixSlideSize(self.currentTab);

      // TODO 鍒犻櫎闈㈡澘鐨勬椂鍊欙紝娌℃湁鍒犻櫎瀵艰埅
      return this;
    },
    // 鍒犻櫎鏈€鍚庝竴甯�
    removeLast: function() {
      var self = this;
      self.remove(self.length - 1);
      return self;
    },

    //娓叉煋textarea涓殑鍐呭锛屽苟鏀惧湪涓庝箣鐩搁偦鐨勪竴涓猟iv涓紝鑻ユ湁鑴氭湰锛屾墽琛屽叾涓剼鏈�
    renderLazyData: function(textarea) {
      var self = this;
      textarea.setStyle('display', 'none');
      if (textarea.attr('lazy-data') == '1') {
        return;
      }
      textarea.attr('lazy-data', '1');
      var id = S.stamp(div),
        html = textarea.get('innerHTML').replace(/&lt;/ig, '<').replace(/&gt;/ig, '>'),
        div = S.Node.create('<div>' + html + '</div>');
      S.DOM.insertBefore(div, textarea);
      S.execScript(html);
    },
    // 娓叉煋绗琲ndex涓猵annel鐨勫欢杩熸覆鏌撶殑textarea
    renderPannelTextarea: function(index) {
      var self = this;
      if (!self.pannels.item(index)) {
        return;
      }

      var renderOnePannelT = function(index) {
        var con = S.one(self.pannels.item(index));

        var scriptsArea = self.pannels.item(index).all('.data-lazyload');
        if (scriptsArea) {
          scriptsArea.each(function(node, i) {
            self.renderLazyData(node);
          });
        }
      };

      for (var i = 0; i < self.colspan; i++) {
        renderOnePannelT(index + i);
      }
    },

    // 濡傛灉鏄姩鐢绘晥鏋滐紝鍒欐瀯寤篧rap
    buildWrap: function() {
      var self = this;

      self.animwrap = S.Node.create('<div style="position:absolute;"></div>');
      self.animwrap.set('innerHTML', self.animcon.get('innerHTML'));
      self.animcon.set('innerHTML', '');
      self.animcon.appendChild(self.animwrap);
      self.pannels = self.con.all('.' + self.contentClass + ' .' + self.pannelClass);

      return self;

    },

    // 鍚勭鍔ㄧ敾鏁堟灉鐨勫垵濮嬪寲琛屼负
    // TODO 搴斿綋浠嶣SLide涓娊鍙栧嚭鏉�
    doEffectInit: function() {

      var self = this;

      var effectInitFn = {
        'none': function() {

          self.pannels = self.con.all('.' + self.contentClass + ' .' + self.pannelClass);
          self.pannels.setStyles({
            display: 'none'
          });

          self.pannels.item(self.defaultTab).setStyles({
            'display': 'block'
          });

        },
        'vSlide': function() {
          self.buildWrap();
          //缁熶竴瀹瑰櫒鍜宨tem鐨勫楂樺強閫変腑榛樿鍊�
          var animconRegion = self.animcon.get('region');
          self.pannels.setStyles({
            'float': 'none',
            'overflow': 'hidden'
          });
          self.animwrap.setStyles({
            'height': self.length * animconRegion.height / self.colspan + 'px',
            'overflow': 'hidden',
            'top': -1 * self.defaultTab * animconRegion.height + 'px'
          });
        },

        'hSlide': function() {
          self.buildWrap();
          //缁熶竴瀹瑰櫒鍜宨tem鐨勫楂樺強閫変腑榛樿鍊�
          var animconRegion = self.animcon.get('region');
          self.pannels.setStyles({
            'float': 'left',
            'overflow': 'hidden'
          });
          self.animwrap.setStyles({
            'width': self.length * animconRegion.width / self.colspan + 'px',
            'overflow': 'hidden',
            'left': -1 * self.defaultTab * animconRegion.width + 'px'
          });
        },
        'fade': function() {

          self.pannels = self.con.all('.' + self.contentClass + ' .' + self.pannelClass);
          self.pannels.setStyles({
            'position': 'absolute',
            'zIndex': 0
          });
          self.pannels.each(function(node, i) {
            if (i == self.defaultTab) {
              //node.removeClass('hidden');
              node.setStyles({
                'opacity': 1,
                'display': 'block'
              });
            } else {
              //node.addClass('hidden');
              node.setStyles({
                'opacity': 0,
                'diaplay': 'none'
              });
            }
          });
        }
      };

      effectInitFn[self.effect]();

      return this;
    },
    //鏋勫缓html缁撴瀯鐨勫叏灞€鍑芥暟
    buildHTML: function() {
      var self = this;
      var con = self.con;
      self.tabs = con.all('.' + self.navClass + ' ' + self.triggerSelector);

      var tmp_pannels = con.all('.' + self.contentClass + ' .' + self.pannelClass);
      self.length = tmp_pannels.size();

      if (!con.one('.' + self.navClass)) {
        S.Node('<ul class="' + self.navClass + '" style="display:none"></ul>').appendTo(self.con);
      }

      if (self.tabs.size() === 0) {
        //nav.li娌℃湁鎸囧畾锛岄粯璁ゆ寚瀹�1234
        var t_con = con.all('.' + self.navClass);
        var t_str = '';
        for (var i = 0; i < self.length; i++) {
          var t_str_prefix = '';
          if (i === 0) {
            t_str_prefix = self.selectedClass;
          }
          t_str += '<li class="' + t_str_prefix + '"><a href="javascript:void(0);">' + (i + 1) + '</a></li>';
        }
        t_con.set('innerHTML', t_str);
      }
      self.tabs = con.all('.' + self.navClass + ' ' + self.triggerSelector);
      self.animcon = con.one('.' + self.contentClass);
      self.animwrap = null;

      self.doEffectInit();

      self.fixSlideSize(self.currentTab);
      //娣诲姞閫変腑鐨刢lass
      self.hightlightNav(self.getWrappedIndex(self.currentTab));
      //鏄惁鑷姩鎾斁
      if (self.autoSlide === true) {
        self.play();
      }
      return this;
    },
    getCurrentPannel: function() {
      var self = this;
      return S.one(self.pannels[self.currentTab]);
    },


    // 閲嶆柊娓叉煋slide鍐呴〉(pannels)鐨勫搴�
    renderWidth: function() {
      var self = this;
      //鏈夊彲鑳絘nimcon娌℃湁瀹氫箟瀹藉害
      var width = self.animcon.get('region').width;
      if (self.effect == 'hSlide') {
        width /= self.colspan;
      }
      self.pannels.setStyles({
        width: width + 'px'
      });
      return this;
    },

    //閲嶆柊娓叉煋slide鍐呴〉(pannels)鐨勯珮搴�
    renderHeight: function() {
      var self = this;
      //鏈夊彲鑳絘nimcon娌℃湁瀹氫箟楂樺害
      var height = self.animcon.get('region').height;
      if (self.effect == 'vSlide') {
        height /= self.colspan;
      }
      self.pannels.setStyles({
        height: height + 'px'
      });
      return this;
    },

    //褰撳綋鍓嶅抚鐨勪綅缃笉姝ｇ‘鏃讹紝閲嶆柊瀹氫綅褰撳墠甯у埌姝ｇ‘鐨勪綅缃�,鏃犲姩鐢�
    relocateCurrentTab: function(index) {
      var self = this;
      if (S.isUndefined(index)) {
        index = self.currentTab;
      }
      if (self.effect != 'hSlide') {
        return;
      }

      if (self.transitions) {
        self.animwrap.setStyles({
          '-webkit-transition-duration': '0s',
          '-webkit-transform': 'translate3d(' + (-1 * index * self.animcon.get('region').width / self.colspan) + 'px,0,0)',
          '-webkit-backface-visibility': 'hidden'
        });
      } else {
        self.animwrap.setStyles({
          left: -1 * index * self.animcon.get('region').width / self.colspan

        });
      }

      self.currentTab = index;

      return this;
    },

    //鏍规嵁閰嶇疆鏉′欢淇鎺т欢灏哄
    // 閲嶆柊娓叉煋slide鐨勫昂瀵革紝
    // 鏍规嵁go鍒扮殑index绱㈠紩鍊兼覆鏌撳綋鍓嶉渶瑕佺殑闀垮害鍜屽搴�
    fixSlideSize: function(index) {
      var self = this;
      if (self.adaptive_fixed_width) {
        self.renderWidth();
      }
      if (self.adaptive_fixed_height) {
        self.renderHeight();
      }
      if (self.adaptive_fixed_size) {
        self.renderHeight().renderWidth();
      }
      self.resetSlideSize(index);
      return this;
    },

    // timmer 鏄寚鐨勫姩鎬佺洃鎺rapperCon楂樺害鐨勫畾鏃跺櫒
    // wrapperCon鍦ㄥ緢澶氭椂鍊欓珮搴︽槸鍙彉鐨�
    // 杩欐椂灏遍渶瑕乼immer鏉ョ洃鍚簡
    removeHeightTimmer: function() {
      var self = this;
      if (!S.isNull(self.heightTimmer)) {
        clearInterval(self.heightTimmer);
        self.heightTimmer = null;
      }
    },
    addHeightTimmer: function() {
      var self = this;
      if (!S.isNull(self.heightTimmer)) {
        clearInterval(self.heightTimmer);
        self.heightTimmer = null;
      }

      var resetHeight = function() {
        if (self.effect == 'hSlide') {
          self.animcon.setStyles({
            height: self.pannels.item(self.currentTab).get('region').height + 'px'
          });
        }
      };
      self.heightTimmer = setInterval(resetHeight, 100);
      resetHeight();
    },

    //鍦╞efore_switch鍜寃indowResize鐨勬椂鍊欐墽琛岋紝鏍规嵁spec_width鏄惁鎸囧畾锛屾潵鍐冲畾鏄惁閲嶇疆椤甸潰涓殑閫傞厤鍑烘潵鐨勫搴﹀拰楂樺害骞惰祴鍊�
    // index鏄痝o鐨勭洰鏍噒ab-pannel鐨勭储寮�
    // 杩欎釜鍑芥暟涓昏閽堝妯悜婊氬姩鏃跺悇涓猵annel楂樺害涓嶅畾鐨勬儏鍐�
    resetSlideSize: function(index) {
      var self = this;
      var width, height;
      if (typeof index == 'undefined' || index === null) {
        index = self.currentTab;
      }
      // 濡傛灉娌℃湁寮€鍏筹紝鎴栬€呮病鏈夋粦鍔ㄧ壒鏁堬紝鍒欓€€鍑哄嚱鏁�
      if (self.effect != 'hSlide' && self.effect != 'vSlide') {
        return;
      }
      //var width = self.spec_width();

      if (self.effect == 'hSlide') {
        width = self.adaptive_width ?
          self.adaptive_width() :
          self.animcon.get('region').width;
        height = self.pannels.item(index).get('region').height;

        width /= self.colspan;

        // pannels鐨勯珮搴︽槸涓嶅畾鐨勶紝楂樺害鏄牴鎹唴瀹�
        // 鏉ユ拺寮€鐨勫洜姝や笉鑳借缃珮搴︼紝鑰屽搴﹀垯闇€瑕佽缃�
        self.pannels.setStyles({
          width: width + 'px',
          display: 'block'
        });

        self.animcon.setStyles({
          width: width * self.colspan + 'px',
          overflow: 'hidden'
        });

        if (self.animWrapperAutoHeightSetting) {
          self.animcon.setStyles({
            height: height + 'px'
            //寮哄埗pannel鐨勫唴瀹逛笉瓒呰繃鍔ㄧ敾瀹瑰櫒鐨勮寖鍥�
          });
        }
      }

      if (self.effect == 'vSlide') {
        width = self.pannels.item(index).get('region').width;
        height = self.adaptive_height ?
          self.adaptive_height() :
          self.animcon.get('region').height;
        height /= self.colspan;

        self.pannels.setStyles({
          height: height * self.colspan + 'px',
          display: 'block'
        });

        self.animcon.setStyles({
          height: height * self.colspan + 'px',
          overflow: 'hidden'
        });

        if (self.animWrapperAutoHeightSetting) {
          self.animcon.setStyles({
            width: width + 'px'
            //寮哄埗pannel鐨勫唴瀹逛笉瓒呰繃鍔ㄧ敾瀹瑰櫒鐨勮寖鍥�
          });
        }

      }

      return this;
    },

    // 寰楀埌tabnav搴斿綋鏄剧ず鐨勫綋鍓峣ndex绱㈠紩锛�0,1,2,3...
    getWrappedIndex: function(index) {
      var self = this,
        wrappedIndex = 0;

      if (index === 0) {
        //debugger;
      }
      if (self.carousel) {

        if (index < self.colspan) {
          wrappedIndex = self.length - self.colspan * 3 + index;
        } else if (index >= self.length - self.colspan) {
          wrappedIndex = index - (self.length - self.colspan);
        } else {
          wrappedIndex = index - self.colspan;
        }

      } else {
        wrappedIndex = index;
      }
      return wrappedIndex;
    },

    getMousePosition: function() {
      var self = this;
      var domousemove = function(e) {
        self._t_mouseX = e.clientX;
        self._t_mouseY = e.clientY;
      };
      S.Event.on(document, 'mousemove', domousemove);
      setTimeout(function() {
        S.Event.detach(window, 'mouseover', domousemove);
      }, self.triggerDelay);
    },
    // 澶ч噺瑙︾浜嬩欢鐨勫鐞嗭紝甯︿笂寤舵椂鐨勮繃婊わ紝闃叉棰戠箒澶勭悊鍒囨崲
    massTrigger: function(cb, el) {
      var self = this;
      if (!S.inArray(self.eventType, ['mouseover', 'mouseenter'])) {
        cb(S.one(el));
        return;
      }
      self.getMousePosition();
      if (S.isUndefined(self._fired) || S.isNull(self._fired)) {
        self._fired = setTimeout(function() {
          if (self.inRegion([self._t_mouseX + S.DOM.scrollLeft(), self._t_mouseY + S.DOM.scrollTop()], S.one(el))) {
            cb(S.one(el));
          }
          self._fired = null;
        }, self.triggerDelay);
      } else {
        clearTimeout(self._fired);
        self._fired = setTimeout(function() {
          if (self.inRegion([self._t_mouseX + S.DOM.scrollLeft(), self._t_mouseY + S.DOM.scrollTop()], S.one(el))) {
            cb(S.one(el));
          }
          self._fired = null;
        }, self.triggerDelay);
      }

    },

    // 鑾峰彇褰撳墠subLayer閫€鍑哄姩鐢荤殑delay鏈€澶у€笺€�
    getMaxAnimDelay: function(index) {
      var self = this,
        max = 0;

      if (!self.sublayers) {
        return;
      }

      S.each(self.sublayers[index], function(sublayer) {
        if (sublayer.durationout + sublayer.delayout > max) {
          max = sublayer.durationout + sublayer.delayout;
        }
      });

      return max;
    },

    // 鍒ゆ柇涓€涓偣鏄惁鍦ㄦ煇涓尯鍩熷唴
    inRegion: function(point, el) {
      var offset = el.offset();
      var layout = {
        width: el.width(),
        height: el.height()
      };
      if (point[0] >= offset.left && point[0] <= offset.left + layout.width) {
        if (point[1] >= offset.top && point[1] <= offset.top + layout.height) {
          return true;
        }
      }
      return false;
    },

    // 缁戝畾榛樿浜嬩欢
    bindEvent: function() {
      var self = this;
      if (S.inArray(self.eventType, ['click', 'mouseover', 'mouseenter'])) {
        self.con._delegate(self.eventType, function(e) {
          //e.halt();
          e.preventDefault();
          self.massTrigger(function(el) {
            var ti = Number(self.tabs.indexOf(el));
            if (self.carousel) {
              ti = (ti + 1) % self.length;
            }
            self.go(ti);
            if (self.autoSlide) {
              self.stop().play();
            }
          }, e.currentTarget);
        }, '.' + self.navClass + ' ' + self.triggerSelector);
      }

      // 鏄惁鏀寔榧犳爣鎮仠鍋滄鎾斁
      if (self.hoverStop) {
        self.con._delegate('mouseover', function(e) {
          //e.halt();
          if (self.autoSlide) self.stop();
        }, '.' + self.contentClass + ' .' + self.pannelClass);
        self.con._delegate('mouseout', function(e) {
          //e.halt();
          if (self.autoSlide) self.play();
        }, '.' + self.contentClass + ' .' + self.pannelClass);
      }

      // 缁戝畾绐楀彛resize浜嬩欢
      try {
        S.Event.on('resize', function(e) {
          self.fixSlideSize(self.currentTab);
          self.relocateCurrentTab();
        }, window);
      } catch (e) {}

      // 缁戝畾鍒ゆ柇switch鍙戠敓鐨勬椂鏈�
      self.on('beforeSwitch', function(o) {
        if (this.layerSlide && this.isAming()) {
          return false;
        }
      });

      //缁堢浜嬩欢瑙﹀睆浜嬩欢缁戝畾
      // TODO 瑙﹀睆璁惧鐩墠鍜宨e6鐨勯檷绾ф柟妗堝疄鐜颁竴鏍�,鐩墠娌″疄鐜伴檷绾�
      // TODO 闇€瑕佸皢瑙﹀睆鏀寔鎶界鍑築Slide
      if ('ontouchstart' in document.documentElement) {

        if (!self.touchmove) {
          return this;
        }

        self.con._delegate('touchstart', function(e) {
          self.stop();
          self.touching = true;
          if (self.is_last() && self.carousel) {
            self.fix_next_carousel();
          }
          if (self.is_first() && self.carousel) {
            self.fix_pre_carousel();
          }
          self.startX = e.changedTouches[0].clientX;
          self.startY = e.changedTouches[0].clientY;
          self.animwrap.setStyles({
            '-webkit-transition-duration': '0s'
          });
          self.startT = Number(new Date()); //濡傛灉蹇€熸墜婊戯紝鍒欐帬杩噒ouchmove锛屽洜姝ら渶瑕佽绠楁椂闂�
        }, '.' + self.contentClass);

        self.con._delegate('touchend', function(e) {
          self.touching = false;
          var endX = e.changedTouches[0].clientX;
          var width = Number(self.animcon.get('region').width);
          self.deltaX = Math.abs(endX - self.startX); //婊戣繃鐨勮窛绂�
          var swipeleft = (Math.abs(endX) < Math.abs(self.startX)); //鏄惁鏄悜宸︽粦鍔�
          var swiperight = !swipeleft;
          //鍒ゆ柇鏄惁鍦ㄨ竟鐣屽弽婊戝姩锛宼rue锛屽嚭鐜颁簡鍙嶆粦鍔紝false锛屾甯告粦鍔�
          var anti = self.carousel ? false : (self.is_last() && swipeleft || self.is_first() && swiperight);

          //澶嶄綅
          var reset = function() {
            self.animwrap.setStyles({
              '-webkit-transition-duration': (Number(self.speed) / 2) + 's',
              '-webkit-transform': 'translate3d(' + (-1 * self.currentTab * self.animcon.get('region').width / self.colspan) + 'px,0,0)'
            });
          };

          //鏍规嵁鎵嬪娍璧板悜涓婁竴涓垨涓嬩竴涓�
          var goswipe = function() {
            var colwidth = self.animcon.get('region').width / self.colspan;
            var span = parseInt((self.deltaX - colwidth / 2) / colwidth, 10);
            // 婊戝姩璺濈瓒呰繃涓€甯�
            if (swipeleft) { //涓嬩竴甯�
              if (span >= 1 && self.length > 2) {
                //  +1 鏄负浜嗗湪鍚戝彸婊戝姩鏃讹紝濮嬬粓淇濇寔鍓嶈繘涓€妗ｏ紝涓嶄細鍑虹幇鍚庨€€涓€鏍�
                self.currentTab += span + 1;
                if (self.currentTab >= (self.length - self.colspan)) {
                  self.currentTab = self.length - self.colspan - 1;
                }
              }
              self.next();
            } else { //涓婁竴甯�
              if (span >= 1 && self.length > 2) {
                //  -1 鏄负浜嗗湪鍚戝乏婊戝姩鏃讹紝濮嬬粓淇濇寔鍚戝乏鍒掞紝涓嶄細鍑虹幇鍥炲脊
                self.currentTab += -1 * span - 1;
                // 濡傛灉婊戝姩鍒拌捣濮嬩綅缃紝灏变笉闇€瑕佸啀鍑忎竴浜�
                if (self.currentTab <= 0) {
                  self.currentTab = 1;
                }
              }
              self.previous();
            }
          };

          //濡傛灉妫€娴嬪埌鏄笂涓嬫粦鍔紝鍒欏浣嶅苟return

          if (self.isScrolling) {
            reset();
            return;
          }


          //濡傛灉婊戝姩鐗╃悊璺濈澶皬锛屽垯澶嶄綅骞秗eturn
          //杩欎釜鏄伩鍏嶅皢涓嶇簿纭殑鐐瑰嚮璇涓烘槸婊戝姩
          if (self.touchmove && self.deltaX < 30) {
            reset();
            return;
          }


          if (!anti && (
              // 鏀寔touchmove锛岃窇椹伅鏁堟灉锛屼换鎰忓抚锛宼ouchmove瓒冲鐨勮窛绂�
              (self.touchmove && (self.deltaX > width / 3)) ||
              // 涓嶆敮鎸乼ouchmove锛岃窇椹伅
              (!self.touchmove && self.carousel) ||
              // 姝ｅ父tab锛屾敮鎸乼ouchmove锛屾í鍚戝垏鎹�
              (!self.carousel && self.touchmove && self.effect == 'hSlide') ||
              // 涓嶆敮鎸乼ouchmove锛屼笉鏀寔璺戦┈鐏�
              (!self.touchmove && !self.carousel) ||
              //蹇€熸墜婊�
              (Number(new Date()) - self.startT < 550)
            )

          ) {

            //鏍规嵁鏍规嵁鎵嬫粦鏂瑰悜缈诲埌涓婁竴椤靛拰涓嬩竴椤�
            goswipe();

          } else {
            //澶嶄綅
            reset();
          }

          if (self.autoSlide) {
            self.play();
          }
        }, '.' + self.contentClass);


        //澶勭悊鎵嬫寚婊戝姩浜嬩欢鐩稿叧
        if (self.touchmove) {

          // TODO 缃戦〉鏀惧ぇ缂╁皬鏃讹紝璺濈璁＄畻鏈夎宸�


          self.con._delegate('touchmove', function(e) {
            // 纭繚鍗曟墜鎸囨粦鍔紝鑰屼笉鏄鐐硅Е纰�
            if (e.touches.length > 1) return;


            //deltaX > 0 锛屽彸绉伙紝deltaX < 0 宸︾Щ
            self.deltaX = e.touches[0].clientX - self.startX;

            //鍒ゆ柇鏄惁鍦ㄨ竟鐣屽弽婊戝姩锛宼rue锛屽嚭鐜颁簡鍙嶆粦鍔紝false锛屾甯告粦鍔�
            var anti = (self.is_last() && self.deltaX < 0 || self.is_first() && self.deltaX > 0);

            if (!self.carousel && self.effect == 'hSlide' && anti) {
              self.deltaX = self.deltaX / 3; //濡傛灉鏄竟鐣屽弽婊戝姩锛屽垯澧炲姞闃诲凹鏁堟灉
            }

            // 鍒ゆ柇鏄惁闇€瑕佷笂涓嬫粦鍔ㄩ〉闈�


            self.isScrolling = (Math.abs(self.deltaX) < Math.abs(e.touches[0].clientY - self.startY)) ? true : false;

            if (!self.isScrolling) {

              // 闃绘榛樿涓婁笅婊戝姩浜嬩欢
              //e.halt();
              e.preventDefault();

              self.stop();
              var width = Number(self.animcon.get('region').width / self.colspan);
              var dic = self.deltaX - self.currentTab * width;

              // 绔嬪嵆璺熼殢绉诲姩
              self.animwrap.setStyles({
                '-webkit-transition-duration': '0s',
                '-webkit-transform': 'translate3d(' + dic + 'px,0,0)'
              });

            }

          }, '.' + self.contentClass);

          // TODO 瑙﹀睆璁惧涓殑AnimEnd浜嬩欢鐨勫疄鐜�
          self.animwrap.on('webkitTransitionEnd', function() {

            /*
            self.fire('afterSwitch',{
              index: index,
              navnode: self.tabs.item(self.getWrappedIndex(index)),
              pannelnode: self.pannels.item(index)

            });
            */
          });
        }

      }

      return this;

    },

    // 鍒濆鍖栨墍鏈夌殑SubLayer
    // TODO 浠嶣Slide涓娊绂诲嚭鏉�

    /*
     * SubLayer瀛樻斁鍦�:
     *
     * self {
     *    sublayers:[
     *      [], // 绗竴甯х殑sublay鏁扮粍,鍙互涓虹┖鏁扮粍
     *      [], // ...
     *      []
     *    ]
     * }
     *
     * */

    initLayer: function() {
      var self = this;

      // 鍦ㄨЕ灞忚澶囦腑layer鍔熻兘鏆傛椂鍘绘帀
      // TODO 搴斿綋鍔犱笂瑙﹀睆鏀寔
      if ('ontouchstart' in document.documentElement) {
        return;
      }

      if (S.UA.ie > 0 && S.UA.ie < 9) {
        return;
      }

      // 杩囨护rel涓殑閰嶇疆椤�
      var SubLayerString = [
        "durationin",
        "easingin",
        "durationout",
        "easingout",
        "delayin",
        "delayout",
        "slideindirection",
        "slideoutdirection",
        "offsetin",
        "offsetout",
        "alpha",

        "easeInStrong",
        "easeOutStrong",
        "easeBothStrong",
        "easeNone",
        "easeIn",
        "easeOut",
        "easeBoth",
        "elasticIn",
        "elasticOut",
        "elasticBoth",
        "backIn",
        "backOut",
        "backBoth",
        "bounceIn",
        "bounceOut",
        "bounceBoth",
        "left",
        "top",
        "right",
        "bottom"
      ];

      // sublay鐨勯粯璁ら厤缃」锛屽弬鐓ф枃浠堕《閮ㄦ枃妗ｈ鏄�
      var SubLayerConfig = {
        "durationin": 1000,
        "easingin": 'easeIn',
        "durationout": 1000,
        "easingout": 'easeOut',
        "delayin": 300,
        "delayout": 300,
        "slideindirection": 'right',
        "slideoutdirection": 'left',
        "alpha": true,
        "offsetin": 50,
        "offsetout": 50
      };

      // SubLayer 鏋勯€犲櫒,浼犲叆鍗曚釜el锛岀敓鎴怱ubLayer瀵硅薄
      var SubLayer = function(el) {

        var that = this;
        var _sublayer_keys = [];

        // 濡傛灉sublayer閰嶇疆鐨勪功鍐欐牸寮忎笉鏍囧噯锛屽垯杩欓噷浼氭姤閿�
        // TODO 閿欒鎹曟崏澶勭悊
        var json = el.attr('rel').replace(/"'/ig, '').replace(new RegExp('(' + SubLayerString.join('|') + ')', "ig"), '"$1"');

        var o = S.JSON.parse('{' + json + '}');

        function setParam(def, key) {
          var v = o[key];
          // null 鏄崰浣嶇
          that[key] = (v === undefined || v === null) ? def : v;
        }


        S.each(SubLayerConfig, setParam);

        this.el = el;

        // el.offset 璁＄畻楂樺害涓嶅噯纭紝涓嶇煡涓轰綍锛屾敼鐢╟ss()
        // TODO 瀵绘壘鍘熷洜
        /*
        this.left = el.offset().left;
        this.top = el.offset().top;
        */
        this.left = Number(el.css('left').replace('px', ''));
        this.top = Number(el.css('top').replace('px', ''));

        // sublayer.animIn()锛屾煇涓猻ublayer鐨勮繘鍏ュ姩鐢�
        this.animIn = function() {

          var that = this;

          // 璁板綍杩涘叆鍋忕Щ閲忓拰杩涘叆鏂瑰悜
          var offsetIn = that.offsetin;
          var inType = that.slideindirection;

          // 鍔ㄧ敾寮€濮嬩箣鍓嶇殑棰勫鐞�
          var prepareEl = {
            left: function() {
              that.el.css({
                'left': that.left - offsetIn
              });
            },
            top: function() {
              that.el.css({
                'top': that.top - offsetIn
              });
            },
            right: function() {
              that.el.css({
                'left': that.left + offsetIn
              });
            },
            bottom: function() {
              that.el.css({
                'top': that.top + offsetIn
              });
            }
          };

          prepareEl[inType]();

          setTimeout(function() {


            var SlideInEffectTo = {
              left: {
                left: that.left // + offsetIn
              },
              top: {
                top: that.top // - offsetIn
              },
              bottom: {
                top: that.top // + offsetIn,
              },
              right: {
                left: that.left // - offsetIn
              }
            };



            // 鍔ㄧ敾缁撴潫鐨勫睘鎬�
            var to = {};

            S.mix(to, SlideInEffectTo[inType]);

            // 濡傛灉寮€鍚痑lpha锛屽垯浠庨€忔槑鍔ㄧ敾鍒颁笉閫忔槑
            if (that.alpha) {
              S.mix(to, {
                opacity: 1
              });
            }


            // 鎵ц鍔ㄧ敾
            S.Anim(that.el, to, that.durationin / 1000, that.easingin, function() {
              // TODO 鍔ㄧ敾缁撴潫鍚庣殑鍥炶皟浜嬩欢
              // 瀵绘壘鏈€鍚庣殑鍔ㄧ敾缁撴潫鏃堕棿
            }).run();

          }, that.delayin);

          if (that.alpha) {
            that.el.css({
              opacity: 0
            });
          }


        };
        // TODO 浠挎晥animIn鏉ュ疄鐜�
        this.animOut = function() {
          var that = this;

          // 璁板綍閫€鍑哄亸绉婚噺鍜岄€€鍑烘柟鍚�
          var offsetOut = that.offsetout;
          var outType = that.slideoutdirection;

          // 鍔ㄧ敾寮€濮嬩箣鍓嶇殑棰勫鐞�
          var prepareEl = {
            left: function() {
              that.el.css({
                'left': that.left
              });
            },
            top: function() {
              that.el.css({
                'top': that.top
              });
            },
            right: function() {
              that.el.css({
                'left': that.left
              });
            },
            bottom: function() {
              that.el.css({
                'top': that.top
              });
            }
          };

          prepareEl[outType]();

          setTimeout(function() {
            var SlideOutEffectTo = {
              left: {
                left: that.left + offsetOut
              },
              top: {
                top: that.top + offsetOut
              },
              bottom: {
                top: that.top - offsetOut
              },
              right: {
                left: that.left - offsetOut
              }
            };



            // 鍔ㄧ敾缁撴潫鐨勫睘鎬�
            var to = {};

            S.mix(to, SlideOutEffectTo[outType]);

            // 濡傛灉寮€鍚痑lpha锛屽垯浠庨€忔槑鍔ㄧ敾鍒颁笉閫忔槑
            if (that.alpha) {
              S.mix(to, {
                opacity: 0
              });
            }


            // 鎵ц鍔ㄧ敾
            S.Anim(that.el, to, that.durationout / 1000, that.easingout, function() {
              // TODO 鍔ㄧ敾缁撴潫鍚庣殑鍥炶皟浜嬩欢
              // 瀵绘壘鏈€鍚庣殑鍔ㄧ敾缁撴潫鏃堕棿
            }).run();

          }, that.delayout);

          if (that.alpha) {
            that.el.css({
              opacity: 1
            });
          }

        };

      };

      self.sublayers = [];

      self.pannels.each(function(node, index) {

        if (self.effect == 'vSlide' || self.effect == 'hSlide') {
          node.css({
            position: 'relative'
          });
        }

        if (node.all('[alt="sublayer"]').length === 0) {
          self.sublayers[index] = [];
          return;
        }
        if (self.sublayers[index] === undefined) {
          self.sublayers[index] = [];
        }

        node.all('[alt="sublayer"]').each(function(el, j) {
          self.sublayers[index].push(new SubLayer(el));
        });

      });

      self.on('beforeSwitch', function(o) {
        if (o.index === self.currentTab) {
          return false;
        }
        self.subLayerRunin(o.index);
      });

      self.on('beforeTailSwitch', function(o) {
        //if(self.isTailSwitching === true) {
        //  return false;
        //}

        //self.isTailSwitching = true;
        self.subLayerRunout(o.index);
        // 鍚屾椂锛岃繑鍥為渶瑕乨elay鐨勬渶闀挎椂闂�
        return self.getMaxAnimDelay(o.index);
      });

    },

    // 鎵ц鏌愪竴甯х殑杩涘叆鍔ㄧ敾
    subLayerRunin: function(index) {

      var self = this;

      var a = self.sublayers[index];

      S.each(a, function(o, i) {
        o.animIn();
      });
    },

    // 鎵ц鏌愪竴甯х殑绉诲嚭鍔ㄧ敾
    subLayerRunout: function(index) {
      var self = this;

      var a = self.sublayers[index];

      S.each(a, function(o, i) {
        o.animOut();
      });

    },

    // 鏋勫缓BSlide鍏ㄥ眬鍙傛暟鍒楄〃
    buildParam: function(o) {

      var self = this;

      if (o === undefined || o === null) {
        o = {};
      }

      function setParam(def, key) {
        var v = o[key];
        // null 鏄崰浣嶇
        self[key] = (v === undefined || v === null) ? def : v;
      }

      S.each({
        autoSlide: false,
        speed: 500, //ms
        timeout: 3000,
        effect: 'none',
        eventType: 'click',
        easing: 'easeBoth',
        hoverStop: true,
        selectedClass: 'selected',
        conClass: 't-slide',
        navClass: 'tab-nav',
        triggerSelector: 'li',
        contentClass: 'tab-content',
        pannelClass: 'tab-pannel',
        // before_switch: new Function,
        carousel: false,
        reverse: false,
        touchmove: false,
        adaptive_fixed_width: false,
        adaptive_fixed_height: false,
        adaptive_fixed_size: false,
        adaptive_width: false,
        adaptive_height: false,
        defaultTab: 0,
        layerSlide: false,
        layerClass: 'tab-animlayer',
        colspan: 1,
        animWrapperAutoHeightSetting: true, // beforeSwitch涓嶄慨鏀箇rappercon 瀹介珮
        webkitOptimize: true,
        triggerDelay: 300 // added by jayli 2013-05-21锛岃Е纰板欢鏃�

      }, setParam);

      S.mix(self, {
        tabs: [],
        animcon: null,
        pannels: [],
        timmer: null,
        touching: false
      });

      self.speed = self.speed / 1000;

      if (self.defaultTab !== 0) {
        self.defaultTab = Number(self.defaultTab) - 1; // 榛樿闅愯棌鎵€鏈塸annel
      }

      // 濡傛灉鏄窇椹伅锛屽垯涓嶈€冭檻榛樿閫変腑鐨勫姛鑳斤紝涓€寰嬪畾浣嶅湪绗竴椤�,涓斿彧鑳芥槸宸﹀彸鍒囨崲鐨勪笉鏀寔涓婁笅鍒囨崲
      if (self.carousel) {
        self.defaultTab = self.colspan; //璺戦┈鐏樉绀虹殑鏄湡瀹炵殑绗簩椤�
        self.effect = 'hSlide'; // TODO 鐩墠璺戦┈鐏彧鏀寔妯悜婊氬姩
      }

      self.currentTab = self.defaultTab; //0,1,2,3...

      //鍒ゆ柇鏄惁寮€鍚簡鍐呯疆鍔ㄧ敾
      self.transitions = ("webkitTransition" in document.body.style && self.webkitOptimize);

      return self;
    },
    //閽堝绉诲姩缁堢鐨勮窇椹伅鐨刪ack
    //index 绉诲姩绗嚑涓�,0,1,2,3
    fix_for_transition_when_carousel: function(index) {
      var self = this;
      if (typeof index == 'undefined') {
        index = 0;
      }
      var con = self.con;
      self.animcon = self.con.one('.' + self.contentClass);
      self.animwrap = self.animcon.one('div');
      self.pannels = con.all('.' + self.contentClass + ' .' + self.pannelClass);
      if (self.effect == 'hSlide') {
        var width = Number(self.animcon.get('region').width / self.colspan);
        var height = Number(self.animcon.get('region').height);
        self.animwrap.setStyle('width', self.pannels.size() * width + 2 * width);
        var first = self.pannels.item(index).cloneNode(true);
        var last = self.pannels.item(self.pannels.size() - 1 - index).cloneNode(true);
        self.animwrap.append(first);
        self.animwrap.prepend(last);
        if (self.transitions) {
          //杩欐鎿嶄綔浼氭墜鎸佺粓绔腑閫犳垚涓€娆￠棯鐑�,寰呰В鍐�
          self.animwrap.setStyles({
            '-webkit-transition-duration': '0s',
            '-webkit-transform': 'translate3d(' + (-1 * width * (index / 2 + 1)) + 'px,0,0)',
            '-webkit-backface-visibility': 'hidden',
            'left': '0'
          });
        } else {
          self.animwrap.setStyle('left', -1 * width * (index / 2 + 1));
        }
      }
      //閲嶆柊鑾峰彇閲嶇粍涔嬪悗鐨則abs
      self.pannels = con.all('.' + self.contentClass + ' .' + self.pannelClass);
      self.length = self.pannels.size();

      return this;

    },

    // 鏄惁鍦ㄥ仛鍔ㄧ敾杩囩▼涓�
    isAming: function() {
      var self = this;
      if (self.anim) {
        return self.anim.isRunning();
      } else {
        return false;
      }
    },

    //涓婁竴涓�
    previous: function(callback) {
      var self = this;
      //闃叉鏃嬭浆鏈ㄩ┈鐘舵€佷笅鍒囨崲杩囧揩甯︽潵鐨勬檭鐪�
      try {
        if (self.isAming() && self.carousel) {
          return this;
        }
      } catch (e) {}
      var _index = self.currentTab + self.length - 1 - (self.colspan - 1);
      if (_index >= (self.length - self.colspan + 1)) {
        _index = _index % (self.length - self.colspan + 1);
      }

      if (self.carousel) {

        if (self.is_first()) {
          self.fix_pre_carousel();
          self.previous.call(self);
          // arguments.callee.call(self);
          return this;
        }
      }
      self.go(_index, callback);
      return this;
    },
    //鍒ゆ柇褰撳墠tab鏄惁鏄渶鍚庝竴涓�
    is_last: function() {
      var self = this;
      if (self.currentTab == (self.length - (self.colspan - 1) - 1)) {
        return true;
      } else {
        return false;
      }
    },
    //鍒ゆ柇褰撳墠tab鏄惁鏄涓€涓�
    is_first: function() {
      var self = this;
      if (self.currentTab === 0) {
        return true;
      } else {
        return false;
      }
    },
    //涓嬩竴涓�
    next: function(callback) {
      var self = this;
      //闃叉鏃嬭浆鏈ㄩ┈鐘舵€佷笅鍒囨崲杩囧揩甯︽潵鐨勬檭鐪�
      try {
        if (self.isAming() && self.carousel) {
          return this;
        }
      } catch (e) {}
      var _index = self.currentTab + 1;
      if (_index >= (self.length - self.colspan + 1)) {
        _index = _index % (self.length - self.colspan + 1);
      }
      if (self.carousel) {

        if (self.is_last()) {
          self.fix_next_carousel();
          self.next.call(self);
          // arguments.callee.call(self);
          return this;

        }

      }
      self.go(_index, callback);
      return this;
    },
    // 淇璺戦┈鐏粨灏剧殑婊氬姩浣嶇疆
    fix_next_carousel: function() {
      var self = this;

      self.currentTab = self.colspan;
      var con = self.con;
      if (self.effect != 'none') {
        self.pannels = con.all('.' + self.contentClass + ' .' + self.pannelClass);
      }

      //鐩爣offset锛�'-234px'
      var dic = '-' + Number(self.animcon.get('region').width).toString() + 'px';

      if (self.effect == 'hSlide') {

        if (self.transitions) {
          self.animwrap.setStyles({
            '-webkit-transition-duration': '0s',
            '-webkit-transform': 'translate3d(' + dic + ',0,0)'
          });

        } else {
          self.animwrap.setStyle('left', dic);
        }
      } else if (self.effect == 'vSlide') {
        // 鏆備笉鏀寔绾靛悜璺戦┈鐏殑婊氬姩

      }

      return;

    },

    // 淇璺戦┈鐏紑濮嬬殑婊氬姩浣嶇疆
    fix_pre_carousel: function() {
      var self = this;

      // jayli 杩欓噷闇€瑕佽皟璇曚慨姝ｏ紝缁х画璋冭瘯
      self.currentTab = self.length - 1 - self.colspan * 2 + 1;
      var con = self.con;
      if (self.effect != 'none') {
        self.pannels = con.all('.' + self.contentClass + ' .' + self.pannelClass);
      }
      // 鐩爣offset,鏄竴涓瓧绗︿覆 '-23px'
      var dic = '-' + (Number(self.animcon.get('region').width / self.colspan) * (self.currentTab)).toString() + 'px';

      if (self.effect == 'hSlide') {
        if (self.transitions) {
          self.animwrap.setStyles({
            '-webkit-transition-duration': '0s',
            '-webkit-transform': 'translate3d(' + dic + ',0,0)'
          });

        } else {
          self.animwrap.setStyle('left', dic);
        }
      } else if (self.effect == 'vSlide') {
        //绔栧悜婊氬姩鏆傛椂鏈疄鐜�

      }

      return;

    },
    //楂樹寒鏄剧ず绗琲ndex(0,1,2,3...)涓猲av
    hightlightNav: function(index) {
      var self = this;
      // 鍚屾椂鏄窇椹伅锛屼笖涓€甯у鍏冪礌锛屽垯涓嶅厑璁稿瓨鍦∟av
      if (self.carousel && self.colspan > 1) {
        return this;
      }
      if (self.tabs.item(index)) {
        self.tabs.removeClass(self.selectedClass);
        self.tabs.item(index).addClass(self.selectedClass);
      }
      return this;
    },
    //鍒囨崲鑷砳ndex,杩欓噷鐨刬ndex涓虹湡瀹炵殑绱㈠紩
    switch_to: function(index, callback) {
      var self = this;

      // 鍒囨崲鏄惁寮哄埗鍙栨秷鍔ㄧ敾
      if (callback === false) {
        var doeffect = false;
      } else {
        var doeffect = true;
      }

      var afterSwitch = function() {
        if (S.isFunction(callback)) {
          callback.call(self, self);
        }
        self.fire('afterSwitch', {
          index: self.currentTab,
          navnode: self.tabs.item(self.getWrappedIndex(self.currentTab)),
          pannelnode: self.pannels.item(self.currentTab)
        });
      };


      // tailSwitch 鏄鏁�
      var tailSwitch = self.fire('beforeTailSwitch', {
        index: self.currentTab,
        navnode: self.tabs.item(self.getWrappedIndex(self.currentTab)),
        pannelnode: self.pannels.item(self.currentTab)
      });

      self.fixSlideSize(index);
      if (self.autoSlide) {
        self.stop().play();
      }
      if (index >= self.length) {
        index = index % self.length;
      }
      if (index == self.currentTab) {
        return this;
      }

      if (self.anim) {
        try {
          self.anim.stop();
          //fix IE6涓嬪唴瀛樻硠闇茬殑闂锛屼粎鏀寔3.2.0鍙�3.3.0,3.1.0鍙�3.0.0闇€淇敼Y.Anim鐨勪唬鐮�
          //modified by huya
          // self.anim.destroy();
          self.anim = null;
        } catch (e) {}
      }

      // TODO 甯у垏鎹㈠姩鐢荤殑瀹炵幇搴斿綋浠嶣slide涓娊绂诲嚭鏉�
      var animFn = {
        'none': function(index) {

          self.pannels.setStyles({
            'display': 'none'
          });

          self.pannels.item(index).setStyles({
            'display': 'block'
          });

          afterSwitch();

        },
        'vSlide': function(index) {

          if (self.transitions) {
            self.animwrap.setStyles({
              '-webkit-transition-duration': (doeffect ? self.speed : '0') + 's',
              '-webkit-transform': 'translate3d(0,' + (-1 * index * self.animcon.get('region').height / self.colspan) + 'px,0)',
              '-webkit-backface-visibility': 'hidden'
            });
            if (doeffect) {
              self.anim = S.Anim(self.animwrap, {
                opacity: 1
              }, self.speed, self.easing, function() {
                afterSwitch();
              });
              self.anim.run();
            } else {
              afterSwitch();
            }
          } else {
            /*
            self.anim = new S.Anim({
              node: self.animwrap,
              to: {
                top: -1 * index * self.animcon.get('region').height
              },
              easing: self.easing,
              duration: self.speed
            });
            self.anim.run();
            */
            if (doeffect) {
              self.anim = S.Anim(self.animwrap, {
                top: -1 * index * self.animcon.get('region').height / self.colspan
              }, self.speed, self.easing, function() {
                afterSwitch();
              });
              self.anim.run();
            } else {
              self.animwrap.css({
                top: -1 * index * self.animcon.get('region').height / self.colspan
              });
              afterSwitch();
            }
          }

        },
        'hSlide': function(index) {

          if (self.transitions) {

            self.animwrap.setStyles({
              '-webkit-transition-duration': (doeffect ? self.speed : '0') + 's',
              '-webkit-transform': 'translate3d(' + (-1 * index * self.animcon.get('region').width / self.colspan) + 'px,0,0)',
              '-webkit-backface-visibility': 'hidden'
            });
            if (doeffect) {
              self.anim = S.Anim(self.animwrap, {
                opacity: 1
              }, self.speed, self.easing, function() {
                afterSwitch();
              });
              self.anim.run();
            } else {
              afterSwitch();
            }
          } else {

            if (doeffect) {
              self.anim = S.Anim(self.animwrap, {
                left: -1 * index * self.animcon.get('region').width / self.colspan
              }, self.speed, self.easing, function() {
                afterSwitch();
              });

              self.anim.run();
            } else {
              self.animwrap.css({
                left: -1 * index * self.animcon.get('region').width / self.colspan
              });
              afterSwitch();
            }
          }

        },
        'fade': function(index) {
          //閲嶅啓fade鏁堟灉閫昏緫
          //modified by huya
          var _curr = self.currentTab;

          self.anim = S.Anim(self.pannels.item(index), {
            opacity: 1
          }, doeffect ? self.speed : 0.01, self.easing, function() {

            self.pannels.item(_curr).setStyle('zIndex', 0);
            self.pannels.item(index).setStyle('zIndex', 1);
            self.pannels.item(_curr).setStyle('opacity', 0);
            self.pannels.item(_curr).setStyles({
              'display': 'none'
            });
            afterSwitch();
            /*
            self.fire('afterSwitch',{
              index: index,
              navnode: self.tabs.item(self.getWrappedIndex(index)),
              pannelnode: self.pannels.item(index)
            });
            */
          });

          //鍔ㄧ敾寮€濮嬩箣鍓嶇殑鍔ㄤ綔
          self.pannels.item(index).setStyles({
            'display': 'block'
          });
          self.pannels.item(index).setStyle('opacity', 0);
          self.pannels.item(_curr).setStyle('zIndex', 1);
          self.pannels.item(index).setStyle('zIndex', 2);

          self.anim.run();

        }

      };

      var doSwitch = function() {

        var goon = self.fire('beforeSwitch', {
          index: index,
          navnode: self.tabs.item(index),
          pannelnode: self.pannels.item(index)
        });

        if (goon !== false) {
          //鍙戠敓go鐨勬椂鍊欓鍏堝垽鏂槸鍚﹂渶瑕佹暣鐞嗙┖闂寸殑闀垮灏哄
          //self.renderSize(index);

          if (index + self.colspan > self.pannels.size()) {
            index = self.pannels.size() - self.colspan;
          }
          animFn[self.effect](index);

          self.currentTab = index;
          self.hightlightNav(self.getWrappedIndex(index));
          // TODO锛岃璁簊witch鐨勫彂鐢熸椂鏈�
          self.fire('switch', {
            index: index,
            navnode: self.tabs.item(self.getWrappedIndex(index)),
            pannelnode: self.pannels.item(index)
          });

          //寤惰繜鎵ц鐨勮剼鏈�
          self.renderPannelTextarea(index);
        }
      };

      if (S.isNumber(tailSwitch)) {
        setTimeout(function() {
          doSwitch();
          //self.isTailSwitching = false;
        }, tailSwitch);
      } else /*if(tailSwitch !== false)*/ {
        doSwitch();
        //self.isTailSwitching = false;
      }


    },
    //鍘诲線浠绘剰涓€涓�,0,1,2,3...
    "go": function(index, callback) {
      var self = this;

      self.switch_to(index, callback);

      return this;

    },
    //鑷姩鎾斁
    play: function() {
      var self = this;
      if (self.timer !== null) {
        clearTimeout(self.timer);
      }
      self.timer = setTimeout(function() {
        self.next().play();
      }, Number(self.timeout));
      return this;
    },
    //鍋滄鑷姩鎾斁
    stop: function() {
      var self = this;
      clearTimeout(self.timer);
      self.timer = null;
      return this;
    }
  });

  return BSlide;

}, {
  requires: ['node', 'json', 'event', './slide-util', './kissy2yui']
});



KISSY.add('gallery/slide/1.1/index', function(S, BSlide) {

  return BSlide;

}, {
  requires: ['./base']
});


/**
 * @fileOverview KISSY Slide
 * @author  bachi@taobao.com
 *    骞荤伅/Tab/Carousel...
 *    Demo: 閰峢ost锛岃闂細http://a.tbcdn.cn/apps/ks/zoo/slide/demo/tab.html
 *
 * @param 鍙傛暟鍒楄〃
 *    autoSlide : {boolean}   鏄惁鑷姩鎾斁锛岄粯璁や负false
 *    speed:    {float}   甯у垏鎹㈢殑閫熷害锛岄粯璁や负500(ms)
 *    timeout:  {Number}  甯у垏鎹㈢殑鏃堕棿闂撮殧锛岄粯璁や负1000(ms)
 *    effect:   {String}  甯у垏鎹㈢被鍨嬶紝榛樿涓�'none',鍙栧€硷細 *                none:鏃犵壒鏁�
 *                fade:娓愰殣
 *                hSlide:姘村钩鍒囨崲
 *                vSlide:鍨傜洿鍒囨崲
 *    eventType:  {String}  瑙﹀彂tab鍒囨崲鐨刵av涓婄殑浜嬩欢绫诲瀷锛岄粯璁や负'click'锛屾帹鑽愪娇鐢細
 *                click:鐐瑰嚮
 *                mouseover:榧犳爣缁忚繃(杩欎釜鍙兘浼氬娆¤Е鍙戝垏鎹簨浠�)
 *                mouseenter:榧犳爣杩涘叆
 *    easing:   {String}  甯у垏鎹㈢殑缂撳姩鍊硷紝榛樿涓�'easeBoth'锛屽彇鍊艰鍙傜収KISSY.Anim
 *              http://docs.kissyui.com/docs/html/api/core/anim/index.html
 *    hoverStop:  {boolean} 榧犳爣鎮仠鍦ㄩ潰鏉夸笂鏄惁鍋滄鑷姩鎾斁锛岄粯璁や负true
 *    selectedClass:{String}  tab閫変腑鏃剁殑className锛岄粯璁や负't-slide'锛岀洰鍓嶆湭瀹炵幇
 *    navClass: {String}  tab瀹瑰櫒鐨刢lassName锛岄粯璁や负'tab-nav'
 *    triggerSelector:{String}tab瀹瑰櫒涓殑瑙︾鍏冪礌鐨勯€夋嫨鍣紝榛樿涓�'li'
 *    contentClass:{String} tab鍐呭瀹瑰櫒鐨刢lassName,榛樿涓簍ab-content
 *    pannelClass:{String}  tab闈㈡澘鐨刢lassName锛岄粯璁や负tab-pannel
 *    id:     {String}  hook锛岀洿鎺ュ啓id锛屾瘮濡�"J_id"(姝ｇ‘)锛�"#J_id"(閿欒)
 *    carousel: {Boolean} 鏄惁浠ヨ窇椹伅褰㈠紡鎾斁锛岄粯璁や负false
 *    touchmove:  {Boolean} 鏄惁鏀寔鎵嬫寚婊戝姩鍒囨崲锛岄粯璁や负false
 *    adaptive_fixed_width:{boolean} 灞忓箷鏄惁鏍规嵁鎺т欢鐨勫搴︽敼鍙橀噸鏂版覆鏌撳昂瀵革紝榛樿涓篺alse锛屼富瑕佸湪缁勪欢瀹氬楂樼殑鍦烘櫙涓紝淇濊瘉resize鏃秚ab-pannel灏哄姝ｇ‘
 *    adaptive_fixed_height:{boolean} 灞忓箷鏄惁鏍规嵁鎺т欢鐨勯珮搴︽敼鍙橀噸鏂版覆鏌撳昂瀵革紝榛樿涓篺alse,涓昏鍦ㄧ粍浠跺畾瀹介珮鐨勫満鏅腑锛屼繚璇乺esize鏃秚ab-pannel灏哄姝ｇ‘
 *    adaptive_fixed_size:{boolean} 灞忓箷鏄惁鏍规嵁鎺т欢鐨勫搴﹀拰楂樺害鏀瑰彉閲嶆柊娓叉煋灏哄锛岄粯璁や负false,涓昏鍦ㄧ粍浠跺畾瀹介珮鐨勫満鏅腑锛屼繚璇乺esize鏃秚ab-pannel灏哄姝ｇ‘
 *    defaultTab: {Number}  榛樿瀹氫綅鍦ㄦ煇涓抚锛岄粯璁や负0锛屽嵆绗竴甯�
 *    layerSlide: {Boolean} 鏄惁寮€鍚垎灞傚姩鐢伙紝榛樿涓篺alse
 *    layerClass: {String}  subLayer鐨刢lassName锛屾湭瀹炵幇锛岄粯璁ょ敤alt="sublayer"鏉ユ爣璇�
 *    reverse:  {boolean}   "鎾斁涓嬩竴涓�"鍜�"鎾斁涓婁竴涓�"瀵硅皟锛岄粯璁や负false
 *    adaptive_height:{function},鍚屼笅
 *    adaptive_width:{function}锛屽鏋滄槸鐧惧垎姣旇缃鍣ㄧ殑瀹藉害鐨勮瘽锛岄渶瑕佹寚瀹氳繖涓嚱鏁帮紝杩斿洖涓€涓搴﹀€硷紝鍔ㄦ€佺殑寰楀埌鍙彉鍖栫殑瀹藉害,榛樿涓篺alse锛屼唬鐮佺ず渚�:
 *
 *            var slide = new Slide('J_tab',{
 *              adaptive_width:function(){
 *                return document.body.offsetWidth;
 *              }
 *            });
 *
 *
 *  @event 浜嬩欢
 *    ready:    鍒濆鍖栧畬鎴愬悗鐨勪簨浠跺洖璋冿紝甯﹀叆涓婁笅鏂噒his锛屽甫鍏ュ弬鏁颁负
 *          {
 *            index:index,    // 褰撳墠甯х殑绱㈠紩
 *            navnode:navnode,  // 褰撳墠瀵艰埅鐨勮妭鐐�
 *            pannelnode:pannelnode//褰撳墠闈㈡澘鐨勮妭鐐�
 *          }
 *    switch:   鍒囨崲鍙戠敓鏃剁殑浜嬩欢锛岀壒鎸囧垏鎹㈠姩浣滃繀鐒跺彂鐢熸椂鐨勬椂鍒伙紝鍥炶皟涓婁笅鏂囧拰鍙傛暟鍚屼笂
 *    beforeSwitch: 鈥滃垏鎹㈣嚦鈥濈殑浜嬩欢锛屽洖璋冭繑鍥瀎alse鍙互闃绘鍒囨崲浜嬩欢鐨勫彂鐢�
 *    beforeTailSwitch:浠庢煇涓€甯х殑瑙掑害鐪嬶紝杩欎竴甯у垏鎹㈠埌涓嬩竴甯т箣鍓嶅彂鐢熺殑浜嬩欢,鍙傛暟鍚屼笂
 *    afterSwitch:  鍒囨崲瀹屾垚鐨勫姩浣滐紝鏈疄鐜�
 *
 *
 *  @mathod 鏂规硶
 *    init    鍒濆鍖栵紝鍙傛暟涓轰竴涓璞★紝甯﹀叆閰嶇疆椤�
 *    previous  鍒囨崲鍒颁笂涓€涓紝鏃犲弬鏁�
 *    next    鍒囨崲鍒颁笅涓€涓紝鏃犲弬鏁�
 *    go    璺宠浆鍒版寚瀹氱储寮曠殑甯э紝鍙傛暟涓篿ndex:0,1,2,3...
 *    switch_to 绾补鎵ц鍒囨崲鐨勫姩浣滐紝涓嶆帹鑽愪娇鐢紝寤鸿浣跨敤go
 *    play    寮€濮嬭嚜鍔ㄦ挱鏀�
 *    stop    鍋滄鑷姩鎾斁
 *    hightlightNav 楂樹寒鏌愪釜鐗瑰畾鐨勫鑸」锛屽弬鏁颁负绱㈠紩鍊糹ndex:0,1,2,3...
 *    is_first  鏄惁褰撳墠鍋滄鍦ㄧ涓€甯�
 *    is_last   鏄惁褰撳墠鍋滄鍦ㄦ渶鍚庝竴鐪�
 *    resetSlideSize 鍙互浼犲叆涓€涓储寮曞€间负鍙傛暟锛岄噸缃index涓猄lide鐨勫搴﹀拰楂樺害,骞荤伅灏哄鍙戠敓鍔ㄦ€佸彉鍖栨椂锛岄渶瑕佽皟鐢ㄨ繖涓柟娉曟潵閲嶈瀹介珮锛屽唴閮ㄦ柟娉�
 *    relocateCurrentTab 鏃犲弬鏁帮紝閲嶆柊淇褰撳墠甯х殑浣嶇疆锛屽唴閮ㄦ柟娉�
 *    initLayer 鍒濆鍖朣ubLayer锛屾棤鍙傛暟锛岄潪瑙﹀睆妯″紡涓嬫湁鏁� TODO
 *
 *
 *  @subClass 褰搇ayerSlide閰嶇疆涓簍rue鏃讹紝閰嶇疆sublayer鐨勫弬鏁帮紝鍐欐硶锛�
 *
 *          <span alt="sublayer"
 *            rel="alpha: true,slideindirection: left, durationin: 1000"
 *            class="sublayer1">SubLayer1</span>
 *
 *    subLayer閰嶇疆椤癸細
 *      durationin    杩涘叆鍔ㄧ敾鐨勭紦鍔ㄩ€熷害锛岄粯璁や负1000锛堟绉掞級
 *      easingin    杩涘叆鍔ㄧ敾鐨勭紦鍔ㄦ晥鏋滐紝榛樿涓篹aseIn锛屽叿浣撳弬鐓ISSY.Anim
 *      durationout   绉诲嚭鍔ㄧ敾鐨勭紦鍔ㄩ€熷害锛岄粯璁や负1000锛堟绉掞級
 *      easingout   绉诲嚭鍔ㄧ敾鐨勭紦鍔ㄦ晥鏋滐紝榛樿涓篹aseOut
 *      delayin     杩涘叆鍔ㄧ敾鐨勫欢鏃讹紝榛樿涓�300锛堟绉掞級
 *      delayout    绉诲嚭鍔ㄧ敾鐨勫欢鏃讹紝榛樿涓�300
 *      slideindirection杩涘叆鍔ㄧ敾鐨勮捣濮嬫柟鍚戯紝榛樿涓�'right'锛宼op/right/left/bottom
 *      slideoutdirection绉诲嚭鍔ㄧ敾鐨勮捣濮嬫柟鍚戯紝榛樿涓�'left'
 *      alpha     鏄惁甯︽湁閫忔槑搴﹀彉骞伙紝榛樿涓簍rue
 *      offsetin    杩涘叆鍔ㄧ敾鐨勭浉瀵硅窛绂伙紝榛樿涓�50
 *      offsetout   绉诲嚭鍔ㄧ敾鐨勭浉瀵硅窛绂伙紝榛樿涓�50
 */


KISSY.use('gallery/slide/1.1/,wms.lego/search/index,datalazyload,node', function(S, Slide, Search, DataLazyLoad) {
  KISSY.ready(function() {
    Search.init();

    var ctNode = S.one(".tab-content");
    var imgPx = ((ctNode.width() - 24) / 2) - 2;
    S.all(".item-img-resize").css({
      width: imgPx,
      height: imgPx
    })

    var slide = new Slide('J_tab', {
        //effect: 'hSlide',
        touchmove: false
      });

    var dataLazyLoad = new DataLazyLoad();

    slide.on("switch",function(){
      dataLazyLoad.refresh();
    })
    //window['dataLazyLoad'] = dataLazyLoad;
    var renderTab = function(){
      //渲染楼层标签 可以滑动
      var ulNode = S.one('#J_tab .tab-nav');

      if (!ulNode) return;
      var tags = ulNode.all('li');
      var tagsNum = tags.length;
      var perWidth = parseInt(ulNode.width() / 4);
      if (tagsNum >= 4) {
        ulNode.css('width', perWidth * tagsNum);

      }
      tags.css('width', perWidth);
      ulNode.css('visibility', 'visible');

      var xscroll = new XScroll({
          renderTo:"#J_tab_menu",
          scrollbarY:false,
          scrollbarX:false,
          lockY:true
      });
      xscroll.render();

      var tabContainer;

      var tabTop;
      var sTop;
      //var searchHeight = S.one('.top-search').outerHeight();

      var checkFix = function(){
        sTop = S.one(window).scrollTop();
        //console.log('sTop'+sTop)
        //
        if (sTop >= tabTop) {
          tabContainer.addClass('tab-wrap-fixed');
        }else{
          tabContainer.removeClass('tab-wrap-fixed');
        }
      }
      var delayCheckFix = function(){
        checkFix();
        //uc浏览器 不知道为什么触发不了，需要延时再触发一次。
        S.later(checkFix,50);
      }
      var initFix = function(){
        tabContainer = S.one('#J_tab_menu');
        tabTop = tabContainer.offset().top;
        //console.log('tabTop'+tabTop)
        S.one(window).on('touchmove', delayCheckFix)
        S.one(window).on('scroll', delayCheckFix)
        //S.one(window).on('touchend', delayCheckFix)
      }

      S.later(initFix,500);
      slide.on("beforeSwitch",function(){
        sTop = S.one(window).scrollTop();
        if (sTop >= tabTop){
          S.one(window).scrollTop(tabTop);
        }

      })

      slide.on("afterSwitch",delayCheckFix)
    }
    if(S.one('#J_tab_menu')) renderTab();

    S.one('.search-input-wrap .inp-search').on('focus',function(){
      S.one(this).parent().animate({'width':'280px'},.2, "easeOutStrong");
    }).on('blur',function(){
      S.one(this).parent().animate({'width':'170px'},.2, "easeOutStrong");
    })






  })
});