var dataModel = function(opt) {
  this.userData;
  
};
dataModel.prototype.bindEvents = function() {
  
};
dataModel.prototype.addInventory = function(item) {
  this.userData.inventory.push(item);
  return this.saveData();
}
dataModel.prototype.setUnitXP = function(i,xp){
  this.userData.activeUnits[i].xp = xp;
  return this.saveData();
}
dataModel.prototype.setItemSlot = function(unitIndex,slot,itemIndex) {
  var item = this.userData.inventory[itemIndex];
  item = $.extend(true,{},item);
  var unit = this.userData.activeUnits[unitIndex];
  if (item.validClass.indexOf(unit.unitClass) == -1 || item.slots.indexOf(slot) == -1) {
    return this.userData;
  }
  this.userData.inventory.splice(itemIndex,1)
  if (unit.items[slot]) {
    this.userData.inventory.push(this.userData.activeUnits[unitIndex].items[slot]);
  }
  this.userData.activeUnits[unitIndex].items[slot] = item;
  return this.saveData();
}
dataModel.prototype.removeItemSlot = function(unitIndex,slot) {
  this.userData.inventory.push(this.userData.activeUnits[unitIndex].items[slot]);
  this.userData.activeUnits[unitIndex].items[slot] = null;
  return this.saveData();
}
dataModel.prototype.switchItemsInventory = function(index1,index2) {
  var item1 = $.extend(true,{},this.userData.inventory[index1]);
  var item2 = $.extend(true,{},this.userData.inventory[index2]);
  this.userData.inventory[index1] = item2;
  this.userData.inventory[index2] = item1;
  return this.saveData();
}

dataModel.prototype.populateItems = function() {
  var self = this;
  //put the item's effects back since they dont serialize
  var sortedFunc = {};
  items.forEach(function(item,i){
    sortedFunc[item.name] = item.effect;
  })
  this.userData.inventory.forEach(function(item,i){
    self.userData.inventory[i].effect = sortedFunc[item.name];
  })

  this.userData.activeUnits.forEach(function(unit,i){
    for (slot in unit.items) {
      if (unit.items.hasOwnProperty(slot) && unit.items[slot]) {
        unit.items[slot].effect = sortedFunc[unit.items[slot].name];
      }
    }
  })
}
dataModel.prototype.getData = function() {
  this.userData = $.jStorage.get('bh',{
    activeUnits: defaultUnits,
    reserveUnits: [],
    map: [],
    inventory: []
  });
  this.populateItems();
  return this.saveData();
};

dataModel.prototype.saveData = function() {
  $.jStorage.set('bh', this.userData);
  return this.userData;
};

dataModel.prototype.init = function() {
  var self = this;
  self.bindEvents();
}