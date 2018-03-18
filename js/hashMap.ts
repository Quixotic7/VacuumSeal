
///<reference path="interfaces.ts"/>
///<reference path="sprite.ts"/>
///<reference path="util.ts"/>
///<reference path="geom.ts"/>

module vs {
    export class SpatialHash {
        private cellSize: number;
        private grid: Array[];

        // Used for calculating size
        private _size: number = 0;
        private _objectCount: number = 0;

        // Every time a new bucket is created it's stored here
        // Useful for clearing
        // private _buckets: LinkedList[];


        // This shit is just for testing
        // private _keys: string[];

        constructor (cellSize:number) {
            this.cellSize = cellSize;
            this.grid = [];
            // this._buckets = [];
        }

        add(obj : GameObject) {
            // var obj = new HashWrapper(object);
            var box = obj.boundingBox;
            var min = this.hash2(box.min);
            var max = this.hash2(box.max);

            // console.log("Adding new object. Bounds min = " + box.min.x + ":" + box.min.y + " max = " + box.max.x + ":" + box.max.y + " MinKey: " + min.x + ":" + min.y + " MaxKey: " + max.x + ":" + max.y);
            for (var x = min.x; x <= max.x; x++) {
                for (var y = min.y; y <= max.y; y++) {
                    var key = x + "_" + y;
                    this._add(key, obj);
                }
            }

            this._objectCount++;
        }

        private _add(key: string, obj: GameObject) {
            if (!this.grid[key]) {
                this.grid[key] = new LinkedList();
            }
            this.grid[key].add(obj);
            this._size++;
        }

        // Instead of pure brute forcing, we grab the keys from the first item of every bucket and set
        // that key on the grid to undefined. 
        clear() {
            this.grid = [];
            this._size = 0;
            this._objectCount = 0;

            //this._buckets.forEach((list: LinkedList,i) =>{
            //    if(list.size() > 0)
            //        this.grid[this.hashN(list.head.val.x, list.head.val.y)] = undefined;
            //});
            //this._size = 0;
            //this._buckets = [];
        }

        remove(obj: GameObject) {
            this.removeBox(obj.boundingBox, obj);
        }

        removeBox(box: Box, obj: GameObject) {
            var min = this.hash2(box.min);
            var max = this.hash2(box.max);

            for (var x = min.x; x <= max.x; x++) {
                for (var y = min.y; y <= max.y; y++) {
                    var key = x + "_" + y;
                    this._remove(key, obj);
                }
            }

            this._objectCount--;

        }

        private _remove(key: string, obj: GameObject) {
            if (this.grid[key]) {
                var list:LinkedList = this.grid[key];

                list.remove(obj);

                //// Dangerous code, not using iterator to traverse linked list. I could use the iterator, but it would
                //// have to call list.remove() once finding node which would take twice as long. Which probably won't make much
                //// Of a dent, but I like staying optimal
                //var node = list.head;
                //while (list._valid(node)) {
                //    if (node.val.val == obj)
				//        node = list.unlink(node);
			    //    else
				//        node = node.next;
                //}

                ////var itr = list.iterator();
                ////while (itr.hasNext()) {
                ////    var wrapper:HashWraper = itr.next();
                ////    if (wrapper.val == obj) {
                ////        list.remove(wrapper);
                ////    }
                ////}
                
            } else {
                console.log("Error while removing obj. Must be removed before updating");
            }
            this._size--;
        }

        //// Returns the HashWrapper containing the given object
        //// This should be called before updating
        //getWrapper(obj:GameObject): HashWrapper {
        //    if (this.grid[this.hash(obj.position)]) {
        //        var list: LinkedList = this.grid[this.hash(obj.position)];
        //        var itr = list.iterator();
        //        var node: HashWrapper;
        //        while (itr.hasNext()) {
        //            node = itr.next();
        //            if (node.val == obj) {
        //                break;
        //            }
        //        }
        //        return node;
        //    }
        //    else {
        //        console.log("Wrapper not found");
        //        return null;
        //    }
        //}

