var world = function() {
  this.worldEl = $('#container');
  var self = this;
  self.getData();
  self.bindDom();
}
world.prototype.nav = function(e,el) {
  var self = this;
  var t = new template;
  $('body').append(t.stage());
  var item = el.attr('rel');
  switch (item) {
    case 'train':
      self.startRandom();
      break;
  default:

  }
};
world.prototype.getData = function() {
  this.userData = $.jStorage.get('bh',{
    activeUnits: this.defaultUnits,
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
  $('.nav').on('click', 'li', function(e){
    self.nav(e,$(this))
  });

}

world.prototype.startRandom = function() {
  var self = this;
  var stage = $('.stage');
  var t = new template;
  self.worldEl.hide();
  
  var com = new communicator();
  var bh = new game({stage: stage, com: com});
  
  self.userData.activeUnits.forEach(function(unit,i){
    //make dom els
    stage.append(t.ship(unit.id));
    $('.actionbars').append(t.actionbar(unit.id));
    $('.chars').append(t.charInfo(unit.id,unit.img));
    //set unit dom info
    unit.domEl = $('.entity.'+unit.id)
    unit.infoEl = $('.chars .'+unit.id)
    unit.actionbarEl = $('.actionbars .'+unit.id)
    //add to game
    bh.addEntity(new entity(unit))
  })
  
  stage.append(t.ship('bx bx1 enemy'))
  var enemy = new entity({
      controllable: false,
      startX: 400,
      startY: 300,
      height: 35, //px
      width: 34, //px
      rate: 20, //px/s
      health: 100,
      controllable: false,
      weapon: {
        damage: 10,
        range: 50, //px
        cooldown: 1500, //ms
        target: 'pc'
      },
      domEl: $('.entity.bx1'),
      validTargets: ['ship1','healer'],
      type: 'npc'
  });
  bh.addEntity(enemy);  
  self.bindEvents(com,stage);
  var rend = new renderer({game: bh});
  bh.init();
  rend.init();
};

world.prototype.bindEvents = function(com,stage) {
  var self = this;
  com.bind('gameOver',function(winner) {
    stage.remove();
    self.worldEl.show();
  });
}

world.prototype.defaultUnits = [{
    id: 'ship1',
    controllable: true,
    startX: 20,
    startY: 250,
    height: 33, //px
    width: 43, //px
    rate: 200, //px/s
    health: 100,
    weapon: {
      damage: 15,
      range: 120, //px
      cooldown: 2000, //ms
      target: 'npc'
    },
    selectKey: '1',
    attackKey: 'a',
    type: 'pc',
    img: 'images/green_ship.png'
},{
    id: 'healer',
    controllable: true,
    startX: 50,
    startY: 300,
    height: 36, //px
    width: 43, //px
    rate: 200, //px/s
    health: 100,
    weapon: {
      damage: -5,
      range: 120, //px
      cooldown: 2500, //ms
      target: 'pc'
    },
    selectKey: '2',
    attackKey: 'a',
    type: 'pc',
    img: 'images/green_healer.png'
}];