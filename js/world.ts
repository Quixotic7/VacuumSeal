
module vs {
    export class World {
        x: number;
        y: number;

        game: Game;

        canvas: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        camera: Camera;

        // children: Sprite[];

        children: LinkedList;
        childrenArray: Sprite[];

        //staticObjects: SpatialHash;
        //// animatedObjects: SpatialHash;
        //// animatedObjects: LinkedList;
        //animatedObjects: SpatialHash;

        gameObjects: SpatialHash;

        map: Dungeon;
        minimap: HTMLCanvasElement;
        minimapTile: number = 4;
        minimapScale: number = 0.7;

        mapX: number = 100;
        mapY: number = 100;
        // mapObjects: number = 25;
        mapFeatures: number = 25;
        itemDensity: number = 25;
        npcDensity: number = 25;
        roomDensity: number = 75;
        corridorDensity: number = 100;

        weaponRatios: ProportionValue[] = [];
        mobRatios: ProportionValue[] = [];

        //// If true mobs will be spawned
        //spawnMobs: bool = true;

        //// If true mobs may be spawned when leaving a room
        //spawnMobsInRooms: bool = true;

        // Determines the type of items to be spawned, if -1 a random assortment of items will be spawned
        itemType: number = -1;


        // This variable effects the possibility of mobs spawning behind you when you leave a room
        roomSpawnChance: number = 10;



        // This determines the radius off the camera that enemies will be updated
        updateRadius: number = 100;


        player: Player;

        
        constructor (game:Game) {
            this.game = game;
            // this.children = [];
            //this.children = new LinkedList();
            //this.childrenArray = [];

            //this.staticObjects = new SpatialHash(32);
            //this.animatedObjects = new SpatialHash(32);
            //this.animatedObjects = new LinkedList();

            this.gameObjects = new SpatialHash(32);


            this.canvas = <HTMLCanvasElement>document.createElement("canvas");
            this.ctx = this.canvas.getContext("2d");
            


            this.player = this.game.player;

            this.camera = new Camera(this.player);
            //this.add(this.player);

            this.map = new Dungeon();
            this.minimap = <HTMLCanvasElement>document.createElement("canvas");
            // this.createMap();
        }

        init() {
            //this.staticObjects.clear();
            //this.animatedObjects.clear();

            this.gameObjects.clear();
            this.createMap();
            this.add(this.player);
        }

        restart() {
            this._regen();
        }


        private _regen() {
            this.gameObjects.clear();
            this.game.lightEngine.reset();
            this.player.reset();
            
            this.createMap();
            this.add(this.player);
        }

        rebuild() {
            this._regen();
            this.player.hp = 100;
        }

        nextlevel() {
            this._regen();
        }

        initMap() {
            this.map.init(this.mapX, this.mapY, this.mapFeatures, this.itemDensity, this.npcDensity, this.roomDensity, this.corridorDensity);
        }

