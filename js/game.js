function Game() {
  this.WIDTH = 40;
  this.HEIGHT = 24;
  this.TILE_SIZE = 25;

  this.map = [];
  this.player = {};
  this.enemies = [];
  this.items = [];

  this.settings = {
    rooms: { min: 5, max: 10 },
    roomSize: { min: 3, max: 8 },
    passages: { vertical: { min: 3, max: 5 }, horizontal: { min: 3, max: 5 } },
    enemiesCount: 10,
    healthPotions: 10,
    swords: 2,
  };
}

Game.prototype.init = function () {
  this.generateMap();
  this.render();
  this.bindEvents();
};

Game.prototype.generateMap = function () {
  //
};

Game.prototype.render = function () {
  $(".field").empty();
};

Game.prototype.bindEvents = function () {
  //wasdspace
};

Game.prototype.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

Game.prototype.isValidPosition = function (x, y) {
  return x >= 0 && x < this.WIDTH && y >= 0 && y < this.HEIGHT;
};
