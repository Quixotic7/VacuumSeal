module vs {
    export class Camera {
        private _x: number = 0;
        private _y: number = 0;

        vel: Vec2;

        width: number = 0;
        height: number = 0;

        scale: number = 1;

        radius2: number = 256;

        scrollSpeed: number = 0.05;
        mouseOffsetScale: number = 0.2;
        mouseOffset: Vec2;
        mouseOffsetSmoothing: number = 0.3;

        desiredScale: number = 1;

        private _cX: number;
        private _cY: number;

        private _bounds: Rect;

        target: Sprite;

        constructor (target:Sprite) {
            this.target = target;
            this.mouseOffset = new Vec2(0, 0);
            this._x = this.target.x;
            this._y = this.target.y;

            this.updateDimensions();

            this.vel = new Vec2(0, 0);

            this._bounds = new Rect(this.x, this.y, this.width, this.height);

            
        }

        updateDimensions() {
            this.width = Game.game.canvas.width;
            this.height = Game.game.canvas.height;

            this._cX = Math.round(this.width * 0.5);
            this._cY = Math.round(this.height * 0.5);
        }

        scrollScale(n: number) {
            var step = 0.1;
            if (n < 0) {
                this.desiredScale -= step;
            } else if (n > 0) {
                this.desiredScale += step
            }
            if (this.desiredScale < 0.1) this.desiredScale = 0.1;
        }

        updateScale() {
            var step = (this.desiredScale - this.scale) * 0.05;
            if (this.scale !== this.desiredScale) {
                this.scale += step;

                var d = Math.abs(this.scale - this.desiredScale);
                var min = 0.001;
                if (d < min) {
                    this.scale = this.desiredScale;
                }
            }
        }

        update(delta: number) {
            var t = this.target;

            var dist2 = Util.dist2(this._x, this._y, t.x, t.y);
            if (dist2 > this.radius2) {
                this._x = Util.lerp(this._x, t.x, this.scrollSpeed);
                this._y = Util.lerp(this._y, t.y, this.scrollSpeed);
            }

            var lastOffset = this.mouseOffset.clone();
            var newOffset = this.mouseOffset.clone();

            newOffset.x = (Mouse.x - (t.x - (this._x - this._cX))) * this.mouseOffsetScale;
            newOffset.y = (Mouse.y - (t.y - (this._y - this._cY))) * this.mouseOffsetScale;

            this.mouseOffset = Util.lerpV(lastOffset, newOffset, this.mouseOffsetSmoothing);

            this.updateScale();
        }

        get bounds(): Rect {
            this._bounds.width = Math.floor(this.width / this.scale);
            this._bounds.height = Math.floor(this.height / this.scale);
            this._bounds.x = Math.floor((this._x -(this._bounds.width * 0.5)) + this.mouseOffset.x);
            this._bounds.y = Math.floor((this._y - (this._bounds.height * 0.5)) + this.mouseOffset.y);
            
            return this._bounds;
        }

        get x() { 
            return Math.floor((this._x - this._cX) + this.mouseOffset.x); 
        }
        set x(x: number) { this._x = x; }
        get y() { 
            return Math.floor((this._y - this._cY) + this.mouseOffset.y); 
        }
        set y(y: number) { this._y = y; }
    }
}