        createMap() {
            // this.map.init(this.mapX, this.mapY, this.mapObjects, this.mapChanceRoom, this.mapChanceCorridor);

            var times = 0;
            this.initMap();
            while (this.checkMap() == false) {
                this.initMap();
                times++;
            }
            console.log("Rebuilt " + times + " times");

            //var startElevator: Point;
            //var endElevator: Point;


            for (var x = 0; x < this.map.xsize; x++) {
                for (var y = 0; y < this.map.ysize; y++) {
                    var type = this.map.getCell(x, y);
                    var xPos = x * Game.TILESIZE;
                    var yPos = y * Game.TILESIZE;
                    
                    if (type == TileType.DIRTWALL) {
                        this.createWall(x,y);
                    } else if (type == TileType.DOWNSTAIRS) {
                        this.movePlayer(xPos, yPos);
                        this.map.setCell(x, y, TileType.DIRTFLOOR);
                        //var floor = new Floor(xPos, yPos, 7);
                        //this.add(floor);
                        var elevator = new Elevator(xPos, yPos, true);
                        this.add(elevator);
                    } else if (type == TileType.UPSTAIRS) {
                        var elevator = new Elevator(xPos, yPos, false);
                        this.add(elevator);
                    } else if (type == TileType.DIRTFLOOR) {
                        var floor = new Floor(xPos, yPos, 6);
                        this.add(floor);
                    } else if (type == TileType.DOOR) {
                        var door = new Floor(xPos, yPos, 7);
                        this.add(door);
                    } else if (type == TileType.CORRIDOR) {
                        var floor = new Floor(xPos, yPos, 6);
                        this.add(floor);
                    } else if (type == TileType.CHEST) {
                        this.createItem(xPos, yPos);
                        this.map.setCell(x, y, TileType.DIRTFLOOR);
                        var floor = new Floor(xPos, yPos, 6);
                        this.add(floor);
                    } else if (type == TileType.NPC) {
                        //var npc = new Mob(xPos, yPos, 0);
                        //this.add(npc);
                        this.createMob(xPos, yPos);
                        this.map.setCell(x, y, TileType.DIRTFLOOR);
                        var floor = new Floor(xPos, yPos, 6);
                        this.add(floor);
                    }
                }
            }

            this.createMinimap();

            var rooms = 0;

            for (var y = 0; y < this.map.ysize; y++) {
                for (var x = 0; x < this.map.xsize; x++) {
                    var cell = this.map.getCell(x, y);
                    if (cell === TileType.DIRTFLOOR) {
                        if (this.createRoom(x, y)) {
                            rooms++;
                        }
                    }
                }
            }

            console.log(rooms + " rooms created.");


            

            //if (!success) {
            //    this.createMap();
            //} else {
            //    this.movePlayer(startElevator.x, startElevator.y);
            //    var elevator = new Elevator(startElevator.x, startElevator.y);
            //    this.add(elevator);

            //    this.createMinimap();
            //}
        }

        createMob(xPos: number, yPos: number) {
           
            var m: NPC;
            var x = xPos + 32;
            var y = yPos + 32;
            //var m = new Mob(x, y, 0);
            // m = new FaceHugger(x, y, 0);


            // m = new Leaper(x, y, 0);

            // m = new Runner(x, y, 0);

            // m = new Creeper(x + 32, y + 32, 0);

            var list = this.mobRatios;
            if (list.length > 0) {
                var mobtype = Random.Choose(list);

                switch (mobtype) {
                    case MobType.CREEPER:
                        m = new Creeper(x, y, 0);
                    break;
                    case MobType.LEAPER:
                        m = new Leaper(x, y, 0);
                    break;
                    case MobType.FACEHUGGER:
                        m = new FaceHugger(x, y, 0);
                    break;
                }
                this.add(m);
            }
        }

        createRoom(x: number, y: number): bool {
            var w = 0;
            var h = 0;
            var i = 0;
            var cell = TileType.DIRTFLOOR;
            while (cell !== TileType.DIRTWALL && cell !== TileType.DOOR && cell !== TileType.CORRIDOR && cell !== TileType.STONEWALL) {
                // this.map.setCell(x + i, y, TileType.UNUSED);
                i++;
                w++;
                cell = this.map.getCell(x + i, y);
            }
            i = 0;
            cell = TileType.DIRTFLOOR;
            while (cell !== TileType.DIRTWALL && cell !== TileType.DOOR && cell !== TileType.CORRIDOR && cell !== TileType.STONEWALL) {
                // this.map.setCell(x, y + i, TileType.UNUSED);
                i++;
                h++;
                cell = this.map.getCell(x, y + i);
            }
            // console.log("w " + w + " h " + h);
            for(var xpos = x; xpos < x + w; xpos++){
                for(var ypos = y; ypos < y + h; ypos++){
                    this.map.setCell(xpos, ypos, TileType.ROOM);
                }
            }


            // this.map.setCell(x, y, TileType.UNUSED);

            var t = Game.TILESIZE;
            var roomcreated = false;
            if (w > 1 && h > 1) {
                // var room = new RoomShape(x * t, y * t, w*t, h *t);
                var room = new Room(x * t, y * t, w * t, h * t, this.game, this.roomSpawnChance);
                this.add(room);
                roomcreated = true;
            }
            return roomcreated;
            
        }

