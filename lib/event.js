//参考seajs的事件写法

var Event = module.exports = function(){
}

Event.prototype.on = function(name, callback) {
  var events = this.events || (this.events = {})
  var list = events[name] || (events[name] = [])
  list.push(callback)
  return this
}

Event.prototype.off = function(name, callback) {
  var events = this.events

  if (!events) return this

  // Remove *all* events
  if (!(name || callback)) {
    this.events = {}
    return this
  }

  var list = events[name]
  if (list) {
    if (callback) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === callback) {
          list.splice(i, 1)
        }
      }
    }
    else {
      delete events[name]
    }
  }

  return this
}

Event.prototype.emit = function(name, data) {

  var events = this.events
  if (!events) return Promise.resolve([])


  var list = events[name], fn

  var results = []
  var res

  if (list) {
    // Copy callback lists to prevent modification
    list = list.slice()

    // Execute event callbacks, use index because it's the faster.
    for(var i = 0, len = list.length; i < len; i++) {
      res = list[i].call(this,data)
      if (!res) continue;
      isPromise(res) ? results.push(res) : results.push(Promise.resolve(res));
    }
  }

  return Promise.all(results)
}

//参考https://github.com/aralejs/events/blob/master/events.js
//可以mix到方法或者对象上

Event.mixTo = function(receiver){
  var proto = Event.prototype

  if (isFunction(receiver)) {
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        receiver.prototype[key] = proto[key]
      }
    }

  }else{
    var event = new Event
    for (var key in proto) {
      if (proto.hasOwnProperty(key)) {
        copyProto(key)
      }
    }
  }

  function copyProto(key) {
    receiver[key] = function() {
      return proto[key].apply(event, Array.prototype.slice.call(arguments))
    }
  }

}

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

function isFunction(func) {
  return Object.prototype.toString.call(func) === '[object Function]'
}








