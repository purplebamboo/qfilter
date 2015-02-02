
KISSY.use('datalazyload,node', function(S, DataLazyLoad) {
  KISSY.ready(function() {

    var ctNode = S.one(".tab-content");
    var imgPx = ((ctNode.width() - 24) / 2) - 2;
    S.all(".item-img-resize").css({
      width: imgPx,
      height: imgPx
    })

    var dataLazyLoad = new DataLazyLoad();
  })
});