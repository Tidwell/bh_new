var world = function() {
  this.worldEl = $('#container');
  var self = this;
  self.getData();
  self.bindDom();
  self.showHome();
}
world.prototype.nav = function(e,el) {
  var self = this;
  var item = el.attr('rel');
  switch (item) {
    case 'map':
      self.showMap();
      break;
    case 'armory':
      self.showArmory();
      break;
  default:

  }
};
world.prototype.showMap = function() {
  $('#nav').hide();
  $('#map').show();
  $('.home').show();
}
world.prototype.showArmory = function() {
  this.populateArmory();
  $('#nav').hide();
  $('#armory').show();
  $('.home').show();
}
world.prototype.showHome = function() {
  var self = this;
  if (self.stage) {
    self.stage.remove();
    self.stage = null;
  }
  if (self.rend && self.game && self.game.active) {
    self.rend.gameOver();
    self.rend = null;
  }
  if (self.game) {
    self.game = null;
  }
  this.worldEl.show();
  $('#nav').show();
  $('#map').hide();
  $('#armory').hide();
  $('.home').hide();
}
world.prototype.getData = function() {
  this.userData = $.jStorage.get('bh',{
    activeUnits: defaultUnits,
    reserveUnits: [],
    map: [],
    inventory: []
  });
  this.saveData();
};

world.prototype.saveData = function() {
  $.jStorage.set('bh', this.userData);
};

world.prototype.bindDom = function() {
  var self = this;
  $('#nav').on('click', 'li', function(e){
    self.nav(e,$(this))
  });
  $('body').on('click', '.home', function() {
    self.showHome();
    return false;
  })
  $('#map .planet').click(function() {
    var stage = planets[$(this).attr('rel')];
    self.startGame(stage);
    return false;
  })
  $('body').on('click','#armory .chars li',function() {
    $('#armory .chars li').removeClass('selected');
    $(this).addClass('selected');
    self.populateArmorySelected();
  })

}

world.prototype.startGame = function(instance) {
  //copy the options so we dont muck with them
  var instance = $.extend(true,{}, instance);
  var enemies = instance.enemies;
  var self = this;
  var t = new template;
  $('body').append(t.stage());
  $('.stage .home').show();
  self.stage = $('.stage');
  var stage = self.stage;
  stage.css('background', 'url("'+instance.background+'")');
  var t = new template;
  self.worldEl.hide();
    
  var com = new communicator();
  self.game = new game({stage: stage, com: com});
  var bh = self.game;
  self.userData.activeUnits.forEach(function(unit,i){
    //make dom els
    stage.append(t.ship(unit.id));
    stage.find('.actionbars').append(t.actionbar(unit.id));
    stage.find('.chars').append(t.charInfo(unit.id,unit.img));
    //set unit dom info
    unit.domEl = $('.entity.'+unit.id)
    unit.infoEl = $('.chars .'+unit.id)
    unit.actionbarEl = $('.actionbars .'+unit.id)
    //add to game
    bh.addEntity(new entity(unit))
  })
  
  enemies.forEach(function(unit,i){
    //make dom els
    stage.append(t.ship(unit.id+' enemy'));
    
    //set unit dom info
    unit.domEl = $('.entity.'+unit.id)
    //add to game
    bh.addEntity(new entity(unit))
  })
  
  self.bindEvents(com);
  self.rend = new renderer({game: bh});
  bh.init();
  self.rend.init();
};

world.prototype.bindEvents = function(com) {
  var self = this;
  com.bind('gameRenderDone',function(winner) {
    self.showHome();  
  });
}

world.prototype.populateArmory = function() {
  var t = new template;
  $('#armory .chars li').remove();
  this.userData.activeUnits.forEach(function(unit,i){
    $('#armory .chars').append(t.armoryChar(unit.id,unit.img,i));
  })
  $($('#armory .chars li')[0]).addClass('selected');
  this.populateArmorySelected();
}

world.prototype.populateArmorySelected = function() {
  var stats = $('#armory .stats');
  var i = $('#armory .chars .selected').attr('rel');
  var unit = this.userData.activeUnits[i];
  stats.find('.attack span').html(Math.abs(unit.weapon.damage));
  if (unit.weapon.damage < 0) {
    stats.find('.attack label').html('Heals:');
  } else {
    stats.find('.attack label').html('Attack:');
  }
  stats.find('.defense span').html(unit.defense);
  $('#armory .info img').attr('src',unit.img);
  $('#armory .info h3').html(unit.id);
}