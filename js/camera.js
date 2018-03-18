var vs;
(function (vs) {
    var Camera = (function () {
        function Camera(target) {
            this._x = 0;
            this._y = 0;
            this.width = 0;
            this.height = 0;
            this.scale = 1;
            this.radius2 = 256;
            this.scrollSpeed = 0.05;
            this.mouseOffsetScale = 0.2;
            this.mouseOffsetSmoothing = 0.3;
            this.desiredScale = 1;
            this.target = target;
            this.mouseOffset = new vs.Vec2(0, 0);
            this._x = this.target.x;
            this._y = this.target.y;
            this.updateDimensions();
            this.vel = new vs.Vec2(0, 0);
            this._bounds = new vs.Rect(this.x, this.y, this.width, this.height);
        }
        Camera.prototype.updateDimensions = function () {
            this.width = vs.Game.game.canvas.width;
            this.height = vs.Game.game.canvas.height;
            this._cX = Math.round(this.width * 0.5);
            this._cY = Math.round(this.height * 0.5);
        };
        Camera.prototype.scrollScale = function (n) {
            var step = 0.1;
            if(n < 0) {
                this.desiredScale -= step;
            } else {
                if(n > 0) {
                    this.desiredScale += step;
                }
            }
            if(this.desiredScale < 0.1) {
                this.desiredScale = 0.1;
            }
        };
        Camera.prototype.updateScale = function () {
            var step = (this.desiredScale - this.scale) * 0.05;
            if(this.scale !== this.desiredScale) {
                this.scale += step;
                var d = Math.abs(this.scale - this.desiredScale);
                var min = 0.001;
                if(d < min) {
                    this.scale = this.desiredScale;
                }
            }
        };
        Camera.prototype.update = function (delta) {
            var t = this.target;
            var dist2 = vs.Util.dist2(this._x, this._y, t.x, t.y);
            if(dist2 > this.radius2) {
                this._x = vs.Util.lerp(this._x, t.x, this.scrollSpeed);
                this._y = vs.Util.lerp(this._y, t.y, this.scrollSpeed);
            }
            var lastOffset = this.mouseOffset.clone();
            var newOffset = this.mouseOffset.clone();
            newOffset.x = (vs.Mouse.x - (t.x - (this._x - this._cX))) * this.mouseOffsetScale;
            newOffset.y = (vs.Mouse.y - (t.y - (this._y - this._cY))) * this.mouseOffsetScale;
            this.mouseOffset = vs.Util.lerpV(lastOffset, newOffset, this.mouseOffsetSmoothing);
            this.updateScale();
        };
        Object.defineProperty(Camera.prototype, "bounds", {
            get: function () {
                this._bounds.width = Math.floor(this.width / this.scale);
                this._bounds.height = Math.floor(this.height / this.scale);
                this._bounds.x = Math.floor((this._x - (this._bounds.width * 0.5)) + this.mouseOffset.x);
                this._bounds.y = Math.floor((this._y - (this._bounds.height * 0.5)) + this.mouseOffset.y);
                return this._bounds;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "x", {
            get: function () {
                return Math.floor((this._x - this._cX) + this.mouseOffset.x);
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "y", {
            get: function () {
                return Math.floor((this._y - this._cY) + this.mouseOffset.y);
            },
            set: function (y) {
                this._y = y;
            },
            enumerable: true,
            configurable: true
        });
        return Camera;
    })();
    vs.Camera = Camera;    
})(vs || (vs = {}));
