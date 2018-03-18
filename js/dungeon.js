var Dungeon = (function () {
    function Dungeon(xmax, ymax, xsize, ysize, objects,items, npc, chanceRoom, chanceCorridor, dungeon_map, oldseed) {
        this.xmax = xmax;
        this.ymax = ymax;
        this.xsize = xsize;
        this.ysize = ysize;
        this.objects = objects;
        this.npc = npc;
        this.items = items;
        this.chanceRoom = chanceRoom;
        this.chanceCorridor = chanceCorridor;
        this.dungeon_map = dungeon_map;
        this.oldseed = oldseed;
        this.TileEnum = {
            unused: 0,
            dirtWall: 1,
            dirtFloor: 2,
            stoneWall: 3,
            corridor: 4,
            door: 5,
            upStairs: 6,
            downStairs: 7,
            chest: 8,
            npc: 9,
        };
    }
    Dungeon.prototype.setCell = function (x, y, cellType) {
        var set;
        var rx = Math.round(x);
        var ry = Math.round(y);
        set = rx + this.xsize * ry;
        this.dungeon_map[set] = cellType;
    };
    Dungeon.prototype.getCell = function (x, y) {
        var output;
        var rx = Math.round(x);
        var ry = Math.round(y);
        output = this.dungeon_map[rx + this.xsize * ry];
        if (output == undefined) {
            alert("get fail");
        }
        return output;
    };
    Dungeon.prototype.getRand = function (min, max) {
        var output;
        output = (Math.random() * (max - min+1)) + min;
        output = Math.floor(output);
        return output;
    };
    Dungeon.prototype.makeCorridor = function (x, y, lenght, direction) {
        var len = this.getRand(2, lenght);
        var floor = this.TileEnum.corridor;
        var wall = this.TileEnum.dirtWall;
        var dir = 0;
        if (direction > 0 && direction < 4) {
            dir = direction;
        }
        var xtemp = 0;
        var ytemp = 0;
        switch (dir) {
            case 0: {
                if (x < 0 || x > this.xsize) {
                    return false;
                } else {
                    xtemp = x;
                }
                for (ytemp = y; ytemp > (y - len) ; ytemp--) {
                    if (ytemp < 0 || ytemp > this.ysize) {
                        return false;
                    }
                    if (this.getCell(xtemp, ytemp) != this.TileEnum.unused) {
                        return false;
                    }
                }
                for (ytemp = y; ytemp > (y - len) ; ytemp--) {
                    this.setCell(xtemp, ytemp, floor);
                    this.setCell(xtemp-1, ytemp, wall );
                    this.setCell(xtemp + 1, ytemp, wall);
                    if (ytemp > (y - len)) {
                            this.setCell(xtemp, ytemp-1, wall);
                            this.setCell(xtemp-1, ytemp-1, wall );
                            this.setCell(xtemp + 1, ytemp-1, wall);
                        }
                }
                break;
            }

            case 1: {
                if (y < 0 || y > this.ysize) {
                    return false;
                } else {
                    ytemp = y;
                }
                for (xtemp = x; xtemp < (x + len) ; xtemp++) {
                    if (xtemp < 0 || xtemp > this.xsize) {
                        return false;
                    }
                    if (this.getCell(xtemp, ytemp) != this.TileEnum.unused) {
                        return false;
                    }
                }
                for (xtemp = x; xtemp < (x + len) ; xtemp++) {
                    this.setCell(xtemp, ytemp, floor);
                    this.setCell(xtemp, ytemp - 1, wall);
                    this.setCell(xtemp, ytemp + 1, wall);
                    if (xtemp < (x + len)) {
                        this.setCell(xtemp+1, ytemp + 1, wall);
                        this.setCell(xtemp + 1, ytemp, wall);
                        this.setCell(xtemp + 1, ytemp - 1, wall);
                    }
                }
                break;
            }

            case 2: {
                if (x < 0 || x > this.xsize) {
                    return false;
                } else {
                    xtemp = x;
                }
                for (ytemp = y; ytemp < (y + len) ; ytemp++) {
                    if (ytemp < 0 || ytemp > this.ysize) {
                        return false;
                    }
                    if (this.getCell(xtemp, ytemp) != this.TileEnum.unused) {
                        return false;
                    }
                }
                for (ytemp = y; ytemp < (y + len) ; ytemp++) {
                    this.setCell(xtemp, ytemp, floor);
                    this.setCell(xtemp - 1, ytemp, wall);
                    this.setCell(xtemp + 1, ytemp, wall);
                    if (ytemp < (y + len)) {
                        this.setCell(xtemp, ytemp + 1, wall);
                        this.setCell(xtemp - 1, ytemp + 1, wall);
                        this.setCell(xtemp + 1, ytemp + 1, wall);
                    }

                }
                break;
            }

            case 3: {
                if (ytemp < 0 || ytemp > this.ysize) {
                    return false;
                } else {
                    ytemp = y;
                }
                for (xtemp = x; xtemp > (x - len) ; xtemp--) {
                    if (xtemp < 0 || xtemp > this.xsize) {
                        return false;
                    }
                    if (this.getCell(xtemp, ytemp) != this.TileEnum.unused) {
                        return false;
                    }
                }
                for (xtemp = x; xtemp > (x - len) ; xtemp--) {
                    this.setCell(xtemp, ytemp, floor);
                    this.setCell(xtemp, ytemp-1, wall);
                    this.setCell(xtemp, ytemp + 1, wall);
                    if (xtemp > (x - len)) {
                        this.setCell(xtemp - 1, ytemp + 1, wall);
                        this.setCell(xtemp - 1, ytemp, wall);
                        this.setCell(xtemp - 1, ytemp - 1, wall);
                    }
                }
                break;
            }

        }
        return true;
    };
    Dungeon.prototype.makeRoom = function (x, y, xlength, ylength, direction) {
        var xlen = this.getRand(4, xlength);
        var ylen = this.getRand(4, ylength);
        var floor = this.TileEnum.dirtFloor;
        var wall = this.TileEnum.dirtWall;
        var dir = 0;
        if (direction > 0 && direction < 4) {
            dir = direction;
        }
        switch (dir) {
            case 0: {
                for (var ytemp = y; ytemp > (y - ylen) ; ytemp--) {
                    if (ytemp < 0 || ytemp > this.ysize) {
                        return false;
                    }
                    for (var xtemp = Math.round(x - xlen / 2) ; xtemp < Math.round(x + (xlen + 1) / 2) ; xtemp++) {
                        if (xtemp < 0 || xtemp > this.xsize) {
                            return false;
                        }
                        if (this.getCell(xtemp, ytemp) != this.TileEnum.unused) {
                            return false;
                        }
                    }
                }
                for (var ytemp = y; ytemp > (y - ylen) ; ytemp--) {
                    for (var xtemp = Math.round(x - xlen / 2) ; xtemp < Math.round(x + (xlen + 1) / 2) ; xtemp++) {
                        if (xtemp == Math.round(x - xlen / 2)) {
                            this.setCell(xtemp, ytemp, wall);
                        } else {
                            if (xtemp == Math.round(x + (xlen - 1) / 2)) {
                                this.setCell(xtemp, ytemp, wall);
                            } else {
                                if (ytemp == y) {
                                    this.setCell(xtemp, ytemp, wall);
                                } else {
                                    if (ytemp == (y - ylen + 1)) {
                                        this.setCell(xtemp, ytemp, wall);
                                    } else {
                                        this.setCell(xtemp, ytemp, floor);
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            }
            case 1: {
                for (var ytemp = Math.round(y - ylen / 2) ; ytemp < Math.round(y + (ylen + 1) / 2) ; ytemp++) {
                    if (ytemp < 0 || ytemp > this.ysize) {
                        return false;
                    }
                    for (var xtemp = x; xtemp < (x + xlen) ; xtemp++) {
                        if (xtemp < 0 || xtemp > this.xsize) {
                            return false;
                        }
                        if (this.getCell(xtemp, ytemp) != this.TileEnum.unused) {
                            return false;
                        }
                    }
                }
                for (var ytemp = Math.round(y - ylen / 2) ; ytemp < Math.round(y + (ylen + 1) / 2) ; ytemp++) {
                    for (var xtemp = x; xtemp < (x + xlen) ; xtemp++) {
                        if (xtemp == x) {
                            this.setCell(xtemp, ytemp, wall);
                        } else {
                            if (xtemp == (x + xlen - 1)) {
                                this.setCell(xtemp, ytemp, wall);
                            } else {
                                if (ytemp == Math.round(y - ylen / 2)) {
                                    this.setCell(xtemp, ytemp, wall);
                                } else {
                                    if (ytemp == Math.round(y + (ylen - 1) / 2)) {
                                        this.setCell(xtemp, ytemp, wall);
                                    } else {
                                        this.setCell(xtemp, ytemp, floor);
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            }
            case 2: {
                for (var ytemp = y; ytemp < (y + ylen) ; ytemp++) {
                    if (ytemp < 0 || ytemp > this.ysize) {
                        return false;
                    }
                    for (var xtemp = Math.round(x - xlen / 2) ; xtemp < Math.round(x + (xlen + 1) / 2) ; xtemp++) {
                        if (xtemp < 0 || xtemp > this.xsize) {
                            return false;
                        }
                        if (this.getCell(xtemp, ytemp) != this.TileEnum.unused) {
                            return false;
                        }
                    }
                }
                for (var ytemp = y; ytemp < (y + ylen) ; ytemp++) {
                    for (var xtemp = Math.round(x - xlen / 2) ; xtemp < Math.round(x + (xlen + 1) / 2) ; xtemp++) {
                        if (xtemp == Math.round(x - xlen / 2)) {
                            this.setCell(xtemp, ytemp, wall);
                        } else {
                            if (xtemp == Math.round(x + (xlen - 1) / 2)) {
                                this.setCell(xtemp, ytemp, wall);
                            } else {
                                if (ytemp == y) {
                                    this.setCell(xtemp, ytemp, wall);
                                } else {
                                    if (ytemp == (y + ylen - 1)) {
                                        this.setCell(xtemp, ytemp, wall);
                                    } else {
                                        this.setCell(xtemp, ytemp, floor);
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            }
            case 3: {
                for (var ytemp = Math.round(y - ylen / 2) ; ytemp < Math.round(y + (ylen + 1) / 2) ; ytemp++) {
                    if (ytemp < 0 || ytemp > this.ysize) {
                        return false;
                    }
                    for (var xtemp = x; xtemp > (x - xlen) ; xtemp--) {
                        if (xtemp < 0 || xtemp > this.xsize) {
                            return false;
                        }
                        if (this.getCell(xtemp, ytemp) != this.TileEnum.unused) {
                            return false;
                        }
                    }
                }
                for (var ytemp = Math.round(y - ylen / 2) ; ytemp < Math.round(y + (ylen + 1) / 2) ; ytemp++) {
                    for (var xtemp = x; xtemp > (x - xlen) ; xtemp--) {
                        if (xtemp == x) {
                            this.setCell(xtemp, ytemp, wall);
                        } else {
                            if (xtemp == (x - xlen + 1)) {
                                this.setCell(xtemp, ytemp, wall);
                            } else {
                                if (ytemp == Math.round(y - ylen / 2)) {
                                    this.setCell(xtemp, ytemp, wall);
                                } else {
                                    if (ytemp == Math.round(y + (ylen - 1) / 2)) {
                                        this.setCell(xtemp, ytemp, wall);
                                    } else {
                                        this.setCell(xtemp, ytemp, floor);
                                    }
                                }
                            }
                        }
                    }
                }
                break;

            }
        }
        return true;
    };
    Dungeon.prototype.createDungeon = function (inx, iny, inobj) {
        if (inobj < 1) {
            this.objects = 10;
        } else {
            this.objects = inobj;
        }
        if (inx < 3) {
            this.xsize = 3;
        } else {
            if (inx > this.xmax) {
                this.xsize = this.xmax;
            } else {
                this.xsize = inx;
            }
        }
        if (iny < 3) {
            this.ysize = 3;
        } else {
            if (iny > this.ymax) {
                this.ysize = this.ymax;
            } else {
                this.ysize = iny;
            }
        }
        this.dungeon_map = new Array(this.xsize * this.ysize);
        for (var y = 0; y < this.ysize; y++) {
            for (var x = 0; x < this.xsize; x++) {
                if (y == 0) {
                    this.setCell(x, y, this.TileEnum.stoneWall);
                } else {
                    if (y == this.ysize - 1) {
                        this.setCell(x, y, this.TileEnum.stoneWall);
                    } else {
                        if (x == 0) {
                            this.setCell(x, y, this.TileEnum.stoneWall);
                        } else {
                            if (x == this.xsize - 1) {
                                this.setCell(x, y, this.TileEnum.stoneWall);
                            } else {
                                this.setCell(x, y, this.TileEnum.unused);
                            }
                        }
                    }
                }
            }
        }
        this.makeRoom(this.xsize / 2, this.ysize / 2, 8, 6, this.getRand(0, 3));
        var currentFeatures = 1;
        for (var countingTries = 0; countingTries < 1000; countingTries++) {
            if (currentFeatures == this.objects) {
                break;
            }
            var newx = 0;
            var xmod = 0;
            var newy = 0;
            var ymod = 0;
            var validTile = -1;
            for (var testing = 0; testing < 1000; testing++) {
                newx = this.getRand(1, this.xsize - 1);
                newy = this.getRand(1, this.ysize - 1);
                validTile = -1;
                if (this.getCell(newx, newy) == this.TileEnum.dirtWall || this.getCell(newx, newy) == this.TileEnum.corridor) {
                    if (this.getCell(newx, newy + 1) == this.TileEnum.dirtFloor || this.getCell(newx, newy + 1) == this.TileEnum.corridor) {
                        validTile = 0;
                        xmod = 0;
                        ymod = -1;
                    } else {
                        if (this.getCell(newx - 1, newy) == this.TileEnum.dirtFloor || this.getCell(newx - 1, newy) == this.TileEnum.corridor) {
                            validTile = 1;
                            xmod = 1;
                            ymod = 0;
                        } else {
                            if (this.getCell(newx, newy - 1) == this.TileEnum.dirtFloor || this.getCell(newx, newy - 1) == this.TileEnum.corridor) {
                                validTile = 2;
                                xmod = 0;
                                ymod = 1;
                            } else {
                                if (this.getCell(newx + 1, newy) == this.TileEnum.dirtFloor || this.getCell(newx + 1, newy) == this.TileEnum.corridor) {
                                    validTile = 3;
                                    xmod = -1;
                                    ymod = 0;
                                }
                            }
                        }
                    }
                    if (validTile > -1) {
                        if (this.getCell(newx, newy + 1) == this.TileEnum.door) {
                            validTile = -1;
                        } else {
                            if (this.getCell(newx - 1, newy) == this.TileEnum.door) {
                                validTile = -1;
                            } else {
                                if (this.getCell(newx, newy - 1) == this.TileEnum.door) {
                                    validTile = -1;
                                } else {
                                    if (this.getCell(newx + 1, newy) == this.TileEnum.door) {
                                        validTile = -1;
                                    }
                                }
                            }
                        }
                    }
                    if (validTile > -1) {
                        break;
                    }
                }
            }
            if (validTile > -1) {
                var feature = this.getRand(0, 100);
                if (feature <= this.chanceRoom) {
                    if (this.makeRoom((newx + xmod), (newy + ymod), 8, 6, validTile)) {
                        currentFeatures++;
                        this.setCell(newx, newy, this.TileEnum.door);
                        this.setCell((newx + xmod), (newy + ymod), this.TileEnum.dirtFloor);
                    }
                } else {
                    if (feature >= this.chanceRoom) {
                        if (this.makeCorridor((newx + xmod), (newy + ymod), 6, validTile)) {
                            currentFeatures++;
                            this.setCell(newx, newy, this.TileEnum.door);
                        }
                    }
                }
            }
        }
        //add items
        var item_temp = 0;
        while (item_temp < this.items) {
                newx = this.getRand(1, this.xsize - 1);
                newy = this.getRand(1, this.ysize - 2);
                if (this.getCell(newx, newy) == this.TileEnum.dirtFloor || this.getCell(newx, newy) == this.TileEnum.corridor){
                    this.setCell(newx,newy,this.TileEnum.chest);
                    item_temp += 1;
                }
        }
        //add npc
        var npc_temp = 0;
        while (npc_temp < this.npc) {
            newx = this.getRand(1, this.xsize - 1);
            newy = this.getRand(1, this.ysize - 2);
            if (this.getCell(newx, newy) == this.TileEnum.dirtFloor || this.getCell(newx, newy) == this.TileEnum.corridor) {
                this.setCell(newx, newy, this.TileEnum.npc);
                npc_temp += 1;
            }
        }
        var newx = 0;
        var newy = 0;
        var ways = 0;
        var state = 0;
        while (state != 10) {
            for (var testing = 0; testing < 1000; testing++) {
                newx = this.getRand(1, this.xsize - 1);
                newy = this.getRand(1, this.ysize - 2);
                ways = 4;
                if (this.getCell(newx, newy + 1) == this.TileEnum.dirtFloor || this.getCell(newx, newy + 1) == this.TileEnum.corridor) {
                    if (this.getCell(newx, newy + 1) != this.TileEnum.door) {
                        ways--;
                    }
                }
                if (this.getCell(newx - 1, newy) == this.TileEnum.dirtFloor || this.getCell(newx - 1, newy) == this.TileEnum.corridor) {
                    if (this.getCell(newx - 1, newy) != this.TileEnum.door) {
                        ways--;
                    }
                }
                if (this.getCell(newx, newy - 1) == this.TileEnum.dirtFloor || this.getCell(newx, newy - 1) == this.TileEnum.corridor) {
                    if (this.getCell(newx, newy - 1) != this.TileEnum.door) {
                        ways--;
                    }
                }
                if (this.getCell(newx + 1, newy) == this.TileEnum.dirtFloor || this.getCell(newx + 1, newy) == this.TileEnum.corridor) {
                    if (this.getCell(newx + 1, newy) != this.TileEnum.door) {
                        ways--;
                    }
                }
                if (state == 0) {
                    if (ways == 0) {
                        this.setCell(newx, newy, this.TileEnum.upStairs);
                        state = 1;
                        break;
                    }
                } else {
                    if (state == 1) {
                        if (ways == 0) {
                            this.setCell(newx, newy, this.TileEnum.downStairs);
                            state = 10;
                            break;
                        }
                    }
                }
            }
        }
        return true;
    };
   
    Dungeon.prototype.init = function (x, y,feature_cap, item_density,npc_density, room_density, corridor_density) {
        this.xmax = x;
        this.ymax = y;
        this.xsize = 0;
        this.ysize = 0;
        this.objects = feature_cap;
        this.items = item_density;
        this.npc = npc_density;
        this.chanceRoom = room_density;
        this.chanceCorridor = corridor_density;
        var dungeon_map = new Array(x * y);
        if (this.createDungeon(x, y, this.objects)) {
            var formated;
            formated = dungeon_map.toString();
            return formated;
        } else {
            return "dungeon creation failed";
        }
    };
    return Dungeon;
})();

function generate(x, y,featuresc, item_density,npc_density, room_density, corridor_density)
{
    return d.init(x, y, item_density,npc_density, room_density, corridor_density);
}
function db_gen(x, y, features,item_density,npc_density, room_density, corridor_density) {
    context.fillStyle = '#000';
    context.font = 'bold 14px sans-serfif';
    context.textBaseline = 'top';
    d.init(x, y,features, item_density,npc_density, room_density, corridor_density);
    gui_out();
}
function gui_out() {

    for (var y = 0; y < d.ysize; y++){
        for (var x = 0; x < d.xsize; x++){
        //System.out.print(getCell(x, y));
            switch(d.getCell(x, y)){
                case d.TileEnum.unused:
                    context.fillStyle = "#000";
                    context.fillRect(x*10,y*10,10,10);
                break;
                case d.TileEnum.dirtWall:
                    context.fillStyle = "#4D738C";
                    context.fillRect(x*10,y*10,10,10);
                break;
                case d.TileEnum.dirtFloor:
                    context.fillStyle = "#A7B6C4";
                    context.fillRect(x*10,y*10,10,10);
                break;
                case d.TileEnum.stoneWall:
                    context.fillStyle = "#B3B3B3";
                    context.fillRect(x*10,y*10,10,10);
                break;
                case d.TileEnum.corridor:
                    context.fillStyle = "#919CCC";
                    context.fillRect(x*10,y*10,10,10);
                break;
                case d.TileEnum.door:
                    context.fillStyle = "#A67347";
                    context.fillRect(x*10,y*10,10,10);
                break;
                case d.TileEnum.upStairs:
                    context.fillStyle = "#A5FC4E";
                    context.fillRect(x*10,y*10,10,10);
                break;
                case d.TileEnum.downStairs:
                    context.fillStyle = "#E00774";
                    context.fillRect(x*10,y*10,10,10);
                break;
                case d.TileEnum.chest:
                    context.fillStyle = "#FFFC63";
                    context.fillRect(x*10,y*10,10,10);
                    break;
                case d.TileEnum.npc:
                    context.fillStyle = "#FF0000";
                    context.fillRect(x * 10, y * 10, 10, 10);
                    break;
    }
}
}
}
