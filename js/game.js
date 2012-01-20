var game = function(opt) {
  this.com = opt.com;
  this.entities = [];
  this.active = false;
  this.stage = opt.stage;
}
game.prototype.addEntity = function(entity) {
  entity.com = this.com;
  this.entities.push(entity);
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
  var d = new Date();
  var t = d.getTime();
  self.entities.forEach(function(entity) {
    entity.update(t);
  });
  self.checkOver();
  if (self.active) {
    setTimeout(function() {self.loop()}, 20);
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
    self.com.trigger('gameOver','npc');
    self.active = false;
  }
  if (hasPlayers && !hasEnemies) {
    self.com.trigger('gameOver','pc');
    self.active = false;
  }
}

game.prototype.init = function() {
  var self = this;
  //inititalize each of the entities
  this.entities.forEach(function(entity) {
    entity.stage = self.stage;
    entity.init();
  });
  //when we get a destruction notice from an entity, we need to
  //remove it from our array
  this.com.bind('removeEntity', function(opt) {self.removeEntity(opt)});
  this.active = true;
  
  /***Inititalize the Main Game Loop***/
  setTimeout(function() {self.loop()}, 20);
};
