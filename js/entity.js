var entity = function(opt) {
  this._id = opt.id || Math.floor(Math.random()*100000),
  this.id = opt.id || this._id,
  this.com = opt.communicator;
  this.dead = false;
  //position
  this.x = opt.startX || 0;;
  this.y = opt.startY || 0;;
  //dimensions
  this.height = opt.height;
  this.width = opt.width;
  //movement tracking
  this.startX = opt.startX || 0;
  this.startY = opt.startY || 0;
  this.targetX = opt.startX || 0;;
  this.targetY = opt.startY || 0;;
  this.targetDistance = 0;
  this.timeToTarget = 0;
  this.startTime = 0;
  this.rate = opt.rate; //px per second
  this.autopilot = false;
  this.disableAutopilot = false;
  //domm els
  this.el = opt.domEl || undefined;;
  this.infoEl = opt.infoEl || undefined;;
  this.actionbarEl = opt.actionbarEl || undefined;
  this.stage;
  //game stats
  this.health = opt.health;
  this.maxHealth = opt.health;
  this.weapon = opt.weapon || {
    damage: 0,
    range: 0,
    cooldown: 0
  }
  //combat state
  this.weaponOnCooldown = false;
  this.abilityTarget = 0;
  //game state
  this.selected = false;
  this.attacking = false;
  this.controllable = opt.controllable || false;
  //game controls
  this.selectKey = opt.selectKey || false;
  this.attackKey = opt.attackKey || false;
  //AI
  this.validTargets = opt.validTargets || false;
};

entity.prototype.update = function(t) {
  if (this.health <= 0 && !this.dead) {
    this.destroy();
  }
  else {
    this.behaviors();
    this.move(t);
    this.render();
  }
};

entity.prototype.destroy = function() {
  this.dead = true;
  this.com.trigger('removeEntity',{id: this.id});
  this.el.remove();
};

entity.prototype.distance = function(x1,y1,x2,y2) {
  return Math.sqrt((Math.pow((x2-x1),2)+Math.pow((y2-y1),2)));
}
entity.prototype.setMoveTarget = function(x2,y2) {
  var self = this;
  //check border collisions and fix coordinates
  var s = this.stage;
  if (x2+self.width/2 > s.width()) {
    x2 = s.width()-self.width/2;
  }
  if (y2+self.height/2 > s.height()) {
    y2 = s.height()-self.height/2;
  }
  if (x2-self.width/2 < 0) {
    x2 = 0+self.width/2;
  }
  if (y2-self.height/2 < 0) {
    y2 = 0+self.height/2;
  }
  this.startX = this.x;
  this.startY = this.y;
  //accomidate so we land centered on where was selected
  this.targetX = x2-this.width/2;
  this.targetY = y2-this.height/2;
  var x1 = this.x;
  var y1 = this.y;
  //determine distance and the length of time it will take to get there
  this.targetDistance = this.distance(x1,y1,x2,y2);
  this.timeToTarget = (this.targetDistance/(this.rate/1000)); //convert to ms
  var d = new Date();
  this.startTime = d.getTime();
};

entity.prototype.initMove = function(newX, newY) {
  this.disableAutopilot = true;
  this.setMoveTarget(newX, newY);
}

entity.prototype.move = function(t) {
  //if we reached the target, we're done
  if (this.x == this.targetX && this.y == this.targetY) return;
  var elapsedTime = t-this.startTime;
  var percentTotal = ((elapsedTime/this.timeToTarget));
  var t = percentTotal;
  if (t>1){
    //if we are longer than it should have taken, jump us where we should be
    this.x = this.targetX;
    this.y = this.targetY;
    return;
  }
  //otherwise set up some vars
  var x1 = this.startX;
  var y1 = this.startY;
  var x2 = this.targetX;
  var y2 = this.targetY
  //calculate new x & y based on the % of time elapsed to go from (x1,y1) to
  //(x2,y2) using parametric equations (http://stackoverflow.com/questions/8018929/simulating-movement-in-2d)
  var newX = x1 + (t*(x2 - x1));
  var newY = y1 + (t*(y2 - y1));
  this.x = newX;
  this.y = newY;
};

entity.prototype.behaviors = function() {
  var self = this;
  if (!self.controllable) { self.AITarget(); }
  //we have a target
  if (this.attacking && typeof this.abilityTarget == 'object') {
    //see if the target is in range
    var distance = this.distance(this.x,this.y,this.abilityTarget.x,this.abilityTarget.y);
    //in range
    if (distance < this.weapon.range) {
      //if the autopilot is turned on and not forcibly disabled
      if (self.autopilot && !self.disableAutopilot) {
        self.turnOffAutopilot();
      }
      self.fireWeapon();
    }
    //out of range 
    else {
      //if the autopilot is off, and not forcibly disabled
      if (!self.autopilot && !self.disableAutopilot) {
        self.turnOnAutopilot();
      }
    }
  }
}

