function Game() {
  // Константы игры
  this.WIDTH = 40;
  this.HEIGHT = 24;
  this.TILE_SIZE = 25;

  // Типы клеток
  this.TILE_TYPES = {
    WALL: "W",
    FLOOR: " ",
    PLAYER: "P",
    ENEMY: "E",
    HEALTH_POTION: "HP",
    SWORD: "SW",
  };

  // Состояние игры
  this.map = [];
  this.player = {};
  this.enemies = [];
  this.items = [];

  // Настройки генерации
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
  this.fillMapWithWalls();

  this.generateRooms();

  this.generatePassages();

  console.log("Карта сгенерирована:");
  console.log("Комнат: " + this.countRooms());
  console.log("Связных областей: " + this.countConnectedAreas());
};

Game.prototype.fillMapWithWalls = function () {
  this.map = [];
  for (let y = 0; y < this.HEIGHT; y++) {
    let row = [];
    for (let x = 0; x < this.WIDTH; x++) {
      row.push(this.TILE_TYPES.WALL);
    }
    this.map.push(row);
  }
};

Game.prototype.generateRooms = function () {
  const roomsCount = this.getRandomInt(
    this.settings.rooms.min,
    this.settings.rooms.max
  );
  let roomsPlaced = 0;
  let attempts = 0;
  const maxAttempts = 100;

  while (roomsPlaced < roomsCount && attempts < maxAttempts) {
    attempts++;
    if (this.generateRoom()) {
      roomsPlaced++;
    }
  }
};

Game.prototype.generateRoom = function () {
  const width = this.getRandomInt(
    this.settings.roomSize.min,
    this.settings.roomSize.max
  );
  const height = this.getRandomInt(
    this.settings.roomSize.min,
    this.settings.roomSize.max
  );

  const maxX = this.WIDTH - width - 1;
  const maxY = this.HEIGHT - height - 1;

  const x = this.getRandomInt(1, maxX);
  const y = this.getRandomInt(1, maxY);

  let canPlace = true;
  for (let dy = y; dy < y + height; dy++) {
    for (let dx = x; dx < x + width; dx++) {
      if (this.map[dy][dx] === this.TILE_TYPES.FLOOR) {
        canPlace = false;
        break;
      }
    }
    if (!canPlace) break;
  }

  if (canPlace) {
    for (let dy = y; dy < y + height; dy++) {
      for (let dx = x; dx < x + width; dx++) {
        this.map[dy][dx] = this.TILE_TYPES.FLOOR;
      }
    }
    return true;
  }
  return false;
};

Game.prototype.generatePassages = function () {
  // горизонтальные
  const horPassages = this.getRandomInt(
    this.settings.passages.horizontal.min,
    this.settings.passages.horizontal.max
  );

  for (let i = 0; i < horPassages; i++) {
    const y = this.getRandomInt(1, this.HEIGHT - 2);
    for (let x = 0; x < this.WIDTH; x++) {
      this.map[y][x] = this.TILE_TYPES.FLOOR;
    }
  }

  // вертикальные
  const vertPassages = this.getRandomInt(
    this.settings.passages.vertical.min,
    this.settings.passages.vertical.max
  );

  for (let i = 0; i < vertPassages; i++) {
    const x = this.getRandomInt(1, this.WIDTH - 2);
    for (let y = 0; y < this.HEIGHT; y++) {
      this.map[y][x] = this.TILE_TYPES.FLOOR;
    }
  }
};

Game.prototype.render = function () {
  $(".field").empty();

  for (let y = 0; y < this.HEIGHT; y++) {
    for (let x = 0; x < this.WIDTH; x++) {
      const tileType = this.map[y][x];
      const tileClass = tileType === this.TILE_TYPES.WALL ? "tileW" : "tile";

      const $tile = $("<div>")
        .addClass("tile " + tileClass)
        .css({
          left: x * this.TILE_SIZE,
          top: y * this.TILE_SIZE,
        });

      $(".field").append($tile);
    }
  }
};

Game.prototype.bindEvents = function () {
  //
};

Game.prototype.getRandomInt = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

Game.prototype.isValidPosition = function (x, y) {
  return x >= 0 && x < this.WIDTH && y >= 0 && y < this.HEIGHT;
};

Game.prototype.isFloor = function (x, y) {
  if (!this.isValidPosition(x, y)) return false;
  return this.map[y][x] === this.TILE_TYPES.FLOOR;
};

Game.prototype.countRooms = function () {
  let count = 0;
  for (let y = 0; y < this.HEIGHT; y++) {
    for (let x = 0; x < this.WIDTH; x++) {
      if (this.isRoomTile(x, y)) count++;
    }
  }
  return count;
};

Game.prototype.isRoomTile = function (x, y) {
  if (!this.isFloor(x, y)) return false;

  const isHorPassage =
    y > 0 && this.isFloor(x, y - 1) && this.isFloor(x, y + 1);
  const isVertPassage =
    x > 0 && this.isFloor(x - 1, y) && this.isFloor(x + 1, y);

  return !isHorPassage && !isVertPassage;
};

Game.prototype.countConnectedAreas = function () {
  const visited = Array(this.HEIGHT)
    .fill()
    .map(() => Array(this.WIDTH).fill(false));
  let areas = 0;

  for (let y = 0; y < this.HEIGHT; y++) {
    for (let x = 0; x < this.WIDTH; x++) {
      if (this.isFloor(x, y) && !visited[y][x]) {
        areas++;
        this.floodFill(x, y, visited);
      }
    }
  }

  return areas;
};

Game.prototype.floodFill = function (x, y, visited) {
  const stack = [[x, y]];

  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    if (!this.isValidPosition(cx, cy)) continue;
    if (!this.isFloor(cx, cy)) continue;
    if (visited[cy][cx]) continue;

    visited[cy][cx] = true;

    stack.push([cx + 1, cy]);
    stack.push([cx - 1, cy]);
    stack.push([cx, cy + 1]);
    stack.push([cx, cy - 1]);
  }
};

$(document).ready(function () {
  var game = new Game();
  game.init();
});
