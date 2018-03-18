module vs {
    export class Point {
        x: number;
        y: number;

        constructor (x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        distanceTo(x: number, y: number) : number {
            return Math.sqrt(this.distanceTo2(x,y));
        }

        distanceTo2(x: number, y: number) : number {
            return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y);
        }

        // Converts the points to a local coord using the power of subtraction
        getLocal(x,y) : Point {
            return new Point(this.x - x, this.y - y);
        }

        toVec() : Vec2 {
            return new Vec2(this.x, this.y);
        }

        equals(p:Point) : bool {
            return (this.x == p.x && this.y == p.y);
        }

        clone() {
            return new Point(this.x, this.y);
        }
    }

    export class Vec2 {
        x: number;
        y: number;

        constructor (x?: number, y?: number) {
            this.x = x || 0;
            this.y = y || 0;
        }

        addN(x: number, y?: number = x):Vec2 {
            //if (y) {
            //    return new Vec2(this.x + x, this.y + y);
            //}
            //return new Vec2(this.x + x, this.y + x);

            return new Vec2(this.x + x, this.y + y);
        }

        add(v:Vec2):Vec2 {
            return new Vec2(this.x + v.x, this.y + v.y);
        }

        addRel(v: Vec2):Vec2 {
            this.x += v.x;
            this.y += v.y;
            return this;
        }

        subN(x: number, y?: number = x):Vec2 {
            return new Vec2(this.x - x, this.y - y);
        }

        sub(v: Vec2):Vec2 {
            return new Vec2(this.x - v.x, this.y - v.y);
        }

        subRel(v: Vec2): Vec2 {
            this.x -= v.x;
            this.y -= v.y;
            return this;
        }

        mult(v: Vec2):Vec2 {
            return new Vec2(this.x * v.x, this.y * v.y);
        }

        multN(x: number, y?: number = x) {
            return new Vec2(this.x * x, this.y * y);
        }

        multRel(v: Vec2): Vec2 {
            this.x *= v.x;
            this.y *= v.y;
            return this;
        }

        divide(v: Vec2):Vec2 {
            return new Vec2((this.x / v.x), (this.y / v.y));
        }

        divideN(x: number, y?: number = x):Vec2 {
            return new Vec2((this.x / x), (this.y / y));
        }

        divRel(v: Vec2): Vec2 {
            this.x /= v.x;
            this.y /= v.y;
            return this;
        }

        dot(v: Vec2):number {
            return this.x * v.x - this.y * v.y;
        }

        dotPoint(p: Point): number {
            return this.x * p.x - this.y * p.y;
        }

        cross(v: Vec2): number {
            return this.x * v.y - this.y * v.x;
        }

        length():number {
            return Math.sqrt(this.x * this.x + this.y * this.y );
        }

        length2():number {
            return this.x * this.x + this.y * this.y;
        }

        magnitude(): number {
            return this.length();
        }

        // Normalizes the current vec
        normalize() : Vec2 {
            var m = this.length();
            this.x = this.x / m;
            this.y = this.y / m;
            return this;
        }

        // Returns a new normalized Vec
        unit() : Vec2 {
            var l = this.length();
            var v2 = new Vec2((this.x / l), (this.y / l));
            return v2;
        }

        // Rotates the vec by angle in deg
        rotateDeg(deg: number) : Vec2 {
            return this.rotate(Util.degToRad(deg));
        }

        rotate(angle: number):Vec2 {
            var xt = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
            var yt = (this.y * Math.cos(angle)) + (this.x * Math.sin(angle));
            this.x = xt;
            this.y = yt;
            return this;
        }

        // returns the angle that the vector points to in radians
        angle():number {
            return Math.atan2(this.y, this.x);
        }

        angleDeg():number {
            return Util.radToDeg(this.angle());
        }

        // returns a number between 0 and 360
        angleDegConstrained(): number {
            return Util.constrainAngle(this.angleDeg());
        }

        // Rounds the vector
        round(): Vec2 {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        }

        floor(): Vec2 {
            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            return this;
        }

        ceil(): Vec2 {
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            return this;
        }

        // Sets the vec to point in a random direction
        random(mag?:number = 1) : Vec2 {
            var angle = Util.degToRad( Random.range(0, 360));
            this.x = Math.cos(angle);
            this.y = Math.sin(angle);
            this.scale(mag);
            return this;
        }

        setN(x: number, y: number):Vec2 {
            this.x = x;
            this.y = y;
            return this;
        }

        // Copies the values from other vector
        setV(v: Vec2):Vec2 {
            this.x = v.x;
            this.y = v.y;
            return this;
        }

        setZero():Vec2 {
            this.x = 0;
            this.y = 0;
            return this;
        }

        scale(scalar: number):Vec2 {
            this.x *= scalar;
            this.y *= scalar;
            return this;
        }

        lerp(v:Vec2, blend: number) : Vec2 {
            return new Vec2(Util.lerp(this.x, v.x, blend), Util.lerp(this.y, v.y, blend));
        }

        static lerp(a: Vec2, b: Vec2, blend: number): Vec2 {
            return new Vec2(Util.lerp(a.x, b.x, blend), Util.lerp(a.y, b.y, blend));
        }

        // Returns new vec that is turns 90 right
        turnLeft():Vec2 {
            var v2 = new Vec2(-this.y, this.x);
            return v2;
        }

        turnRight():Vec2 {
            var v2 = new Vec2(this.y, -this.x);
            return v2;
        }

        clone():Vec2 {
            return new Vec2(this.x, this.y);
        }

        toPoint():Point {
            return new Point(this.x, this.y);
        }

        static makeRandom(mag?: number = 1) {
            return new Vec2().random(mag);
        }

        // returns a vector representing the given angle in Rads
        // 0 will return a Vec2 facing right (1,0), 90 (0,1), -90(0,-1)
        static makeFromAngleDeg(angle: number) {
            return Vec2.makeFromAngleRad(Util.degToRad(angle));
        }

        static makeFromAngleRad(angle: number) {
            return new Vec2(Math.cos(angle), Math.sin(angle));
        }
    }

    export class Rect {
        x: number;
        y: number;
        width: number;
        height: number;

        constructor (x: number, y: number, width: number, height: number) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        
        }

        clone() {
            return new Rect(this.x, this.y, this.width, this.height);
        }

        getCenter() {
            return new Point(this.x + this.width * 0.5, this.y + this.height * 0.5);
        }

        contains(x: number, y: number) {
            var w = this.width;
            var h = this.height;
            if ((w | h) < 0) return false;
            if (x < this.x || y < this.y) return false;
            w += this.x;
            h += this.y;
            return ((w < this.x || w > x) &&
                    (h < this.y || h > y));
        }

        intersects(r:Rect) {
            var tw = this.width;
            var th = this.height;
            var rw = r.width;
            var rh = r.height;
            if (tw <= 0 || th <= 0 || rw <= 0 || rh <= 0) {
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

            return ((rw < rx || rw > tx) &&
                    (rh < ry || rh > ty) &&
                    (tw < tx || tw > rx) &&
                    (th < ty || th > ry));
        }
    }

    // This shit is useful for interpolating angles
    // You will find the function slerp2d to be most valuable
    export class Spinor {
        real: number;
        complex: number;

        static createWithAngle(angle: number):Spinor {
            var s:Spinor = new Spinor();
            s.real = Math.cos(angle);
            s.complex = Math.sin(angle);
            return s;
        }

        static create(realPart: number, complexPart: number):Spinor {
            var s: Spinor = new Spinor();
            s.complex = complexPart;
            s.real = realPart;
            return s;
        }

        getScale(t:number):Spinor {
            return Spinor.create(this.real * t, this.complex * t);
        }

        getInvert(): Spinor {
            var s: Spinor = Spinor.create(this.real, -this.complex);
            return s.getScale(s.getLengthSquared());
        }

        getAdd(other: Spinor): Spinor {
            return Spinor.create(this.real + other.real, this.complex + other.complex);
        }
        getLength(): number {
            return Math.sqrt((this.real * this.real + this.complex * this.complex));
        }
        getLengthSquared():number {
            return (this.real * this.real + this.complex * this.complex);
        }
        getMultiply(other:Spinor): Spinor {
            return Spinor.create(this.real * other.real, this.complex * other.complex);
        }
        getNormalized(): Spinor {
            var length = this.getLength();
            return Spinor.create((this.real / length), (this.complex / length));
        }
        getAngle(): number {
            return Util.radToDeg(Math.atan2(this.complex, this.real));
        }
        static lerp(start: Spinor, end: Spinor, t: number): Spinor {
            return start.getScale(1 - t).getAdd(end.getScale(t)).getNormalized();
        }
        static slerp(from: Spinor, dest: Spinor, t: number): Spinor {
            var tr: number;
            var tc: number;
            var omega: number, cosom: number, sinom: number, scale0: number, scale1: number;

            // Calc cos
            cosom = from.real * dest.real + from.complex * dest.complex;

            // Adjust
            if (cosom < 0) {
                cosom = -cosom;
                tc = -dest.complex;
                tr = -dest.real;
            }
            else {
                tc = dest.complex;
                tr = dest.real;
            }

            // Coefficients
            // Use linear if too close
            if ((1 - cosom) > 0.001) {
                omega = Math.acos(cosom);
                sinom = Math.sin(omega);
                scale0 = Math.sin((1 - t) * omega) / sinom;
                scale1 = Math.sin(t * omega) / sinom;
            }
            else {
                scale0 = 1 - t;
                scale1 = t;
            }

            // Calc final
            var res: Spinor = Spinor.create(0, 0);
            res.complex = scale0 * from.complex + scale1 * tc;
            res.real = scale0 * from.real + scale1 * tr;
            return res;
        }

        // This will interpolate between the two angles
        // t should be between 0 and 1
        // if t is 1 you will get toAngle, if 0 you will get fromAngle
        static slerp2D(fromAngle: number, toAngle: number, t: number) {
            var fA = Util.degToRad(fromAngle / 2);
            var tA = Util.degToRad(toAngle / 2);
            var from: Spinor = Spinor.create(Math.cos(fA), Math.sin(fA));
            var dest: Spinor = Spinor.create(Math.cos(tA), Math.sin(tA));
            return Spinor.slerp(from, dest, t).getAngle() * 2;
        }


    }
}