        checkMap() {
            var upstairs: Point, downstairs: Point;
            for (var x = 0; x < this.map.xsize; x++) {
                for (var y = 0; y < this.map.ysize; y++) {
                        var type = this.map.getCell(x, y);
                        if (type == TileType.UPSTAIRS) {
                            upstairs = new Point(x, y);
                        } else if (type == TileType.DOWNSTAIRS) {
                            downstairs = new Point(x, y);
                        }
                        //if (type == TileType.UPSTAIRS || type == TileType.DOWNSTAIRS) {
                        //    if (this.canCreateElevator(x, y) == false) {
                        //        return false;
                        //    }
                        //}
                }
            }
            if (upstairs && downstairs) {
                if (!this.canCreateElevator(upstairs)) return false;
                if (!this.canCreateElevator(downstairs)) return false;
                var t = 64;
                var v = new Vec2((downstairs.x - upstairs.x) * t, (downstairs.y - upstairs.y) * t);
                var d = v.length();
                console.log("Distance = " + d);
                if (d < 800) return false;
                return true;
            }

            return false;
        }

        canCreateElevator(pos:Point) {
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

            if (!N && !S && !W && !E && !NW && !NE && !NE && !SW && !SE) {
                return true;
            }
            return false;
        }

        movePlayer(x:number, y:number) {
            this.gameObjects.remove(this.player);
            this.player.x = x + 32;
            this.player.y = y + 32;
            this.camera.x = this.player.x;
            this.camera.y = this.player.y;
            this.gameObjects.add(this.player);
        }

        createItem(xPos:number, yPos:number) {
            // var item = new Item(xPos, yPos, Math.floor(Math.random() * 4));

            var item = new ItemSprite(xPos, yPos, this.game.itemManager, this.itemType);

            this.add(item);
        }

        createWall(x:number, y:number) {
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

            var type: number = WallType.DEFAULT;

            if ((E && W) && (!N || !S)) type = WallType.HORIZONTAL;
            if ((N && S) && (!E || !W)) type = WallType.VERTICAL;

            if (!W && !NW && !N) type = WallType.CORNER_NW;
            if (!N && !NE && !E) type = WallType.CORNER_NE;
            if (!S && !SW && !W) type = WallType.CORNER_SW;
            if (!E && !SE && !S) type = WallType.CORNER_SE;

            if (S && E && !SE) type = WallType.CORNER_NW;
            if (S && W && !SW ) type = WallType.CORNER_NE;
            if (N && E && !NE) type = WallType.CORNER_SW;
            if (N && W && !NW) type = WallType.CORNER_SE;

            if (!W && !NW && !N && !NE && !E) type = WallType.CAP_N;
            if (!E && !SE && !S && !SE && !W) type = WallType.CAP_S;
            if (!S && !SW && !W && !NW && !N) type = WallType.CAP_W;
            if (!N && !NE && !E && !SE && !S) type = WallType.CAP_E;

            if (!N && !NE && E && SE && S && !SW && !W && !NW) type = WallType.CORNER_NW;
            if (!N && !NE && !E && !SE && S && SW && W && !NW) type = WallType.CORNER_NE;
            if (N && !NE && !E && !SE && !S && !SW && W && NW) type = WallType.CORNER_SE;
            if (N && NE && E && !SE && !S && !SW && !W && !NW) type = WallType.CORNER_SW;

            if ((N && !S && W && E) && (!SW || !SE)) type = WallType.TRI_N;
            if ((!N && S && W && E) && (!NW || !NE)) type = WallType.TRI_S;
            if ((N && S && W && !E) && (!NE || !SE)) type = WallType.TRI_W;
            if ((N && S && !W && E) && (!NW || !SW)) type = WallType.TRI_E;

            //if (N && S && E && NE && SE && !W && !NW && !SW) type = WallType.VERTICAL;
            //if (N && S && W && NW && SW && !E && !NE && !SE) type = WallType.VERTICAL;
            //if (E && W && SE && SW && S && !N && !NE && !NW) type = WallType.HORIZONTAL;
            //if (E && W && NW && N && NE && !S && !SW && !SE) type = WallType.HORIZONTAL;


            if (N && S && W && !E && W && (NW || SW)) type = WallType.TRI_W;

            if (N && S && W && E) type = WallType.CROSS;
            if (!N && !NE && !E && !SE && !S && !SW && !W && !NW) type = WallType.DEFAULT;

            this.add(new Wall(x * Game.TILESIZE, y * Game.TILESIZE, type));
            
        }

