function Player(world, settings) {
  this.opts = settings || {};

  this.data = this.opts.data || {};

  this.name = this.opts.name || 'Unamed Player';
  this.moneyAmount = this.opts.moneyAmount || 500;
  this.moneyStockage = this.opts.moneyStockage || 500;

  this.BuildingStockage = [];

}
Player.prototype.update = function () {
  // dès qu'on a besoin de rafraichir un truc, on appelle cette fonction :D
  this.moneyStockage = this.opts.moneyStockage || 500;
  for (var i = 0; i < this.BuildingStockage.length; i++) {
    this.moneyStockage += this.BuildingStockage[i].stockage;
  }
  document.getElementById('moneyText').innerHTML = this.moneyAmount+' / '+this.moneyStockage;
  document.getElementById('moneyBar').style.width = (this.moneyAmount/this.moneyStockage*100)+'%';
}