//set the target move-to coordinates to the same as the ability target
entity.prototype.turnOnAutopilot = function() {
  var self = this;
  self.autopilot = true;
  self.setMoveTarget(self.abilityTarget.x,self.abilityTarget.y);
};

//set the target move-to coordinates to current coordinates
entity.prototype.turnOffAutopilot = function() {
  var self = this;
  self.autopilot = false;
  self.targetX = self.x;
  self.targetY = self.y;
};

entity.prototype.fireWeapon = function() {
  var self = this;
  if (!self.weaponOnCooldown) {
    self.weaponOnCooldown = true;
    self.com.trigger('dmgDealt',{id: self.abilityTarget.id, dmg: self.weapon.damage});
    setTimeout(function(){
      self.weaponOnCooldown = false;
    },self.weapon.cooldown);
  }
}

entity.prototype.AITarget = function() {
  if (!this.abilityTarget && this.validTargets.length) {
    this.attack();
    var t = this.validTargets;
    var id = t[Math.floor(Math.random()*t.length)];
    this.setAbilityTarget(id);
  }
};

entity.prototype.bindEvents = function() {
  var self = this;
  this.com.bind('newSelect', function() {
    self.selected = false;
    self.unselect();
  });
  this.com.bind('requestPosition', function(opt){
    if (opt.id == self.id) {
      var obj = {x: self.x, y: self.y, fromId: self.id, id: opt.fromId};
      self.com.trigger('tellPosition', obj)
    }
  });
  this.com.bind('tellPosition', function(opt){
    self.populateAbilityTarget(opt);
  });
  this.com.bind('dmgDealt',function(opt){
    if (opt.id == self.id) {
      self.health = self.health - opt.dmg;
      console.log('ouch, '+self._id+' took '+opt.dmg+'@'+self.health)
    }
  });
  this.com.bind('removeEntity', function(opt) {
    if (self.abilityTarget && self.abilityTarget.id == opt.id) {
      self.abilityTarget = undefined;
    }
    if (!self.validTargets){return;}
    var toRemove;
    self.validTargets.forEach(function(target,i){
      if (target == opt.id) {
        toRemove = i;
      }
    });
    if (toRemove != undefined){
      self.validTargets.remove(toRemove);
    }
  });
}
entity.prototype.makeSelected = function() {
  this.com.trigger('newSelect',{});
  this.selected = true;
  this.select();
};
entity.prototype.attack = function() {
  if (this.controllable && !this.selected){ return; }
  this.attacking = true;
}
//recieving a entity Id, make a reuest to the entity
//for its' information to populate the ability target
entity.prototype.setAbilityTarget = function(entityId) {
  var self = this;
  if (this.controllable && (!this.selected || !this.attacking)) {return;}
  this.abilityTarget = entityId;
  this.com.trigger('requestPosition',{id: entityId, fromId: self.id});
  this.disableAutopilot = false;
}
//take a response from another entity and populate the
//ability target
entity.prototype.populateAbilityTarget = function(opt) {
  var self = this;
  if (opt.fromId==self.abilityTarget && opt.id == self.id) {
    opt.id = opt.fromId;
    delete opt.fromId;
    self.abilityTarget = opt;
  }
}

/*UI stuff, needs to be split off*/

entity.prototype.render = function() {
  this.el.css('left',this.x).css('top',this.y);
  if (this.controllable) {
    this.infoEl.find('.health').html(this.health+' / '+this.maxHealth);
  }
};
entity.prototype.select = function() {
  var self = this;
  if (!this.controllable){ return;}
  this.infoEl.addClass('selected');
  this.actionbarEl.addClass('selected');
  if (self.attackKey) {
    self.kb = KeyboardJS.bind.key(self.attackKey, function(){}, function(){ self.attack();});
  }
}
entity.prototype.unselect = function() {
  var self = this;
  if (!this.controllable){ return;}
  this.infoEl.removeClass('selected');
  this.actionbarEl.removeClass('selected');
  if (self.kb) {
    self.kb.clear();
    self.kb = undefined;
  }
}

entity.prototype.bindDom = function() {
  var self = this;
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
    var el = $(this);
    self.setAbilityTarget(el.attr('rel'));
  });
}

entity.prototype.init = function() {
  //message passing events
  this.bindEvents();
  this.el.attr('rel',this.id);
  if (this.controllable) {
    this.bindDom();
  }
}