var game = function(opt) {
  this.com = opt.com;
  this.entities = [];
  this.active = false;
  this.stage = opt.stage;
  this.numWaves = opt.numWaves;
  this.wave = 0;
}
game.prototype.addEntity = function(entity) {
  entity.com = this.com;
  //inititalize each of the entities
  entity.stage = this.stage;
  this.entities.push(entity);
  if (this.active) {
    entity.init();
    this.com.trigger('newEntity',entity)
  }
};

game.prototype.removeEntity = function(opt){
  var self = this;
  var toRemove = undefined;
  this.entities.forEach(function(entity, i){
    if (entity.id==opt.id) {
      toRemove = i;
    }
  })
  if (toRemove != undefined) {
    self.entities.remove(toRemove);
  }
};

//main game loop
game.prototype.loop = function() {
  var self = this;
  self.checkOver();
  if (self.active) {
    var d = new Date();
    var t = d.getTime();
    self.entities.forEach(function(entity) {
      entity.update(t);
    });
    setTimeout(function() {self.loop()}, 25);
  }
};
game.prototype.checkOver = function() {
  var self = this;
  var hasPlayers = false;
  var hasEnemies = false;
  self.entities.forEach(function(entity, i){
    if (entity.type == 'pc') {
      hasPlayers = true;
    }
    if (entity.type == 'npc') {
      hasEnemies = true;
    }
  });
  if (!hasPlayers && hasEnemies) {
    self.active = false;
    self.com.trigger('gameOver','npc');
  }
  if (hasPlayers && !hasEnemies && self.wave==self.numWaves) {
    self.active = false;
    self.com.trigger('xpGain',10);
    self.com.trigger('itemGain',1);
    self.com.trigger('gameOver','pc');
    self.com.trigger('moneyGain','100');
  }
  if (hasPlayers && !hasEnemies && self.wave != self.numWaves) {
    self.com.trigger('nextWave',{})
  }
}
game.prototype.gameOver = function() {
  this.active = false;
}
game.prototype.init = function() {
  var self = this;
  //when we get a destruction notice from an entity, we need to
  //remove it from our array
  this.com.bind('removeEntity', function(opt) {self.removeEntity(opt)});
  this.active = true;
  this.entities.forEach(function(entity){
    entity.init();
  })
  /***Inititalize the Main Game Loop***/
  setTimeout(function() {self.loop()}, 20);
};
