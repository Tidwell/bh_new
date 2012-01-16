var game = function(opt) {
  this.com = new communicator();
  this.entities = [];
  this.stage = opt.stage;
}
game.prototype.addEntity = function(entity) {
  entity.com = this.com;
  this.entities.push(entity);
};

game.prototype.removeEntity = function(opt){
  var i = 0;
  var toRemove;
  self.entities.forEach(function(entity){
    if (entity.id==opt.id) {
      toRemove = i;
    }
    i++;
  })
  self.entities.remove(i);
};

//main game loop
game.prototype.loop = function() {
  var self = this;
  var d = new Date();
  var t = d.getTime();
  this.entities.forEach(function(entity) {
    entity.update(t);
  });
  setTimeout(function() {self.loop()}, 20);
};

game.prototype.init = function() {
  var self = this;
  //inititalize each of the entities
  this.entities.forEach(function(entity) {
    entity.stage = self.stage;
    entity.init();
  });
  //when we get a destruction notice from an entity, we need to
  //remove it from our array
  this.com.bind('removeEntity', self.removeEntity);
  
  /***Inititalize the Main Game Loop***/
  setTimeout(function() {self.loop()}, 20);
};
