var renderer = function(opt) {
  this.game = opt.game;
  this.com = opt.game.com;
  this.kb = false;
}

renderer.prototype.loop = function() {
  var self = this;
  var d = new Date();
  var t = d.getTime();
  self.game.entities.forEach(function(entity) {
    self.renderEntity(entity);
  });
  setTimeout(function() {self.loop()}, 20);
}

renderer.prototype.renderEntity = function(entity) {
  //console.log(entity.el.parent())
  entity.el.parent().css('left',entity.x).css('top',entity.y);
  this.renderEntityHealthBars(entity);

  if (entity.controllable) {
    entity.infoEl.find('.health').html(entity.health+' / '+entity.maxHealth);
  }
  //rotate to face target
  if (!entity.rawTargetX || !entity.rawTargetY) { return; }
  var slope = ((entity.y-entity.height/2)-(entity.rawTargetY-entity.height/2))/((entity.x-entity.width/2)-(entity.rawTargetX-entity.width/2));
  var angle = Math.atan(slope); //radians
  var angleDeg = -angle*(180/Math.PI);
  
  if (!slope || !angle || !angleDeg) { return; }
  //because our sprites are facing "up" we have to base the rotation on entity assumption  
  //if up right or down right
  if ((entity.x < entity.rawTargetX && (entity.y > entity.rawTargetY)) ||
     (entity.x < entity.rawTargetX && (entity.y < entity.rawTargetY))) {
    angleDeg = 90-angleDeg
  }
  //if up left or down left
  if ((entity.x > entity.rawTargetX && entity.y > entity.rawTargetY) ||
      (entity.x > entity.rawTargetX && (entity.y < entity.rawTargetY))
      ) {
    angleDeg= -90-angleDeg;
  }
  entity.el.css('-moz-transform', 'rotate('+(angleDeg)+'deg)');
  entity.el.css('-webkit-transform', 'rotate('+(angleDeg)+'deg)');
};

//renders the health bar on the ships if below max health
renderer.prototype.renderEntityHealthBars = function(entity) {
  var hbar = entity.el.parent().find('.health');
  var bar = hbar.find('.bar');
  //% entity.width = % health
  var percentHealth = entity.health/entity.maxHealth;
  var width = percentHealth*hbar.width();
  if (percentHealth==1) {
    hbar.hide();
  }
  else {
    hbar.show();
    bar.width(width);
  }
}

renderer.prototype.selectEntity = function(entity) {
  var self = this;
  if (!entity.controllable){ return;}
  entity.el.addClass('selected');
  entity.infoEl.addClass('selected');
  entity.actionbarEl.addClass('selected');
  if (entity.attackKey) {
    if (self.kb) {
      self.kb.clear();
      self.kb = undefined;
    }
    self.kb = KeyboardJS.bind.key(entity.attackKey, function(){}, function(){ entity.attack();});
  }
}
renderer.prototype.unselectEntity = function(entity) {
  var self = this;
  if (!entity.controllable){ return;}
  entity.el.removeClass('selected');
  entity.infoEl.removeClass('selected');
  entity.actionbarEl.removeClass('selected');
}

renderer.prototype.bindEvents = function() {
  var self = this;
  this.com.bind('newSelect',function(opt){self.selectEntity(opt.entity);});
  this.com.bind('unselected',function(opt){self.unselectEntity(opt.entity);});
  this.com.bind('removeEntity', function(opt) {
    //unbind the select key
    if (opt.entity.selectKey) {
      KeyboardJS.unbind.key(opt.entity.selectKey);
    }
    if (opt.entity.actionbarEl) {
      opt.entity.actionbarEl.hide();
    }
    if (opt.entity.infoEl) {
      opt.entity.infoEl.addClass('dead');
      opt.entity.infoEl.removeClass('selected');
    }
    opt.entity.el.parent().remove();
  });
}

renderer.prototype.bindDom = function(entity) {
  var self = entity;
  //bind the keyboard event to select this entity
  KeyboardJS.bind.key(self.selectKey, function(){}, function(){self.makeSelected()});

  //bind the click event to move
  $(self.stage).click(function(e) {
    if (!self.selected) { return; }
    //we dont want to move, we want to target if they are an enemy
    if ($(e.srcElement).hasClass('enemy') && self.attacking){ return; }
    //otherwise we are moving
    var s = self.stage;
    var newX = e.pageX-s.offset().left;
    var newY = e.pageY-s.offset().top;
    self.initMove(newX,newY);
  });
  
  //bind the click event to target
  $(self.stage).on('click', '.entity', function(e) {
    if (!self.selected) {return;}
    var el = $(this);
    self.setAbilityTarget(el.attr('rel'));
  });
}

renderer.prototype.init = function() {
  var self = this;
  self.bindEvents();
  self.game.entities.forEach(function(entity) {
      entity.el.parent().width(entity.width).height(entity.height);
      entity.el.attr('rel',entity.id);
      if (entity.controllable) {
        self.bindDom(entity);
      }
      if(entity.actionbarEl) {
        entity.actionbarEl.find('.attack .bind').html(entity.attackKey);
      }
      if (entity.selectKey) {
        entity.infoEl.find('.bind').html(entity.selectKey);
      }
  });
  /***Inititalize the Main Render Loop***/
  setTimeout(function() {self.loop()}, 20);
}