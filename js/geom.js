var vs;
(function (vs) {
    var Point = (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Point.prototype.distanceTo = function (x, y) {
            return Math.sqrt(this.distanceTo2(x, y));
        };
        Point.prototype.distanceTo2 = function (x, y) {
            return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y);
        };
        Point.prototype.getLocal = function (x, y) {
            return new Point(this.x - x, this.y - y);
        };
        Point.prototype.toVec = function () {
            return new Vec2(this.x, this.y);
        };
        Point.prototype.equals = function (p) {
            return (this.x == p.x && this.y == p.y);
        };
        Point.prototype.clone = function () {
            return new Point(this.x, this.y);
        };
        return Point;
    })();
    vs.Point = Point;    
    var Vec2 = (function () {
        function Vec2(x, y) {
            this.x = x || 0;
            this.y = y || 0;
        }
        Vec2.prototype.addN = function (x, y) {
            if (typeof y === "undefined") { y = x; }
            return new Vec2(this.x + x, this.y + y);
        };
        Vec2.prototype.add = function (v) {
            return new Vec2(this.x + v.x, this.y + v.y);
        };
        Vec2.prototype.addRel = function (v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        };
        Vec2.prototype.subN = function (x, y) {
            if (typeof y === "undefined") { y = x; }
            return new Vec2(this.x - x, this.y - y);
        };
        Vec2.prototype.sub = function (v) {
            return new Vec2(this.x - v.x, this.y - v.y);
        };
        Vec2.prototype.subRel = function (v) {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        };
        Vec2.prototype.mult = function (v) {
            return new Vec2(this.x * v.x, this.y * v.y);
        };
        Vec2.prototype.multN = function (x, y) {
            if (typeof y === "undefined") { y = x; }
            return new Vec2(this.x * x, this.y * y);
        };
        Vec2.prototype.multRel = function (v) {
            this.x *= v.x;
            this.y *= v.y;
            return this;
        };
        Vec2.prototype.divide = function (v) {
            return new Vec2((this.x / v.x), (this.y / v.y));
        };
        Vec2.prototype.divideN = function (x, y) {
            if (typeof y === "undefined") { y = x; }
            return new Vec2((this.x / x), (this.y / y));
        };
        Vec2.prototype.divRel = function (v) {
            this.x /= v.x;
            this.y /= v.y;
            return this;
        };
        Vec2.prototype.dot = function (v) {
            return this.x * v.x - this.y * v.y;
        };
        Vec2.prototype.dotPoint = function (p) {
            return this.x * p.x - this.y * p.y;
        };
        Vec2.prototype.cross = function (v) {
            return this.x * v.y - this.y * v.x;
        };
        Vec2.prototype.length = function () {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        };
        Vec2.prototype.length2 = function () {
            return this.x * this.x + this.y * this.y;
        };
        Vec2.prototype.magnitude = function () {
            return this.length();
        };
        Vec2.prototype.normalize = function () {
            var m = this.length();
            this.x = this.x / m;
            this.y = this.y / m;
            return this;
        };
        Vec2.prototype.unit = function () {
            var l = this.length();
            var v2 = new Vec2((this.x / l), (this.y / l));
            return v2;
        };
        Vec2.prototype.rotateDeg = function (deg) {
            return this.rotate(vs.Util.degToRad(deg));
        };
        Vec2.prototype.rotate = function (angle) {
            var xt = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
            var yt = (this.y * Math.cos(angle)) + (this.x * Math.sin(angle));
            this.x = xt;
            this.y = yt;
            return this;
        };
        Vec2.prototype.angle = function () {
            return Math.atan2(this.y, this.x);
        };
        Vec2.prototype.angleDeg = function () {
            return vs.Util.radToDeg(this.angle());
        };
        Vec2.prototype.angleDegConstrained = function () {
            return vs.Util.constrainAngle(this.angleDeg());
        };
        Vec2.prototype.round = function () {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        };
        Vec2.prototype.floor = function () {
            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            return this;
        };
        Vec2.prototype.ceil = function () {
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            return this;
        };
        Vec2.prototype.random = function (mag) {
            if (typeof mag === "undefined") { mag = 1; }
            var angle = vs.Util.degToRad(vs.Random.range(0, 360));
            this.x = Math.cos(angle);
            this.y = Math.sin(angle);
            this.scale(mag);
            return this;
        };
        Vec2.prototype.setN = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        Vec2.prototype.setV = function (v) {
            this.x = v.x;
            this.y = v.y;
            return this;
        };
        Vec2.prototype.setZero = function () {
            this.x = 0;
            this.y = 0;
            return this;
        };
        Vec2.prototype.scale = function (scalar) {
            this.x *= scalar;
            this.y *= scalar;
            return this;
        };
        Vec2.prototype.lerp = function (v, blend) {
            return new Vec2(vs.Util.lerp(this.x, v.x, blend), vs.Util.lerp(this.y, v.y, blend));
        };
        Vec2.lerp = function lerp(a, b, blend) {
            return new Vec2(vs.Util.lerp(a.x, b.x, blend), vs.Util.lerp(a.y, b.y, blend));
        }
        Vec2.prototype.turnLeft = function () {
            var v2 = new Vec2(-this.y, this.x);
            return v2;
        };
        Vec2.prototype.turnRight = function () {
            var v2 = new Vec2(this.y, -this.x);
            return v2;
        };
        Vec2.prototype.clone = function () {
            return new Vec2(this.x, this.y);
        };
        Vec2.prototype.toPoint = function () {
            return new Point(this.x, this.y);
        };
        Vec2.makeRandom = function makeRandom(mag) {
            if (typeof mag === "undefined") { mag = 1; }
            return new Vec2().random(mag);
        }
        Vec2.makeFromAngleDeg = function makeFromAngleDeg(angle) {
            return Vec2.makeFromAngleRad(vs.Util.degToRad(angle));
        }
        Vec2.makeFromAngleRad = function makeFromAngleRad(angle) {
            return new Vec2(Math.cos(angle), Math.sin(angle));
        }
        return Vec2;
    })();
    vs.Vec2 = Vec2;    
    var Rect = (function () {
        function Rect(x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        Rect.prototype.clone = function () {
            return new Rect(this.x, this.y, this.width, this.height);
        };
        Rect.prototype.getCenter = function () {
            return new Point(this.x + this.width * 0.5, this.y + this.height * 0.5);
        };
        Rect.prototype.contains = function (x, y) {
            var w = this.width;
            var h = this.height;
            if((w | h) < 0) {
                return false;
            }
            if(x < this.x || y < this.y) {
                return false;
            }
            w += this.x;
            h += this.y;
            return ((w < this.x || w > x) && (h < this.y || h > y));
        };
        Rect.prototype.intersects = function (r) {
            var tw = this.width;
            var th = this.height;
            var rw = r.width;
            var rh = r.height;
            if(tw <= 0 || th <= 0 || rw <= 0 || rh <= 0) {
                return false;
            }
            var tx = this.x;
            var ty = this.y;
            var rx = r.x;
            var ry = r.y;
            tw += tx;
            th += ty;
            rw += rx;
            rh += ry;
            return ((rw < rx || rw > tx) && (rh < ry || rh > ty) && (tw < tx || tw > rx) && (th < ty || th > ry));
        };
        return Rect;
    })();
    vs.Rect = Rect;    
    var Spinor = (function () {
        function Spinor() { }
        Spinor.createWithAngle = function createWithAngle(angle) {
            var s = new Spinor();
            s.real = Math.cos(angle);
            s.complex = Math.sin(angle);
            return s;
        }
        Spinor.create = function create(realPart, complexPart) {
            var s = new Spinor();
            s.complex = complexPart;
            s.real = realPart;
            return s;
        }
        Spinor.prototype.getScale = function (t) {
            return Spinor.create(this.real * t, this.complex * t);
        };
        Spinor.prototype.getInvert = function () {
            var s = Spinor.create(this.real, -this.complex);
            return s.getScale(s.getLengthSquared());
        };
        Spinor.prototype.getAdd = function (other) {
            return Spinor.create(this.real + other.real, this.complex + other.complex);
        };
        Spinor.prototype.getLength = function () {
            return Math.sqrt((this.real * this.real + this.complex * this.complex));
        };
        Spinor.prototype.getLengthSquared = function () {
            return (this.real * this.real + this.complex * this.complex);
        };
        Spinor.prototype.getMultiply = function (other) {
            return Spinor.create(this.real * other.real, this.complex * other.complex);
        };
        Spinor.prototype.getNormalized = function () {
            var length = this.getLength();
            return Spinor.create((this.real / length), (this.complex / length));
        };
        Spinor.prototype.getAngle = function () {
            return vs.Util.radToDeg(Math.atan2(this.complex, this.real));
        };
        Spinor.lerp = function lerp(start, end, t) {
            return start.getScale(1 - t).getAdd(end.getScale(t)).getNormalized();
        }
        Spinor.slerp = function slerp(from, dest, t) {
            var tr;
            var tc;
            var omega, cosom, sinom, scale0, scale1;
            cosom = from.real * dest.real + from.complex * dest.complex;
            if(cosom < 0) {
                cosom = -cosom;
                tc = -dest.complex;
                tr = -dest.real;
            } else {
                tc = dest.complex;
                tr = dest.real;
            }
            if((1 - cosom) > 0.001) {
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            } else {
                scale0 = 1 - t;
                scale1 = t;
            }
            var res = Spinor.create(0, 0);
            res.complex = scale0 * from.complex + scale1 * tc;
            res.real = scale0 * from.real + scale1 * tr;
            return res;
        }
        Spinor.slerp2D = function slerp2D(fromAngle, toAngle, t) {
            var fA = vs.Util.degToRad(fromAngle / 2);
            var tA = vs.Util.degToRad(toAngle / 2);
            var from = Spinor.create(Math.cos(fA), Math.sin(fA));
            var dest = Spinor.create(Math.cos(tA), Math.sin(tA));
            return Spinor.slerp(from, dest, t).getAngle() * 2;
        }
        return Spinor;
    })();
    vs.Spinor = Spinor;    
})(vs || (vs = {}));