        scaleMinimap(n: number) {
            var step = 0.2;
            if (n < 0) {
                this.minimapScale += step;
            } else if (n > 0) {
                this.minimapScale -= step
            }
        }

        drawMinimap(ctx:CanvasRenderingContext2D) {
            var scale = this.minimapScale;
            ctx.drawImage(this.minimap, 0, 0, this.minimap.width, this.minimap.height, 0,0,this.minimap.width * scale,this.minimap.height * scale);
            ctx.fillStyle = "red";
            var tile = this.minimapTile;
            ctx.fillRect(((this.player.x / 64) * tile) * scale, ((this.player.y / 64) * tile) * scale, tile * scale, tile * scale);
        }

        createMinimap() {
            this.minimap.width = this.mapX * this.minimapTile;
            this.minimap.height = this.mapY * this.minimapTile;

            var ctx = this.minimap.getContext("2d");
            ctx.clearRect(0, 0, this.minimap.width, this.minimap.height);

            var tile = this.minimapTile;

            for (var x = 0; x < this.map.xsize; x++) {
                for (var y = 0; y < this.map.ysize; y++) {
                    var type = this.map.getCell(x, y);
                    var color;
                    switch (type) {
                        case TileType.UNUSED:
                            color = Util.rgba(0, 0, 0, 0);
                        break;
                        case TileType.DIRTWALL:
                            color = Util.rgba(106, 90, 205, 1);
                        break;
                        case TileType.DIRTFLOOR:
                            color = Util.rgba(255, 255, 255, 0.5);
                        break;
                        case TileType.DOOR:
                            color = Util.rgba(106, 90, 205, 0.5);
                        break;
                        case TileType.STONEWALL:
                            color = Util.rgba(0, 0, 0, 0);
                        break;
                        case TileType.CORRIDOR:
                            color = Util.rgba(46, 139, 87, 0.5);
                        break;
                        case TileType.CHEST:
                            color = Util.rgba(255, 255, 255, 1);
                        break;
                        case TileType.NPC:
                            color = Util.rgba(0, 255, 0, 1);
                        break;
                        case TileType.UPSTAIRS:
                            color = Util.rgba(255, 165, 0, 1);
                        break;
                        case TileType.DOWNSTAIRS:
                            color = Util.rgba(255, 20, 147, 1);
                        break;
                        default:
                            color = Util.rgba(0, 0, 0, 0);
                        break;
                    }
                    ctx.fillStyle = color;
                    ctx.fillRect(x * tile, y * tile, tile, tile);
                }
            }
        }

        createVeryRandomMap() {
            var n = 50;

            for (var x = 0; x < n; x++) {
                for (var y = 0; y < n; y++) {
                    if (Math.random() > 0.8) {
                        var wall = new Wall(x * Game.TILESIZE, y * Game.TILESIZE, 0);
                        this.add(wall);
                        // wall.addToLightEngine(Game.game.lightEngine);
                    }
                }
            }
        }

        add(obj:GameObject) {
            // this.children.add(obj);
            //if (obj instanceof Wall || obj instanceof Floor) {
            //    this.staticObjects.add(obj);
            //} 
            //else if (obj instanceof Sprite) {
            //    this.animatedObjects.add(obj);
            //    // this.animatedThings.add(obj);
            //}

            this.gameObjects.add(obj);
        }

