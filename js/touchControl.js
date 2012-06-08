function touchControl(opt) {
     var container = opt.container;
     var moveInProgress = false;

     container.on('touchstart mousedown',function(e) {
       moveInProgress = true;
       var loc = getLocation(e)   
       debug(loc);
       return false;
     })

     container.on('touchmove mousemove',function(e){
       if (!moveInProgress) {return;}
       var loc = getLocation(e)   
       debug(loc);
       return false;
     })

     container.on('touchend mouseup',function(e) {
       moveInProgress = false;
       var loc = getLocation(e)
       debug(loc);
       return false;
     });

     function getLocation(e) {
          if (!e.offsetX && !e.originalEvent.touches[0]) {return;}
          var x = e.offsetX || e.originalEvent.touches[0].pageX;
          var y = e.offsetY || e.originalEvent.touches[0].pageY;
          return {x: x, y: y};
     }

     function debug(loc) {
          if (!opt.debug || !loc){return;}
          $('.debug .x').html(loc.x);
          $('.debug .y').html(loc.y);
     }

}