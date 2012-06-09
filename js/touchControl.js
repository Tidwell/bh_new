function touchControl(opt) {
     var container = opt.container;
     var containerStats = {
       x: container.position().left,
       y: container.position().top,
       width: container.width(),
       height: container.height(),
     };
     var moveInProgress = false;
     var entities = opt.entities;
     var moveLoc;

     container.on('touchstart mousedown',function(e) {
        moveInProgress = true;
        var loc = getLocation(e);
        opt.down(loc);
        var collisions = detectCollisions(entities,loc);
        if (collisions) {
            opt.downCollide(collisions);
        }
        return false;
     })

     container.on('touchmove mousemove',function(e){
        if (!moveInProgress) {return;}
        var loc = getLocation(e);
        moveLoc = loc;
        opt.move(loc);
        var collisions = detectCollisions(entities,loc);
        if (collisions) {
            opt.moveCollide(collisions)
        }
        return false;
     })

     container.on('touchend mouseup',function(e) {
       moveInProgress = false;
       var loc = getLocation(e);
       if (!loc) {loc = moveLoc}
       opt.up(loc);
       var collisions = detectCollisions(entities,loc);
       if (collisions) {
            opt.upCollide(collisions)
       }
       moveLoc = null;
       return false;
     });

     function getLocation(e) {
          if (e.pageX) {
            var x = e.pageX-containerStats.x;
            var y = e.pageY-containerStats.y;
            return {x: x, y: y};
          } else if(e.originalEvent.touches.length > 0) {
            var x = e.originalEvent.touches[0].pageX-containerStats.x;
            var y = e.originalEvent.touches[0].pageY-containerStats.y;
            return {x: x, y: y};
          }
          return false;
     }

     //detects a collision between a point and a box
     //expects {x:,y:,width:,height} and {x:,y:}
     function detectPointCollide(box,pt) {
      if ((pt.x > box.x && pt.x < box.x+box.width) && (pt.y > box.y && pt.y < box.y + box.height)){
        return true;
      }
      return false;
     }

     function detectCollisions(entities,pt) {
      var collide = [];
      entities.forEach(function(entity,i){
          if(detectPointCollide({ 
              x: entity.x, 
              y: entity.y, 
              width: entity.width, 
              height: entity.height},pt)) {

              collide.push(entity);
          }
      });
      return collide.length ? collide : false;
     }
}