        // Right now this only works for animated objects
        remove(obj:GameObject) {
            var spr: Sprite;

            if (obj instanceof Sprite) {
                spr = <Sprite>obj;
                spr.remove();
                this.gameObjects.remove(spr);
                //this.animatedObjects.remove(spr);
                obj = null;
            } else {
                console.log("Removing Object from world failed.");
            }
        }

        update(delta: number) {
            //var objs: GameObject[];
            //var walls: Wall[];
            //var wall: Wall[];

            var removeThese: GameObject[] = [];

            var c = this.camera;
            // var animatedObjs: GameObject[] = this.animatedObjects.getArea(c.x, c.y, c.width, c.height);
            var rad = this.updateRadius;

            var objects: GameObject[] = this.gameObjects.getArea(c.x - rad, c.y - rad, c.width + rad, c.height + rad);
            
            // var staticObjs: GameObject[] = this.staticObjects.getArea(c.x, c.y, c.width, c.height);
            // console.log("Animated Objects Updated: " + animatedObjs.length + " StaticObjects Updated: " + staticObjs.length);

            var oldBox: Box, newBox: Box;

            objects.forEach((spr: Sprite) =>{
                if (!spr.exists) {
                    removeThese.push(spr);
                } else if (spr.active) {
                    if (spr.movable) {
                        oldBox = spr.boundingBox;
                    }
                    spr.update(delta);

                    if (spr.enableCollisionDetection) {
                        var others: GameObject[] = this.gameObjects.getClosest(spr);

                        others.forEach((other: Sprite) =>{
                            if (other !== spr && other.exists && other.collidable) {
                                if (this.checkCollision(spr, other)) {
                                    spr.collide(other.affector, other);
                                    other.collide(spr.affector, spr);
                                }
                            }
                        });
                    }

                    // Update it in the spatial hash if it moved
                    if (spr.movable) {
                        newBox = spr.boundingBox;
                        if (oldBox.min.equals(newBox.min) == false || oldBox.max.equals(newBox.max) == false) {
                            this.gameObjects.removeBox(oldBox, spr);
                            this.gameObjects.add(spr);
                        }
                    }
                    
                }
            });

            //animatedObjs.forEach((spr: Sprite) =>{
            //    if (!spr.exists) {
            //        removeThese.push(spr);
            //    } else {
            //        oldBox = spr.boundingBox;
            //        spr.update(delta);
                
            //        var otherObjs: GameObject[] = this.staticObjects.getClosest(spr);
            //        otherObjs = otherObjs.concat(this.animatedObjects.getClosest(spr));

            //        otherObjs.forEach((other: Sprite) =>{
            //            if (other.exists && other.active) {
            //                if (this.checkCollision(spr, other)) {
            //                    other.collide(spr.affector, spr);
            //                    spr.collide(other.affector, other);
            //                } 
            //            }
            //        });
                
            //        newBox = spr.boundingBox;
            //        // See if we need to update the item in the hash table
            //        if (oldBox.min.equals(newBox.min) == false || oldBox.max.equals(newBox.max) == false) {
            //            // console.log("Updating Spatial Hash");
            //            this.animatedObjects.removeBox(oldBox, spr);
            //            this.animatedObjects.add(spr);
            //        }
            //    }
            //});

            removeThese.forEach((obj: GameObject) =>{
                this.remove(obj);
            });

            this.camera.update(delta);
        }

        //updateOld(delta: number) {
        //    var objs: GameObject[];
        //    var walls: Wall[];
        //    var wall: Wall[];

        //    var removeThese: GameObject[] = [];

        //    var c = this.camera;
        //    var animatedObjs: GameObject[] = this.animatedObjects.getArea(c.x, c.y, c.width, c.height);
            
        //    // var staticObjs: GameObject[] = this.staticObjects.getArea(c.x, c.y, c.width, c.height);
        //    // console.log("Animated Objects Updated: " + animatedObjs.length + " StaticObjects Updated: " + staticObjs.length);

        //    var oldBox: Box;
        //    var newBox: Box;

