var game = function(opt) {
  this.com = new communicator();
  this.entities = [];
  this.stage = opt.stage;
}
game.prototype.loop = function() {
  var self = this;
  var d = new Date();
  var t = d.getTime();
  this.entities.forEach(function(entity) {
    entity.update(t);
  });
  setTimeout(function() {self.loop()}, 20);
}
game.prototype.init = function() {
  var self = this;
  this.entities.forEach(function(entity) {
    entity.stage = self.stage;
    entity.init();
  });
  setTimeout(function() {self.loop()}, 20);
  this.com.bind('removeEntity', function(opt){
    var i = 0;
    var toRemove;
    self.entities.forEach(function(entity){
      if (entity.id==opt.id) {
        toRemove = i;
      }
      i++;
    })
    self.entities.remove(i);
  })
}
game.prototype.addEntity = function(entity) {
  entity.com = this.com;
  this.entities.push(entity);
}