var util = require('../util.js');
var velocity = require('velocityjs');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');

function fetchTmpl(viewPath) {

    return function(callback){
        fs.readFile(viewPath, function (err, data) {
            if (err) {
                callback(err);
            } else {
                callback (null, data.toString());
            }
        });
    }
}

var VIEW_DIR = G_DIR;

var defaultMacros = {
    parse: function (file) {
        var viewPath = path.join(VIEW_DIR, file);
        var template = fs.readFileSync(viewPath).toString();
        return this.eval(template);
    }
}

// exports.service = function *(next) {
// }

function isVm(url, extReg) {
  extReg = extReg || /vm/;

  var trueUrl = url.replace(/\?.*/ig, '');
  var ext = path.extname(trueUrl);

  return extReg.test(ext);

}

exports.factory = function (app,config) {

    if(config.viewLocation) VIEW_DIR = config.viewLocation;

    var macros = _.extend(defaultMacros,config.macros);

    return function *(next){
        //只有是vm才会渲染，否则跳过。
        var ctx = this;
        ctx.md_config = config;

        if (isVm(ctx.url)){
            var view = ctx.path;
            var viewPath = path.resolve(VIEW_DIR,'./'+view);

            var template = yield fetchTmpl(viewPath);
            var dataPath = this.query.ds || ctx.path.split('.')[0]+'.json';
            var data = yield util.mock(dataPath);

            ctx.body = velocity.render(template, data, macros);
            ctx.type = 'text/html';

        };
        //yield next;


    };
}
