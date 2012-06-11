var template = function() {
  
}
template.prototype.stage = function() {
  return '<div class="stage"><div class="buttons"><ul class="chars"></ul><ul class="actionbars"></ul></div><canvas width="1024" height="768" id="effects"></canvas><canvas width="1024" height="768" id="movement-lines"></canvas><a href="#home" class="home button">Home</a></a></div>';      
}
template.prototype.ship = function(classes) {
  return '<div class="bb"><div class="entity '+classes+'"><div class="img"></div></div><div class="health"><span class="bar"></span></div></div>';
}
template.prototype.actionbar = function(unit) {
  var unit = $.extend(true,{abilities: {attack: {name:'attack'}}},unit);
  var html = '<li class="'+unit.id+'"><ul>'
  for (ability in unit.abilities) {
    html += '<li class="'+unit.abilities[ability].name.toLowerCase().replace(' ','-')+'"><p class="bind"></p></li>';
  }

  html += '</ul></li>';

  return html;
}
template.prototype.charInfo = function(classes,image) {
  return '<li class="'+classes+'"><p class="bind"></p><img src="'+image+'" /><p class="health"></p></li>';
}
template.prototype.armoryChar = function(classes,image,rel) {
  return '<li class="'+classes+'" rel="'+rel+'"><img src="'+image+'" /></li>';
}
template.prototype.armoryItem = function(item,i) {
  if (!item) {
    return '';
  }
  return '<div class="item" rel="'+i+'" title="'+item.name+'" data-desc="'+item.desc+'" data-users="'+item.validClass.join()+'" data-slot="'+item.slots.join()+'" data-cost="'+item.cost+'"><img src="'+item.img+'" /></div>';
}
template.prototype.armoryDesc = function(name,desc,img,users,slot,rel,cost) {
  return '<h2 rel="'+rel+'">'+name+'</h2><img src="'+img+'" /><p>'+desc+'</p><p>Usable by: '+users+'</p><p class="slot">Slot: '+slot+'</p><p>Buy: '+cost+' / Sell: '+Number(cost)/2+'</p>';
}
template.prototype.cooldown = function(id,w,h) {
  return '<canvas class="cooldown" id="'+id+'" width="'+w+'" height="'+h+'"></canvas>'
}
template.prototype.alert = function(title,img,info) {
  return '<div class="alert"><h2>'+title+'</h2>'+(img ? '<img src="'+img+'">' : '')+'<p>'+info+'</p><button class="button okay">Okay</button></div>';
}
template.prototype.academyAbility = function(ability, active,enabled) {
  return '<p class="'+(active ? 'active' : '')+(enabled?'':' disabled')+'" ability="'+ability.name+'">'+ability.name+'</p>';
}
template.prototype.abilityDesc = function(ability,level) {
  return '<p>'+ability.name+'</p><p>Required Level: '+level+'</p><p>'+ability.description+'</p><p>Cooldown: '+ability.cooldown+'</p>';
}