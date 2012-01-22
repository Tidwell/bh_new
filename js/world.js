var world = function() {
  this.worldEl = $('#container');
  this.userData;
  var self = this;
  self.getData();
  self.bindDom();
  self.showHome();
  self.bindHash();
}
world.prototype.nav = function(hash) {
  var self = this;
  switch (hash) {
    case 'map':
      self.showMap();
      break;
    case 'armory':
      self.showArmory();
      break;
    case 'home':
      self.showHome();
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
  var t = new template;
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
  $('#armory').on('click','#armory .item',function(event) {
    var el = $(this);
    $('#armory .item').removeClass('selected');
    el.addClass('selected');
    var name = el.attr('title');
    var desc = el.attr('data-desc');
    var img = el.find('img').attr('src');
    var users = el.attr('data-users');
    var slot = el.attr('data-slot');
    $('#armory .desc').html(t.armoryDesc(name,desc,img,users,slot));
  });

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
    //copy so we dont muck up the one storing the user's data
    var unit = $.extend(true,{},unit);
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
  com.bind('xpGain',function(amount){
    self.userData.activeUnits.forEach(function(unit,i){
      unit.xp+=amount;
    });
    self.saveData();
  })
  com.bind('itemGain',function(opt){self.itemGain(opt)});
}

world.prototype.itemGain = function(number) {
  var self = this;
  for(var i=0;i<number;i++) {
    var rand = Math.floor(Math.random()*items.length);
    var item = items[rand];
    self.userData.inventory.push(item);
    self.saveData();
  }
}

world.prototype.populateArmory = function() {
  var t = new template;
  $('#armory .chars li').remove();
  this.userData.activeUnits.forEach(function(unit,i){
    $('#armory .chars').append(t.armoryChar(unit.id,unit.img,i));
  })
  $($('#armory .chars li')[0]).addClass('selected');
  var inv = $('.unequip');
  $('.unequip li').remove();
  this.userData.inventory.forEach(function(item,i){
    inv.append(t.armoryItem(item,i));
  })
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
  $('#armory .progression .level span').html(unit.level);
  $('#armory .progression .xp span').html(unit.xp);
  $('#armory .info img').attr('src',unit.img);
  $('#armory .info h3').html(unit.id);
}

world.prototype.bindHash = function() {
  var self = this;
  $(window).hashchange( function(){
    var hash = location.hash.replace('#','');
    self.nav(hash);
  });
  //check for pageload
  $(window).hashchange();
  
};