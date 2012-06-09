function touchControl(opt) {
     var container = opt.container;
     var moveInProgress = false;
     var activeEntity;
     var lastLocation;

     $('body').on('touchstart',function() {
      return false
     })

     container.on('touchstart mousedown',function(e) {
        moveInProgress = true;
        lastLocation = false;
        var loc = getLocation(e)  

        //detect if we are on an entity
        opt.game.entities.forEach(function(entity,i){
          if (entity.controllable) {
            //detect collision with the position
            if ((loc.x > entity.x && loc.x < entity.x+entity.width) && (loc.y > entity.y && loc.y < entity.y+entity.height)) {
              //if its friendly, select it and trigger attack
              activeEntity = entity;
              entity.makeSelected();
              entity.ability('attack')
            }
          }
        })
        return false;
     })

     container.on('touchmove mousemove',function(e){
       if (!moveInProgress) {return false;}
       //draw the movement line

       var loc = getLocation(e)
       lastLocation = loc;
       debug(loc);
       return false;
     })

     container.on('touchend mouseup',function(e) {
       moveInProgress = false;
       var loc = getLocation(e)
       if (!loc) {return;}

       var isAttacking = false;
       if (!activeEntity) {return false;}
       //detect if we let up on a valid target
      opt.game.entities.forEach(function(entity,i){
          //detect collision with the position
          if ((loc.x > entity.x && loc.x < entity.x+entity.width) && (loc.y > entity.y && loc.y < entity.y+entity.height)) {
            //if its a valid target, target

             if ((entity.type==='npc' && activeEntity.attacking && activeEntity.weapon.target == 'npc') ||
                 (entity.type==='pc' && activeEntity.attacking && activeEntity.weapon.target == 'pc'))
             {
                activeEntity.setAbilityTarget(entity.id); 
                isAttacking = true;
         //       alert('target acquired '+entity.id)
             }
             //if ($(e.srcElement).parent().hasClass('friendly') && self.attacking && self.weapon.target == 'pc'){ return; }
          }
        
      });

       //otherwise move
       if (!isAttacking) {
        var s = opt.game.stage;
        var newX = e.pageX-s.offset().left;
        var newY = e.pageY-s.offset().top;
        activeEntity.initMove(newX,newY);
      }

       
       debug(loc);
       return false;
     });

     function getLocation(e) {
          if (e.clientX) {
            var x = e.clientX - opt.game.stage.offset().left;
            var y = e.clientY - opt.game.stage.offset().top;
          }
          else if (e.originalEvent.touches.length > 0) {
            var x = e.originalEvent.touches[0].pageX - opt.game.stage.offset().left;
            var y = e.originalEvent.touches[0].pageY - opt.game.stage.offset().top;
          }
          else if (lastLocation){
            var x = lastLocation.x;
            var y = lastLocation.y
          }
          return {x: x, y: y};
     }

     function debug(loc) {
          if (!opt.debug || !loc){return;}
          console.log('x'+loc.x);
          console.log('y'+loc.y);
     }

}