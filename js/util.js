var vs;
(function (vs) {
    var Util = (function () {
        function Util() { }
        Util.checkFOVByAngle = function checkFOVByAngle(a, b) {
            var aPos = new vs.Vec2(b.x - a.x, b.y - a.y);
            var crossMin = b.fovMinVec.cross(aPos);
            var crossMax = b.fovMaxVec.cross(aPos);
            return crossMax > 0 && crossMin < 0;
        }
        Util.checkFOV = function checkFOV(a, b) {
            if(Util.checkLOS(a, b) == false) {
                return false;
            }
            if(Util.checkFOVByAngle(a, b) === false) {
                return false;
            }
            return true;
        }
        Util.checkPoint = function checkPoint(p) {
            var objs = vs.Game.game.world.collisionAtPoint(p);
            for(var i = 0; i < objs.length; i++) {
                if(objs[i].affector.solid) {
                    return false;
                }
            }
            return true;
        }
        Util.checkLOS = function checkLOS(a, b) {
            var los = Util.getLos(a.position, b.position);
            for(var i = 0; i < los.length; i++) {
                if(los[i].affector.solid) {
                    return false;
                }
            }
            return true;
        }
        Util.angleContains = function angleContains(value, min, max) {
            var offset = 360;
            while((value + offset) < 0) {
                offset += 360;
            }
            while((min + offset) < 0) {
                offset += 360;
            }
            while((max + offset) < 0) {
                offset += 360;
            }
            var v = value + offset;
            var m = min + offset;
            var mx = max + offset;
            return (v < mx && v > m);
        }
        Util.constrainAngle = function constrainAngle(a) {
            while(a < 0) {
                a += 360;
            }
            while(a > 360) {
                a -= 360;
            }
            return a;
        }
        Util.constrain = function constrain(value, min, max) {
            if(value < min) {
                return min;
            }
            if(value > max) {
                return max;
            }
            return value;
        }
        Util.degToRad = function degToRad(d) {
            return d * (Math.PI / 180);
        }
        Util.radToDeg = function radToDeg(r) {
            return r * (180 / Math.PI);
        }
        Util.lengthDirX = function lengthDirX(length, angleDeg) {
            return Math.cos(Util.degToRad(angleDeg)) * length;
        }
        Util.lengthDirY = function lengthDirY(length, angleDeg) {
            return -Math.sin(Util.degToRad(angleDeg)) * length;
        }
        Util.dist2 = function dist2(x1, y1, x2, y2) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            return dx * dx + dy * dy;
        }
        Util.lerp = function lerp(a, b, blend) {
            return a + (b - a) * blend;
        }
        Util.lerpV = function lerpV(v1, v2, blend) {
            var vec = new vs.Vec2(0, 0);
            vec.x = Util.lerp(v1.x, v2.x, blend);
            vec.y = Util.lerp(v1.y, v2.y, blend);
            return vec;
        }
        Util.findDir = function findDir(p1, p2) {
            return Util.findDirV(p1.toVec(), p2.toVec());
        }
        Util.findDirV = function findDirV(v1, v2) {
            return v1.sub(v2).unit();
        }
        Util.findAngle = function findAngle(p1, p2) {
            var deltaX = p2.x - p1.x;
            var deltaY = p2.y - p1.y;
            return Math.atan2(deltaY, deltaX);
        }
        Util.angleWithinCone = function angleWithinCone(p1, p2, min, max) {
            var angle = Util.findAngleD(p1, p2);
            return Util.angleBetween(angle, min, max);
        }
        Util.angleBetween = function angleBetween(n, a, b) {
            n = (360 + (n % 360)) % 360;
            a = (3600000 + a) % 360;
            b = (3600000 + b) % 360;
            if(a < b) {
                return a <= n && n <= b;
            }
            return a <= n || n <= b;
        }
        Util.findAngleD = function findAngleD(p1, p2) {
            return Util.radToDeg(Util.findAngle(p1, p2));
        }
        Util.interpolateAngle = function interpolateAngle(a, b, blend) {
            if (typeof blend === "undefined") { blend = 0.5; }
            return vs.Spinor.slerp2D(a, b, blend);
        }
        Util.getLos = function getLos(p1, p2) {
            var a = new vs.Point(Math.floor(p1.x), Math.floor(p1.y));
            var b = new vs.Point(Math.floor(p2.x), Math.floor(p2.y));
            return vs.Game.game.world.gameObjects.getLine(a, b);
        }
        Util.getClosestLine = function getClosestLine(p1, p2, type) {
            if (typeof type === "undefined") { type = vs.EffectType.WALL; }
            var list = Util.getLos(p1, p2);
            var closestObj;
            for(var i = 0; i < list.length; i++) {
                if(list[i].affector.type) {
                    if(list[i].affector.type == type) {
                        closestObj = list[i];
                        break;
                    }
                }
            }
            return closestObj;
        }
        Util.containsSolid = function containsSolid(list) {
            for(var i = 0; i < list.length; i++) {
                if(list[i].affector.solid) {
                    return true;
                }
            }
            return false;
        }
        Util.getLinePlayerToMouse = function getLinePlayerToMouse() {
            var p1 = vs.Game.game.player.position;
            var p2 = vs.Mouse.position;
            p2.x += vs.Game.game.world.camera.x;
            p2.y += vs.Game.game.world.camera.y;
            var arr = Util.getLos(p1, p2);
            console.log("getting line player to mouse. Length: " + arr.length);
            console.log(arr);
        }
        Util.getEndpoint = function getEndpoint(start, angle, length) {
            return start.toVec().add(vs.Vec2.makeFromAngleDeg(angle).multN(length, length)).toPoint();
        }
        Util.rgba = function rgba(r, g, b, a) {
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        }
        Util.sgn = function sgn(x) {
            if(x < 0) {
                return -1;
            } else {
                if(x > 0) {
                    return 1;
                } else {
                    return 0;
                }
            }
        }
        return Util;
    })();
    vs.Util = Util;    
    var HTML = (function () {
        function HTML() { }
        HTML.outputMessage = function outputMessage(str) {
            var d = document.getElementById("infoDIV");
            d.innerHTML = str;
        }
        return HTML;
    })();
    vs.HTML = HTML;    
    var Polygon = (function () {
        function Polygon() { }
        Polygon.makeTriangle = function makeTriangle(radius) {
            return [
                new vs.Point(-1 * radius, 1 * radius), 
                new vs.Point(0, -1 * radius), 
                new vs.Point(1 * radius, 1 * radius)
            ];
        }
        Polygon.makeNgon = function makeNgon(r, sides, angle, x, y) {
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            var points = [];
            var increment = Math.floor(360 / sides);
            for(var i = 360; i > 0; i -= increment) {
                var p = new vs.Point(x + Util.lengthDirX(r, i + angle), Util.lengthDirY(r, i + angle));
                points.push(p);
            }
            return points;
        }
        return Polygon;
    })();
    vs.Polygon = Polygon;    
    var FPS = (function () {
        function FPS() {
        }
        FPS.timeLast = Date.now();
        FPS.fpsFilter = 50;
        FPS.fps = 0;
        FPS._delta = 0;
        FPS.start = function start() {
        }
        FPS.getDelta = function getDelta() {
            return FPS._delta * 0.001;
        }
        FPS.getFPS = function getFPS() {
            var now = Date.now();
            FPS._delta = (now - FPS.timeLast);
            var thisFrameFPS = 1000 / FPS._delta;
            FPS.fps += (thisFrameFPS - FPS.fps) / FPS.fpsFilter;
            FPS.timeLast = now;
            return FPS.fps;
        }
        return FPS;
    })();
    vs.FPS = FPS;    
    var Random = (function () {
        function Random() { }
        Random.pool = null;
        Random.poolSize = 1000;
        Random.index = 0;
        Random.range = function range(from, to) {
            return Math.floor(Math.random() * (to - from + 1) + from);
        }
        Random.rangeP = function rangeP(p) {
            return Math.floor(Math.random() * (p.b - p.a + 1) + p.a);
        }
        Random.lerp = function lerp(a, b) {
            return Util.lerp(a, b, Random.next());
        }
        Random.lerpP = function lerpP(p) {
            return Random.lerp(p.a, p.b);
        }
        Random.next = function next() {
            if(Random.pool == undefined) {
                Random.pool = [];
                for(var i = 0; i < Random.poolSize; i++) {
                    Random.pool.push(Math.random());
                }
                Random.index = 0;
            }
            if(Random.index > Random.poolSize - 1) {
                Random.index = 0;
            }
            return Random.pool[Random.index++];
        }
        Random.createProportion = function createProportion(value, proportion) {
            var p;
            var n = proportion / 100;
            p = {
                proportion: n,
                value: value
            };
            return p;
        }
        Random.Choose = function Choose(array) {
            var rnd = Random.next();
            for(var i = 0; i < array.length; i++) {
                var p = array[i];
                if(rnd < p.proportion) {
                    return p.value;
                }
                rnd -= p.proportion;
            }
            throw Error("The proportions in the collection do not add up to 1");
        }
        return Random;
    })();
    vs.Random = Random;    
    var Color = (function () {
        function Color(r, g, b, a) {
            if (typeof a === "undefined") { a = 1; }
            this.setRGB(r, g, b, a);
        }
        Color.prototype.setRGB = function (r, g, b, a) {
            this.r = Math.abs(Math.floor(r));
            this.g = Math.abs(Math.floor(g));
            this.b = Math.abs(Math.floor(b));
            if(a) {
                this.a = Math.abs(a);
            }
        };
        Color.prototype.lerp = function (c, blend) {
            return Color.lerp(this, c, blend);
        };
        Color.prototype.toString = function () {
            return Color.rgba(this.r, this.g, this.b, this.a);
        };
        Color.prototype.equalsRGB = function (c) {
            return ((this.r == c.r) && (this.g == c.g) && (this.b == c.b));
        };
        Color.prototype.copyFrom = function (c) {
            this.r = c.r;
            this.g = c.g;
            this.b = c.b;
            this.a = c.a;
        };
        Color.prototype.clone = function () {
            return new Color(this.r, this.g, this.b, this.a);
        };
        Color.lerp = function lerp(start, end, blend) {
            var r = Util.lerp(start.r, end.r, blend);
            var g = Util.lerp(start.g, end.g, blend);
            var b = Util.lerp(start.b, end.b, blend);
            var a = Util.lerp(start.a, end.a, blend);
            return new Color(r, g, b, a);
        }
        Color.rgba = function rgba(r, g, b, a) {
            return "rgba(" + r + "," + g + "," + b + "," + a + ")";
        }
        Color.random = function random() {
            var r = Random.range(0, 255);
            var g = Random.range(0, 255);
            var b = Random.range(0, 255);
            var a = Random.next();
            return new Color(r, g, b, a);
        }
        return Color;
    })();
    vs.Color = Color;    
    var TintImage = (function () {
        function TintImage(image, makeRGBK) {
            if (typeof makeRGBK === "undefined") { makeRGBK = true; }
            this.cacheDrawn = false;
            this.ready = false;
            this.image = image;
            this.cache = document.createElement("canvas");
            this.cache.width = image.width;
            this.cache.height = image.height;
            if(makeRGBK) {
                var rgbk = TintImage.makeRGBK(image);
                this.red = rgbk[0];
                this.green = rgbk[1];
                this.blue = rgbk[2];
                this.black = rgbk[3];
                this.color = new Color(0, 0, 0, 1);
            }
            this.ctx = this.cache.getContext("2d");
        }
        TintImage.prototype.draw = function (ctx, color, x, y, width, height) {
            ctx.clearRect(x, y, width, height);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "copy";
            ctx.drawImage(this.black, x, y, width, height, x, y, width, height);
            ctx.globalCompositeOperation = "lighter";
            if(color.r > 0) {
                ctx.globalAlpha = color.r / 255;
                ctx.drawImage(this.red, x, y, width, height, x, y, width, height);
            }
            if(color.g > 0) {
                ctx.globalAlpha = color.g / 255;
                ctx.drawImage(this.green, x, y, width, height, x, y, width, height);
            }
            if(color.b > 0) {
                ctx.globalAlpha = color.b / 255;
                ctx.drawImage(this.blue, x, y, width, height, x, y, width, height);
            }
        };
        TintImage.prototype.render = function (ctx, color, x, y, width, height, x2, y2, width2, height2) {
            this.draw(this.ctx, color, x, y, width, height);
            ctx.drawImage(this.cache, x, y, width, height, x2, y2, width2, height2);
        };
        TintImage.prototype.renderNoTint = function (ctx, x, y, width, height, x2, y2, width2, height2) {
            ctx.drawImage(this.image, x, y, width, height, x2, y2, width2, height2);
        };
        TintImage.prototype.clone = function () {
            var img = new TintImage(this.image);
            return img;
        };
        Object.defineProperty(TintImage.prototype, "width", {
            get: function () {
                return this.image.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TintImage.prototype, "height", {
            get: function () {
                return this.image.height;
            },
            enumerable: true,
            configurable: true
        });
        TintImage.makeRGBK = function makeRGBK(image) {
            var w = image.width;
            var h = image.height;
            var rgbks = [];
            var canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);
            var pixels = ctx.getImageData(0, 0, w, h).data;
            for(var rgbI = 0; rgbI < 4; rgbI++) {
                var c = document.createElement("canvas");
                c.width = w;
                c.height = h;
                var cx = c.getContext("2d");
                cx.drawImage(image, 0, 0);
                var to = cx.getImageData(0, 0, w, h);
                var toData = to.data;
                for(var i = 0, len = pixels.length; i < len; i += 4) {
                    toData[i] = (rgbI == 0) ? pixels[i] : 0;
                    toData[i + 1] = (rgbI == 1) ? pixels[i + 1] : 0;
                    toData[i + 2] = (rgbI == 2) ? pixels[i + 2] : 0;
                    toData[i + 3] = pixels[i + 3];
                }
                cx.putImageData(to, 0, 0);
                var imgComp = new Image();
                imgComp.src = c.toDataURL();
                rgbks.push(imgComp);
            }
            return rgbks;
        }
        return TintImage;
    })();
    vs.TintImage = TintImage;    
    var Pair = (function () {
        function Pair(a, b) {
            this.a = a;
            this.b = b;
        }
        return Pair;
    })();
    vs.Pair = Pair;    
    var ObjPair = (function () {
        function ObjPair(a, b) {
            this.a = a;
            this.b = b;
        }
        return ObjPair;
    })();
    vs.ObjPair = ObjPair;    
})(vs || (vs = {}));
