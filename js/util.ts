module vs {
    export class Util {
        // this checks to see of object a is within b's fov
        static checkFOVByAngle(a:Sprite, b:Sprite):bool {
            var aPos = new Vec2(b.x - a.x, b.y - a.y);
            var crossMin = b.fovMinVec.cross(aPos);
            var crossMax = b.fovMaxVec.cross(aPos);
            return crossMax > 0 && crossMin < 0;
        }

        static checkFOV(a: Sprite, b: Sprite): bool {
            if (Util.checkLOS(a, b) == false) return false;
            if (Util.checkFOVByAngle(a, b) === false) return false;
            return true;
        }

        // Checks to see if there is a solid object at the given point
        // Returns false if there is a solid at the point
        // Returns true if there are no solids at the point
        static checkPoint(p: Point): bool {
            var objs = Game.game.world.collisionAtPoint(p);
            for (var i = 0; i < objs.length; i++) {
                if (objs[i].affector.solid) return false;
            }
            return true;
        }

        // Checks the LOS between two sprites and return true if visible, false if not visible
        static checkLOS(a: Sprite, b: Sprite): bool {
            var los = Util.getLos(a.position, b.position);
            for (var i = 0; i < los.length; i++) {
                if (los[i].affector.solid) return false;
            }
            return true;
        }

        // Use this to determine if the angle value is contained by the minimum and maximum angles
        static angleContains(value: number, min: number, max: number) {
            var offset = 360;
            // All numbers need to be positive
            while ((value + offset) < 0) offset += 360;
            while ((min + offset) < 0) offset += 360;
            while ((max + offset) < 0) offset += 360;
            var v = value + offset;
            var m = min + offset;
            var mx = max + offset;
            return (v < mx && v > m);
        }

        static constrainAngle(a: number) {
            while (a < 0) a += 360;
            while (a > 360) a -= 360;
            return a;
        }

        static constrain(value: number, min: number, max: number): number {
            if (value < min) return min;
            if (value > max) return max;
            return value;
        }
        static degToRad(d: number) {
            return d * (Math.PI / 180);
        }

        static radToDeg(r: number) {
            return r * (180 / Math.PI);
        }

        static lengthDirX(length: number, angleDeg: number) {
            return Math.cos(Util.degToRad(angleDeg)) * length;
        }

        static lengthDirY(length: number, angleDeg: number) {
            return -Math.sin(Util.degToRad(angleDeg)) * length;
        }

        static dist2(x1: number, y1: number, x2: number, y2: number) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            return dx * dx + dy * dy;
        }

        static lerp(a: number, b: number, blend: number) : number {
            return a + (b - a) * blend;
        }

        static lerpV(v1: Vec2, v2: Vec2, blend: number): Vec2 {
            var vec = new Vec2(0, 0);
            vec.x = Util.lerp(v1.x, v2.x, blend);
            vec.y = Util.lerp(v1.y, v2.y, blend);
            return vec;
        }

        // returns a vec2 representing the directions between two points
        static findDir(p1: Point, p2: Point) {
            return Util.findDirV(p1.toVec(), p2.toVec());
        }

        static findDirV(v1: Vec2, v2: Vec2): Vec2 {
            return v1.sub(v2).unit();
        }

        // Returns an angle in radians from the two points, 0 is facing right
        static findAngle(p1:Point, p2:Point): number {
            var deltaX = p2.x - p1.x;
            var deltaY = p2.y - p1.y;

            return Math.atan2(deltaY, deltaX);
        }

        // Returns true if the given point p2 is within the cone represented by p1 and the min and max angles, in degrees
        static angleWithinCone(p1: Point, p2:Point, min: number, max: number) : bool {
            var angle = Util.findAngleD(p1, p2);
            return Util.angleBetween(angle, min, max);
        }

        // Determines if angle n is between angle a and b
        static angleBetween(n: number, a: number, b: number): bool {
            n = (360 + (n % 360)) % 360;
	        a = (3600000 + a) % 360;
	        b = (3600000 + b) % 360;

	        if (a < b)
		        return a <= n && n <= b;
	        return a <= n || n <= b;
        }

        // Returns an angle in degrees from the two points
        static findAngleD(p1: Point, p2: Point): number {
           return Util.radToDeg(Util.findAngle(p1, p2));
        }

        static interpolateAngle(a: number, b: number, blend?: number = 0.5) {
            return Spinor.slerp2D(a, b, blend);
        }

        //static getLos(p1:Point, p2:Point) : LinkedList {
        //    var start = p1.toVec();
        //    var end = p2.toVec();
        //    var dir = Util.findDirV(end, start);

        //    var dis2 = p1.distanceTo2(p2.x, p2.y);
        //    var step = 32;
        //    var step2 = step * step;
            
        //    var dir = dir.multN(step,step);

        //    var objs: LinkedList;
        //    var output: LinkedList = new LinkedList();

        //    Game.game.hud.alert("", 2);

        //    for (var i = 0; i < dis2; i += step2) {

        //        objs = Game.game.world.collisionAtPoint(start.toPoint());
                
        //        //objs.forEach((obj: GameObject) =>{
        //        //    if (obj instanceof Wall) {
        //        //        Game.game.hud.alert("Hit Wall", 2);
        //        //    }
        //        //});
        //        // console.log(objs);
        //        if (objs !== undefined) {
        //            output.merge(objs);
        //        }
        //        start = start.add(dir);
        //    }

        //    return output;
        //}

        // static counter: number = 10;

        static getLos(p1:Point, p2:Point) : GameObject[] {
            // console.log("Statics = " + Game.game.world.staticObjects.size() + " Animateds = " + Game.game.world.animatedObjects.size());
            var a = new Point(Math.floor(p1.x), Math.floor(p1.y));
            var b = new Point(Math.floor(p2.x), Math.floor(p2.y));

            //if (Util.counter-- >= 0) {
            //    console.log("a = " + a.x + " " + a.y + " b = " + b.x + " " + b.y);
            //}
            
            //var statics = Game.game.world.staticObjects.getLine(a,b);
            //var animateds = Game.game.world.animatedObjects.getLine(a,b);
            return Game.game.world.gameObjects.getLine(a,b);
            // return [];
        }

        // Returns the closest wall object to p1 in given line segment
        //static getClosestLine(p1: Point, p2: Point):GameObject {
        //    var list = Util.getLos(p1, p2);
        //    var itr = list.iterator();

        //    var closestObj: GameObject;

        //    while (itr.hasNext()) {
        //        var obj:GameObject = itr.next();
        //        if (obj instanceof Wall) {
        //            closestObj = obj;
        //            break;
        //        }
        //    }
        //    return closestObj;
        //}

        // finds the closest solid in a line
        static getClosestLine(p1: Point, p2: Point, type?:number = EffectType.WALL):GameObject {
            var list = Util.getLos(p1, p2);

            var closestObj: GameObject;

            for (var i = 0; i < list.length; i++) {
                if (list[i].affector.type) {
                    if (list[i].affector.type == type) {
                        closestObj = list[i];
                        break;
                    }
                }
            }
            return closestObj;
        }

        static containsSolid(list: GameObject[]) {
            for (var i = 0; i < list.length; i++) {
                if (list[i].affector.solid) {
                    return true;
                }
            }
            //console.log("clearLOS");
            return false;
        }

        // Just a function to help debugging lines
        static getLinePlayerToMouse() {
            var p1 = Game.game.player.position;
            var p2 = Mouse.position;
            p2.x += Game.game.world.camera.x;
            p2.y += Game.game.world.camera.y;

            var arr = Util.getLos(p1, p2);
            console.log("getting line player to mouse. Length: " + arr.length);
            console.log(arr);
        }

        // Returns a point projected from the start point at the given angle
        static getEndpoint(start: Point, angle: number, length: number):Point {
            return start.toVec().add(Vec2.makeFromAngleDeg(angle).multN(length,length)).toPoint();
        }

        static rgba(r: number, g: number, b: number, a: number) {
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        }

        // Returns the sign of the number
        static sgn(x:number) : number{
            if (x < 0) return -1;
            else if (x > 0) return 1;
            else return 0;
        }
    }

    export class HTML {
        static outputMessage(str: string) {
            var d = document.getElementById("infoDIV");
            d.innerHTML = str;
        }
    }

    export class Polygon {
        static makeTriangle(radius: number): Point[] {
            return [
                new Point(-1 * radius, 1 * radius),
                new Point(0, -1 * radius),
                new Point(1 * radius, 1 * radius)];
        }

        static makeNgon(r: number, sides: number, angle: number, x?: number = 0, y?: number = 0) {
            var points: Point[] = [];

            var increment = Math.floor(360 / sides);
            for (var i = 360; i > 0; i -= increment) {
                var p = new Point(x + Util.lengthDirX(r, i + angle), Util.lengthDirY(r, i + angle));
                points.push(p);
            }
            return points;
        }
    }

    // Helper class to get FPS and Delta
    // Calculated when FPS.getFPS() is called
    export class FPS {
        private static timeLast: number = Date.now();
        private static fpsFilter: number = 50;
        private static fps: number = 0;
        private static _delta: number = 0;

        constructor () {
        
        }

        static start() {
            
        }

        static getDelta() {
            
            return FPS._delta * 0.001;
        }

        static getFPS() {
            var now = Date.now();
            FPS._delta = (now - FPS.timeLast);
            var thisFrameFPS = 1000 / FPS._delta;
            FPS.fps += (thisFrameFPS - FPS.fps) / FPS.fpsFilter;
            FPS.timeLast = now;

            // console.log("now = " + now + " delta = " + FPS._delta);

            return FPS.fps;
        }
    }

    // Reall random all the time
    export class Random {
        private static pool: number[];
        private static poolSize: number = 1000;
        private static index: number = 0;

        // Returns a random int within the given range
        static range(from: number, to: number): number {
            return Math.floor(Math.random() * (to - from + 1) + from);
        }

        // Returns a random int from the pair
        static rangeP(p: Pair): number {
            return Math.floor(Math.random() * (p.b - p.a + 1) + p.a);
        }

        static lerp(a: number, b: number): number {
            return Util.lerp(a, b, Random.next());
        }

        static lerpP(p: Pair): number {
            return Random.lerp(p.a, p.b);
        }

        // Returns a value between 0 and 1;
        static next(): number {
            if (Random.pool == undefined) {
                Random.pool = [];
                for (var i = 0; i < Random.poolSize; i++) {
                    Random.pool.push(Math.random());
                }
                Random.index = 0;
            }
            if (Random.index > Random.poolSize - 1) {
                Random.index = 0;
            }
            return Random.pool[Random.index++];
        }


        static createProportion(value: any, proportion: number) {
            var p: ProportionValue;
            var n = proportion / 100;
            p = {
                proportion: n,
                value: value
            }
            return p;
        }

        static Choose(array: ProportionValue[]):any {
            var rnd = Random.next();

            for (var i = 0; i < array.length; i++) {
                var p = array[i];
                if(rnd < p.proportion)
                    return p.value;
                rnd -= p.proportion;
            }

            // console.log("Size: " + array.length);
            throw Error("The proportions in the collection do not add up to 1");
        }
    }

    export interface ProportionValue {
        proportion: number;
        value: any;
    }

    export class Color {
        r: number;
        g: number;
        b: number;
        a: number;

        constructor (r:number, g:number, b:number, a?:number = 1) {
            this.setRGB(r, g, b, a);
        }

        setRGB(r: number, g: number, b: number, a?:number) {
            this.r = Math.abs(Math.floor(r));
            this.g = Math.abs(Math.floor(g));
            this.b = Math.abs(Math.floor(b));
            if(a)
                this.a = Math.abs(a);
        }

        lerp(c: Color, blend:number):Color {
            return Color.lerp(this, c, blend);
        }

        toString(): string {
            //var r = Math.abs(Math.floor(this.r));
            //var g = Math.abs(Math.floor(this.g));
            //var b = Math.abs(Math.floor(this.b));
            //var a = Math.abs(this.a);

            return Color.rgba(this.r, this.g, this.b, this.a);
        }

        equalsRGB(c: Color) {
            return ((this.r == c.r) && (this.g == c.g) && (this.b == c.b));
        }

        copyFrom(c: Color) {
            this.r = c.r;
            this.g = c.g;
            this.b = c.b;
            this.a = c.a;
        }

        clone(): Color {
            return new Color(this.r, this.g, this.b, this.a);
        }

        static lerp(start: Color, end: Color, blend: number): Color {
            var r = Util.lerp(start.r, end.r, blend);
            var g = Util.lerp(start.g, end.g, blend);
            var b = Util.lerp(start.b, end.b, blend);
            var a = Util.lerp(start.a, end.a, blend);
            return new Color(r, g, b, a);
        }

        static rgba(r: number, g: number, b: number, a: number):string {
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        }

        static random(): Color {
            var r = Random.range(0, 255);
            var g = Random.range(0, 255);
            var b = Random.range(0, 255);
            var a = Random.next();
            return new Color(r, g, b, a);
        }
        


    }

    export class TintImage {
        image: HTMLImageElement;
        cache: HTMLCanvasElement;
        ctx: CanvasRenderingContext2D;
        red: HTMLImageElement;
        green: HTMLImageElement;
        blue: HTMLImageElement;
        black: HTMLImageElement;
        cacheDrawn: bool = false;
        ready: bool = false;

        //r: number = 0;
        //g: number = 0;
        //b: number = 0;
        //a: number = 1;

        color: Color;

        constructor (image:HTMLImageElement, makeRGBK?: bool = true) {
            this.image = image;

            this.cache = <HTMLCanvasElement>document.createElement("canvas");
            this.cache.width = image.width;
            this.cache.height = image.height;

            if (makeRGBK) {
                var rgbk = TintImage.makeRGBK(image);
                this.red = rgbk[0];
                this.green = rgbk[1];
                this.blue = rgbk[2];
                this.black = rgbk[3];

                this.color = new Color(0,0, 0, 1);
            }

            this.ctx = this.cache.getContext("2d");
        }

        //rgba(r: number, g: number, b: number, a: number) {
        //    this.r = r;
        //    this.g = g;
        //    this.b = b;
        //    this.a = a;
        //}

        draw(ctx: CanvasRenderingContext2D, color:Color, x: number, y: number, width: number, height: number) {
            ctx.clearRect(x, y, width, height);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "copy";
            // ctx.drawImage(this.black, x, y, width, height, x2, y2, width2, height2);
            ctx.drawImage(this.black, x, y, width, height, x, y, width, height);

            ctx.globalCompositeOperation = "lighter";
            if (color.r > 0) {
                ctx.globalAlpha = color.r / 255;
                // ctx.drawImage(this.red, x, y, width, height, x2, y2, width2, height2);
                ctx.drawImage(this.red, x, y, width, height, x, y, width, height);
            }
            if (color.g > 0) {
                ctx.globalAlpha = color.g / 255;
                // ctx.drawImage(this.green, x, y, width, height, x2, y2, width2, height2);
                ctx.drawImage(this.green, x, y, width, height, x, y, width, height);
            }
            if (color.b > 0) {
                ctx.globalAlpha = color.b / 255;
                // ctx.drawImage(this.blue, x, y, width, height, x2, y2, width2, height2);
                ctx.drawImage(this.blue, x, y, width, height, x, y, width, height);
            }

            //ctx.globalAlpha = this.b / 255;
            //    ctx.drawImage(this.blue, x, y, width, height, x2, y2, width2, height2);
        }

        //drawTint(ctx: CanvasRenderingContext2D, color: color, x: number, y: number, width: number, height: number, x2: number, y2: number, width2: number, height2: number) {
            
        //}

        render(ctx: CanvasRenderingContext2D, color:Color, x: number, y: number, width: number, height: number, x2: number, y2: number, width2: number, height2: number) {
            this.draw(this.ctx, color, x, y, width, height);
            ctx.drawImage(this.cache, x, y, width, height, x2, y2, width2, height2);





            //this.cacheDrawn = true;
            //if (this.cacheDrawn === true) {
            //    this.color.copyFrom(color);
            //    var cacheCtx = this.cache.getContext("2d");
            //    cacheCtx.clearRect(0, 0, this.cache.width, this.cache.height);
            //    this.draw(cacheCtx, 0, 0, this.cache.width, this.cache.height);
            //    this.cacheDrawn = true;
            //} 

            //if(this.cacheDrawn){
            //    ctx.globalAlpha = this.color.a;
            //    // ctx.drawImage(this.cache, x, y, width, height, x2, y2, width2, height2);
            //}

            //drawTint(ctx, color, x, y, width, height, x2, y2, width2, height2);


            //ctx.drawImage(this.image, x, y, width, height, x2, y2, width2, height2);

            //this.color.copyFrom(color);
            //// var cacheCtx = this.cache.getContext("2d");
            //// cacheCtx.clearRect(x, y, width, height);
            //ctx.globalAlpha = this.color.a;
            //this.draw(ctx, x, y, width, height, x2, y2, width2, height2);
            //this.cacheDrawn = true;
            
            //ctx.drawImage(this.cache, x, y, width, height, x2, y2, width2, height2);



                //this.color.copyFrom(color);
                //var cacheCtx = this.cache.getContext("2d");
                //cacheCtx.clearRect(x, y, width, height);
                //this.draw(cacheCtx, x, y, width, height, x, y, width, height);
                //this.cacheDrawn = true;
            //ctx.globalAlpha = this.color.a;
            //ctx.drawImage(this.cache, x, y, width, height, x2, y2, width2, height2);
        }

        renderNoTint(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, x2: number, y2: number, width2: number, height2: number) {
            ctx.drawImage(this.image, x, y, width, height, x2, y2, width2, height2);
        }

        clone():TintImage {
            var img = new TintImage(this.image);

            //var cache = <HTMLCanvasElement>document.createElement("canvas");
            //cache.width = this.cache.width;
            //cache.height = this.cache.height;

            ////var ctx = cache.getContext("2d");
            ////ctx.drawImage(this.cache, 0, 0);

            //// img.cache = cache;
            //img.cacheDrawn = false;

            //var red = new Image();
            //var redCanvas = <HTMLCanvasElement>document.createElement("canvas");
            //redCanvas.width = this.cache.width;
            //redCanvas.height = this.cache.height;
            //var redCtx = redCanvas.getContext("2d");
            //redCtx.drawImage(this.red, 0, 0);
            //red.src = redCanvas.toDataURL();
            //img.red = red;

            //var green = new Image();
            //var greenCanvas = <HTMLCanvasElement>document.createElement("canvas");
            //greenCanvas.width = this.cache.width;
            //greenCanvas.height = this.cache.height;
            //var greenCtx = greenCanvas.getContext("2d");
            //greenCtx.drawImage(this.green, 0, 0);
            //green.src = greenCanvas.toDataURL();
            //img.green = green;

            //var blue = new Image();
            //var blueCanvas = <HTMLCanvasElement>document.createElement("canvas");
            //blueCanvas.width = this.cache.width;
            //blueCanvas.height = this.cache.height;
            //var blueCtx = blueCanvas.getContext("2d");
            //blueCtx.drawImage(this.blue, 0, 0);
            //blue.src = blueCanvas.toDataURL();
            //img.blue = blue;

            //var black = new Image();
            //var blackCanvas = <HTMLCanvasElement>document.createElement("canvas");
            //blackCanvas.width = this.cache.width;
            //blackCanvas.height = this.cache.height;
            //var blackCtx = blackCanvas.getContext("2d");
            //blackCtx.drawImage(this.black, 0, 0);
            //black.src = blackCanvas.toDataURL();
            //img.black = black;

            //img.color = this.color.clone();
            return img;
        }

        get width() {
            return this.image.width;
        }

        get height() {
            return this.image.height;
        }

        // This splits an image in to different color channels for fast tinting and stuff
        // Returns and array of 4 images: Red, Green, Blue, and Black
        static makeRGBK(image:HTMLImageElement):HTMLImageElement[] {
            var w = image.width;
            var h = image.height;
            var rgbks:HTMLImageElement[] = [];

            var canvas = <HTMLCanvasElement>document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);

            var pixels = ctx.getImageData(0, 0, w, h).data;

            // 4 is used to get 4 images, red, green, blue, and black
            for (var rgbI = 0; rgbI < 4; rgbI++) {
                var c = <HTMLCanvasElement>document.createElement("canvas");
                c.width = w;
                c.height = h;
                
                var cx = c.getContext("2d");
                cx.drawImage(image, 0, 0);
                var to = cx.getImageData(0, 0, w, h);
                var toData = to.data;

                for (var i = 0, len = pixels.length; i < len; i += 4) {
                    toData[i    ] = (rgbI == 0) ? pixels[i    ] : 0;
                    toData[i + 1] = (rgbI == 1) ? pixels[i + 1] : 0;
                    toData[i + 2] = (rgbI == 2) ? pixels[i + 2] : 0;
                    toData[i + 3] = pixels[i + 3];
                }

                cx.putImageData(to, 0, 0);


                // Image is faster to draw from, so we'll convert

                var imgComp = new Image();
                imgComp.src = c.toDataURL();

                rgbks.push(imgComp);
            }
            return rgbks;
        }
    }

    export class Pair {
        a: number;
        b: number;

        constructor (a: number, b: number) {
            this.a = a;
            this.b = b;
        }
    }

    export class ObjPair {
        a: any;
        b: any;

        constructor (a: any, b: any) {
            this.a = a;
            this.b = b;
        }
    }


}