        //    animatedObjs.forEach((spr: Sprite) =>{
        //        if (!spr.exists) {
        //            removeThese.push(spr);
        //        } else {
        //            oldBox = spr.boundingBox;
        //            spr.update(delta);
                
        //            var otherObjs: GameObject[] = this.staticObjects.getClosest(spr);
        //            otherObjs = otherObjs.concat(this.animatedObjects.getClosest(spr));

        //            otherObjs.forEach((other: Sprite) =>{
        //                if (other.exists && other.active) {
        //                    if (this.checkCollision(spr, other)) {
        //                        other.collide(spr.affector, spr);
        //                        spr.collide(other.affector, other);
        //                    } 
        //                }
        //            });
                
        //            newBox = spr.boundingBox;
        //            // See if we need to update the item in the hash table
        //            if (oldBox.min.equals(newBox.min) == false || oldBox.max.equals(newBox.max) == false) {
        //                // console.log("Updating Spatial Hash");
        //                this.animatedObjects.removeBox(oldBox, spr);
        //                this.animatedObjects.add(spr);
        //            }
        //        }
        //    });

        //    removeThese.forEach((obj: GameObject) =>{
        //        this.remove(obj);
        //    });

        //    this.camera.update(delta);
        //}

        checkCollision(a: GameObject, b: GameObject) {
            if (a.boundingRect.intersects(b.boundingRect)) {
                return true;
            }
            return false;
        }

        collisionAtPoint(p: Point):GameObject[] {
            //var a = this.staticObjects.getPointArray(p);
            //var b = this.animatedObjects.getPointArray(p);

            return this.gameObjects.getPointArray(p);

            //var list:LinkedList = this.staticObjects.getPoint(p);
            //if (list == null || list == undefined) list = new LinkedList();
            //var list2: LinkedList = this.animatedObjects.getPoint(p);
            //if (list2 == null || list2 == undefined) list2 = new LinkedList();
            //list = list.concat(list2);
            //return list;
        }

        // Checks for a collision at the point using the given effect type, wall is the default
        // Returns a true if there is a collision
        checkCollisionAtPoint(p:Point, type?:number = EffectType.WALL) : bool {
            var objs = this.collisionAtPoint(p);
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].affector.type == type) {
                    return true;
                }
            }
            return false;
        }

        render(ctx: CanvasRenderingContext2D, width: number, height: number) {
            this.clear(ctx, this.game.canvas.width, this.game.canvas.height);

            var c = this.camera;
            var b = c.bounds;

            var visibleObjects:GameObject[] = this.gameObjects.getArea(b.x, b.y, b.width, b.height);
            // visibleObjects = visibleObjects.concat(this.animatedObjects.getArea(b.x, b.y, b.width, b.height));
            // console.log("Visible Objects Rendered: " + visibleObjects.length);

            // visibleObjects.sort(World.zCompare);

            visibleObjects.sort(World.zCompare);

            visibleObjects.forEach((spr: Sprite) =>{
                this.drawSprite(ctx, spr);
            });
        }

        drawSprite(ctx:CanvasRenderingContext2D, spr:Sprite) {
            var cam = this.camera;
            if (spr.visible) {
                ctx.save();
                
                var xOff = (this.game.width * 0.5) - ((cam.width * cam.scale) * 0.5);
                var yOff = (this.game.height * 0.5) - ((cam.height * cam.scale) * 0.5);

                ctx.setTransform(1, 0, 0, 1, xOff - (cam.x * cam.scale), yOff -(cam.y * cam.scale));
                // ctx.rotate(Util.degToRad(45));
                ctx.scale(cam.scale, cam.scale);
                spr.render(ctx);
                ctx.restore();
            }
        }

        static zCompare(a: GameObject, b: GameObject) {
            if (a.zIndex < b.zIndex) return -1;
            else if (a.zIndex > b.zIndex) return 1;
            return 0;
        }

        clear(ctx: CanvasRenderingContext2D, width: number, height: number) {
            ctx.clearRect(0, 0, width, height);
        }
    }
}