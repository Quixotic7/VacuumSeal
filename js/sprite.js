var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var Sprite = (function () {
        function Sprite(x, y, imageName) {
            this._x = 0;
            this._y = 0;
            this.regX = 0;
            this.regY = 0;
            this.active = true;
            this.visible = true;
            this.exists = true;
            this.enableCollisionDetection = true;
            this.collidable = true;
            this.movable = true;
            this.zIndex = 0;
            this.alpha = 1;
            this.compositeMode = "Source-Over";
            this.scaleX = 1;
            this.scaleY = 1;
            this._rotation = 0;
            this.rotationOffset = 0;
            this.fov = 360;
            this.frameX = 0;
            this.frameY = 0;
            this.frameWidth = 0;
            this.frameHeight = 0;
            this.boundX = 0;
            this.boundY = 0;
            this.boundWidth = 64;
            this.boundHeight = 64;
            this.boundingRadius = 64;
            this.speed = 0;
            this._x = x;
            this._y = y;
            this.oldPos = new vs.Vec2(0, 0);
            this.direction = new vs.Vec2(0, 0);
            if(imageName !== "noimage") {
                this.changeImage(imageName);
            } else {
                this._bounds = new vs.Rect(0, 0, 1, 1);
            }
        }
        Sprite.prototype.changeImage = function (imageName, frame, frameWidth, frameHeight) {
            if (typeof frame === "undefined") { frame = 0; }
            if (typeof frameWidth === "undefined") { frameWidth = 64; }
            if (typeof frameHeight === "undefined") { frameHeight = 64; }
            this.image = vs.Game.game.assets.images[imageName];
            this.frameWidth = frameWidth;
            this.frameHeight = frameHeight;
            this.frame = frame;
            this._bounds = new vs.Rect(0, 0, this.frameWidth, this.frameHeight);
        };
        Object.defineProperty(Sprite.prototype, "rotation", {
            get: function () {
                return this._rotation;
            },
            set: function (v) {
                while(v > 360) {
                    v -= 360;
                }
                while(v < 0) {
                    v += 360;
                }
                this._rotation = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "directionVector", {
            get: function () {
                return vs.Vec2.makeFromAngleDeg(this.rotation + this.rotationOffset);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "fovMaxVec", {
            get: function () {
                return vs.Vec2.makeFromAngleDeg((this.rotation + this.rotationOffset) + this.fov * 0.5);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "fovMinVec", {
            get: function () {
                return vs.Vec2.makeFromAngleDeg((this.rotation + this.rotationOffset) - this.fov * 0.5);
            },
            enumerable: true,
            configurable: true
        });
        Sprite.zIndexComparator = function zIndexComparator() {
        }
        Object.defineProperty(Sprite.prototype, "x", {
            get: function () {
                return Math.floor(this._x);
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "y", {
            get: function () {
                return Math.floor(this._y);
            },
            set: function (y) {
                this._y = y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "affector", {
            get: function () {
                var affector = {
                };
                return affector;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "position", {
            get: function () {
                return new vs.Point(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "positionCenter", {
            get: function () {
                return new vs.Point(this.x + this.frameWidth * 0.5, this.y + this.frameHeight * 0.5);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "positionLocal", {
            get: function () {
                return new vs.Point(this.x - vs.Game.game.world.camera.x, this.y - vs.Game.game.world.camera.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "boundingBox", {
            get: function () {
                return {
                    min: new vs.Point(this.x + this.boundX, this.y + this.boundY),
                    max: new vs.Point(this.x + this.boundX + this.boundWidth, this.y + this.boundY + this.boundHeight)
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sprite.prototype, "boundingRect", {
            get: function () {
                this._bounds.x = this.x + this.boundX;
                this._bounds.y = this.y + this.boundY;
                this._bounds.width = this.boundWidth;
                this._bounds.height = this.boundHeight;
                return this._bounds;
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype.collide = function (e, o) {
        };
        Sprite.prototype.effect = function (e) {
        };
        Object.defineProperty(Sprite.prototype, "frame", {
            get: function () {
                return this._frame;
            },
            set: function (frame) {
                this._frame = frame;
                this.frameX = (frame * this.frameWidth) % this.image.width;
                this.frameY = Math.floor(frame / (this.image.width / this.frameWidth)) * this.frameHeight;
            },
            enumerable: true,
            configurable: true
        });
        Sprite.prototype.update = function (delta) {
        };
        Sprite.prototype.updatePosition = function (delta) {
            var moveDistance = this.speed * delta;
            this.oldPos.setN(this.x, this.y);
            this.x += Math.round(moveDistance * this.direction.x);
            this.y += Math.round(moveDistance * this.direction.y);
        };
        Sprite.prototype.checkCollisionAndMove = function (obj) {
            var myBounds = this.boundingRect;
            var yourBounds = obj.boundingRect;
            var x = this.x;
            var y = this.y;
            var oldPos = this.oldPos;
            var newPos = new vs.Vec2(x, y);
            var boundX = this.boundX;
            var boundY = this.boundY;
            var boundW = this.boundWidth;
            var boundH = this.boundHeight;
            var width = this.boundWidth * 0.5;
            var height = this.boundHeight * 0.5;
            myBounds.x = x + boundX;
            myBounds.y = oldPos.y + boundY;
            var diff;
            var collision = false;
            if(myBounds.intersects(yourBounds)) {
                collision = true;
                diff = myBounds.x - yourBounds.x;
                if(x > oldPos.x) {
                    newPos.x = yourBounds.x - (boundX + boundW);
                } else {
                    if(x < oldPos.x) {
                        newPos.x = yourBounds.x + yourBounds.width + (boundX + boundW);
                    }
                }
            }
            myBounds.x = this.oldPos.x + this.boundX;
            myBounds.y = this.y + this.boundY;
            if(myBounds.intersects(yourBounds)) {
                collision = true;
                diff = myBounds.y - yourBounds.y;
                if(y > oldPos.y) {
                    newPos.y = yourBounds.y - (boundX + boundW);
                } else {
                    if(y < oldPos.y) {
                        newPos.y = yourBounds.y + yourBounds.width + (boundX + boundW);
                    }
                }
            }
            this.x = newPos.x;
            this.y = newPos.y;
            return collision;
        };
        Sprite.prototype.render = function (ctx) {
            ctx.translate(this.x, this.y);
            var rotAmt = vs.Util.degToRad(this.rotation);
            ctx.rotate(rotAmt);
            ctx.globalAlpha = this.alpha;
            ctx.globalCompositeOperation = this.compositeMode;
            ctx.drawImage(this.image, this.frameX, this.frameY, this.frameWidth, this.frameHeight, -this.regX, -this.regY, this.frameWidth * this.scaleX, this.frameHeight * this.scaleY);
            ctx.rotate(-rotAmt);
            if(vs.D.drawBoundsBox) {
                var boundsBox = this.boundingBox;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(boundsBox.min.x - this.x, boundsBox.min.y - this.y, boundsBox.max.x - boundsBox.min.x, boundsBox.max.y - boundsBox.min.y);
                ctx.stroke();
            }
            if(vs.D.drawBoundsRect) {
                var boundsRect = this.boundingRect;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(boundsRect.x - this.x, boundsRect.y - this.y, boundsRect.width, boundsRect.height);
                ctx.stroke();
            }
            if(vs.D.drawCenter) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(-1, -1, 2, 2);
                ctx.stroke();
            }
        };
        Sprite.prototype.remove = function () {
        };
        return Sprite;
    })();
    vs.Sprite = Sprite;    
    var AnimatedSprite = (function (_super) {
        __extends(AnimatedSprite, _super);
        function AnimatedSprite(x, y, imageName, frameWidth, frameHeight) {
                _super.call(this, x, y, imageName);
            this.frameCounter = 0;
            this.numFrames = 1;
            this.width = 0;
            this.start = 0;
            this.end = 0;
            this.lastUpdate = 0;
            this.frequency = 1;
            this.frameWidth = frameWidth || 64;
            this.frameHeight = frameHeight || 64;
            this.width = this.image.width;
            this.numFrames = (this.image.width / this.frameWidth) * (this.image.height / this.frameHeight);
            this.end = this.numFrames - 1;
            this.canvas = document.createElement("canvas");
            this.drawCache();
            this.animations = [];
            this.addAnimation("default", [
                0, 
                this.end
            ], "default", 12);
            this.gotoAndPlay("default");
        }
        AnimatedSprite.prototype.drawCache = function () {
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;
            var ctx = this.canvas.getContext("2d");
            ctx.drawImage(this.image, 0, 0);
        };
        AnimatedSprite.prototype.update = function (delta) {
        };
        AnimatedSprite.prototype.addAnimation = function (name, frames, next, speed) {
            var anim = {
                name: name,
                frames: frames,
                next: next,
                speed: speed
            };
            this.animations[anim.name] = anim;
        };
        AnimatedSprite.prototype.gotoAndPlay = function (name) {
            this.setAnimation(name);
            this.frame = this.start;
        };
        AnimatedSprite.prototype.setAnimation = function (name) {
            var anim = this.animations[name];
            this.currentAnim = anim.name;
            this.start = anim.frames[0];
            this.end = anim.frames[(anim.frames.length - 1)];
            this.frequency = (1000 / anim.speed);
        };
        AnimatedSprite.prototype.getAnimation = function () {
            return this.currentAnim;
        };
        AnimatedSprite.prototype.incrementFrame = function () {
            var anim = this.animations[this.currentAnim];
            if(anim.frames.length == 2) {
                this.frame++;
                if(this.frame >= this.numFrames) {
                    this.frame = this.start;
                }
                if(this.frame > this.end) {
                    if(anim.next !== this.currentAnim) {
                        this.gotoAndPlay(anim.next);
                    } else {
                        this.frame = this.start;
                    }
                }
            } else {
                if(this.frameCounter >= anim.frames.length) {
                    if(anim.next !== this.currentAnim) {
                        this.gotoAndPlay(anim.next);
                    } else {
                        this.frameCounter = 0;
                    }
                }
                this.frame = anim.frames[this.frameCounter];
                this.frameCounter++;
                if(this.frame >= this.numFrames) {
                    console.log("Problem with animation: " + this.currentAnim + " . Frame does not exist. Setting frame to 0");
                    this.frame = 0;
                }
            }
        };
        AnimatedSprite.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
            if(Date.now() - this.lastUpdate > this.frequency) {
                if(!vs.Game.game.paused) {
                    this.incrementFrame();
                    this.lastUpdate = Date.now();
                }
            }
        };
        return AnimatedSprite;
    })(Sprite);
    vs.AnimatedSprite = AnimatedSprite;    
    var Shape = (function (_super) {
        __extends(Shape, _super);
        function Shape(x, y, width, height) {
                _super.call(this, x, y, "noimage");
            this.cacheDrawn = false;
            this.cacheCanvas = document.createElement("canvas");
            this.cacheCanvas.width = width;
            this.cacheCanvas.height = height;
            this.width = width;
            this.height = height;
        }
        Shape.prototype.draw = function (ctx) {
        };
        Shape.prototype.render = function (ctx) {
            var cacheCtx = this.cacheCanvas.getContext("2d");
            if(!this.cacheDrawn) {
                this.draw(cacheCtx);
            }
            this.cacheDrawn = true;
            ctx.translate(this.x, this.y);
            var rotAmt = vs.Util.degToRad(this._rotation);
            ctx.rotate(rotAmt);
            ctx.globalAlpha = this.alpha;
            ctx.globalCompositeOperation = this.compositeMode;
            ctx.drawImage(this.cacheCanvas, 0, 0, this.width, this.height, -this.regX, -this.regY, this.width * this.scaleX, this.height * this.scaleY);
            ctx.rotate(-rotAmt);
        };
        return Shape;
    })(Sprite);
    vs.Shape = Shape;    
    var ShapeRectangle = (function (_super) {
        __extends(ShapeRectangle, _super);
        function ShapeRectangle(x, y, width, height) {
                _super.call(this, x, y, width, height);
            this.stroke = true;
            this.fill = true;
            this.zIndex = 1;
            this.color = new vs.Color(0, 0, 0, 1);
            this.strokeColor = new vs.Color(255, 0, 0, 1);
        }
        ShapeRectangle.prototype.draw = function (ctx) {
            console.log("Drawing");
            ctx.fillStyle = this.color.toString();
            ctx.strokeStyle = this.strokeColor.toString();
            ctx.rect(0, 0, this.width, this.height);
            if(this.fill) {
                ctx.fill();
            }
            if(this.stroke) {
                ctx.stroke();
            }
        };
        return ShapeRectangle;
    })(Shape);
    vs.ShapeRectangle = ShapeRectangle;    
    var FOVTester = (function (_super) {
        __extends(FOVTester, _super);
        function FOVTester(x, y) {
                _super.call(this, x, y, 32, 32);
            this.regX = 16;
            this.regY = 16;
        }
        FOVTester.prototype.update = function (delta) {
            var inFOV = vs.Util.checkFOV(this, vs.Game.game.player);
            if(inFOV) {
                this.color.setRGB(0, 0, 255);
            } else {
                this.color.setRGB(255, 0, 0);
            }
            this.rotation += 1;
        };
        return FOVTester;
    })(ShapeRectangle);
    vs.FOVTester = FOVTester;    
    var RoomShape = (function (_super) {
        __extends(RoomShape, _super);
        function RoomShape(x, y, width, height) {
                _super.call(this, x, y, width, height);
            this.color.setRGB(60, 60, 255, 0.5);
        }
        return RoomShape;
    })(ShapeRectangle);
    vs.RoomShape = RoomShape;    
})(vs || (vs = {}));
