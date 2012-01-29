var entity = function(opt) {
  var self = this;
  this._id = opt.id || Math.floor(Math.random()*100000);
  this.xp = opt.xp || 0;
  this.level = opt.level || 0;
  this.img = opt.img || '';
  this.id = opt.id || this._id;
  this.com = opt.communicator;
  this.dead = false;
  this.type = opt.type || undefined;
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
    cooldown: 0,
    type: ''
  };
  this.items = opt.items || {};
  this.defense = opt.defense || 0;
  //combat state
  this.weaponOnCooldown = false;
  this.abilityTarget = 0;
  //game state
  this.selected = false;
  this.attacking = false;
  this.controllable = opt.controllable || false;
  //game controls
  this.selectKey = opt.selectKey || false;
  //AI
  this.validTargets = opt.validTargets || false;
  this.threatTable = {};
  this.firstHitThreatMultiplier = 2;
  var abilities = $.extend(true,{
    attack: {
      key: opt.attackKey || false,
      effect:function() {
        self.attack();
      }
  }},opt.abilities);
  this.abilities = abilities;
};
entity.prototype.ability = function(id) {
  return this.abilities[id].effect();
}
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
  this.com.trigger('newTargetPos',{id: self.id});
};

entity.prototype.initMove = function(newX, newY) {
  this.disableAutopilot = true;
  this.abilityTarget = null;
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
  //no change in velocity
  var newX = x1 + (t*(x2 - x1));
  var newY = y1 + (t*(y2 - y1));
  //change in velocity
  //var w = 3*t*t - 2*t*t*t
  //var newX = x1 + w*(x2 - x1)
  //var newY = y1 + w*(y2 - y1)
  this.x = newX;
  this.y = newY;
};

entity.prototype.behaviors = function(t) {
  var self = this;
  if (!self.controllable) { self.AITarget(); }
  //we have a target
  if (this.attacking && this.abilityTarget && typeof this.abilityTarget == 'object') {
    //see if the target is in range
    var distance = this.distance(this.x,this.y,this.abilityTarget.x,this.abilityTarget.y);
    //in range
    if (distance <= this.weapon.range) {
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
        //console.log('out of range moving',self.id)
        self.turnOnAutopilot();
      }
    }
  }
}

entity.prototype.updateTargetPos = function() {
  var self = this;
  //dont update the target if we havent gotten anything back from them yet
  if (typeof self.abilityTarget != 'object') {
    return;
  };
  //self.setAbilityTarget(self.abilityTarget.id);
  if (self.abilityTarget) {
    this.com.trigger('requestPosition',{id: self.abilityTarget.id, fromId: self.id});
  }
  this.disableAutopilot = false;
}
//set the target move-to coordinates to the same as the ability target
entity.prototype.turnOnAutopilot = function() {
  var self = this;
  //console.log('attempting auto')
  if (!self.abilityTarget || self.abilityTarget.pctype != self.weapon.target) {return;}
  self.autopilot = true;
  //console.log('turing on auto',self.id)
  self.setMoveTarget(self.abilityTarget.x,self.abilityTarget.y);
};

//set the target move-to coordinates to current coordinates
entity.prototype.turnOffAutopilot = function() {
  var self = this;
  if (self.controllable == true) {
    self.autopilot = false;
  }
  self.targetX = self.x;
  self.targetY = self.y;
  self.rawTargetX = self.x;
  self.rawTargetY = self.y;
};

