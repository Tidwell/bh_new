var defaultUnits = [{
    id: 'tank',
    unitClass: 'tank',
    level: 1,
    controllable: true,
    startX: 20,
    startY: 250,
    height: 66, //px//
    width: 86, //px
    rate: 200, //px/s
    health: 100,
    weapon: {
      damage: 15,
      range: 220, //px
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
    img: 'images/green_ship.png',
    abilityTree: [{
      skills: [{name: 'Increase Defense',active: false}],
      level: 0
    }],
    activeAbilities: [null]
},{
    id: 'healer',
    unitClass: 'healer',
    level: 1,
    controllable: true,
    startX: 150,
    startY: 350,
    height: 72, //px
    width: 86, //px
    rate: 200, //px/s
    health: 100,
    weapon: {
      damage: -5,
      range: 320, //px
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
    img: 'images/green_healer.png',
    abilityTree: [
      { skills: [{name: 'Heal All',active: false}],
        level: 0
      },
      { skills: [{name: 'Increase Defense',active: false},{name: 'Something Else',active: false}],
        level: 5
      }
    ],
    activeAbilities: [null,null]
},{
    id: 'dps',
    unitClass: 'dps',
    level: 1,
    controllable: true,
    startX: 20,
    startY: 550,
    height: 78, //px//
    width: 66, //px
    rate: 200, //px/s
    health: 100,
    weapon: {
      damage: 20,
      range: 230, //px
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
    img: 'images/green_dps.png',
    abilityTree: [
      { skills: [{name: 'Increase Defense',active: false}],
        level: 0
      }
    ],
    activeAbilities: []
}];

var _e = new entities;
_e.setValidTargets(['tank','healer']);
var planets = {
  planet1: {
    background: 'images/backgrounds/space4.jpg',
    waves: [[_e.get({entityName: 'attack1',id: 'bx',startX: 1300, startY: 220})],
            [_e.get({entityName: 'attack1',id: 'bx2',startX: 1300, startY: 220})],
            [_e.get({entityName: 'attack1',id: 'bx3',startX: 1300, startY: 220})]
           ]
  },
  planet2: {
    background: 'images/backgrounds/space2.jpg',
    waves:[[_e.get({entityName: 'attack1', id: 'bx',startX: 1300, startY: 320}),
            _e.get({entityName: 'attack1', id: 'bx2', startX: 1300, startY: 120})
           ],
           [_e.get({entityName: 'attack1', id: 'bx3',startX: 1300, startY: 320}),
            _e.get({entityName: 'attack1', id: 'bx4', startX: 1300, startY: 120})
           ]
          ]
  },
  planet3: {
    background: 'images/backgrounds/space3.jpg',
    waves: [[_e.get({entityName: 'attack1', id: 'bx',startX: 1300, startY: 320}),
              _e.get({entityName: 'attack1', id: 'bx2', startX: 1300, startY: 220}),
              _e.get({entityName: 'attack1', id: 'bx3', startX: -70, startY: 120})
            ]]
  },
  planet4: {
    background: 'images/backgrounds/space5.jpg',
    waves: [[_e.get({
        entityName: 'attack1',
        id: 'bx', 
        startX: 1300,
        startY: 200,
        rate: 80, //px/s
        health: 200,
        weapon: {
          damage: 15,
          range: 280, //px
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

var levelUp = [
{xp: 0},{xp: 0},
{
 xp: 30 //lvl 2
},
{
 xp: 80
}]



var abilities = [
      {
        name: 'Increase Defense',
        cooldown: 2000,
        description: 'Increases Unit\'s Defense by +6 for 10 seconds',
        effect: function(entity) {
          console.log('id used', entity)
        },
        active: false,
        key: 'w'
      },
      {
        name: 'Heal All',
        cooldown: 2000,
        description: 'Heals all Units for 20 health',
        effect: function(entity) {
          console.log('ha used', entity)
        },
        active: false,
        key: 'e'
      },
      {
        name: 'Something Else',
        cooldown: 2000,
        description: 'Something Else',
        effect: function(entity) {
          console.log('se used', entity)
        },
        active: false,
        key: 'd'
      }
]