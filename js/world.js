var world = function() {
  this.dm = new dataModel;
  this.worldEl = $('#container');
  this.userData = this.dm.getData();
  var self = this;
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
    case '':
      self.showHome();
      break;
  default:

  }
};
world.prototype.showMap = function() {
  this.worldEl.show();
  this.destroyGame();
  $('#nav').hide();
  $('#armory').hide();
  $('#map').show();
  $('.home').show();
}
world.prototype.showArmory = function() {
  this.worldEl.show();
  this.destroyGame();
  this.populateArmory();
  $('#nav').hide();
  $('#map').hide();
  $('#armory').show();
  $('.home').show();
}
world.prototype.showHome = function() {
  this.worldEl.show();
  this.destroyGame();
  $('#nav').show();
  $('#map').hide();
  $('#armory').hide();
  $('.home').hide();
}

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
    stage.append(t.ship(unit.id+' friendly'));
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
  location = location.hash.replace(location.hash,'#game');
};

world.prototype.destroyGame = function() {
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
    self.game.gameOver();
    self.game = null;
  }
}

world.prototype.bindEvents = function(com) {
  var self = this;
  com.bind('gameRenderDone',function() {self.showHome();});
  com.bind('xpGain',function(opt){self.xpGain(opt);});
  com.bind('itemGain',function(opt){self.itemGain(opt)});
}
world.prototype.xpGain = function(amount){
  var self = this;
  self.userData.activeUnits.forEach(function(unit,i){
    self.userData = self.dm.setUnitXP(i,unit.xp+amount);
  });
  self.populateArmory();
}

world.prototype.itemGain = function(number) {
  var self = this;
  for(var i=0;i<number;i++) {
    var rand = Math.floor(Math.random()*items.length);
    var item = items[rand];
    self.userData = self.dm.addInventory(item)
  }
  self.populateArmory();
}

world.prototype.populateArmory = function() {
  var self = this;
  $('.drop').droppable( "destroy" );
  $( ".item" ).draggable( "destroy" );
  $('#armory .desc').html('');
  var t = new template;
  var currentSelected = $('#armory .chars .selected').attr('rel') || 0;
  $('#armory .chars li').remove();
  this.userData.activeUnits.forEach(function(unit,i){
    $('#armory .chars').append(t.armoryChar(unit.id,unit.img,i));
  })
  $($('#armory .chars li')[currentSelected]).addClass('selected');
  var inv = $('.unequip');
  $('.unequip li').remove();
  this.userData.inventory.forEach(function(item,i){
    inv.append('<li>'+t.armoryItem(item,i)+'</li>');
  })
  //fucking droppable throws error when destroyed with revert, ignore it
  $('.drop').droppable({
    accept: '.item',
    drop: function(e,obj) {
      self.changeItem(this,e,obj);
    }
  });
  $( ".item" ).droppable({
    accept: '.item',
    drop: function(e,obj,a,b) {
      var otherIndex = $(this).attr('rel');
      var droppedIndex = $(obj.draggable[0]).attr('rel');
      //if we are just moving stuff in the inventory
      if (!isNaN(Number(otherIndex)) && !isNaN(Number(droppedIndex))) {
        self.userData = self.dm.switchItemsInventory( Number(otherIndex),Number(droppedIndex))
        self.populateArmory();
      }
      else {
        
        var slot = droppedIndex;
        var itemIndex = otherIndex;
        var unitIndex = $('#armory .chars .selected').attr('rel');
        self.userData = self.dm.setItemSlot(unitIndex,slot,itemIndex)

        self.populateArmory();
      }
    }
  });
  $( ".unequip" ).droppable({
    accept: '.equip .item',
    drop: function(e,obj) {
      var slot = $(obj.draggable[0]).attr('rel');
      var unitIndex = $('#armory .chars .selected').attr('rel');
      self.userData = self.dm.removeItemSlot(unitIndex,slot);
      self.populateArmory();
    }
  });
  this.populateArmorySelected();
}

world.prototype.populateArmorySelected = function() {
  var stats = $('#armory .stats');
  var i = $('#armory .chars .selected').attr('rel');
  var unit = this.userData.activeUnits[i];
  var unit = new entity(unit);
  unit.applyItems();
  stats.find('.attack span').html(Math.abs(unit.weapon.damage));
  if (unit.weapon.damage < 0) {
    stats.find('.attack label').html('Heals:');
  } else {
    stats.find('.attack label').html('Attack:');
  }
  stats.find('.defense span').html(unit.defense);
  var t = new template;
  $('#armory .equip .attack .drop').html(t.armoryItem(unit.items.attack,'attack'));
  var def = t.armoryItem(unit.items.defense,'defense');
  $('#armory .equip .defense .drop').html(def);
  $('#armory .equip .misc1 .drop').html(t.armoryItem(unit.items.misc1,'misc1'));
  $('#armory .equip .misc2 .drop').html(t.armoryItem(unit.items.misc2,'misc2'));
  $('#armory .progression .level span').html(unit.level);
  $('#armory .progression .xp span').html(unit.xp);
  $('#armory .info img.charImg').attr('src',unit.img);
  $('#armory .info h3').html(unit.id);
  $( ".item" ).draggable({
    revert:true,
    revertDuration: 500,
  });


}

world.prototype.changeItem = function(el,e,obj){
  var self = this;
  //get the item
  var itemEl = obj.draggable;
  var item = self.userData.inventory[$(itemEl).attr('rel')];
  
  var slot = $(el).attr('rel');
  //get the active unit
  var unitIndex = $('#armory .chars .selected').attr('rel');
  var unit = self.userData.activeUnits[unitIndex];
  //if the class can use the item and slot can accept the item
  
  //set the item in the slot
  var itemIndex = $(itemEl).attr('rel');
  self.userData = self.dm.setItemSlot(unitIndex,slot,itemIndex)
  self.populateArmory();
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