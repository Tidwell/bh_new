var template = function() {
  
}
template.prototype.stage = function() {
  return '<div class="stage"><div class="buttons"><ul class="chars"></ul><ul class="actionbars"></ul></div><canvas width="800" height="500" id="effects"></canvas><a href="#" class="home button">Home</a></div>';      
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