var template = function() {
  
}
template.prototype.ship = function(classes) {
  return '<div class="entity '+classes+'"><div class="img"></div></div>';
}
template.prototype.actionbar = function(classes) {
  return '<li class="'+classes+'"><ul><li class="attack"><p class="bind"></p></li></ul></li>';
}
template.prototype.charInfo = function(classes,image) {
  return '<li class="'+classes+'"><p class="bind"></p><img src="'+image+'" /><p class="health"></p></li>';
}