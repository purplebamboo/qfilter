var assert = require("assert")
var co = require('co')
var compose = require('koa-compose');
var koa = require('koa');

global.G_DIR = __dirname;

var app = koa();


var staticMid = require('../lib/middleware/q_static.js')

describe('test to do...',function(){


})