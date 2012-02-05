var defaultUnits = [{
    id: 'tank',
    unitClass: 'tank',
    level: 1,
    controllable: true,
    startX: 20,
    startY: 250,
    height: 33, //px//
    width: 43, //px
    rate: 200, //px/s
    health: 100,
    weapon: {
      damage: 15,
      range: 120, //px
      cooldown: 2000, //ms
      target: 'npc'
    },
    items: {
      attack: null,
      defense: null,
      misc1: null,
      misc2: null
    },
    xp: 0,
    defense: 5,
    selectKey: '1',
    attackKey: 'a',
    type: 'pc',
    img: 'images/green_ship.png'
},{
    id: 'healer',
    unitClass: 'healer',
    level: 1,
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
    items: {
      attack: null,
      defense: null,
      misc1: null,
      misc2: null
    },
    xp: 0,
    defense: 5,
    selectKey: '2',
    attackKey: 'a',
    type: 'pc',
    img: 'images/green_healer.png'
},{
    id: 'dps',
    unitClass: 'dps',
    level: 1,
    controllable: true,
    startX: 20,
    startY: 350,
    height: 39, //px//
    width: 33, //px
    rate: 200, //px/s
    health: 100,
    weapon: {
      damage: 20,
      range: 130, //px
      cooldown: 2200, //ms
      target: 'npc'
    },
    items: {
      attack: null,
      defense: null,
      misc1: null,
      misc2: null
    },
    xp: 0,
    defense: 0,
    selectKey: '3',
    attackKey: 'a',
    type: 'pc',
    img: 'images/green_dps.png'
}];

var _e = new entities;
_e.setValidTargets(['tank','healer']);
var planets = {
  planet1: {
    background: 'images/backgrounds/space4.jpg',
    waves: [[_e.get({entityName: 'attack1',id: 'bx',startX: 800, startY: 220})],
            [_e.get({entityName: 'attack1',id: 'bx2',startX: 800, startY: 220})],
            [_e.get({entityName: 'attack1',id: 'bx3',startX: 800, startY: 220})]
           ]
  },
  planet2: {
    background: 'images/backgrounds/space2.jpg',
    waves:[[_e.get({entityName: 'attack1', id: 'bx',startX: 800, startY: 320}),
            _e.get({entityName: 'attack1', id: 'bx2', startX: 800, startY: 120})
           ],
           [_e.get({entityName: 'attack1', id: 'bx3',startX: 800, startY: 320}),
            _e.get({entityName: 'attack1', id: 'bx4', startX: 800, startY: 120})
           ]
          ]
  },
  planet3: {
    background: 'images/backgrounds/space3.jpg',
    waves: [[_e.get({entityName: 'attack1', id: 'bx',startX: 800, startY: 320}),
              _e.get({entityName: 'attack1', id: 'bx2', startX: 800, startY: 220}),
              _e.get({entityName: 'attack1', id: 'bx3', startX: -70, startY: 120})
            ]]
  },
  planet4: {
    background: 'images/backgrounds/space5.jpg',
    waves: [[_e.get({
        entityName: 'attack1',
        id: 'bx', 
        startX: 200,
        startY: 200,
        rate: 80, //px/s
        health: 200,
        weapon: {
          damage: 15,
          range: 80, //px
          cooldown: 1200, //ms
          target: 'pc'
        },
    })]],
  }
}


var items = [{
  name: 'Advanced Shields',
  effect: function(entity) {
    return {defense: entity.defense+3};
  },
  desc: 'Increses a ships shields by +3',
  validClass: ['healer'],
  img: 'images/items/shield.png',
  slots: ['defense'],
  cost: 100
},
{
  name: 'Super Advanced Shields',
  effect: function(entity) {
    return {defense: entity.defense+6};
  },
  desc: 'Increses a ships shields by +6',
  validClass: ['healer'],
  img: 'images/items/shield.png',
  slots: ['defense'],
  cost: 150
},
{
  name: 'Better Engine',
  effect: function(entity) {
    return {rate: entity.rate+100};
  },
  desc: 'Increses a ships speed',
  validClass: ['healer','tank'],
  img: 'images/items/engine.png',
  slots: ['misc1','misc2'],
  cost: 200
}]

