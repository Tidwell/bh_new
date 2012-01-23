var template = function() {
  
}
template.prototype.stage = function() {
  return '<div class="stage"><div class="buttons"><ul class="chars"></ul><ul class="actionbars"></ul></div><canvas width="800" height="500" id="effects"></canvas><a href="#home" class="home button">Home</a></a></div>';      
}
template.prototype.ship = function(classes) {
  return '<div class="bb"><div class="entity '+classes+'"><div class="img"></div></div><div class="health"><span class="bar"></span></div></div>';
}
template.prototype.actionbar = function(classes) {
  return '<li class="'+classes+'"><ul><li class="attack"><p class="bind"></p></li></ul></li>';
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
  return '<div class="item" rel="'+i+'" title="'+item.name+'" data-desc="'+item.desc+'" data-users="'+item.validClass.join()+'" data-slot="'+item.slots.join()+'"><img src="'+item.img+'" /></div>';
}
template.prototype.armoryDesc = function(name,desc,img,users,slot) {
  return '<h2>'+name+'</h2><img src="'+img+'" /><p>'+desc+'</p><p>Usable by: '+users+'</p><p>Slot: '+slot+'</p>';
}