var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var CasterPoint = (function () {
        function CasterPoint(x, y, caster) {
            this._x = x;
            this._y = y;
            this.caster = caster;
        }
        Object.defineProperty(CasterPoint.prototype, "localX", {
            get: function () {
                return this._x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CasterPoint.prototype, "localY", {
            get: function () {
                return this._y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CasterPoint.prototype, "x", {
            get: function () {
                return this._x + this.caster.x;
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CasterPoint.prototype, "y", {
            get: function () {
                return this._y + this.caster.y;
            },
            set: function (y) {
                this._y = y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CasterPoint.prototype, "vec", {
            get: function () {
                return new vs.Vec2(this._x + this.caster.x, this._y + this.caster.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CasterPoint.prototype, "point", {
            get: function () {
                return new vs.Point(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CasterPoint.prototype, "pointLocal", {
            get: function () {
                return new vs.Point(this._x, this._y);
            },
            enumerable: true,
            configurable: true
        });
        return CasterPoint;
    })();
    vs.CasterPoint = CasterPoint;    
    var ShadowCaster = (function () {
        function ShadowCaster(x, y, points) {
            this.shadowDepth = 4;
            this.visible = true;
            this.exists = true;
            this.active = true;
            this.zIndex = 0;
            this._x = x;
            this._y = y;
            this.setPoints(points);
            this.calcCenter();
            this.calcBounds();
        }
        ShadowCaster.prototype.setPoints = function (points) {
            var _this = this;
            this.points = [];
            points.forEach(function (point, i, a) {
                var p = new CasterPoint(point.x, point.y, _this);
                _this.points.push(p);
            });
        };
        ShadowCaster.prototype.drawPath = function (ctx) {
            var p1 = this.points[0];
            ctx.moveTo(p1.x, p1.y);
            this.points.forEach(function (p, i, a) {
                ctx.lineTo(p.x, p.y);
            });
            ctx.lineTo(p1.x, p1.y);
        };
        ShadowCaster.prototype.drawNormals = function (ctx) {
            var p1 = this.points[0];
            var size = this.points.length;
            for(var i = 1; i <= size; i++) {
                if(i < size) {
                    var p2 = this.points[i];
                } else {
                    var p2 = this.points[0];
                }
                var pos = new vs.Vec2((p1.localX + p2.localX) * 0.5, (p1.localY + p2.localY) * 0.5);
                var dir = vs.Util.findDirV(p2.vec, p1.vec).turnRight().multN(10, 10);
                this.drawNormal(ctx, pos, dir);
                p1 = p2;
            }
        };
        ShadowCaster.prototype.drawNormal = function (ctx, pos, dir) {
            ctx.moveTo(pos.x, pos.y);
            var v = pos.add(dir);
            ctx.lineTo(v.x, v.y);
        };
        ShadowCaster.prototype.drawShadow = function (ctx, l) {
            var lV = l;
            var p1 = this.points[0].vec;
            var size = this.points.length;
            for(var i = 1; i <= size; i++) {
                if(i < size) {
                    var p2 = this.points[i].vec;
                } else {
                    var p2 = this.points[0].vec;
                }
                var normal = this.findNormal(p2, p1);
                var pointToLight = p2.sub(lV);
                if(normal.dot(pointToLight) > 0) {
                    this.projectLine(ctx, p1, p2, lV);
                }
                p1 = p2;
            }
        };
        ShadowCaster.prototype.findNormal = function (curr, prev) {
            return new vs.Vec2(curr.y - prev.y, curr.x - prev.x);
        };
        ShadowCaster.prototype.isInsideHalfPlane = function (p, p2, dir) {
            return p.sub(p2).dot(dir) >= 0;
        };
        ShadowCaster.prototype.projectLine = function (ctx, p1, p2, l) {
            var p3 = this.projectPoint(p1, l, this.shadowDepth);
            var p4 = this.projectPoint(p2, l, this.shadowDepth);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.lineTo(p2.x, p2.y);
        };
        ShadowCaster.prototype.update = function (delta) {
        };
        ShadowCaster.prototype.projectPoint = function (p1, p2, scale) {
            var lightToPoint = p1.sub(p2).multN(scale, scale);
            return p1.add(lightToPoint);
        };
        ShadowCaster.prototype.calcCenter = function () {
            var size = this.points.length;
            var sumX = 0;
            var sumY = 0;
            for(var i = 0; i < size; i++) {
                sumX += this.points[i].localX;
                sumY += this.points[i].localY;
            }
            this._cX = sumX / size;
            this._cY = sumY / size;
        };
        ShadowCaster.prototype.calcBounds = function () {
            var minX = 0;
            var minY = 0;
            var maxX = 0;
            var maxY = 0;
            var size = this.points.length;
            for(var i = 0; i < size; i++) {
                var p = this.points[i].pointLocal;
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
            }
            this._bounds = {
                min: new vs.Point(this.x + minX, this.y + minY),
                max: new vs.Point(this.x + maxX, this.y + maxY)
            };
        };
        ShadowCaster.prototype.collide = function (e, o) {
        };
        ShadowCaster.prototype.effect = function (e) {
        };
        Object.defineProperty(ShadowCaster.prototype, "affector", {
            get: function () {
                return {
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShadowCaster.prototype, "position", {
            get: function () {
                return new vs.Point(this.x, this.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShadowCaster.prototype, "positionCenter", {
            get: function () {
                return new vs.Point(this._x + this._cX, this._y + this._cY);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShadowCaster.prototype, "boundingBox", {
            get: function () {
                return this._bounds;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShadowCaster.prototype, "boundingRect", {
            get: function () {
                return new vs.Rect(this._bounds.min.x, this._bounds.min.y, this._bounds.max.x - this._bounds.min.x, this._bounds.max.y - this._bounds.max.y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShadowCaster.prototype, "centerX", {
            get: function () {
                return this._x + this._cX;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShadowCaster.prototype, "centerY", {
            get: function () {
                return this._y + this._cY;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShadowCaster.prototype, "x", {
            get: function () {
                return Math.floor(this._x);
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ShadowCaster.prototype, "y", {
            get: function () {
                return Math.floor(this._y);
            },
            set: function (y) {
                this._y = y;
            },
            enumerable: true,
            configurable: true
        });
        return ShadowCaster;
    })();
    vs.ShadowCaster = ShadowCaster;    
    var Light = (function () {
        function Light(engine, x, y, radius) {
            this.useImage = false;
            this.frameWidth = 0;
            this.frameHeight = 0;
            this.enableTint = false;
            this._intensity = 1;
            this._fog = 0.2;
            this.rotation = 0;
            this.drawShadows = false;
            this.drawWallShadow = false;
            this.limitFov = false;
            this.flicker = false;
            this._nextFlickIn = 0;
            this._flickerCounter = 0;
            this._isFlicker = false;
            this._priorIntensity = 1;
            this.visible = true;
            this._visible = true;
            this.animate = false;
            this.animSpeed = 1;
            this._frameCounter = 0;
            this.dynamic = true;
            this.enableFade = false;
            this.fadingOut = false;
            this.fadeTime = 1;
            this.fadeOut = false;
            this.fadeIn = false;
            this.fadeInTime = 1;
            this.fadeOutTime = 1;
            this.engine = engine;
            this._x = x;
            this._y = y;
            this.radius = radius;
            this.radius2 = radius * radius;
            this.useImage = false;
            this.color = new vs.Color(255, 255, 255, 0.2);
            this.flickerNext = new vs.Pair(0, 2);
            this.flickAlpha = new vs.Pair(0, 1);
        }
        Light.prototype.addImage = function (image, frame, frameWidth, frameHeight) {
            this.image = image;
            this.useImage = true;
            this.framePos = new vs.Point(0, 0);
            this.frameWidth = frameWidth;
            this.frameHeight = frameHeight;
            this.frame = frame;
        };
        Light.prototype.update = function (delta) {
            if(this.visible) {
                if(this.flicker) {
                    this.calcFlicker();
                }
                if(this.animate) {
                    this.animateFrames();
                }
                if(this.enableFade) {
                    this.fadeLight(delta);
                }
            }
        };
        Light.prototype.animateFrames = function () {
            this._frameCounter += vs.FPS.getDelta();
            if(this._frameCounter >= this.animSpeed) {
                if(this.frame < this.frames.b) {
                    this.frame++;
                } else {
                    this.frame = this.frames.a;
                }
                this._frameCounter = 0;
            }
        };
        Light.prototype.fadeLight = function (delta) {
            var change = delta / this.fadeTime;
            if(!this.fadeIn && !this.fadeOut) {
                if(this.fadingOut) {
                    this.intensity -= change;
                } else {
                    this.intensity += change;
                }
                if(this.intensity <= this.fadeToFrom.a || this.intensity >= this.fadeToFrom.b) {
                    this.fadingOut = !this.fadingOut;
                    if(this.intensity <= this.fadeToFrom.a) {
                        this.intensity = this.fadeToFrom.a;
                    }
                    if(this.intensity >= this.fadeToFrom.b) {
                        this.intensity = this.fadeToFrom.b;
                    }
                }
            } else {
                if(this.fadeIn) {
                    this.intensity += delta / this.fadeInTime;
                    if(this.intensity >= this.fadeToFrom.b) {
                        this.fadeIn = false;
                        this.fadingOut = true;
                        this.intensity = this.fadeToFrom.b;
                    }
                }
                if(this.fadeOut) {
                    this.intensity -= delta / this.fadeOutTime;
                    if(this.intensity < 0) {
                        this.intensity = 0;
                        this.visible = false;
                    }
                }
            }
        };
        Light.prototype.calcFlicker = function () {
            this._flickerCounter += vs.FPS.getDelta();
            if(this._flickerCounter > this._nextFlickIn) {
                if(!this._isFlicker) {
                    this._visible = false;
                    this._isFlicker = true;
                }
                this._nextFlickIn = vs.Random.lerpP(this.flickerNext);
                this._flickerCounter = 0;
            } else {
                if(this._isFlicker) {
                    this._visible = true;
                    this._isFlicker = false;
                }
            }
        };
        Light.prototype.setPos = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Object.defineProperty(Light.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (x) {
                var oldbox = this.renderer.boundingBox;
                this._x = x;
                this.engine.moveLight(this, oldbox);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Light.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (y) {
                var oldbox = this.renderer.boundingBox;
                this._y = y;
                this.engine.moveLight(this, oldbox);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Light.prototype, "vec", {
            get: function () {
                return new vs.Vec2(this._x, this._y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Light.prototype, "point", {
            get: function () {
                return new vs.Point(this._x, this._y);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Light.prototype, "frame", {
            get: function () {
                return this._frame;
            },
            set: function (frame) {
                this._frame = frame;
                this.framePos.x = (frame * this.frameWidth) % this.image.width;
                this.framePos.y = Math.floor((this.frame * this.frameHeight) / this.image.width);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Light.prototype, "intensity", {
            get: function () {
                return this._intensity;
            },
            set: function (v) {
                this._intensity = vs.Util.constrain(v, 0, 1);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Light.prototype, "fog", {
            get: function () {
                return this._fog;
            },
            set: function (v) {
                this._fog = vs.Util.constrain(v, 0, 1);
            },
            enumerable: true,
            configurable: true
        });
        return Light;
    })();
    vs.Light = Light;    
    var Flashlight = (function (_super) {
        __extends(Flashlight, _super);
        function Flashlight(engine, x, y, radius) {
                _super.call(this, engine, x, y, radius);
            var image = engine.imgFlashlight;
            this.addImage(image, 0, image.width, image.height);
            this.drawShadows = true;
            this.limitFov = true;
            this.drawWallShadow = true;
            this.centerX = 960;
            this.centerY = 1392;
            this.enableTint = false;
            this.intensity = 1;
            this.fog = 0.3;
        }
        return Flashlight;
    })(Light);
    vs.Flashlight = Flashlight;    
    var ParticleLight = (function (_super) {
        __extends(ParticleLight, _super);
        function ParticleLight(engine, x, y, frame, color, intensity) {
                _super.call(this, engine, x, y, 8);
            var image = engine.imgParticles;
            this.addImage(image, frame, 16, 16);
            this.color = color;
            this.enableTint = false;
            this.dynamic = false;
            this.intensity = vs.Random.lerpP(intensity);
            this.fog = this.intensity;
            this.drawShadows = false;
        }
        return ParticleLight;
    })(Light);
    vs.ParticleLight = ParticleLight;    
    var FlickerLight = (function (_super) {
        __extends(FlickerLight, _super);
        function FlickerLight(engine, x, y, radius, color) {
                _super.call(this, engine, x, y, radius);
            var image = engine.imgCircular;
            this.addImage(image, 0, 256, 256);
            this.flicker = true;
            this.dynamic = false;
            this.drawShadows = true;
            this.color = color;
            this.intensity = 1;
            this.fog = vs.Random.lerp(0, 1);
            this.enableTint = true;
            this.animate = true;
            this.frames = new vs.Pair(0, 2);
            this.animSpeed = 1 / 12;
            this.enableFade = true;
            this.fadeTime = vs.Random.lerp(1, 10);
            this.fadeToFrom = new vs.Pair(0, vs.Random.next());
        }
        return FlickerLight;
    })(Light);
    vs.FlickerLight = FlickerLight;    
    var RoomLight = (function (_super) {
        __extends(RoomLight, _super);
        function RoomLight(engine, x, y, radius) {
                _super.call(this, engine, x, y, radius);
            var image = engine.imgCircular;
            this.addImage(image, 0, 256, 256);
            if(vs.Random.next() < 0.5) {
                this.flicker = true;
            }
            this.drawShadows = true;
            this.color = vs.Color.random();
            this.intensity = 0;
            this.fadeIn = false;
            this.visible = false;
            this.fog = vs.Random.lerp(0, 0.5);
            this.fog = 0.2;
            this.enableTint = true;
            this.animate = true;
            this.frames = new vs.Pair(0, 2);
            this.animSpeed = 1 / 12;
            this.fadeInTime = vs.Random.lerp(0.4, 4);
            this.fadeOutTime = 1;
            this.enableFade = true;
            this.fadeTime = vs.Random.lerp(6, 20);
            this.fadeToFrom = new vs.Pair(vs.Random.lerp(0, 0.5), vs.Random.lerp(0.65, 1));
        }
        return RoomLight;
    })(Light);
    vs.RoomLight = RoomLight;    
    var LEDLight = (function (_super) {
        __extends(LEDLight, _super);
        function LEDLight(engine, x, y, color, radius, frame, enableFade, fadeToFrom, fadeTime) {
            if (typeof enableFade === "undefined") { enableFade = true; }
            if (typeof fadeTime === "undefined") { fadeTime = 1; }
                _super.call(this, engine, x, y, radius);
            var image = engine.imgParticles;
            this.addImage(image, frame, 16, 16);
            this.color = color;
            this.enableTint = true;
            this.animate = false;
            this.visible = true;
            this.fog = 1;
            this.enableFade = enableFade;
            this.fadeTime = fadeTime;
            this.intensity = 1;
            if(fadeToFrom) {
                this.fadeToFrom = fadeToFrom;
            } else {
                this.fadeToFrom = new vs.Pair(0, 1);
            }
        }
        return LEDLight;
    })(Light);
    vs.LEDLight = LEDLight;    
    var LightRenderer = (function () {
        function LightRenderer(light, engine) {
            this.prevFrame = 0;
            this.zIndex = 100;
            this.cacheDrawn = false;
            this.cacheCounter = 0;
            this.light = light;
            this.casters = engine.casters;
            this.casterMap = engine.casterMap;
            this.width = this.light.radius * 2;
            this.height = this.light.radius * 2;
            this.shadowMap = document.createElement("canvas");
            this.shadowMap.width = this.width;
            this.shadowMap.height = this.height;
            this.cache = document.createElement("canvas");
            this.cache.width = this.width;
            this.cache.height = this.height;
            this.maskCache = document.createElement("canvas");
            this.maskCache.width = this.width;
            this.maskCache.height = this.height;
            this.lightMask = document.createElement("canvas");
            this.lightMask.width = this.width;
            this.lightMask.height = this.height;
            this._cX = Math.floor(this.width * 0.5);
            this._cY = Math.floor(this.height * 0.5);
            if(this.light.centerX) {
                this._cX = Math.floor(this.width * (this.light.centerX / this.light.image.width));
            }
            if(this.light.centerY) {
                this._cY = Math.floor(this.height * (this.light.centerY / this.light.image.height));
            }
            this.oldPos = new vs.Vec2(0, 0);
            this.oldRot = 0;
            this.oldCastersCount = 0;
            this.drawLightMask();
        }
        Object.defineProperty(LightRenderer.prototype, "position", {
            get: function () {
                return new vs.Point(this.light.x, this.light.y);
            },
            set: function (p) {
                this.light.x = p.x;
                this.light.y = p.y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LightRenderer.prototype, "boundingBox", {
            get: function () {
                return {
                    min: new vs.Point(this.light.x - this.light.radius, this.light.y - this.light.radius),
                    max: new vs.Point(this.light.x + this.light.radius, this.light.y + this.light.radius)
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LightRenderer.prototype, "boundingRect", {
            get: function () {
                return new vs.Rect(this.light.x - this.light.radius, this.light.y - this.light.radius, this.light.radius * 2, this.light.radius * 2);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LightRenderer.prototype, "visible", {
            get: function () {
                return this.light.visible;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LightRenderer.prototype, "active", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LightRenderer.prototype, "exists", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LightRenderer.prototype, "affector", {
            get: function () {
                var affector = {
                };
                return affector;
            },
            enumerable: true,
            configurable: true
        });
        LightRenderer.prototype.collide = function (effect, obj) {
        };
        LightRenderer.prototype.effect = function (effect) {
        };
        LightRenderer.prototype.update = function (delta) {
        };
        LightRenderer.prototype.setPos = function (x, y) {
            this.light.x = x;
            this.light.y = y;
        };
        LightRenderer.prototype.setRotation = function (angle) {
            this.light.rotation = angle;
        };
        LightRenderer.prototype.drawLightMask = function () {
            var ctx = this.lightMask.getContext("2d");
            ctx.clearRect(0, 0, this.lightMask.width, this.lightMask.height);
            if(this.light.useImage) {
                var image = this.light.image;
                var width = this.light.frameWidth;
                var height = this.light.frameHeight;
                var scale = this.lightMask.width / width;
                var framePos = this.light.framePos;
                if(this.light.enableTint) {
                    image.render(ctx, this.light.color, framePos.x, framePos.y, width, height, 0, 0, width * scale, height * scale);
                } else {
                    image.renderNoTint(ctx, framePos.x, framePos.y, width, height, 0, 0, width * scale, height * scale);
                }
            } else {
                var grd = ctx.createRadialGradient(this._cX, this._cY, 4, this._cX, this._cY, this.light.radius);
                grd.addColorStop(0, vs.Util.rgba(200, 200, 255, 1));
                grd.addColorStop(1, vs.Util.rgba(0, 0, 0, 0));
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, this.lightMask.width, this.lightMask.height);
            }
            this.oldIntensity = this.light.intensity;
        };
        LightRenderer.prototype.render = function (light, ctx, bounds) {
            var cam = vs.Game.game.world.camera;
            if(this.light._visible && this.light.visible) {
                var drawLightMask = false;
                var drawCache = false;
                var drawShadowMap = false;
                var drawMask = false;
                if(!this.cacheDrawn) {
                    drawLightMask = true;
                    drawCache = true;
                    if(this.light.drawShadows) {
                        drawShadowMap = true;
                    }
                    drawMask = true;
                    this.cacheCounter++;
                    if(this.cacheCounter > 1) {
                        this.cacheDrawn = true;
                    }
                }
                if(this.light.frame !== this.prevFrame) {
                    drawLightMask = true;
                    drawMask = true;
                }
                if(this.oldIntensity !== this.light.intensity) {
                    drawMask = true;
                }
                if(this.light.rotation !== this.oldRot) {
                    drawCache = true;
                    drawMask = true;
                }
                if(this.light.drawShadows) {
                    if(this.light.x !== this.oldPos.x || this.light.y !== this.oldPos.y || this.casters.size() !== this.oldCastersCount) {
                        drawShadowMap = true;
                        drawMask = true;
                    }
                }
                if(drawLightMask) {
                    this.drawLightMask();
                }
                if(drawCache) {
                    this.drawCache();
                }
                if(drawShadowMap) {
                    this.drawShadowMap();
                }
                if(drawMask) {
                    this.drawMask();
                }
                var x = this.light.x - bounds.x - this.light.radius;
                var y = this.light.y - bounds.y - this.light.radius;
                light.globalCompositeOperation = "lighter";
                light.globalAlpha = this.light.fog;
                light.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height, Math.floor(x * cam.scale), Math.floor(y * cam.scale), Math.floor(this.cache.width * cam.scale), Math.floor(this.cache.height * cam.scale));
                ctx.globalCompositeOperation = "destination-out";
                ctx.drawImage(this.maskCache, 0, 0, this.cache.width, this.cache.height, Math.floor(x * cam.scale), Math.floor(y * cam.scale), Math.floor(this.cache.width * cam.scale), Math.floor(this.cache.height * cam.scale));
            }
            this.prevFrame = this.light.frame;
            this.light.update(vs.FPS.getDelta());
        };
        LightRenderer.prototype.drawLight = function (ctx, xOff, yOff, width, height) {
            ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, xOff, yOff, width, height);
        };
        LightRenderer.prototype.drawMask = function () {
            var ctx = this.maskCache.getContext("2d");
            ctx.clearRect(0, 0, this.cache.width, this.cache.height);
            ctx.save();
            var cX = this.cache.width * 0.5;
            var cY = this.cache.height * 0.5;
            ctx.translate(cX, cY);
            ctx.rotate(vs.Util.degToRad(this.light.rotation));
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = this.light.intensity;
            ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, -this._cX, -this._cY, this.lightMask.width, this.lightMask.height);
            ctx.restore();
            if(this.light.drawShadows) {
                ctx.globalCompositeOperation = "destination-out";
                ctx.drawImage(this.shadowMap, 0, 0);
            }
        };
        LightRenderer.prototype.drawCache = function () {
            var ctx = this.cache.getContext("2d");
            ctx.clearRect(0, 0, this.cache.width, this.cache.height);
            ctx.save();
            var cX = this.cache.width * 0.5;
            var cY = this.cache.height * 0.5;
            ctx.translate(cX, cY);
            ctx.rotate(vs.Util.degToRad(this.light.rotation));
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, -this._cX, -this._cY, this.lightMask.width, this.lightMask.height);
            ctx.restore();
        };
        LightRenderer.prototype.drawShadowMap = function () {
            var _this = this;
            var ctx = this.shadowMap.getContext("2d");
            var r2 = this.light.radius2;
            ctx.save();
            ctx.clearRect(0, 0, this.shadowMap.width, this.shadowMap.height);
            ctx.beginPath();
            ctx.fillStyle = vs.Util.rgba(0, 0, 0, 1);
            ctx.setTransform(1, 0, 0, 1, -(this.light.x - this.light.radius), -(this.light.y - this.light.radius));
            var casters = this.casterMap.getRadius(this.light.x, this.light.y, this.light.radius);
            var pos = new vs.Point(this.light.x, this.light.y);
            var minDist = this.light.radius2;
            casters.forEach(function (caster) {
                caster.drawShadow(ctx, _this.light.vec);
                var cDist = pos.distanceTo2(caster.centerX, caster.centerY);
                if(cDist < minDist) {
                    minDist = cDist;
                }
            });
            ctx.fill();
            ctx.beginPath();
            if(this.light.drawWallShadow) {
                ctx.globalCompositeOperation = "destination-out";
            } else {
                ctx.globalCompositeOperation = "source-over";
            }
            casters.forEach(function (caster, i, a) {
                caster.drawPath(ctx);
            });
            ctx.fill();
            if(this.light.drawWallShadow) {
                ctx.globalCompositeOperation = "source-over";
                var rad = Math.sqrt(minDist) + 32;
                var grd = ctx.createRadialGradient(this.light.x, this.light.y, 1, this.light.x, this.light.y, Math.max(rad, 32));
                grd.addColorStop(0, vs.Util.rgba(0, 0, 0, 0));
                grd.addColorStop(1, vs.Util.rgba(0, 0, 0, 1));
                ctx.fillStyle = grd;
                ctx.fill();
            }
            ctx.restore();
            this.oldPos = this.light.vec;
            this.oldRot = this.light.rotation;
            this.oldCastersCount = this.casters.size();
        };
        LightRenderer.prototype.isCasterVisible = function (caster) {
            if(vs.Util.dist2(this.light.x, this.light.y, caster.centerX, caster.centerY) < this.light.radius2) {
                return true;
            } else {
                return false;
            }
        };
        return LightRenderer;
    })();
    vs.LightRenderer = LightRenderer;    
    var LightType = (function () {
        function LightType() { }
        LightType.DEFAULT = 0;
        LightType.FLASHLIGHT = 1;
        return LightType;
    })();
    vs.LightType = LightType;    
    var LightEngine = (function () {
        function LightEngine(game) {
            this.game = game;
            this.casters = new vs.LinkedList();
            this.casterMap = new vs.SpatialHash(32);
            this.lightRenderers = new vs.SpatialHash(32);
            this.compositeLayer = document.createElement("canvas");
            this.compositeLayer.width = 400;
            this.compositeLayer.height = 400;
            this.lightLayer = document.createElement("canvas");
            this.lightLayer.width = 400;
            this.lightLayer.height = 400;
            this.shadowLayer = document.createElement("canvas");
            this.shadowLayer.width = 400;
            this.shadowLayer.height = 400;
            this.createTintImages();
        }
        LightEngine.prototype.createTintImages = function () {
            this.imgFlashlight = new vs.TintImage(this.game.assets.images["flashlightMask"]);
            this.imgParticles = new vs.TintImage(this.game.assets.images["particleLights"]);
            this.imgCircular = new vs.TintImage(this.game.assets.images["circularLight"]);
        };
        LightEngine.prototype.reset = function () {
            this.casters.clear();
            this.casterMap.clear();
            this.lightRenderers.clear();
        };
        LightEngine.prototype.add = function (light) {
            var renderer = new LightRenderer(light, this);
            light.renderer = renderer;
            this.lightRenderers.add(renderer);
            return light;
        };
        LightEngine.prototype.remove = function (light) {
            this.removeRenderer(light.renderer);
            return light;
        };
        LightEngine.prototype.moveLight = function (light, oldBox) {
            this.lightRenderers.removeBox(oldBox, light.renderer);
            this.lightRenderers.add(light.renderer);
        };
        LightEngine.prototype.createLight = function (x, y, radius, type) {
            var type = type || LightType.DEFAULT;
            var light;
            switch(type) {
                case LightType.DEFAULT: {
                    light = new Light(this, x, y, radius);
                    break;

                }
                case LightType.FLASHLIGHT: {
                    light = new Flashlight(this, x, y, radius);
                    break;

                }
            }
            return this.add(light);
            ; ;
        };
        LightEngine.prototype.removeRenderer = function (renderer) {
            this.lightRenderers.remove(renderer);
        };
        LightEngine.prototype.createCaster = function (x, y, points) {
            var caster = new ShadowCaster(x, y, points);
            this.casters.append(caster);
            this.casterMap.add(caster);
            return caster;
        };
        LightEngine.prototype.createCasterRect = function (x, y, width, height, regX, regY) {
            if (typeof regX === "undefined") { regX = 0; }
            if (typeof regY === "undefined") { regY = 0; }
            var points = [
                new vs.Point(-regX, -regY), 
                new vs.Point(-regX + width, -regY), 
                new vs.Point(-regX + width, -regY + height), 
                new vs.Point(-regX, -regY + height)
            ];
            return this.createCaster(x, y, points);
        };
        LightEngine.prototype.drawCasters = function (ctx, bounds) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.fillStyle = "rgba(100,100,100,0.9)";
            ctx.lineWidth = 4;
            var radius = 200;
            var center = bounds.getCenter();
            ctx.arc(-bounds.x + center.x, -bounds.y + center.y, radius, 0, 2 * Math.PI);
            this.casters.forEach(function (caster, i) {
                if(center.distanceTo(caster.centerX, caster.centerY) < radius) {
                    ctx.setTransform(1, 0, 0, 1, -bounds.x + 0.5, -bounds.y + 0.5);
                    ctx.rect(caster.centerX, caster.centerY, 4, 4);
                    caster.drawPath(ctx);
                }
            });
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };
        LightEngine.prototype.render = function (ctx, bounds, paused) {
            var game = vs.Game.game;
            var cam = game.world.camera;
            if(this.compositeLayer.width != game.width || this.compositeLayer.height != game.height) {
                this.compositeLayer.width = game.width;
                this.compositeLayer.height = game.height;
                this.lightLayer.width = game.width;
                this.lightLayer.height = game.height;
            }
            var light = this.lightLayer.getContext("2d");
            light.clearRect(0, 0, this.compositeLayer.width, this.compositeLayer.height);
            var comp = this.compositeLayer.getContext("2d");
            comp.clearRect(0, 0, this.compositeLayer.width, this.compositeLayer.height);
            comp.globalCompositeOperation = "source-over";
            comp.fillStyle = "black";
            comp.fillRect(0, 0, this.compositeLayer.width, this.compositeLayer.height);
            this.renderLights(light, comp, bounds);
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(this.lightLayer, 0, 0);
            ctx.drawImage(this.compositeLayer, 0, 0);
        };
        LightEngine.prototype.renderLights = function (light, ctx, b) {
            var visibleLights = this.lightRenderers.getArea(b.x, b.y, b.width, b.height);
            visibleLights.forEach(function (r) {
                r.render(light, ctx, b);
            });
        };
        return LightEngine;
    })();
    vs.LightEngine = LightEngine;    
})(vs || (vs = {}));
