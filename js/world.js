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
  default:

  }
};
world.prototype.showMap = function() {
  $('#nav').hide();
  $('#map').show();
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
  $('.home').hide();
}
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
  $('#nav').on('click', 'li', function(e){
    self.nav(e,$(this))
  });
  $('body').on('click', '.home', function() {
    self.showHome();
    return false;
  })
  $('#map .planet').click(function() {
    var enemies = planets[$(this).attr('rel')].enemies;
    self.startGame(enemies);
    return false;
  })

}

world.prototype.startGame = function(enemies) {
  var self = this;
  var t = new template;
  $('body').append(t.stage());
  $('.stage .home').show();
  self.stage = $('.stage');
  var stage = self.stage;
  var t = new template;
  self.worldEl.hide();
    
  var com = new communicator();
  self.game = new game({stage: stage, com: com});
  var bh = self.game;
  
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
  com.bind('gameOver',function(winner) {
    self.showHome();
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


var planets = {
  planet1: {
    enemies: [{
      id: 'bx',
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
      validTargets: ['ship1','healer'],
      type: 'npc'
    }]
  },
  planet2: {
    enemies: [{
      id: 'bx',
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
      validTargets: ['ship1','healer'],
      type: 'npc'
    },{
      id: 'bx2',
      controllable: false,
      startX: 430,
      startY: 220,
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
      validTargets: ['ship1','healer'],
      type: 'npc'
    }]
  },
  planet3: {
    enemies: [{
      id: 'bx',
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
      validTargets: ['ship1','healer'],
      type: 'npc'
    },{
      id: 'bx2',
      controllable: false,
      startX: 430,
      startY: 220,
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
      validTargets: ['ship1','healer'],
      type: 'npc'
    },{
      id: 'bx3',
      controllable: false,
      startX: 130,
      startY: 20,
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
      validTargets: ['ship1','healer'],
      type: 'npc'
    }]
  }
}