        //// This will remove and readd the object if it has changed
        //update(wrapper: HashWrapper, obj: GameObject) {
        //    if (wrapper !== null) {
        //        var pos = obj.position;
        //        if (wrapper.oldPos.x !== pos.x || wrapper.oldPos.y !== pos.y) {
        //            this.removeBox(wrapper.box, obj);
        //            wrapper.box = obj.boundingBox;
        //            wrapper.oldPos = pos;
        //            this.addWrapper(wrapper);
        //        }
        //    }
        //}

        //removeOld(obj: GameObject) {
        //    var key = this.hash(obj.position);
        //    // this._remove(obj, key);
        //    this._objectCount--;
        //}

        //private _removeOLD(obj:GameObject , key:string) {
        //    if (this.grid[key]) {
        //        var list:LinkedList = this.grid[key];
        //        list.remove(obj);
        //        this._size--;
        //        if (list.size() <= 0) {
        //            this.grid[key] = undefined;
        //        }
        //    }
        //}

        getRadius(x:number,y:number,radius:number) {
            return this.getArea(x-radius, y-radius, radius + radius, radius + radius);
        }

        getArea(x: number, y: number, width: number, height: number):GameObject[] {
            var min = new Point(x, y);
            var max = new Point(x + width, y + height);
            return this.getBox(min, max);
        }

        getAreaList(x: number, y: number, width: number, height: number): LinkedList {
            var min = new Point(x, y);
            var max = new Point(x + width, y + height);
            return this.getBoxList(min, max);
        }

        getPoint(p: Point) : LinkedList{
            return this.getPointN(p.x, p.y);
        }

        getPointN(x: number, y: number): LinkedList {
            var list = this.grid[this.hashN(x, y)];
            if(list == undefined || list == null)
                return null;
            return list;
        }

        // Returns a list of objects at the given point using keys instead of actual point
        _getPoint(x, y) {
            var list = this.grid[x + "_" + y];
            if (list == undefined || list == null)
                return null;
            return list;
        }

        getPointArray(p: Point) : GameObject[] {
            var objects: GameObject[] = [];
            var list = this.grid[this.hashN(p.x, p.y)];
            if (list) {
                list.forEach((obj: GameObject) =>{
                    objects.push(obj);
                });
            }
            return objects;
        }

        // Returns an array with all the objects at the game objects position
        // Useful for bullet collision detection
        getClosestPoint(obj:GameObject) : LinkedList{
            //var list:LinkedList = this.grid[this.hash(obj.position)];
            //var arr:GameObject[] = [];
            //var itr = list.iterator();
            //while (itr.hasNext()) {
            //    var wrapper:HashWrapper = itr.next();
            //    arr.push(wrapper.val);
            //}
            return this.grid[this.hash(obj.position)];
        }

        getClosest(obj: GameObject):GameObject[] {
            var box = obj.boundingBox;
            return this.getBox(box.min, box.max);
        }

        //// Returns the game object that is closest
        //getClosestType(obj: GameObject, type: number) {
        //}

        // given two points representing the top left and bottom right corner of a box
        // this method will return an array with all the objects contained.
        getBox(topLeft:Point, bottomRight:Point):GameObject[] {
            return this._getBox(this.hash2(topLeft), this.hash2(bottomRight));
        }

        // This internal method uses point keys
        private _getBox(min:Point, max:Point):GameObject[] {
            var arr: GameObject[] = [];
            var bucket: LinkedList;

            for (var x = min.x; x <= max.x; x++) {
                for (var y = min.y; y <= max.y; y++) {
                    var key = x + "_" + y;
                    if (this.grid[key]) {

                        bucket = this.grid[key];
                        if (bucket) {
                            bucket.forEach((item: GameObject, i) =>{
                                // var obj = item.val;
                                if (arr.indexOf(item) == -1) {
                                    arr.push(item);
                                }
                            });
                        }
                    }
                }
            }

            return arr;
        }

