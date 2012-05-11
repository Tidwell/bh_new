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
dataModel.prototype.setUnitLevel = function(i,level) {
  this.userData.activeUnits[i].level = level;
  return this.saveData();
}
dataModel.prototype.addMoney = function(amnt) {
  this.userData.money += Number(amnt);
  return this.saveData();
}
dataModel.prototype.removeMoney = function(amnt) {
  this.userData.money -= amnt;
  return this.saveData();
}
dataModel.prototype.buy = function(i) {
  var item = this.userData.merchant[i];
  if (item && this.userData.money >= item.cost) {
    this.userData.inventory.push(item);
    this.userData.merchant.splice(i,1);
    if (this.userData.merchant.length == 0) {
      this.refreshMerchant();
    }
    return this.removeMoney(item.cost);
  }
  return false;
}
dataModel.prototype.sell = function(i) {
  var item = this.userData.inventory[i];
  if (item) {
    this.userData.inventory.splice(i,1);
    return this.addMoney(Number(item.cost)/2);
  }
  return false;
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
  this.userData.merchant.forEach(function(item,i){
    self.userData.merchant[i].effect = sortedFunc[item.name];
  })

  this.userData.activeUnits.forEach(function(unit,i){
    for (slot in unit.items) {
      if (unit.items.hasOwnProperty(slot) && unit.items[slot]) {
        unit.items[slot].effect = sortedFunc[unit.items[slot].name];
      }
    }
  })
}


//giant clusterfuck to put effects back onto characters
//after they have been unserialized from local storage
dataModel.prototype.populateAbilities = function() {
  var self = this;
  //put the item's effects back since they dont serialize
  var sortedAbilities = {};
  abilities.forEach(function(ability,i){
    sortedAbilities[ability.name] = ability;
  })
  self.userData.activeUnits.forEach(function(unit,i){
    if (!unit.abilityTree) {return;}
    unit.abilityTree.forEach(function(opts,q){
      opts.skills.forEach(function(opts,z){
        unit.abilityTree[q].skills[z] = $.extend(true,{},sortedAbilities[unit.abilityTree[q].skills[z].name]);
      })
    })
  })
  self.allAbilities = sortedAbilities || {};
}

dataModel.prototype.setActiveAbility = function(obj) {
  var self = this;
  self.userData.activeUnits[obj.id].activeAbilities[obj.tier] = obj.ability;
  self.saveData();
}


dataModel.prototype.refreshMerchant = function() {
  this.userData.merchant = [];
  for (var i = 0;i<8; i++) {
    var item = $.extend(true, {}, items[Math.floor(Math.random()*items.length)]);
    this.userData.merchant.push(item)
  }
}
dataModel.prototype.getData = function() {
  this.userData = $.jStorage.get('bh',{
    activeUnits: defaultUnits,
    reserveUnits: [],
    map: [],
    inventory: [],
    merchant: null,
    money: 0
  });
  if (!this.userData.merchant || (this.userData.merchant && this.userData.merchant.length == 0)) {
    this.refreshMerchant()
  }
  if (!this.userData.money) {
    this.userData.money = 0;
  }
  this.populateItems();
  this.populateAbilities();
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