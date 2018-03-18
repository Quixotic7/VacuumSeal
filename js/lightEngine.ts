module vs {
    export class CasterPoint {
        private _x: number;
        private _y: number;

        
        
        private caster: ShadowCaster;
        constructor (x: number, y: number, caster: ShadowCaster) {
            this._x = x;
            this._y = y;
            this.caster = caster;
            
        }
        
        get localX() {
            return this._x;
        }
        get localY() {
            return this._y;
        }
        get x() {
            return this._x + this.caster.x;
        }
        set x(x: number) {
            this._x = x;
        }
        get y() {
            return this._y + this.caster.y;
        }
        set y(y: number) {
            this._y = y;
        }
        get vec() {
            return new Vec2(this._x + this.caster.x, this._y + this.caster.y);
        }
        
        get point() {
            return new Point(this.x, this.y);
        }

        get pointLocal() {
            return new Point(this._x, this._y);
        }
        

    }

    export class ShadowCaster implements GameObject {
        private _x: number;
        private _y: number;
        private _cX: number;
        private _cY: number;
        private _bounds: Box;
        points: CasterPoint[];
        shadowDepth: number = 4;
        visible: bool = true;
        exists: bool = true;
        active: bool = true;
        zIndex: number = 0;

        constructor (x: number, y: number,  points: Point[]) {
            this._x = x;
            this._y = y;
            
            this.setPoints(points);
            this.calcCenter();
            this.calcBounds();
        }

        setPoints(points: Point[]) {
            this.points = [];
            points.forEach((point: Point, i, a) =>{
                var p = new CasterPoint(point.x, point.y, this);
                this.points.push(p);
            });
        }

        // this draws a path representing the caster to the context
        // but does not stroke or fill it
        // ctx.stroke() will need to be called to stroke the paths
        drawPath(ctx: CanvasRenderingContext2D) {
            // ctx.translate(this._x, this._y);
            // this.drawNormals(ctx);
            var p1 = this.points[0];
            ctx.moveTo(p1.x, p1.y);
            this.points.forEach((p: CasterPoint, i, a) =>{
                ctx.lineTo(p.x, p.y);
            });
            ctx.lineTo(p1.x, p1.y);
        }
        
        drawNormals(ctx: CanvasRenderingContext2D) {
            var p1 = this.points[0];
            // var v1 = p1.vec;
            var size = this.points.length;
            for (var i = 1; i <= size; i++) {
                if(i < size)
                    var p2 = this.points[i];
                else
                    var p2 = this.points[0];
                var pos = new Vec2((p1.localX + p2.localX) * 0.5, (p1.localY + p2.localY) * 0.5);
                var dir = Util.findDirV(p2.vec, p1.vec).turnRight().multN(10,10);
                this.drawNormal(ctx, pos, dir);
                p1 = p2;
            }
        }

        drawNormal(ctx: CanvasRenderingContext2D, pos: Vec2, dir: Vec2) {
            ctx.moveTo(pos.x, pos.y);
            var v = pos.add(dir);
            ctx.lineTo(v.x, v.y);
        }

        drawShadow(ctx: CanvasRenderingContext2D, l:Vec2) {
            // ctx.translate(this._x, this._y);
            // this.drawNormals(ctx);

            // var lV = new Vec2(l.x - this._x, l.y - this._y);
            var lV = l;

            var p1 = this.points[0].vec;
            var size = this.points.length;
            for (var i = 1; i <= size; i++) {
                if(i < size)
                    var p2 = this.points[i].vec;
                else
                    var p2 = this.points[0].vec;
                //var dir = Util.findDirV(p2, p1).turnRight()

                var normal = this.findNormal(p2, p1);
                var pointToLight = p2.sub(lV);

                if (normal.dot(pointToLight) > 0) {
                    this.projectLine(ctx, p1, p2, lV);
                }
                p1 = p2;
            }
        }

        // Finds the point of the line segment made from the previous point to the current
        findNormal(curr: Vec2, prev: Vec2) {
            return new Vec2(curr.y - prev.y, curr.x - prev.x);
        }

        isInsideHalfPlane(p: Vec2, p2: Vec2, dir: Vec2) {
            return p.sub(p2).dot(dir) >= 0;
        }

        projectLine(ctx: CanvasRenderingContext2D, p1: Vec2, p2: Vec2, l: Vec2) {
            // var scale = 10;
            var p3 = this.projectPoint(p1, l, this.shadowDepth);
            var p4 = this.projectPoint(p2, l, this.shadowDepth);

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.lineTo(p4.x, p4.y);
            ctx.lineTo(p2.x, p2.y);
            // ctx.lineTo(p1.x, p1.y);
        }

        update(delta?:number) {
        }

        projectPoint(p1: Vec2, p2: Vec2, scale: number) {
            var lightToPoint = p1.sub(p2).multN(scale,scale);
            return p1.add(lightToPoint);
        }

        calcCenter() {
            var size = this.points.length;
            var sumX = 0;
            var sumY = 0;
            for (var i = 0; i < size; i++) {
                sumX += this.points[i].localX;
                sumY += this.points[i].localY;
            }
            this._cX = sumX / size;
            this._cY = sumY / size;
        }

        calcBounds() {
            var minX: number = 0;
            var minY: number = 0;
            var maxX: number = 0;
            var maxY: number = 0;
            
            var size = this.points.length;
            for (var i = 0; i < size; i++) {
                var p = this.points[i].pointLocal;
                minX = Math.min(minX, p.x);
                minY = Math.min(minY, p.y);
                maxX = Math.max(maxX, p.x);
                maxY = Math.max(maxY, p.y);
            }

            
            this._bounds = { min: new Point(this.x + minX, this.y + minY), max: new Point(this.x + maxX, this.y + maxY) };
            // console.log("Bounds: "
        }

        collide(e: Effect, o:GameObject) {
        
        }

        effect(e: Effect) {
        }

        get affector() {
            return {};
        }

        get position() {
            return new Point(this.x, this.y);
        }
        get positionCenter() {
            return new Point(this._x + this._cX, this._y + this._cY);
        }
        get boundingBox() {
            return this._bounds;
        }
        get boundingRect() {
            return new Rect(this._bounds.min.x, this._bounds.min.y, this._bounds.max.x - this._bounds.min.x, this._bounds.max.y - this._bounds.max.y);
        }
        get centerX() {
            return this._x + this._cX;
        }
        get centerY() {
            return this._y + this._cY;
        }
        get x() {
            return Math.floor(this._x);
        }
        set x(x: number) {
            this._x = x;
        }
        get y() {
            return Math.floor(this._y);
        }
        set y(y: number) {
            this._y = y;
        }
    }

    export class Light {
        _x: number;
        _y: number;
        centerX: number;
        centerY: number;
        radius: number;
        radius2: number;
        useImage: bool = false;
        _frame: number;
        framePos: Point;
        frameWidth: number = 0;
        frameHeight: number = 0;
        image: TintImage;
        enableTint: bool = false;
        _intensity: number = 1;
        color: Color;
        _fog: number = 0.2;
        rotation: number = 0;
        drawShadows: bool = false;
        drawWallShadow: bool = false;
        limitFov: bool = false;
        game: Game;
        engine: LightEngine;
        renderer: LightRenderer;

        flicker: bool = false;
        flickAlpha: Pair; // Range for the flick alpha between 0 and 1
        flickerNext: Pair; // Range for time in seconds till next flick
        _nextFlickIn: number = 0;
        _flickerCounter: number = 0;
        _isFlicker: bool = false;
        _priorIntensity: number = 1;
        visible: bool = true;
        _visible: bool = true; // internal visible for flicker to use


        animate: bool = false;
        frames: Pair;
        animSpeed: number = 1;
        _frameCounter: number = 0;

        dynamic: bool = true;

        enableFade: bool = false;
        fadingOut: bool = false;
        fadeTime: number = 1;
        fadeToFrom: Pair;
        fadeOut: bool = false;
        fadeIn: bool = false;
        fadeInTime: number = 1;
        fadeOutTime: number = 1;


        constructor (engine:LightEngine, x: number, y: number, radius: number) {
            this.engine = engine;
            //this.game = game;
            this._x = x; 
            this._y = y;
            this.radius = radius;
            this.radius2 = radius * radius;
            this.useImage = false;
            this.color = new Color(255, 255, 255, 0.2);
            this.flickerNext = new Pair(0, 2);
            this.flickAlpha = new Pair(0, 1);
        }

        addImage(image:TintImage, frame:number, frameWidth:number, frameHeight:number) {
            this.image = image;
            this.useImage = true;
            this.framePos = new Point(0, 0);
            this.frameWidth = frameWidth;
            this.frameHeight = frameHeight;
            this.frame = frame;
        }

        update(delta?: number) {
            if (this.visible) {
                if (this.flicker)this.calcFlicker();
                if (this.animate) this.animateFrames();
                if (this.enableFade) this.fadeLight(delta);
            }
        }

        animateFrames() {
            this._frameCounter += FPS.getDelta();
            if (this._frameCounter >= this.animSpeed) {
                if (this.frame < this.frames.b) {
                    this.frame++;
                } else {
                    this.frame = this.frames.a;
                }
                this._frameCounter = 0;
            }
        }

        fadeLight(delta:number) {
            var change = delta / this.fadeTime;
            
            if (!this.fadeIn && !this.fadeOut) {
                if (this.fadingOut) {
                    this.intensity -= change;
                } else {
                    this.intensity += change;
                }
                if (this.intensity <= this.fadeToFrom.a || this.intensity >= this.fadeToFrom.b) {
                    this.fadingOut = !this.fadingOut;
                    if (this.intensity <= this.fadeToFrom.a) this.intensity = this.fadeToFrom.a;
                    if (this.intensity >= this.fadeToFrom.b) this.intensity = this.fadeToFrom.b;
                }
            } else {
                if (this.fadeIn) {
                    this.intensity += delta / this.fadeInTime;
                    if (this.intensity >= this.fadeToFrom.b) {
                        this.fadeIn = false;
                        this.fadingOut = true;
                        this.intensity = this.fadeToFrom.b;
                    }
                }
                if (this.fadeOut) {
                    this.intensity -= delta / this.fadeOutTime;
                    if (this.intensity < 0) {
                        this.intensity = 0;
                        this.visible = false;
                    }
                }
            }
        }

        calcFlicker() {
            this._flickerCounter += FPS.getDelta();
            //if (this._flickerCounter > this._nextFlickIn) {
            //    if (!this._isFlicker) {
            //        this._priorIntensity = this.intensity;
            //        // this.intensity = Random.lerpP(this.flickAlpha);
            //        this.visible = false;
            //        this._isFlicker = true;
            //        // this.frame = Random.rangeP(this.frames);
            //    } 
                
            //    this._nextFlickIn = Random.lerpP(this.flickerNext);
            //    this._flickerCounter = 0;
            //} else if (this._isFlicker) {
            //    // this.intensity = this._priorIntensity;
            //    this.visible = true;
            //    this._isFlicker = false;
            //}


            if (this._flickerCounter > this._nextFlickIn) {
                if (!this._isFlicker) {
                    // this._priorIntensity = this.intensity;
                    // this.intensity = Random.lerpP(this.flickAlpha);
                    this._visible = false;
                    this._isFlicker = true;
                    // this.frame = Random.rangeP(this.frames);
                } 
                
                this._nextFlickIn = Random.lerpP(this.flickerNext);
                this._flickerCounter = 0;
            } else if (this._isFlicker) {
                // this.intensity = this._priorIntensity;
                this._visible = true;
                this._isFlicker = false;
            }
        }

        setPos(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        get x() { return this._x; }
        set x(x: number) { 
            var oldbox = this.renderer.boundingBox;
            this._x = x; 
            this.engine.moveLight(this, oldbox);
        }
        get y() { return this._y; }
        set y(y: number) { 
            var oldbox = this.renderer.boundingBox;
            this._y = y;
            this.engine.moveLight(this, oldbox);
        }
        get vec() { return new Vec2(this._x, this._y); }
        get point() { return new Point(this._x, this._y); }

        set frame(frame:number) {
            this._frame = frame;
            this.framePos.x = (frame * this.frameWidth) % this.image.width;
            this.framePos.y = Math.floor((this.frame * this.frameHeight) / this.image.width);
        }
        get frame() {
            return this._frame;
        }
        get intensity() {
            return this._intensity;
        }
        set intensity(v:number) {
            this._intensity = Util.constrain(v, 0, 1);
        }
        get fog() {
            return this._fog;
        }
        set fog(v: number) {
            this._fog = Util.constrain(v, 0, 1);
        }
    }

    export class Flashlight extends Light {
        constructor (engine:LightEngine, x: number, y: number, radius: number) {
            super(engine, x, y, radius);
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
    }

    export class ParticleLight extends Light {
        constructor (engine:LightEngine, x: number, y: number, frame:number, color:Color, intensity:Pair) {
            super(engine, x, y, 8);
            var image = engine.imgParticles;
            this.addImage(image, frame, 16, 16);
            this.color = color;
            this.enableTint = false;
            this.dynamic = false;
            this.intensity = Random.lerpP(intensity);
            this.fog = this.intensity;
            this.drawShadows = false;
        }
    }

    export class FlickerLight extends Light {
        constructor (engine: LightEngine, x: number, y: number, radius: number, color: Color) {
            super(engine, x, y, radius);
            var image = engine.imgCircular;
            this.addImage(image, 0, 256, 256);
            this.flicker = true;
            this.dynamic = false;
            this.drawShadows = true;
            this.color = color;
            this.intensity = 1;
            this.fog = Random.lerp(0, 1);
            this.enableTint = true;
            this.animate = true;
            this.frames = new Pair(0, 2);
            this.animSpeed = 1 / 12;

            this.enableFade = true;
            this.fadeTime = Random.lerp(1,10);

            this.fadeToFrom = new Pair(0, Random.next());
        }
    }

    export class RoomLight extends Light {
        constructor (engine: LightEngine, x: number, y: number, radius: number) {
            super(engine, x, y, radius);
            var image = engine.imgCircular;
            this.addImage(image, 0, 256, 256);

            if(Random.next() < 0.5)
                this.flicker = true;

            this.drawShadows = true;
            this.color = Color.random();
            this.intensity = 0;
            this.fadeIn = false;
            this.visible = false;
            this.fog = Random.lerp(0, 0.5);
            this.fog = 0.2;
            this.enableTint = true;
            this.animate = true;
            this.frames = new Pair(0, 2);
            this.animSpeed = 1 / 12;

            this.fadeInTime = Random.lerp(0.4,4);
            this.fadeOutTime = 1;


            this.enableFade = true;
            this.fadeTime = Random.lerp(6,20);

            this.fadeToFrom = new Pair(Random.lerp(0,0.5), Random.lerp(0.65, 1));
        }
        
    }

    export class LEDLight extends Light {
        

        constructor (engine: LightEngine, x: number, y: number, color:Color, radius: number, frame:number, enableFade?:bool = true, fadeToFrom?:Pair, fadeTime?:number = 1) {
            super(engine, x, y, radius);
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
            if (fadeToFrom) {
                this.fadeToFrom = fadeToFrom;
            } else {
                this.fadeToFrom = new Pair(0, 1);
            }
            //this.frameWidth = this.frameHeight = 8;
            //this.frame = 1;

            //var image = engine.imgParticles;
            //this.addImage(image, frame, 16, 16);
            //this.color = color;
            //this.enableTint = false;
            //this.dynamic = false;
            //this.intensity = Random.lerp(0.2, 1);
            //this.drawShadows = false;

            
        }
    }

    export class LightRenderer implements GameObject {
        light: Light;
        oldPos: Vec2;
        oldCastersCount: number;
        oldRot: number;
        oldIntensity: number;
        prevFrame: number = 0;
        casters: LinkedList;
        casterMap: SpatialHash;
        shadowMap: HTMLCanvasElement;
        lightMask: HTMLCanvasElement;
        cache: HTMLCanvasElement;
        maskCache: HTMLCanvasElement;
        zIndex: number = 100;

        _cX: number;
        _cY: number;
        width: number;
        height: number;
        cacheDrawn: bool = false;

        // For some reason the cache doesn't always get drawn, we'll redraw it a couple times before caching it
        cacheCounter: number = 0;

        constructor (light: Light, engine:LightEngine) {
            this.light = light;
            this.casters = engine.casters;
            this.casterMap = engine.casterMap;
            this.width = this.light.radius * 2;
            this.height = this.light.radius * 2;

            this.shadowMap = <HTMLCanvasElement>document.createElement("canvas");
            this.shadowMap.width = this.width;
            this.shadowMap.height = this.height;

            this.cache = <HTMLCanvasElement>document.createElement("canvas");
            this.cache.width = this.width;
            this.cache.height = this.height;

            this.maskCache = <HTMLCanvasElement>document.createElement("canvas");
            this.maskCache.width = this.width;
            this.maskCache.height = this.height;

            this.lightMask = <HTMLCanvasElement>document.createElement("canvas");
            this.lightMask.width = this.width;
            this.lightMask.height = this.height;

            this._cX = Math.floor(this.width * 0.5);
            this._cY = Math.floor(this.height * 0.5);

            if (this.light.centerX) {
                this._cX = Math.floor(this.width * (this.light.centerX / this.light.image.width));
            }

            if (this.light.centerY) {
                this._cY = Math.floor(this.height * (this.light.centerY / this.light.image.height));
            }

            this.oldPos = new Vec2(0, 0);
            this.oldRot = 0;
            this.oldCastersCount = 0;

            this.drawLightMask();
            // this.redrawCache();
        }

        get position() { return new Point(this.light.x, this.light.y); }
        set position(p: Point) { this.light.x = p.x; this.light.y = p.y; }

        get boundingBox() {
            return { 
                min: new Point(this.light.x - this.light.radius, this.light.y - this.light.radius), 
                max: new Point(this.light.x + this.light.radius, this.light.y + this.light.radius) };
            
        }
        get boundingRect() {
            return new Rect(this.light.x - this.light.radius, this.light.y - this.light.radius, this.light.radius * 2, this.light.radius * 2);
        }
        get visible() {
            return this.light.visible;
        }
        get active() {
            return true;
        }
        get exists() {
            return true;
        }
        get affector() {
            var affector:Effect = {};
            return affector;
        }
        collide(effect: Effect, obj: GameObject) {
        }
        effect(effect: Effect) {
        }

        update(delta?: number) {
        }

        setPos(x: number, y: number) {
            this.light.x = x;
            this.light.y = y;
        }

        setRotation(angle: number) {
            this.light.rotation = angle;
        }

        drawLightMask() {
            var ctx:CanvasRenderingContext2D = this.lightMask.getContext("2d");
            ctx.clearRect(0, 0, this.lightMask.width, this.lightMask.height);
            if (this.light.useImage) {
                var image = this.light.image;
                var width = this.light.frameWidth;
                var height = this.light.frameHeight;
                var scale = this.lightMask.width / width;
                var framePos = this.light.framePos;
                // ctx.globalCompositeOperation = "destination-out";

                //2000 
                //600
                //2000 * x = 600;
                // console.log("Flashlight: " + width + ":" + height);
                // ctx.drawImage(image, 0, 0, 300, 300, 0, 0, 300, 300);
                // ctx.globalAlpha = this.light.intensity;
                // ctx.drawImage(image, framePos.x, framePos.y, width, height, 0, 0, width * scale, height * scale);

                if (this.light.enableTint) {
                    image.render(ctx, this.light.color, framePos.x, framePos.y, width, height, 0, 0, width * scale, height * scale);
                } else {
                    image.renderNoTint(ctx, framePos.x, framePos.y, width, height, 0, 0, width * scale, height * scale);
                }

                // image.renderNoTint(ctx, framePos.x, framePos.y, width, height, 0, 0, width * scale, height * scale);

                //ctx.globalCompositeOperation = "lighter";
                //ctx.fillStyle = "blue";
                //ctx.fillRect(0, 0, width * scale, height * scale);
            } else {
                var grd = ctx.createRadialGradient(this._cX, this._cY, 4, this._cX, this._cY, this.light.radius);
                grd.addColorStop(0, Util.rgba(200, 200, 255, 1));
                grd.addColorStop(1, Util.rgba(0,0,0,0));
                ctx.fillStyle = grd;
                // ctx.globalAlpha = this.light.intensity;
                ctx.fillRect(0, 0, this.lightMask.width, this.lightMask.height);
            }

            this.oldIntensity = this.light.intensity;

            //var grd = ctx.createRadialGradient(this._cX, this._cY, 4, this._cX, this._cY, 300);
            //grd.addColorStop(0, Util.rgba(255, 255, 255, 0));
            //grd.addColorStop(1, '#000000');
            //ctx.fillStyle = grd;

            //ctx.fillRect(0, 0, this.lightMask.width, this.lightMask.height);
        }

        render(light: CanvasRenderingContext2D, ctx: CanvasRenderingContext2D, bounds: Rect) {
            var cam = Game.game.world.camera;

            //if (this.light.flicker) {
            //    this.light.calcFlicker();
            //}
            //if (this.light.animate) {
            //    this.prevFrame = this.light.frame;
            //    this.light.animateFrames();
            //}

            if (this.light._visible && this.light.visible) {

                var drawLightMask: bool = false;
                var drawCache: bool = false;
                var drawShadowMap: bool = false;
                var drawMask: bool = false;

                if (!this.cacheDrawn) {
                    drawLightMask = true;
                    drawCache = true;
                    if (this.light.drawShadows) drawShadowMap = true;
                    drawMask = true;
                    this.cacheCounter++;
                    // For some reason the cache doesn't properly draw the first time, image not fully loaded or something
                    if(this.cacheCounter > 1) this.cacheDrawn = true;
                }

                if (this.light.frame !== this.prevFrame) {
                    drawLightMask = true;
                    drawMask = true;
                    //if (this.light.drawShadows) {
                    //    drawShadowMap = true;
                    //}
                }

                if (this.oldIntensity !== this.light.intensity) {
                    drawMask = true;
                }

                if (this.light.rotation !== this.oldRot) {
                    drawCache = true;
                    // if (this.light.drawShadows) drawShadowMap = true;
                    drawMask = true;
                }

                if (this.light.drawShadows) {
                    if (this.light.x !== this.oldPos.x || this.light.y !== this.oldPos.y || this.casters.size() !== this.oldCastersCount) {
                        drawShadowMap = true;
                        drawMask = true;
                    }
                }

                if (drawLightMask) this.drawLightMask();
                if (drawCache) this.drawCache();
                if (drawShadowMap) this.drawShadowMap();
                if (drawMask) this.drawMask();


            //if (this.light.dynamic) {
            //    //if (this.light.intensity !== this.oldIntensity || this.light.frame !== this.prevFrame) {
            //    //    this.drawLightMask();
            //    //}

            //    if (this.light.drawShadows) {
            //        var recache: bool = false;
            //        if (!this.cacheDrawn || this.light.frame !== this.prevFrame || this.light.rotation !== this.oldRot) {
            //            this.drawCache();
            //        }
            //        if (this.light.rotation !== this.oldRot || this.light.x !== this.oldPos.x || this.light.y !== this.oldPos.y || this.casters.size() !== this.oldCastersCount) {
            //            this.drawShadowMap();
            //            this.drawMask();
            //        }
            //    } else if (!this.cacheDrawn || this.light.rotation !== this.oldRot || this.light.frame !== this.prevFrame) {
            //        this.drawMask();
            //        this.drawCache();
            //    }
            //} else {
            //    if (!this.cacheDrawn) {
            //        this.drawLightMask();
            //        this.drawCache();
            //        if (this.light.drawShadows) {
            //            this.drawShadowMap();
            //        }
            //        this.drawMask();
            //        this.cacheDrawn = true;
            //    }
            //    if (this.light.frame !== this.prevFrame) {
            //        this.drawLightMask();
            //        this.drawCache();
            //        if (this.light.drawShadows) {
            //            this.drawShadowMap();
            //            this.drawMask();
            //        }

            //    }

                //this.drawLightMask();
                //this.drawCache();
                //if (this.light.drawShadows) {
                //    this.drawShadowMap();
                //    this.drawMask();
                //}
            // }

                var x = this.light.x - bounds.x - this.light.radius;
                var y = this.light.y - bounds.y - this.light.radius;

            
                light.globalCompositeOperation = "lighter";
                light.globalAlpha = this.light.fog;
                light.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height, Math.floor(x * cam.scale), Math.floor(y * cam.scale), Math.floor(this.cache.width * cam.scale), Math.floor(this.cache.height * cam.scale));

                ctx.globalCompositeOperation = "destination-out";
                ctx.drawImage(this.maskCache, 0, 0, this.cache.width, this.cache.height, Math.floor(x * cam.scale), Math.floor(y * cam.scale), Math.floor(this.cache.width * cam.scale), Math.floor(this.cache.height * cam.scale));
            }

            //shadowCtx.globalCompositeOperation = "destination-out";
            //shadowCtx.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height, x * cam.scale, y * cam.scale, this.cache.width * cam.scale, this.cache.height * cam.scale);
            this.prevFrame = this.light.frame;

            this.light.update(FPS.getDelta());
        }

        //render2(light: CanvasRenderingContext2D, ctx: CanvasRenderingContext2D, bounds: Rect) {
        //    var cam = Game.game.world.camera;

        //    if (this.light.flicker) {
        //        this.light.calcFlicker();
        //    }

        //    if (this.light.intensity !== this.oldIntensity) {
        //        this.drawLightMask();
        //    }

        //    if (this.light.drawShadows) {
        //        if(!this.cacheDrawn || this.light.intensity !== this.oldIntensity || this.light.rotation !== this.oldRot || this.light.x !== this.oldPos.x || this.light.y !== this.oldPos.y || this.casters.size() !== this.oldCastersCount)
        //            this.drawShadowMap();
        //            this.drawMask();
        //            this.drawCache();
        //    } else if (!this.cacheDrawn || this.light.intensity !== this.oldIntensity || this.light.rotation !== this.oldRot) {
        //        this.drawMask();
        //        this.drawCache();
        //    }

        //    var x = this.light.x - bounds.x - this.light.radius;
        //    var y = this.light.y - bounds.y - this.light.radius;

        //    light.globalCompositeOperation = "lighter";
        //    light.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height, x * cam.scale, y * cam.scale, this.cache.width * cam.scale, this.cache.height * cam.scale);

        //    ctx.globalCompositeOperation = "destination-out";
        //    ctx.drawImage(this.maskCache, 0, 0, this.cache.width, this.cache.height, x * cam.scale, y * cam.scale, this.cache.width * cam.scale, this.cache.height * cam.scale);

            

        //    //shadowCtx.globalCompositeOperation = "destination-out";
        //    //shadowCtx.drawImage(this.cache, 0, 0, this.cache.width, this.cache.height, x * cam.scale, y * cam.scale, this.cache.width * cam.scale, this.cache.height * cam.scale);

            
        //}

        drawLight(ctx:CanvasRenderingContext2D, xOff:number, yOff: number, width: number, height: number) {
            ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, xOff, yOff, width, height);
        }

        drawMask() {
            var ctx:CanvasRenderingContext2D = this.maskCache.getContext("2d");
            ctx.clearRect(0, 0, this.cache.width, this.cache.height);
            //ctx.fillStyle = "black";
            //ctx.fillRect(0, 0, this.cache.width, this.cache.height);
            ctx.save();
            var cX = this.cache.width * 0.5;
            var cY = this.cache.height * 0.5
            ctx.translate(cX, cY);
            ctx.rotate(Util.degToRad(this.light.rotation));
            //ctx.globalCompositeOperation = "destination-out";
            //ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, -this._cX, -this._cY, this.lightMask.width, this.lightMask.height);
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = this.light.intensity;
            /// ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, -this._cX, -this._cY, this.lightMask.width, this.lightMask.height);
            ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, -this._cX, -this._cY, this.lightMask.width, this.lightMask.height);
            ctx.restore();
            //if (this.light.drawShadows) {
            //    ctx.drawImage(this.shadowMap, 0, 0);
            //}

            if (this.light.drawShadows) {
                ctx.globalCompositeOperation = "destination-out";
                ctx.drawImage(this.shadowMap, 0, 0);
            }

        }

        drawCache() {
            var ctx:CanvasRenderingContext2D = this.cache.getContext("2d");
            ctx.clearRect(0, 0, this.cache.width, this.cache.height);
            //ctx.fillStyle = "black";
            //ctx.fillRect(0, 0, this.cache.width, this.cache.height);
            ctx.save();
            var cX = this.cache.width * 0.5;
            var cY = this.cache.height * 0.5
            ctx.translate(cX, cY);
            ctx.rotate(Util.degToRad(this.light.rotation));
            //ctx.globalCompositeOperation = "destination-out";
            //ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, -this._cX, -this._cY, this.lightMask.width, this.lightMask.height);
            ctx.globalCompositeOperation = "source-over";
            // ctx.globalAlpha = this.light.intensity;
            /// ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, -this._cX, -this._cY, this.lightMask.width, this.lightMask.height);
            ctx.drawImage(this.lightMask, 0, 0, this.lightMask.width, this.lightMask.height, -this._cX, -this._cY, this.lightMask.width, this.lightMask.height);
            ctx.restore();

            //if (this.light.drawShadows) {
            //    ctx.drawImage(this.shadowMap, 0, 0);
            //}
        }

        drawShadowMap() {
            var ctx:CanvasRenderingContext2D = this.shadowMap.getContext("2d");

            var r2 = this.light.radius2;
            // var visibleCasters: ShadowCaster[] = [];

            ctx.save();
            ctx.clearRect(0, 0, this.shadowMap.width, this.shadowMap.height);

            ctx.beginPath();
            ctx.fillStyle = Util.rgba(0,0,0,1);
            // ctx.strokeStyle = Util.rgba(0,0,0,1);
            // ctx.lineWidth = 2;

            ctx.setTransform(1, 0, 0, 1, -(this.light.x - this.light.radius), -(this.light.y - this.light.radius));


            var casters = this.casterMap.getRadius(this.light.x, this.light.y, this.light.radius);

            var pos: Point = new Point(this.light.x, this.light.y);
            var minDist: number = this.light.radius2;

            //if (this.light.limitFov) {
            //    var p1 = this.light.point;
            //    var aMin = (this.light.rotation - 100) - 90;
            //    var aMax = (this.light.rotation + 100) - 90;

            //    casters.forEach((caster: ShadowCaster) =>{

            //        if (Util.angleWithinCone(p1, caster.positionCenter, aMin, aMax)) {
            //            caster.drawShadow(ctx, this.light.vec);
            //            var cDist = pos.distanceTo2(caster.centerX, caster.centerY);
            //            if (cDist < minDist) minDist = cDist;
            //        }
            //    });
            //}
            //else {
                
            //}

            casters.forEach((caster: ShadowCaster) =>{
                caster.drawShadow(ctx, this.light.vec);
                var cDist = pos.distanceTo2(caster.centerX, caster.centerY);
                if (cDist < minDist) minDist = cDist;
            });

            ctx.fill();

            // **Erase the shapes from the shadows
            ctx.beginPath();
            // ctx.fillStyle = "black";
            if (this.light.drawWallShadow) {
                ctx.globalCompositeOperation = "destination-out";
            } else {
                ctx.globalCompositeOperation = "source-over";
            }
            
            casters.forEach((caster: ShadowCaster, i, a) =>{
                //if (this.light.limitFov) {
                //    if (Util.angleWithinCone(p1, caster.positionCenter, aMin, aMax)) {
                //        caster.drawPath(ctx);
                //    }
                //}
                //else {
                //    caster.drawPath(ctx);
                //}

                caster.drawPath(ctx);
            });
            ctx.fill();

            if (this.light.drawWallShadow) {
                ctx.globalCompositeOperation = "source-over";
                var rad = Math.sqrt(minDist) + 32;
                var grd = ctx.createRadialGradient(this.light.x, this.light.y, 1, this.light.x, this.light.y, Math.max(rad, 32));
                grd.addColorStop(0, Util.rgba(0, 0, 0, 0));
                grd.addColorStop(1, Util.rgba(0, 0, 0, 1));
                ctx.fillStyle = grd;
                ctx.fill();
            }

            ctx.restore();

            this.oldPos = this.light.vec;
            this.oldRot = this.light.rotation;
            this.oldCastersCount = this.casters.size();
        }

        isCasterVisible(caster: ShadowCaster) {
            if(Util.dist2(this.light.x, this.light.y, caster.centerX, caster.centerY) < this.light.radius2)
                return true;
            else
                return false;
        }

        
    }

    export class LightType {
        static DEFAULT: number = 0;
        static FLASHLIGHT: number = 1;
    }

    export class LightEngine {
        game: Game;
        casters: LinkedList;
        casterMap: SpatialHash;
        lightRenderers: SpatialHash;

        //lightRenderer: LightRenderer;
        //light: Light; 
        //lightRenderer2: LightRenderer;
        //light2: Light;

        imgFlashlight: TintImage;
        imgParticles: TintImage;
        imgCircular: TintImage;

        compositeLayer: HTMLCanvasElement;
        shadowLayer: HTMLCanvasElement;
        lightLayer: HTMLCanvasElement;

        constructor (game:Game) {
            this.game = game;
            this.casters = new LinkedList();
            this.casterMap = new SpatialHash(32);
            this.lightRenderers = new SpatialHash(32);

            this.compositeLayer = <HTMLCanvasElement>document.createElement("canvas");
            this.compositeLayer.width = 400;
            this.compositeLayer.height = 400;

            this.lightLayer = <HTMLCanvasElement>document.createElement("canvas");
            this.lightLayer.width = 400;
            this.lightLayer.height = 400;

            this.shadowLayer = <HTMLCanvasElement>document.createElement("canvas");
            this.shadowLayer.width = 400;
            this.shadowLayer.height = 400;

            this.createTintImages();
        }

        // this creates all the tint images that the lights will use
        createTintImages() {
            this.imgFlashlight = new TintImage(this.game.assets.images["flashlightMask"]);
            this.imgParticles = new TintImage(this.game.assets.images["particleLights"]);
            this.imgCircular = new TintImage(this.game.assets.images["circularLight"]);
        }

        reset() {
            this.casters.clear();
            this.casterMap.clear();
            this.lightRenderers.clear();
        }

        add(light: Light) :Light {
            var renderer = new LightRenderer(light, this);
            light.renderer = renderer;
            this.lightRenderers.add(renderer);
            return light;
        }

        remove(light: Light): Light {
            this.removeRenderer(light.renderer);
            return light;
        }

        moveLight(light:Light, oldBox:Box) {
            this.lightRenderers.removeBox(oldBox, light.renderer);
            this.lightRenderers.add(light.renderer);
        }

        createLight(x: number, y: number, radius: number, type?:number) : Light {
            var type = type || LightType.DEFAULT;
            var light: Light;
            switch (type) {
                case LightType.DEFAULT:
                    light = new Light(this, x, y, radius);
                    // light = new ParticleLight(this, this.game, x, y, radius, 1);
                break;
                case LightType.FLASHLIGHT:
                    light = new Flashlight(this, x, y, radius);
                    // light = new Light(this.game, x, y, radius);
                break;
            }
            
            //var renderer = new LightRenderer(light, this);
            //light.engine = this;
            //light.game = this.game;
            //light.renderer = renderer;
            //this.lightRenderers.add(renderer);

            return this.add(light);;
        }

        removeRenderer(renderer: LightRenderer) {
            // console.log("Removing LightRenderer...");
            this.lightRenderers.remove(renderer);
            //var b = this.lightRenderers.contains(renderer);
            //if (b) {
            //    console.log("Removing LightEngine Failed.");
            //}
        }

        createCaster(x:number, y:number, points:Point[]) {
            var caster = new ShadowCaster(x, y, points);
            this.casters.append(caster);
            this.casterMap.add(caster);
            return caster;
        }

        createCasterRect(x: number, y: number, width: number, height: number, regX?:number = 0, regY?: number = 0) {
            var points: Point[] = [
                new Point(-regX, -regY),
                new Point(-regX + width, -regY),
                new Point(-regX + width, -regY + height),
                new Point(-regX, -regY + height)];
            return this.createCaster(x, y, points);
        }

        drawCasters(ctx: CanvasRenderingContext2D, bounds:Rect) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeStyle = "blue";
            ctx.fillStyle = "rgba(100,100,100,0.9)";
            ctx.lineWidth = 4;
           
            var radius = 200;
            var center = bounds.getCenter();
            ctx.arc(-bounds.x + center.x, -bounds.y + center.y, radius, 0, 2 * Math.PI);
            this.casters.forEach((caster: ShadowCaster, i) =>{
                //if (bounds.contains(caster.x, caster.y)) {
                //    ctx.setTransform(1, 0, 0, 1, -bounds.x + 0.5, -bounds.y + 0.5);
                //    caster.drawPath(ctx);
                //}
                if (center.distanceTo(caster.centerX, caster.centerY) < radius) {
                    ctx.setTransform(1, 0, 0, 1, -bounds.x + 0.5, -bounds.y + 0.5);
                    // ctx.arc(caster.centerX, caster.centerY, 4, 0, 2 * Math.PI);
                    ctx.rect(caster.centerX, caster.centerY, 4, 4);
                    caster.drawPath(ctx);
                }
            });
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        render(ctx: CanvasRenderingContext2D, bounds:Rect, paused:bool) {
            var game = Game.game;
            var cam = game.world.camera;

            if (this.compositeLayer.width != game.width || this.compositeLayer.height != game.height) {
                this.compositeLayer.width = game.width;
                this.compositeLayer.height = game.height;
                //this.shadowLayer.width = game.width;
                //this.shadowLayer.height = game.height;
                this.lightLayer.width = game.width;
                this.lightLayer.height = game.height;
            }

            //// Composite the lights together
            

            //// Turn off the lights
            //light.fillStyle = "black";
            //light.fillRect(0, 0, this.compositeLayer.width, this.compositeLayer.height);

            //var shad = this.shadowLayer.getContext("2d");
            //shad.clearRect(0, 0, this.shadowLayer.width, this.shadowLayer.height);
            //shad.fillStyle = "black";
            //// shad.fillRect(0, 0, this.shadowLayer.width, this.shadowLayer.height);

            var light = this.lightLayer.getContext("2d");
            light.clearRect(0, 0, this.compositeLayer.width, this.compositeLayer.height);

            var comp = this.compositeLayer.getContext("2d");
            comp.clearRect(0, 0, this.compositeLayer.width, this.compositeLayer.height);
            comp.globalCompositeOperation = "source-over";
            comp.fillStyle = "black";
            comp.fillRect(0, 0, this.compositeLayer.width, this.compositeLayer.height);

            // c.globalCompositeOperation = "lighter";
            this.renderLights(light, comp, bounds);

            
            //comp.globalCompositeOperation = "lighter";
            //comp.drawImage(this.lightLayer, 0, 0);
            //comp.globalCompositeOperation = "destination-out";
            //comp.drawImage(this.shadowLayer, 0, 0);

            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(this.lightLayer, 0, 0);
            ctx.drawImage(this.compositeLayer, 0, 0);
        }

        renderLights(light:CanvasRenderingContext2D, ctx:CanvasRenderingContext2D, b:Rect) {
            //ctx.globalCompositeOperation = "lighter";
            //shadowCtx.globalCompositeOperation = "destination-in";

            var visibleLights:GameObject[] = this.lightRenderers.getArea(b.x, b.y, b.width, b.height);

            visibleLights.forEach((r: LightRenderer) =>{
                r.render(light, ctx, b);
            });

            //this.lightRenderers.forEach((r: LightRenderer, i) =>{
            //    r.render(light, ctx, bounds);
            //});
        }
    
    }
}