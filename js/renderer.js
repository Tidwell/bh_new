var renderer = function(opt) {
  this.game = opt.game;
  this.com = opt.game.com;
  this.kb = {};
  this.canvas;
  this.ctx;
  this.activeParticles = [];
  this.particleCount = 0;
  this.musicTimeout;
}

renderer.prototype.loop = function() {
  var self = this;
  var d = new Date();
  var t = d.getTime();
  self.game.entities.forEach(function(entity) {
    self.renderEntity(entity);
  });
  self.renderParticles();
  if (self.game.active) {
    setTimeout(function() {self.loop()}, 20);
  }
}

renderer.prototype.renderEntity = function(entity) {
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

renderer.prototype.cooldownPop = function() {
  
}

renderer.prototype.selectEntity = function(entity) {
  var self = this;
  if (!entity.controllable){ return;}
  entity.el.addClass('selected');
  entity.infoEl.addClass('selected');
  entity.actionbarEl.addClass('selected');
  self.unbindAbilityKeys();
  for (ability in entity.abilities) {
    if (entity.abilities.hasOwnProperty(ability)) {
      self.bindAbilityKey(entity,ability);  
    }
  }
}
//totally unecessary when touch
renderer.prototype.bindAbilityKey = function(entity,abilityName) {
  var self = this;
  var key = entity.abilities[abilityName].key;
  if (key) {
    self.kb[key] = KeyboardJS.bind.key(key, function(){}, function(){ entity.ability(abilityName);});
  }
}
renderer.prototype.unbindAbilityKeys = function() {
  var self = this;
  var keys = ['a','q','w','e'];

  keys.forEach(function(key){
    if (self.kb[key]) {
      self.kb[key].clear();
      self.kb[key] = undefined;
    };
  })
}
renderer.prototype.unselectEntity = function(entity) {
  var self = this;
  if (!entity.controllable){ return;}
  entity.el.removeClass('selected');
  entity.infoEl.removeClass('selected');
  entity.actionbarEl.removeClass('selected');
}

renderer.prototype.removeEntity = function(opt) {
  Sound.play('effects/explosion',.8)
  //unbind the select key
  if (opt.entity.selectKey) {
    KeyboardJS.unbind.key(opt.entity.selectKey);
  }
  if (opt.entity.actionbarEl) {
    opt.entity.actionbarEl.hide();
  }
  //set the dom els
  if (opt.entity.infoEl) {
    opt.entity.infoEl.addClass('dead');
    opt.entity.infoEl.removeClass('selected');
  }
  //remove the entity
  opt.entity.el.parent().remove();
}

renderer.prototype.bindEvents = function() {
  var self = this;
  this.com.bind('newSelect',function(opt){self.selectEntity(opt.entity);});
  this.com.bind('unselected',function(opt){self.unselectEntity(opt.entity);});
  this.com.bind('removeEntity', function(opt) {self.removeEntity(opt);});
  this.com.bind('gameOver',function(winner){self.gameOver(winner);});
  this.com.bind('unselected',function(opt){self.unselectEntity(opt.entity);});
  this.com.bind('dmgDealt',function(opt){self.renderLaser(opt);});
  this.com.bind('newEntity',function(entity){self.initEntity(entity);});
  this.com.bind('onCooldown',function(opt){self.cooldown(opt);});
}

renderer.prototype.gameOver = function(winner) {
  var self = this;
  if (self.kb) {
      for (prop in self.kb) {
        if (self.kb[prop]) {
          self.kb[prop].clear();  
        }
      }
  }
  self.game.entities.forEach(function(entity) {
    if (entity.selectKey) {
      KeyboardJS.unbind.key(entity.selectKey);
    }
  });

  $(self.canvas).hide();
  $('.buttons').fadeOut('fast');
  $('.home').fadeOut('fast');
  $('.bb .health').fadeOut('fast');

  self.stopMusic();
  clearTimeout(self.musicTimeout);

  if (winner == 'pc'){
    Sound.play('music/victory');
    $('.entity').removeClass('selected');
    $('.stage').append('<h1 class="victory">You Win</h1>');
    $('.victory').fadeIn('fast');
    $('.victory').fadeIn();
    var left = 325;
    $('.entity').parent().each(function(){
      $(this).animate({top: 200, left: left},2000);
      left += 100;
    })
    setTimeout(function(){
      $('.stage').fadeOut(function(){
        self.com.trigger('gameRenderDone');
      });
    },3000);
  }
  else if (winner=='npc'){
    $('.stage').append('<h1 class="victory">You Lose</h1>');
    $('.victory').fadeIn('fast');
    setTimeout(function(){
      $('.stage').fadeOut(function(){
          self.com.trigger('gameRenderDone');
        });
      },3000);
  }
  else {
    $('.stage').fadeOut(function(){
      self.com.trigger('gameRenderDone');
    });
  }
}

renderer.prototype.bindDom = function(entity) {
  var self = entity;
  //bind the keyboard event to select this entity
  KeyboardJS.bind.key(self.selectKey, function(){}, function(){self.makeSelected()});

  //bind the click event to move
  $(self.stage).click(function(e) {
    if (!self.selected) { return; }
    //we dont want to move, we want to target if they are a valid target
    if ($(e.srcElement).hasClass('enemy') && self.attacking && self.weapon.target == 'npc'){ return; }
    if ($(e.srcElement).parent().hasClass('friendly') && self.attacking && self.weapon.target == 'pc'){ return; }
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

renderer.prototype.loadCanvas = function() {
  var self = this;
  self.canvas = document.getElementById('effects');
  if (self.canvas && self.canvas.getContext) {
    self.ctx = self.canvas.getContext('2d');
  }
}



renderer.prototype.renderLaser = function(opt) {
  Sound.play('effects/shoot',.3)
  var x1 = opt.self.x+opt.self.width/2;
  var y1 =opt.self.y+opt.self.height/2;
  var x2=opt.target.x+opt.target.width/2;
  var y2=opt.target.y+opt.target.height/2;
  var self = this;
  self.particleCount++;
  this.activeParticles['p'+self.particleCount] = {
    x1: x1,
    y1: y1,
    x2: x2,
    y2: y2,
    strokeStyle: (opt.self.weapon.damage > 0) ? 'rgb(255,0,0)' : 'rgb(0,255,0)',
    lineWidth: 2
  };
  var self = this;
  var pc = self.particleCount;
  setTimeout(function(){
    delete self.activeParticles['p'+pc];
  },500);
}

renderer.prototype.renderParticles = function() {
  var self = this;
  self.ctx.clearRect(0,0,800,500);
  var parts = this.activeParticles;
  for (var pid in self.activeParticles) {
    if (self.activeParticles.hasOwnProperty(pid)) {
      var particle = self.activeParticles[pid];
      self.ctx.beginPath(); 
      self.ctx.strokeStyle = particle.strokeStyle;
      self.ctx.lineWidth = particle.lineWidth;
      self.ctx.moveTo(particle.x1,particle.y1);
      self.ctx.lineTo(particle.x2,particle.y2);
      self.ctx.stroke();
    }
  }
}

renderer.prototype.initEntity = function(entity){
  var self = this;
  var sel;
  entity.el.parent().width(entity.width).height(entity.height);
  entity.el.attr('rel',entity.id);
  if (entity.controllable) {
    self.bindDom(entity);
  }
  if(entity.actionbarEl) {
    for (ability in entity.abilities) {
      if (entity.abilities.hasOwnProperty(ability)) {
        sel = '.'+ability.toLowerCase().replace(' ','-')+' .bind';
        entity.actionbarEl.find(sel).html(entity.abilities[ability].key);  
      }
    }
  }
  if (entity.selectKey) {
    entity.infoEl.find('.bind').html(entity.selectKey);
  }
}
renderer.prototype.cooldown = function(opt) {
  if (opt.type == 'pc') {
    var t = new template;
    var id = Math.floor(Math.random()*9000)+opt.id;
    var el = $('.actionbars .'+opt.id+' .'+opt.ability.toLowerCase().replace(' ','-'))
    el.append(t.cooldown(id,40,40));
    var cd = new cooldownTimer({
      id: id,
      cooldown: opt.cooldown
    })
  }
}
renderer.prototype.init = function() {
  var self = this;
  self.bindEvents();
  self.loadCanvas();
  self.game.entities.forEach(function(entity) {
      self.initEntity(entity)
  });
  self.game.stage.show();
  /***Inititalize the Main Render Loop***/
  setTimeout(function() {self.loop()}, 20);
  self.playMusic();
}

renderer.prototype.playMusic = function() {
  var self = this;
  Sound.stop('music/Battle2');
  Sound.play('music/Battle2');
  self.musicTimeout = setTimeout(function() {self.playMusic()},63000);
}

renderer.prototype.stopMusic = function() {
  Sound.stop('music/Battle2');
}