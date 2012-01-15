var entity = function(opt) {
  this.x = opt.startX || 0;;
  this.y = opt.startY || 0;;
  this.height = opt.height;
  this.width = opt.width;
  this.startX = opt.startX || 0;
  this.startY = opt.startY || 0;
  this.targetX = opt.startX || 0;;
  this.targetY = opt.startY || 0;;
  this.targetDistance = 0;
  this.timeToTarget = 0;
  this.startTime = 0;
  this.rate = opt.rate; //px per second 
  this.el = opt.domEl;
  this.infoEl = opt.infoEl;
  this.stage;
  this.health = opt.health;
  this.maxHealth = opt.health;
  this.selected = false;
  this.controllable = opt.controllable || false;
  this.selectKey = opt.selectKey || false;
  this.weapon = opt.weapon || {
    damage: 0,
    range: 0,
    cooldown: 0
  }
};

entity.prototype.setTarget = function(x2,y2) {
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
  this.targetDistance = Math.sqrt((Math.pow((x2-x1),2)+Math.pow((y2-y1),2)));
  this.timeToTarget = (this.targetDistance/(this.rate/1000)); //convert to ms
  var d = new Date();
  this.startTime = d.getTime();
};

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

/*UI stuff, needs to be split off*/

entity.prototype.render = function() {
  this.el.css('left',this.x).css('top',this.y);
  if (this.controllable) {
    this.infoEl.find('.health').html(this.health+' / '+this.maxHealth);
  }
};

entity.prototype.makeSelected = function() {
  this.selected = false;
  $('.chars li').removeClass('selected');
  this.infoEl.addClass('selected');
};

entity.prototype.bind = function() {
  var self = this;
  $(self.stage).click(function(e) {
    if (!self.selected) { return; }
    var s = self.stage;
    var newX = e.pageX-s.offset().left;
    var newY = e.pageY-s.offset().top;
    self.setTarget(newX, newY);
  });
  KeyboardJS.bind.key(self.selectKey, function(){}, function(){self.makeSelected()});
}

entity.prototype.init = function() {
  if (this.controllable) {
    this.bind();
  }
}