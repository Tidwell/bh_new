var defaultUnits = [{
    id: 'tank',
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
    xp: 0,
    defense: 5,
    selectKey: '1',
    attackKey: 'a',
    type: 'pc',
    img: 'images/green_ship.png'
},{
    id: 'healer',
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
    xp: 0,
    defense: 5,
    selectKey: '2',
    attackKey: 'a',
    type: 'pc',
    img: 'images/green_healer.png'
}];


var planets = {
  planet1: {
    background: 'images/backgrounds/space4.jpg',
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
      defense: 0,
      validTargets: ['tank','healer'],
      type: 'npc'
    }]
  },
  planet2: {
    background: 'images/backgrounds/space2.jpg',
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
      defense: 0,
      validTargets: ['tank','healer'],
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
      defense: 0,
      validTargets: ['tank','healer'],
      type: 'npc'
    }]
  },
  planet3: {
    background: 'images/backgrounds/space3.jpg',
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
      defense: 0,
      validTargets: ['tank','healer'],
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
      defense: 0,
      validTargets: ['tank','healer'],
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
      defense: 0,
      validTargets: ['tank','healer'],
      type: 'npc'
    }]
  },
  planet4: {
    background: 'images/backgrounds/space5.jpg',
    enemies: [{
      id: 'bx',
      controllable: false,
        startX: 200,
        startY: 200,
        height: 35, //px
        width: 34, //px
        rate: 80, //px/s
        health: 200,
        controllable: false,
        weapon: {
          damage: 15,
          range: 80, //px
          cooldown: 1200, //ms
          target: 'pc'
        },
        defense: 0,
        validTargets: ['tank','healer'],
        type: 'npc'
    }],
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
},
{
  name: 'Super Advanced Shields',
  effect: function(entity) {
    return {defense: entity.defense+6};
  },
  desc: 'Increses a ships shields by +6',
  validClass: ['healer'],
  img: 'images/items/shield.png',
}]

