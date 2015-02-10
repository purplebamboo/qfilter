


var getXmlhttp = function(){
    var xmlhttp;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
      xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
      xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    return xmlhttp;
}

var request = function(url,cb){
  var xmlhttp = getXmlhttp();
  xmlhttp.onreadystatechange = function(res) {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var data = (new Function('return '+xmlhttp.responseText))();
      cb && cb(data);
    }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}


window.onload = function() {
  var node = document.getElementById('J_msg');

  request('/index/json.htm',function(data){
    node.innerHTML += data.msg;
  });
}