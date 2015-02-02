var qfilter = require('qfilter');



qfilter.add({
  name:'q_less',
  //path:'',
  config:{

  }
})

qfilter.add({
  name:'q_static',
  //path:'',
  config:{

  }
})

qfilter.add({
  name:'q_vm',
  //path:'',
  config:{
    macros:{
      getUrl: function (file) {
          return '/' + file;
      }
    }
  }
})

qfilter.run({
  port:4000
})