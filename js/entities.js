var entities = function() {
	this.validTargets = [];
}
entities.prototype.setValidTargets = function(validTargets){
	this.validTargets = validTargets;
}
entities.prototype.get = function(opt){
	var e = $.extend(true,{},this.entities[opt.entityName]);
	for (prop in opt){
		if (opt.hasOwnProperty(prop)) {
			e[prop] = opt[prop];
		}
	}
	e.id = opt.id
	e.validTargets = opt.validTargets || this.validTargets;
	return e;
}
entities.prototype.entities = {
	attack1: {
      id: 'bx',
      controllable: false,
      startX: 600,
      startY: 300,
      height: 70, //px
      width: 68, //px
      rate: 60, //px/s
      health: 150,
      controllable: false,
      weapon: {
        damage: 10,
        range: 250, //px
        cooldown: 1500, //ms
        target: 'pc'
      },
      defense: 0,
      targetingType: 'allRandom',
      type: 'npc'
    }
}