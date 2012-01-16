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
  this.targetX = opt.startX || 0; //coerced to fit in border
  this.targetY = opt.startY || 0; //coerced to fit in border
  this.rawTargetX = opt.startX || 0; //uncoerced to fit in border
  this.rawTargetY = opt.startY || 0; //uncoerced to fit in border
  this.targetDistance = 0;
  this.timeToTarget = 0;
  this.startTime = 0;
  this.rate = opt.rate; //px per second
  this.autopilot = false;
  this.disableAutopilot = false;
  this.sinceLastAutoTarget = 0;
  this.lastAutoTarget = 0;
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
    this.behaviors(t);
    this.move(t);
  }
};

entity.prototype.destroy = function() {
  this.dead = true;
  this.com.trigger('removeEntity',{id: this.id, entity: this});
  this.el.remove();
};

entity.prototype.distance = function(x1,y1,x2,y2) {
  return Math.sqrt((Math.pow((x2-x1),2)+Math.pow((y2-y1),2)));
}
entity.prototype.setMoveTarget = function(x2,y2) {
  var self = this;
  self.rawTargetX = x2-self.width/2;
  self.rawTargetY = y2-self.height/2;
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

entity.prototype.behaviors = function(t) {
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
      if (self.autopilot) {
        if (self.sinceLastAutoTarget > 200 ) {
          self.updateTargetPos();
          self.sinceLastAutoTarget = 0;
          self.lastAutoTarget = t;
        }
        else {
          self.sinceLastAutoTarget += t-self.lastAutoTarget;
        }
      }
    }
  }
}

entity.prototype.updateTargetPos = function() {
  var self = this;
  //dont update the target if we havent gotten anything back from them yet
  if (typeof self.abilityTarget != 'object');
  self.setAbilityTarget(self.abilityTarget.id);
  self.turnOnAutopilot();
}
//set the target move-to coordinates to the same as the ability target
entity.prototype.turnOnAutopilot = function() {
  var self = this;
  if (!self.abilityTarget) {return;}
  self.autopilot = true;
  self.setMoveTarget(self.abilityTarget.x,self.abilityTarget.y);
};

//set the target move-to coordinates to current coordinates
entity.prototype.turnOffAutopilot = function() {
  var self = this;
  self.autopilot = false;
  self.targetX = self.x;
  self.targetY = self.y;
  self.rawTargetX = self.x;
  self.rawTargetY = self.y;
};

entity.prototype.fireWeapon = function() {
  var self = this;
  if (!self.weaponOnCooldown && self.abilityTarget) {
    self.updateTargetPos();
    if (!self.abilityTarget) { return; }
    var distance = this.distance(this.x,this.y,this.abilityTarget.x,this.abilityTarget.y);
    if (distance > this.weapon.range) { return; }
    
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
    self.com.trigger('unselected', {entity: self})
  });
  self.com.bind('requestPosition', function(opt){
    if (opt.id == self.id) {
      self.com.trigger('tellPosition', {
        x: self.x,
        y: self.y,
        messageFromId: self.id,
        messageToId: opt.fromId
      })
    }
  });
  self.com.bind('tellPosition', function(opt){
    self.populateAbilityTarget(opt);
  });
  self.com.bind('dmgDealt',function(opt){
    if (opt.id == self.id) {
      self.health = self.health - opt.dmg;
      console.log('ouch, '+self._id+' took '+opt.dmg+'@'+self.health)
    }
  });
  self.com.bind('removeEntity', function(opt) {
    if (self.abilityTarget && self.abilityTarget.id == opt.id ||
        self.abilityTarget) {
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
  this.com.trigger('newSelect',{entity:this});
  this.selected = true;
};
entity.prototype.attack = function() {
  if (this.controllable && !this.selected){ return; }
  this.attacking = true;
}
//recieving a entity Id, make a reuest to the entity
//for its' information to populate the ability target
entity.prototype.setAbilityTarget = function(entityId) {

  if (!entityId) {return;}
  var self = this;
  this.abilityTarget = entityId;
  this.com.trigger('requestPosition',{id: entityId, fromId: self.id});
  this.disableAutopilot = false;
}
//take a response from another entity and populate the
//ability target
entity.prototype.populateAbilityTarget = function(opt) {
  var self = this;
  var targetId = (typeof self.abilityTarget == 'object') ? self.abilityTarget.id : self.abilityTarget;
  if ((opt.messageFromId==targetId) && opt.messageToId == self.id) {
    opt.id = opt.messageFromId;
    delete opt.messageFromId;
    self.abilityTarget = opt;
  }
}

entity.prototype.init = function() {
  //message passing events
  this.bindEvents();
}