var game = function(opt) {
  this.entities = [];
  this.stage = opt.stage;
}
game.prototype.loop = function() {
  var self = this;
  var d = new Date();
  var t = d.getTime();
  this.entities.forEach(function(entity) {
    entity.move(t);
    entity.render();
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
}
game.prototype.addEntity = function(entity) {
  this.entities.push(entity);
}