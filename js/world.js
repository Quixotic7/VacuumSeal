var vs;
(function (vs) {
    var World = (function () {
        function World(game) {
            this.minimapTile = 4;
            this.minimapScale = 0.7;
            this.mapX = 100;
            this.mapY = 100;
            this.mapFeatures = 25;
            this.itemDensity = 25;
            this.npcDensity = 25;
            this.roomDensity = 75;
            this.corridorDensity = 100;
            this.weaponRatios = [];
            this.mobRatios = [];
            this.itemType = -1;
            this.roomSpawnChance = 10;
            this.updateRadius = 100;
            this.game = game;
            this.gameObjects = new vs.SpatialHash(32);
            this.canvas = document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            this.player = this.game.player;
            this.camera = new vs.Camera(this.player);
            this.map = new Dungeon();
            this.minimap = document.createElement("canvas");
        }
        World.prototype.init = function () {
            this.gameObjects.clear();
            this.createMap();
            this.add(this.player);
        };
        World.prototype.restart = function () {
            this._regen();
        };
        World.prototype._regen = function () {
            this.gameObjects.clear();
            this.game.lightEngine.reset();
            this.player.reset();
            this.createMap();
            this.add(this.player);
        };
        World.prototype.rebuild = function () {
            this._regen();
            this.player.hp = 100;
        };
        World.prototype.nextlevel = function () {
            this._regen();
        };
        World.prototype.initMap = function () {
            this.map.init(this.mapX, this.mapY, this.mapFeatures, this.itemDensity, this.npcDensity, this.roomDensity, this.corridorDensity);
        };
        World.prototype.createMap = function () {
            var times = 0;
            this.initMap();
            while(this.checkMap() == false) {
                this.initMap();
                times++;
            }
            console.log("Rebuilt " + times + " times");
            for(var x = 0; x < this.map.xsize; x++) {
                for(var y = 0; y < this.map.ysize; y++) {
                    var type = this.map.getCell(x, y);
                    var xPos = x * vs.Game.TILESIZE;
                    var yPos = y * vs.Game.TILESIZE;
                    if(type == TileType.DIRTWALL) {
                        this.createWall(x, y);
                    } else {
                        if(type == TileType.DOWNSTAIRS) {
                            this.movePlayer(xPos, yPos);
                            this.map.setCell(x, y, TileType.DIRTFLOOR);
                            var elevator = new vs.Elevator(xPos, yPos, true);
                            this.add(elevator);
                        } else {
                            if(type == TileType.UPSTAIRS) {
                                var elevator = new vs.Elevator(xPos, yPos, false);
                                this.add(elevator);
                            } else {
                                if(type == TileType.DIRTFLOOR) {
                                    var floor = new vs.Floor(xPos, yPos, 6);
                                    this.add(floor);
                                } else {
                                    if(type == TileType.DOOR) {
                                        var door = new vs.Floor(xPos, yPos, 7);
                                        this.add(door);
                                    } else {
                                        if(type == TileType.CORRIDOR) {
                                            var floor = new vs.Floor(xPos, yPos, 6);
                                            this.add(floor);
                                        } else {
                                            if(type == TileType.CHEST) {
                                                this.createItem(xPos, yPos);
                                                this.map.setCell(x, y, TileType.DIRTFLOOR);
                                                var floor = new vs.Floor(xPos, yPos, 6);
                                                this.add(floor);
                                            } else {
                                                if(type == TileType.NPC) {
                                                    this.createMob(xPos, yPos);
                                                    this.map.setCell(x, y, TileType.DIRTFLOOR);
                                                    var floor = new vs.Floor(xPos, yPos, 6);
                                                    this.add(floor);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            this.createMinimap();
            var rooms = 0;
            for(var y = 0; y < this.map.ysize; y++) {
                for(var x = 0; x < this.map.xsize; x++) {
                    var cell = this.map.getCell(x, y);
                    if(cell === TileType.DIRTFLOOR) {
                        if(this.createRoom(x, y)) {
                            rooms++;
                        }
                    }
                }
            }
            console.log(rooms + " rooms created.");
        };
        World.prototype.createMob = function (xPos, yPos) {
            var m;
            var x = xPos + 32;
            var y = yPos + 32;
            var list = this.mobRatios;
            if(list.length > 0) {
                var mobtype = vs.Random.Choose(list);
                switch(mobtype) {
                    case vs.MobType.CREEPER: {
                        m = new vs.Creeper(x, y, 0);
                        break;

                    }
                    case vs.MobType.LEAPER: {
                        m = new vs.Leaper(x, y, 0);
                        break;

                    }
                    case vs.MobType.FACEHUGGER: {
                        m = new vs.FaceHugger(x, y, 0);
                        break;

                    }
                }
                this.add(m);
            }
        };
        World.prototype.createRoom = function (x, y) {
            var w = 0;
            var h = 0;
            var i = 0;
            var cell = TileType.DIRTFLOOR;
            while(cell !== TileType.DIRTWALL && cell !== TileType.DOOR && cell !== TileType.CORRIDOR && cell !== TileType.STONEWALL) {
                i++;
                w++;
                cell = this.map.getCell(x + i, y);
            }
            i = 0;
            cell = TileType.DIRTFLOOR;
            while(cell !== TileType.DIRTWALL && cell !== TileType.DOOR && cell !== TileType.CORRIDOR && cell !== TileType.STONEWALL) {
                i++;
                h++;
                cell = this.map.getCell(x, y + i);
            }
            for(var xpos = x; xpos < x + w; xpos++) {
                for(var ypos = y; ypos < y + h; ypos++) {
                    this.map.setCell(xpos, ypos, TileType.ROOM);
                }
            }
            var t = vs.Game.TILESIZE;
            var roomcreated = false;
            if(w > 1 && h > 1) {
                var room = new vs.Room(x * t, y * t, w * t, h * t, this.game, this.roomSpawnChance);
                this.add(room);
                roomcreated = true;
            }
            return roomcreated;
        };
        World.prototype.checkMap = function () {
            var upstairs, downstairs;
            for(var x = 0; x < this.map.xsize; x++) {
                for(var y = 0; y < this.map.ysize; y++) {
                    var type = this.map.getCell(x, y);
                    if(type == TileType.UPSTAIRS) {
                        upstairs = new vs.Point(x, y);
                    } else {
                        if(type == TileType.DOWNSTAIRS) {
                            downstairs = new vs.Point(x, y);
                        }
                    }
                }
            }
            if(upstairs && downstairs) {
                if(!this.canCreateElevator(upstairs)) {
                    return false;
                }
                if(!this.canCreateElevator(downstairs)) {
                    return false;
                }
                var t = 64;
                var v = new vs.Vec2((downstairs.x - upstairs.x) * t, (downstairs.y - upstairs.y) * t);
                var d = v.length();
                console.log("Distance = " + d);
                if(d < 800) {
                    return false;
                }
                return true;
            }
            return false;
        };
        World.prototype.canCreateElevator = function (pos) {
            var x = pos.x;
            var y = pos.y;
            var map = this.map;
            var wall = TileType.DIRTWALL;
            var door = TileType.DOOR;
            var upstairs = TileType.UPSTAIRS;
            var downstairs = TileType.DOWNSTAIRS;
            var NT = map.getCell(x, y - 1);
            var ST = map.getCell(x, y + 1);
            var WT = map.getCell(x - 1, y);
            var ET = map.getCell(x + 1, y);
            var NWT = map.getCell(x - 1, y - 1);
            var NET = map.getCell(x + 1, y - 1);
            var SWT = map.getCell(x - 1, y + 1);
            var SET = map.getCell(x + 1, y + 1);
            var N = NT == wall || NT == door || NT == downstairs || NT == upstairs;
            var S = ST == wall || ST == door || ST == downstairs || ST == upstairs;
            var W = WT == wall || WT == door || WT == downstairs || WT == upstairs;
            var E = ET == wall || ET == door || ET == downstairs || ET == upstairs;
            var NW = NWT == wall || NWT == door || NWT == downstairs || NWT == upstairs;
            var NE = NET == wall || NET == door || NET == downstairs || NET == upstairs;
            var SW = SWT == wall || SWT == door || SWT == downstairs || SWT == upstairs;
            var SE = SET == wall || SET == door || SET == downstairs || SET == upstairs;
            if(!N && !S && !W && !E && !NW && !NE && !NE && !SW && !SE) {
                return true;
            }
            return false;
        };
        World.prototype.movePlayer = function (x, y) {
            this.gameObjects.remove(this.player);
            this.player.x = x + 32;
            this.player.y = y + 32;
            this.camera.x = this.player.x;
            this.camera.y = this.player.y;
            this.gameObjects.add(this.player);
        };
        World.prototype.createItem = function (xPos, yPos) {
            var item = new vs.ItemSprite(xPos, yPos, this.game.itemManager, this.itemType);
            this.add(item);
        };
        World.prototype.createWall = function (x, y) {
            var map = this.map;
            var wall = TileType.DIRTWALL;
            var N = (map.getCell(x, y - 1) == wall);
            var S = (map.getCell(x, y + 1) == wall);
            var W = (map.getCell(x - 1, y) == wall);
            var E = (map.getCell(x + 1, y) == wall);
            var NW = (map.getCell(x - 1, y - 1) == wall);
            var NE = (map.getCell(x + 1, y - 1) == wall);
            var SW = (map.getCell(x - 1, y + 1) == wall);
            var SE = (map.getCell(x + 1, y + 1) == wall);
            var type = vs.WallType.DEFAULT;
            if((E && W) && (!N || !S)) {
                type = vs.WallType.HORIZONTAL;
            }
            if((N && S) && (!E || !W)) {
                type = vs.WallType.VERTICAL;
            }
            if(!W && !NW && !N) {
                type = vs.WallType.CORNER_NW;
            }
            if(!N && !NE && !E) {
                type = vs.WallType.CORNER_NE;
            }
            if(!S && !SW && !W) {
                type = vs.WallType.CORNER_SW;
            }
            if(!E && !SE && !S) {
                type = vs.WallType.CORNER_SE;
            }
            if(S && E && !SE) {
                type = vs.WallType.CORNER_NW;
            }
            if(S && W && !SW) {
                type = vs.WallType.CORNER_NE;
            }
            if(N && E && !NE) {
                type = vs.WallType.CORNER_SW;
            }
            if(N && W && !NW) {
                type = vs.WallType.CORNER_SE;
            }
            if(!W && !NW && !N && !NE && !E) {
                type = vs.WallType.CAP_N;
            }
            if(!E && !SE && !S && !SE && !W) {
                type = vs.WallType.CAP_S;
            }
            if(!S && !SW && !W && !NW && !N) {
                type = vs.WallType.CAP_W;
            }
            if(!N && !NE && !E && !SE && !S) {
                type = vs.WallType.CAP_E;
            }
            if(!N && !NE && E && SE && S && !SW && !W && !NW) {
                type = vs.WallType.CORNER_NW;
            }
            if(!N && !NE && !E && !SE && S && SW && W && !NW) {
                type = vs.WallType.CORNER_NE;
            }
            if(N && !NE && !E && !SE && !S && !SW && W && NW) {
                type = vs.WallType.CORNER_SE;
            }
            if(N && NE && E && !SE && !S && !SW && !W && !NW) {
                type = vs.WallType.CORNER_SW;
            }
            if((N && !S && W && E) && (!SW || !SE)) {
                type = vs.WallType.TRI_N;
            }
            if((!N && S && W && E) && (!NW || !NE)) {
                type = vs.WallType.TRI_S;
            }
            if((N && S && W && !E) && (!NE || !SE)) {
                type = vs.WallType.TRI_W;
            }
            if((N && S && !W && E) && (!NW || !SW)) {
                type = vs.WallType.TRI_E;
            }
            if(N && S && W && !E && W && (NW || SW)) {
                type = vs.WallType.TRI_W;
            }
            if(N && S && W && E) {
                type = vs.WallType.CROSS;
            }
            if(!N && !NE && !E && !SE && !S && !SW && !W && !NW) {
                type = vs.WallType.DEFAULT;
            }
            this.add(new vs.Wall(x * vs.Game.TILESIZE, y * vs.Game.TILESIZE, type));
        };
        World.prototype.scaleMinimap = function (n) {
            var step = 0.2;
            if(n < 0) {
                this.minimapScale += step;
            } else {
                if(n > 0) {
                    this.minimapScale -= step;
                }
            }
        };
        World.prototype.drawMinimap = function (ctx) {
            var scale = this.minimapScale;
            ctx.drawImage(this.minimap, 0, 0, this.minimap.width, this.minimap.height, 0, 0, this.minimap.width * scale, this.minimap.height * scale);
            ctx.fillStyle = "red";
            var tile = this.minimapTile;
            ctx.fillRect(((this.player.x / 64) * tile) * scale, ((this.player.y / 64) * tile) * scale, tile * scale, tile * scale);
        };
        World.prototype.createMinimap = function () {
            this.minimap.width = this.mapX * this.minimapTile;
            this.minimap.height = this.mapY * this.minimapTile;
            var ctx = this.minimap.getContext("2d");
            ctx.clearRect(0, 0, this.minimap.width, this.minimap.height);
            var tile = this.minimapTile;
            for(var x = 0; x < this.map.xsize; x++) {
                for(var y = 0; y < this.map.ysize; y++) {
                    var type = this.map.getCell(x, y);
                    var color;
                    switch(type) {
                        case TileType.UNUSED: {
                            color = vs.Util.rgba(0, 0, 0, 0);
                            break;

                        }
                        case TileType.DIRTWALL: {
                            color = vs.Util.rgba(106, 90, 205, 1);
                            break;

                        }
                        case TileType.DIRTFLOOR: {
                            color = vs.Util.rgba(255, 255, 255, 0.5);
                            break;

                        }
                        case TileType.DOOR: {
                            color = vs.Util.rgba(106, 90, 205, 0.5);
                            break;

                        }
                        case TileType.STONEWALL: {
                            color = vs.Util.rgba(0, 0, 0, 0);
                            break;

                        }
                        case TileType.CORRIDOR: {
                            color = vs.Util.rgba(46, 139, 87, 0.5);
                            break;

                        }
                        case TileType.CHEST: {
                            color = vs.Util.rgba(255, 255, 255, 1);
                            break;

                        }
                        case TileType.NPC: {
                            color = vs.Util.rgba(0, 255, 0, 1);
                            break;

                        }
                        case TileType.UPSTAIRS: {
                            color = vs.Util.rgba(255, 165, 0, 1);
                            break;

                        }
                        case TileType.DOWNSTAIRS: {
                            color = vs.Util.rgba(255, 20, 147, 1);
                            break;

                        }
                        default: {
                            color = vs.Util.rgba(0, 0, 0, 0);
                            break;

                        }
                    }
                    ctx.fillStyle = color;
                    ctx.fillRect(x * tile, y * tile, tile, tile);
                }
            }
        };
        World.prototype.createVeryRandomMap = function () {
            var n = 50;
            for(var x = 0; x < n; x++) {
                for(var y = 0; y < n; y++) {
                    if(Math.random() > 0.8) {
                        var wall = new vs.Wall(x * vs.Game.TILESIZE, y * vs.Game.TILESIZE, 0);
                        this.add(wall);
                    }
                }
            }
        };
        World.prototype.add = function (obj) {
            this.gameObjects.add(obj);
        };
        World.prototype.remove = function (obj) {
            var spr;
            if(obj instanceof vs.Sprite) {
                spr = obj;
                spr.remove();
                this.gameObjects.remove(spr);
                obj = null;
            } else {
                console.log("Removing Object from world failed.");
            }
        };
        World.prototype.update = function (delta) {
            var _this = this;
            var removeThese = [];
            var c = this.camera;
            var rad = this.updateRadius;
            var objects = this.gameObjects.getArea(c.x - rad, c.y - rad, c.width + rad, c.height + rad);
            var oldBox, newBox;
            objects.forEach(function (spr) {
                if(!spr.exists) {
                    removeThese.push(spr);
                } else {
                    if(spr.active) {
                        if(spr.movable) {
                            oldBox = spr.boundingBox;
                        }
                        spr.update(delta);
                        if(spr.enableCollisionDetection) {
                            var others = _this.gameObjects.getClosest(spr);
                            others.forEach(function (other) {
                                if(other !== spr && other.exists && other.collidable) {
                                    if(_this.checkCollision(spr, other)) {
                                        spr.collide(other.affector, other);
                                        other.collide(spr.affector, spr);
                                    }
                                }
                            });
                        }
                        if(spr.movable) {
                            newBox = spr.boundingBox;
                            if(oldBox.min.equals(newBox.min) == false || oldBox.max.equals(newBox.max) == false) {
                                _this.gameObjects.removeBox(oldBox, spr);
                                _this.gameObjects.add(spr);
                            }
                        }
                    }
                }
            });
            removeThese.forEach(function (obj) {
                _this.remove(obj);
            });
            this.camera.update(delta);
        };
        World.prototype.checkCollision = function (a, b) {
            if(a.boundingRect.intersects(b.boundingRect)) {
                return true;
            }
            return false;
        };
        World.prototype.collisionAtPoint = function (p) {
            return this.gameObjects.getPointArray(p);
        };
        World.prototype.checkCollisionAtPoint = function (p, type) {
            if (typeof type === "undefined") { type = vs.EffectType.WALL; }
            var objs = this.collisionAtPoint(p);
            for(var i = 0; i < objs.length; i++) {
                if(objs[i].affector.type == type) {
                    return true;
                }
            }
            return false;
        };
        World.prototype.render = function (ctx, width, height) {
            var _this = this;
            this.clear(ctx, this.game.canvas.width, this.game.canvas.height);
            var c = this.camera;
            var b = c.bounds;
            var visibleObjects = this.gameObjects.getArea(b.x, b.y, b.width, b.height);
            visibleObjects.sort(World.zCompare);
            visibleObjects.forEach(function (spr) {
                _this.drawSprite(ctx, spr);
            });
        };
        World.prototype.drawSprite = function (ctx, spr) {
            var cam = this.camera;
            if(spr.visible) {
                ctx.save();
                var xOff = (this.game.width * 0.5) - ((cam.width * cam.scale) * 0.5);
                var yOff = (this.game.height * 0.5) - ((cam.height * cam.scale) * 0.5);
                ctx.setTransform(1, 0, 0, 1, xOff - (cam.x * cam.scale), yOff - (cam.y * cam.scale));
                ctx.scale(cam.scale, cam.scale);
                spr.render(ctx);
                ctx.restore();
            }
        };
        World.zCompare = function zCompare(a, b) {
            if(a.zIndex < b.zIndex) {
                return -1;
            } else {
                if(a.zIndex > b.zIndex) {
                    return 1;
                }
            }
            return 0;
        }
        World.prototype.clear = function (ctx, width, height) {
            ctx.clearRect(0, 0, width, height);
        };
        return World;
    })();
    vs.World = World;    
})(vs || (vs = {}));
