var world = function() {
  this.worldEl = $('#container');
  var self = this;
  $('.nav').on('click', 'li', function(e){self.nav(e,$(this))});
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

world.prototype.startRandom = function() {
  var self = this;
  var stage = $('.stage');
  var t = new template;
  
  self.worldEl.hide();
  stage.append(t.ship('ship1'))
    .append(t.ship('ship2'))
    .append(t.ship('bx bx1 enemy'))
          
  $('.actionbars').append(t.actionbar('ship1'))
    .append(t.actionbar('ship2'))
        
  $('.chars').append(t.charInfo('ship1','images/green_ship.png'))
    .append(t.charInfo('ship2','images/green_healer.png'))
  
  var com = new communicator();
  com.bind('gameOver',function(winner) {
    stage.remove();
    self.worldEl.show();
  });
  var bh = new game({stage: stage, com: com});
  var char1 = new entity({
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
      domEl: $('.entity.ship1'),
      infoEl: $('.chars .ship1'),
      actionbarEl: $('.actionbars .ship1'),
      selectKey: '1',
      attackKey: 'a',
      type: 'pc'
  });
  var char2 = new entity({
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
      domEl: $('.entity.ship2'),
      infoEl: $('.chars .ship2'),
      actionbarEl: $('.actionbars .ship2'),
      selectKey: '2',
      attackKey: 'a',
      type: 'pc'
  });
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
  bh.addEntity(char1);
  bh.addEntity(char2);
  bh.addEntity(enemy);
  var rend = new renderer({game: bh});
  bh.init();
  rend.init();
};
