var vs;
(function (vs) {
    var SpatialHash = (function () {
        function SpatialHash(cellSize) {
            this._size = 0;
            this._objectCount = 0;
            this.cellSize = cellSize;
            this.grid = [];
        }
        SpatialHash.prototype.add = function (obj) {
            var box = obj.boundingBox;
            var min = this.hash2(box.min);
            var max = this.hash2(box.max);
            for(var x = min.x; x <= max.x; x++) {
                for(var y = min.y; y <= max.y; y++) {
                    var key = x + "_" + y;
                    this._add(key, obj);
                }
            }
            this._objectCount++;
        };
        SpatialHash.prototype._add = function (key, obj) {
            if(!this.grid[key]) {
                this.grid[key] = new vs.LinkedList();
            }
            this.grid[key].add(obj);
            this._size++;
        };
        SpatialHash.prototype.clear = function () {
            this.grid = [];
            this._size = 0;
            this._objectCount = 0;
        };
        SpatialHash.prototype.remove = function (obj) {
            this.removeBox(obj.boundingBox, obj);
        };
        SpatialHash.prototype.removeBox = function (box, obj) {
            var min = this.hash2(box.min);
            var max = this.hash2(box.max);
            for(var x = min.x; x <= max.x; x++) {
                for(var y = min.y; y <= max.y; y++) {
                    var key = x + "_" + y;
                    this._remove(key, obj);
                }
            }
            this._objectCount--;
        };
        SpatialHash.prototype._remove = function (key, obj) {
            if(this.grid[key]) {
                var list = this.grid[key];
                list.remove(obj);
            } else {
                console.log("Error while removing obj. Must be removed before updating");
            }
            this._size--;
        };
        SpatialHash.prototype.getRadius = function (x, y, radius) {
            return this.getArea(x - radius, y - radius, radius + radius, radius + radius);
        };
        SpatialHash.prototype.getArea = function (x, y, width, height) {
            var min = new vs.Point(x, y);
            var max = new vs.Point(x + width, y + height);
            return this.getBox(min, max);
        };
        SpatialHash.prototype.getAreaList = function (x, y, width, height) {
            var min = new vs.Point(x, y);
            var max = new vs.Point(x + width, y + height);
            return this.getBoxList(min, max);
        };
        SpatialHash.prototype.getPoint = function (p) {
            return this.getPointN(p.x, p.y);
        };
        SpatialHash.prototype.getPointN = function (x, y) {
            var list = this.grid[this.hashN(x, y)];
            if(list == undefined || list == null) {
                return null;
            }
            return list;
        };
        SpatialHash.prototype._getPoint = function (x, y) {
            var list = this.grid[x + "_" + y];
            if(list == undefined || list == null) {
                return null;
            }
            return list;
        };
        SpatialHash.prototype.getPointArray = function (p) {
            var objects = [];
            var list = this.grid[this.hashN(p.x, p.y)];
            if(list) {
                list.forEach(function (obj) {
                    objects.push(obj);
                });
            }
            return objects;
        };
        SpatialHash.prototype.getClosestPoint = function (obj) {
            return this.grid[this.hash(obj.position)];
        };
        SpatialHash.prototype.getClosest = function (obj) {
            var box = obj.boundingBox;
            return this.getBox(box.min, box.max);
        };
        SpatialHash.prototype.getBox = function (topLeft, bottomRight) {
            return this._getBox(this.hash2(topLeft), this.hash2(bottomRight));
        };
        SpatialHash.prototype._getBox = function (min, max) {
            var arr = [];
            var bucket;
            for(var x = min.x; x <= max.x; x++) {
                for(var y = min.y; y <= max.y; y++) {
                    var key = x + "_" + y;
                    if(this.grid[key]) {
                        bucket = this.grid[key];
                        if(bucket) {
                            bucket.forEach(function (item, i) {
                                if(arr.indexOf(item) == -1) {
                                    arr.push(item);
                                }
                            });
                        }
                    }
                }
            }
            return arr;
        };
        SpatialHash.prototype.getBoxList = function (topLeft, bottomRight) {
            return this._getBoxList(this.hash2(topLeft), this.hash2(bottomRight));
        };
        SpatialHash.prototype._getBoxList = function (min, max) {
            var list = new vs.LinkedList();
            var bucket;
            for(var x = min.x; x <= max.x; x++) {
                for(var y = min.y; y <= max.y; y++) {
                    var key = x + "_" + y;
                    if(this.grid[key]) {
                        bucket = this.grid[key];
                        if(bucket) {
                            list = list.concat(bucket);
                        }
                    }
                }
            }
            return list;
        };
        SpatialHash.prototype.hash = function (p) {
            return this.hashN(p.x, p.y);
        };
        SpatialHash.prototype.hashN = function (x, y) {
            var px = Math.floor(x / this.cellSize);
            var py = Math.floor(y / this.cellSize);
            return (px + "_" + py);
        };
        SpatialHash.prototype.hash2 = function (p) {
            var px = Math.floor(p.x / this.cellSize);
            var py = Math.floor(p.y / this.cellSize);
            return new vs.Point(px, py);
        };
        SpatialHash.prototype.getLine = function (p1, p2) {
            var hp1 = this.hash2(p1);
            var hp2 = this.hash2(p2);
            return this._findLine(hp1.x, hp1.y, hp2.x, hp2.y);
        };
        SpatialHash.prototype._findLine = function (x1, y1, x2, y2) {
            var i, dx, dy, sdx, sdy, dxabs, dyabs, x, y, px, py;
            var objects = [];
            dx = x2 - x1;
            dy = y2 - y1;
            dxabs = Math.abs(dx);
            dyabs = Math.abs(dy);
            sdx = vs.Util.sgn(dx);
            sdy = vs.Util.sgn(dy);
            x = dyabs >> 1;
            y = dxabs >> 1;
            px = x1;
            py = y1;
            if(dxabs >= dyabs) {
                for(i = 0; i < dxabs; i++) {
                    y += dyabs;
                    if(y >= dxabs) {
                        y -= dxabs;
                        py += sdy;
                    }
                    px += sdx;
                    this._plot(px, py, objects);
                }
            } else {
                for(i = 0; i < dyabs; i++) {
                    x += dxabs;
                    if(x >= dyabs) {
                        x -= dyabs;
                        px += sdx;
                    }
                    py += sdy;
                    this._plot(px, py, objects);
                }
            }
            return objects;
        };
        SpatialHash.prototype._plot = function (x, y, objects) {
            var key = x + "_" + y;
            if(this.grid[key]) {
                var bucket = this.grid[key];
                bucket.forEach(function (item, i) {
                    if(objects.indexOf(item) < 0) {
                        objects.push(item);
                    }
                });
            }
        };
        SpatialHash.prototype.size = function () {
            return this._size;
        };
        SpatialHash.prototype.numObjects = function () {
            return this._objectCount;
        };
        return SpatialHash;
    })();
    vs.SpatialHash = SpatialHash;    
})(vs || (vs = {}));