        getBoxList(topLeft:Point, bottomRight:Point):LinkedList {
            return this._getBoxList(this.hash2(topLeft), this.hash2(bottomRight));
        }

        // This internal method uses point keys
        private _getBoxList(min:Point, max:Point):LinkedList {
            var list: LinkedList = new LinkedList();
            var bucket: LinkedList;

            for (var x = min.x; x <= max.x; x++) {
                for (var y = min.y; y <= max.y; y++) {
                    var key = x + "_" + y;
                    if (this.grid[key]) {
                        bucket = this.grid[key];
                        if(bucket)
                            list = list.concat(bucket);
                    }
                }
            }

            return list;
        }

        private hash(p:Point) {
            return this.hashN(p.x, p.y);
        }

        private hashN(x: number, y: number){
            var px: number = Math.floor(x / this.cellSize);
            var py: number = Math.floor(y / this.cellSize);
            return (px + "_" + py);
        }

        // Hashes but returns a point instead of a string
        private hash2(p:Point) {
            var px: number = Math.floor(p.x / this.cellSize);
            var py: number = Math.floor(p.y / this.cellSize);
            return new Point(px, py);
        }

        getLine(p1:Point, p2:Point) {
            var hp1 = this.hash2(p1);
            var hp2 = this.hash2(p2);
            // console.log(hp1.x + hp2.y);
            // return [];
            return this._findLine(hp1.x, hp1.y, hp2.x, hp2.y);
        }

        _findLine(x1: number, y1: number, x2: number, y2: number) {
            //// Make sure these are all ints
            //x1 = Math.floor(x1);
            //y1 = Math.floor(y1);
            //x2 = Math.floor(x2);
            //y2 = Math.floor(y2);

            var i, dx, dy, sdx, sdy, dxabs, dyabs, x, y, px, py; // These should all be integers
            var objects:GameObject[] = [];

            //calc dist
            dx = x2 - x1;
            dy = y2 - y1;
            dxabs = Math.abs(dx);
            dyabs = Math.abs(dy);

            // Calc sign
            sdx = Util.sgn(dx);
            sdy = Util.sgn(dy);

            x = dyabs >> 1;
            y = dxabs >> 1;
            px = x1;
            py = y1;

            if (dxabs >= dyabs) // If the line is more horizontal than vertical
            {
                for (i = 0; i < dxabs; i++) {
                    y += dyabs;
                    if (y >= dxabs) {
                        y -= dxabs;
                        py += sdy;
                    }
                    px += sdx;
                    this._plot(px, py, objects);
                }
            } 
            else // Else the line is more vertical
            {
                for (i = 0; i < dyabs; i++) {
                    x += dxabs;
                    if (x >= dyabs) {
                        x -= dyabs;
                        px += sdx;
                    }
                    py += sdy; 
                    this._plot(px, py, objects);
                }
            }

            return objects;
        }

        _plot(x: number, y: number, objects:GameObject[]) {
            var key = x + "_" + y;
            if (this.grid[key]) {
                var bucket = this.grid[key];
                bucket.forEach((item: GameObject, i) =>{
                    // var obj = item.val;
                    if (objects.indexOf(item) < 0) {
                        objects.push(item);
                    }
                });
            }
        }

        //recompute() {
        //    var i,
        //        obj, 
        //        grid, 
        //        size,
        //        meta, 
        //        key,
        //        newKey;

        //    // size = this._objects.length;
        //    //for (i = 0; i < size; i++) {
        //    //    obj = this._objects[i];
        //    //    meta;
        //    //    grid = 
        //    //}
        //}

        //keys() {
        //    return this._keys;
        //}

        //numBuckets() {
        //    return this._buckets.length;
        //}

        size() {
            return this._size;
        }

        numObjects() {
            return this._objectCount;
        }
    }
}