entity.prototype.fireWeapon = function() {
  var self = this;
  if (!self.weaponOnCooldown && self.abilityTarget && self.abilityTarget.pctype == self.weapon.target) {
    //console.log(self.id,'firing weapon')
    self.updateTargetPos();
    if (!self.abilityTarget) { return; }
    var distance = this.distance(this.x,this.y,this.abilityTarget.x,this.abilityTarget.y);
    if (distance > this.weapon.range) { return; }
    
    self.weaponOnCooldown = true;
    self.com.trigger('dmgDealt',{id: self.abilityTarget.id, dmg: self.weapon.damage,self:self,target:self.abilityTarget});
    self.com.trigger('onCooldown',{id: self.id, ability: 'attack', cooldown: self.weapon.cooldown,type:self.type});
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
entity.prototype.unselect = function() {
  var self = this;
  self.selected = false;
  self.com.trigger('unselected', {entity: self})
}
entity.prototype.respondPosition = function(opt) {
  var self = this;
  if (opt.id == self.id) {
    self.com.trigger('tellPosition', {
      x: self.x,
      y: self.y,
      messageFromId: self.id,
      messageToId: opt.fromId,
      pctype: self.type,
      height: self.height,
      width: self.width,
      self: self
    })
  }
}
entity.prototype.takeDamage = function(opt) {
  var self = this;
  var dmg = opt.dmg;
  //calculate dmg
  if (dmg > 0) {
    dmg = (dmg-self.defense < 0) ? 0 : (dmg-self.defense);
  }
  //calcualte threat for use if npc
  var threat = dmg;
  if (self.health == self.maxHealth) {
    threat = threat*self.firstHitThreatMultiplier;
  }
  //apply dmg
  self.health = self.health - dmg;
  
  //make sure we didnt go over max health if healing
  if (self.health > self.maxHealth) {self.health = self.maxHealth;}
  
  //autoattack
  if (!self.abilityTarget && opt.self.type == self.weapon.target) {
    //console.log('autoattacking',self.id,opt.self.id)
    self.attacking = true;
    self.autopilot = true;
    self.disableAutopilot = false;
    self.setAbilityTarget(opt.self.id);
  }
  //if enemy apply threat and check if need to retarget
  if (self.type == 'npc') {
    self.threatTable[opt.self.id] = self.threatTable[opt.self.id]
      ? self.threatTable[opt.self.id]+threat
      : threat;
    self.checkThreatTarget();
  }
}
entity.prototype.checkThreatTarget = function() {
  var highestThreat = 0;
  var highestThreatId = '';
  for (unit in this.threatTable) {
    if (this.threatTable.hasOwnProperty(unit)) {
      if (this.threatTable[unit] > highestThreat) {
        highestThreat = this.threatTable[unit];
        highestThreatId = unit;
      }
    }
  }
  if (highestThreatId != this.abilityTarget.id) {
    this.setAbilityTarget(highestThreatId);
  }
}
entity.prototype.removeEntity = function(opt) {
  var self = this;
  //strip the ability target if its there
  if (self.abilityTarget && self.abilityTarget.id == opt.id ||
       self.abilityTarget) {
     self.abilityTarget = undefined;
   }
   if (!self.validTargets){return;}
   //strip the valid targets on AI entitys
   var toRemove;
   self.validTargets.forEach(function(target,i){
     if (target == opt.id) {
       toRemove = i;
     }
   });
   if (toRemove != undefined){
     self.validTargets.remove(toRemove);
   }
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
  if (!entityId || entityId==this.id) {return;}
  var self = this;
  this.abilityTarget = entityId;
  this.com.trigger('requestPosition',{id: entityId, fromId: self.id});
  this.disableAutopilot = false;
}
//take a response from another entity and populate the
//ability target
entity.prototype.populateAbilityTarget = function(opt) {
  var self = this;
  var targetId = (self.abilityTarget && typeof self.abilityTarget == 'object') ? self.abilityTarget.id : self.abilityTarget;
  if ((opt.messageFromId==targetId) && opt.messageToId == self.id && opt.messageFromId != self.id) {
  //console.log(self.id,'pop ability target',opt,self)
    opt.id = opt.messageFromId;
    delete opt.messageFromId;
    //only if the target moved
    if ((typeof self.abilityTarget == 'object' && self.abilityTarget.x != opt.x && self.abilityTarget.y != opt.y) || typeof self.abilityTarget == 'string') {
      self.abilityTarget = opt;
      self.rawTargetX = opt.x;
      self.rawTargetY = opt.y;
      self.turnOnAutopilot();
    }
  }
}

entity.prototype.applyItems = function() {
  for (slot in this.items) {
    if (this.items.hasOwnProperty(slot) && this.items[slot]) {
      var mods = this.items[slot].effect(this);
      for (mod in mods) {
        if (mods.hasOwnProperty(mod) && mods[mod]) {
          this[mod] = mods[mod];
        }
      }
    }
  }
}
entity.prototype.bindEvents = function() {
  var self = this;
  var updateTargetTime;
  this.com.bind('newSelect', function() {self.unselect()});
  self.com.bind('requestPosition', function(opt){self.respondPosition(opt)});
  self.com.bind('tellPosition', function(opt){self.populateAbilityTarget(opt);});
  self.com.bind('dmgDealt',function(opt){if (opt.id == self.id) {self.takeDamage(opt);}});
  self.com.bind('removeEntity', function(opt) {self.removeEntity(opt)});
  self.com.bind('newTargetPos',function(opt){
    if (self.abilityTarget && self.abilityTarget.id == opt.id) {
      //console.log('updating target',self.id)
      clearInterval(updateTargetTime);
      updateTargetTime = setInterval(function(){
        self.updateTargetPos();
      },40)
    }
  });
}
entity.prototype.init = function() {
  //message passing events
  this.bindEvents();
  this.applyItems();
}