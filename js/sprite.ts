module vs {

    // This is the base class for Sprite objects
    // This should be kept as simple as possible
    // Static sprites that won't change should extend this class
    // For animated sprites see AnimatedSprite
    // TODO: currently this class draws the sprite the width of the tilesize
    // this will be changed to draw based on the image.width and height property
    // once I've finished AnimatedSprite as not all sprites will need to be 64x64 pixels wide
    // in face it's wasteful if the sprite takes up less room than that
    // TODO2: also not sure if I want to keep a separate canvas for each sprite
    // it apparently will speed up drawing, but it my tests I could see little difference
    // between drawing the image and drawing the canvas.But it did crash Chrome if
    // I had over 1000 canvas's, so I think I'll probably roll with images.
    // it's also important to note that the current implementation is referencing the
    // image and not copying it. I think this is best as images eat up memory, and 
    // once the image is loaded it is not going to change.
    // However if you have a child sprite that does it's own drawing, you should
    // override render and draw to it's own canvas and not the image element. 
    export class Sprite implements GameObject {
        // Stores a reference to the image that the sprite will draw to the given context
        image: HTMLImageElement;
        // canvas: HTMLCanvasElement;

        // Position
        _x: number = 0;
        _y: number = 0;

        // Registration points. Use these to set the center of the sprite or else it will be at 0,0, top left
        regX: number = 0;
        regY: number = 0;

        // This defines whether the sprite is active and whose update method should be actively called
        // This should be true for things like the player, bullets, ect. 
        // But should be false for things like walls, item pickups, weapon pickups.
        active: bool = true;

        // This defines whether the sprite is visible and drawn to the screen. 
        visible: bool = true;

        // This defines whether the sprite exists. Useful for recycling objects
        exists: bool = true;

        // If this is true world will automatically check spatialHash collisions and call collide if there is one 
        enableCollisionDetection: bool = true;

        // If this is true it will be checked for collisions from other objects
        collidable: bool = true;

        // If this is true, that means the object will moved and should be updated in the spatial hash if it moves
        movable: bool = true;

        // Determines what level the sprite will be drawn at
        zIndex: number = 0;

        //updatable: bool = true;

        // Transparency
        alpha: number = 1;

        // This is kind of like photoshop's blend modes, but not exactly, through useful.
        compositeMode: string = "Source-Over";

        // Scale
        scaleX: number = 1;
        scaleY: number = 1;

        _rotation: number = 0;
        rotationOffset: number = 0; // Rotation at 0 is facing right, if your sprite is not facing right, set rotationOffset to match

        fov: number = 360;

        //fovMin: number = -180;
        //fovMax: number = -180;

        private _frame: number;

        // This stores the position of the frame to be drawn
        frameX: number = 0;
        frameY: number = 0;

        // This stores the dimensions of the frame to be drawn by default this will be the width and height of the image
        frameWidth: number = 0;
        frameHeight: number = 0;

        // Offsets for boundingRect
        boundX: number = 0;
        boundY: number = 0;
        boundWidth: number = 64;
        boundHeight: number = 64;

        _bounds: Rect;
        boundingRadius: number = 64;

        speed: number = 0;
        oldPos: Vec2;
        direction: Vec2;

        constructor (x: number, y: number, imageName: string) {
            this._x = x;
            this._y = y;

            this.oldPos = new Vec2(0, 0);
            this.direction = new Vec2(0, 0);

            //this.image = <HTMLImageElement>Game.game.assets.images[imageName];
             //this.canvas = <HTMLCanvasElement>document.createElement("canvas");
             //this.drawCache();

            if(imageName !== "noimage") this.changeImage(imageName);
            else this._bounds = new Rect(0, 0, 1, 1);
            //this.frameWidth = 64;
            //this.frameHeight = 64;
            //this._bounds = new Rect(0, 0, this.frameWidth, this.frameHeight);
        }

        changeImage(imageName: string, frame?:number = 0, frameWidth?:number = 64, frameHeight?:number = 64) {
            this.image = <HTMLImageElement>Game.game.assets.images[imageName];
            this.frameWidth = frameWidth;
            this.frameHeight = frameHeight;
            this.frame = frame;
            this._bounds = new Rect(0, 0, this.frameWidth, this.frameHeight);
        }

        get rotation(): number {
            return this._rotation;
        }
        set rotation(v: number) {
            while (v > 360) v -= 360;
            while (v < 0) v += 360;
            this._rotation = v;
        }

        get directionVector(): Vec2 {
            return Vec2.makeFromAngleDeg(this.rotation + this.rotationOffset);
        }

        get fovMaxVec(): Vec2 {
            return Vec2.makeFromAngleDeg((this.rotation + this.rotationOffset) + this.fov * 0.5);
        }

        get fovMinVec(): Vec2 {
            return Vec2.makeFromAngleDeg((this.rotation + this.rotationOffset) - this.fov * 0.5);
        }

        static zIndexComparator() {
        }

        get x() { return Math.floor(this._x); }
        set x(x: number) { this._x = x; }
        get y() { return Math.floor(this._y); }
        set y(y: number) { this._y = y; }
        

        get affector() : Effect{
            var affector:Effect = {};
            return affector;
        }

        get position() : Point{
            return new Point(this.x, this.y);
        }

        get positionCenter() : Point{
            return new Point(this.x + this.frameWidth * 0.5, this.y + this.frameHeight * 0.5);
        }

        // Returns the position relative to the screen
        get positionLocal(): Point {
            return new Point(this.x - Game.game.world.camera.x, this.y - Game.game.world.camera.y);
        }

        get boundingBox() : Box{
            return { 
                min: new Point(this.x + this.boundX, this.y + this.boundY), 
                max: new Point(this.x + this.boundX + this.boundWidth, this.y + this.boundY + this.boundHeight) };
        }

        get boundingRect() : Rect {
            this._bounds.x = this.x + this.boundX;
            this._bounds.y = this.y + this.boundY;
            this._bounds.width = this.boundWidth;
            this._bounds.height = this.boundHeight;
            return this._bounds;
        }

        collide(e: Effect, o:GameObject) {
        
        }

        effect(e: Effect) {
        }

        set frame(frame:number) {
            this._frame = frame;
            this.frameX = (frame * this.frameWidth) % this.image.width;
            // This was wrong before? How in the world? Hah
            this.frameY = Math.floor(frame / (this.image.width / this.frameWidth)) * this.frameHeight;
            // console.log("Frame = " + frame + "FrameX = " + this.frameX + "FrameY = " + this.frameY + " FrameWidth = " + this.frameWidth + " FrameHeight = " + this.frameHeight);
        }
        get frame() {
            return this._frame;
        }

        update(delta?: number) {

        }

        // Helper function to update the position
        updatePosition(delta: number) {
            var moveDistance = this.speed * delta;
            this.oldPos.setN(this.x, this.y);

            this.x += Math.round(moveDistance * this.direction.x);
            this.y += Math.round(moveDistance * this.direction.y);
        }

        // This method will check to see if there is a collision with the given object, if there is, it will move back to old position
        checkCollisionAndMove(obj:GameObject): bool {
            var myBounds = this.boundingRect;
            var yourBounds = obj.boundingRect;
            

            var x = this.x;
            var y = this.y;
            var oldPos = this.oldPos;
            var newPos: Vec2 = new Vec2(x,y);

            var boundX = this.boundX;
            var boundY = this.boundY;
            var boundW = this.boundWidth;
            var boundH = this.boundHeight;

            var width = this.boundWidth * 0.5;
            var height = this.boundHeight * 0.5;

            // Check X Axis
            myBounds.x = x + boundX;
            myBounds.y = oldPos.y + boundY;

            var diff: number;

            var collision: bool = false;

            if (myBounds.intersects(yourBounds)) {
                collision = true;
                diff = myBounds.x - yourBounds.x;
                // Left or Right?
                if (x > oldPos.x) {
                    newPos.x = yourBounds.x - (boundX + boundW);
                } else if(x < oldPos.x) {
                    newPos.x = yourBounds.x + yourBounds.width + (boundX + boundW);
                }

                // newPos.x = oldPos.x;
                // this.x = this.oldPos.x;
            }

            // Check Y Axis
            myBounds.x = this.oldPos.x + this.boundX;
            myBounds.y = this.y + this.boundY;

            if (myBounds.intersects(yourBounds)) {
                collision = true;
                diff = myBounds.y - yourBounds.y;
                if (y > oldPos.y) {
                    newPos.y = yourBounds.y - (boundX + boundW);
                } else if (y < oldPos.y) {
                    newPos.y = yourBounds.y + yourBounds.width + (boundX + boundW);
                }

                //this.y = this.oldPos.y;
            }

            this.x = newPos.x;
            this.y = newPos.y;


            //if (this.y > yourBounds.y && this.y < yourBounds.y + yourBounds.width) {
            //    if (this.x < yourBounds.x) {
            //        this.x = yourBounds.x - width;
            //    }
            //    else if (this.x > yourBounds.x) {
            //        this.x = yourBounds.x + yourBounds.width + width;
            //    }
            //}
            return collision;
        }

        render(ctx: CanvasRenderingContext2D) {
            //while (this.rotation > 360) {
            //    this.rotation -= 360;
            //}
            //while (this.rotation < 0) {
            //    this.rotation += 360;
            //}

            ctx.translate(this.x, this.y);
            var rotAmt = Util.degToRad(this.rotation);
            ctx.rotate(rotAmt);
            ctx.globalAlpha = this.alpha;
            ctx.globalCompositeOperation = this.compositeMode;
            ctx.drawImage(this.image, this.frameX, this.frameY, this.frameWidth, this.frameHeight, -this.regX, -this.regY, this.frameWidth * this.scaleX, this.frameHeight * this.scaleY);
            ctx.rotate(-rotAmt);

            if (D.drawBoundsBox) {
                var boundsBox = this.boundingBox;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(boundsBox.min.x - this.x, boundsBox.min.y - this.y, boundsBox.max.x - boundsBox.min.x, boundsBox.max.y - boundsBox.min.y);
                ctx.stroke();
            }

            if (D.drawBoundsRect) {
                var boundsRect = this.boundingRect;
                ctx.strokeStyle = "red";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(boundsRect.x - this.x, boundsRect.y - this.y, boundsRect.width, boundsRect.height);
                ctx.stroke();
            }

            if (D.drawCenter) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.rect(-1, -1, 2, 2);
                ctx.stroke();
                
            }
        }

        // This function is to be called from the World class only
        // Override this to put your own remove code
        // This method is called right before the world removes the sprite
        // Useful if the Sprite has children like sub sprites or lights that also need to be removed
        remove() {
        }

        // This code is for caching the image to the canvas
        // Currently not using for Sprite. 
        //drawCache() {
        //    this.canvas.width = this.image.width;
        //    this.canvas.height = this.image.height;

        //    var ctx = this.canvas.getContext("2d");
        //    ctx.drawImage(this.image, 0, 0);
        //}    
    }

    export interface AnimObject {
        name: string;
        frames: number[];
        next: string;
        speed: number;
    }

    // This class represents an animated sprite which uses a Spritesheet to render animation
    // Any game object that is animated should extend this
    export class AnimatedSprite extends Sprite {
        // This is the index of the frame of animation that is currently drawn
        // private frame: number = 0;

        // This is used for figuring out what frame to draw from the current animation's frame sequence
        private frameCounter: number = 0;

        // This is the total number of frames
        private numFrames: number = 1;

        // This is the width of the image
        private width: number = 0;

        // Index of starting frame
        private start: number = 0;

        // Index of ending frame
        private end: number = 0;

        // This is the name of the animation currently playing
        private currentAnim: string;

        // This holds all the animations
        private animations: AnimObject[];

        // This is used for calculating the interval between frames
        private lastUpdate: number = 0;

        // This determines how often to increment to the next frame
        private frequency: number = 1;

        // Canvas that sprite is cached to
        private canvas: HTMLCanvasElement;

        
        

        constructor (x: number, y: number, imageName: string, frameWidth?: number, frameHeight?: number) {
            super(x,y, imageName);

            //this.x = x;
            //this.y = y;

            this.frameWidth = frameWidth || 64;
            this.frameHeight = frameHeight || 64;

            this.width = this.image.width;

            this.numFrames = (this.image.width / this.frameWidth) * (this.image.height / this.frameHeight);
            this.end = this.numFrames - 1;

            this.canvas = <HTMLCanvasElement>document.createElement("canvas");
            this.drawCache();

            this.animations = [];
            this.addAnimation("default", [0,this.end], "default", 12);
            this.gotoAndPlay("default");

            
        }

        drawCache() {
            this.canvas.width = this.image.width;
            this.canvas.height = this.image.height;

            var ctx = this.canvas.getContext("2d");
            ctx.drawImage(this.image, 0, 0);
        }    

        update(delta?: number) {
        }

        

        

        addAnimation(name: string, frames: number[], next: string, speed: number) {
            var anim = { name: name, frames: frames, next: next, speed: speed };

            this.animations[anim.name] = anim;
        }

        gotoAndPlay(name: string) {
            this.setAnimation(name);
            this.frame = this.start;
            // this.updateFramePos();
        }

        // this is like gotoAndPlay except it does not change the current frame or update the position
        setAnimation(name: string) {
            var anim:AnimObject = this.animations[name];
            this.currentAnim = anim.name;
            this.start = anim.frames[0];
            this.end = anim.frames[(anim.frames.length - 1)];
            this.frequency = (1000 / anim.speed);
        }

        getAnimation() {
            return this.currentAnim;
        }

        incrementFrame() {
            // console.log("CurrentAnim: " + this.currentAnim + " Frame: " + this.frame + " Start: " + this.start + " End: " + this.end);
            var anim:AnimObject = this.animations[this.currentAnim];

            if (anim.frames.length == 2) {
                this.frame++;
                if (this.frame >= this.numFrames) {
                    this.frame = this.start;
                } 
                if (this.frame > this.end) {
                    if (anim.next !== this.currentAnim) {
                        this.gotoAndPlay(anim.next);
                    } else {
                        this.frame = this.start;
                    }
                }
            } else {
                if (this.frameCounter >= anim.frames.length) {
                    if (anim.next !== this.currentAnim) {
                        this.gotoAndPlay(anim.next);
                    } else {
                        this.frameCounter = 0;
                    }
                } 
                this.frame = anim.frames[this.frameCounter];
                this.frameCounter++;
                if (this.frame >= this.numFrames) {
                    console.log("Problem with animation: " + this.currentAnim + " . Frame does not exist. Setting frame to 0");
                    this.frame = 0;
                }
            }
        }

        //updateFramePos() {
        //    this.frameX = (this.frame * this.frameWidth) % this.width;
        //    this.frameY = Math.floor((this.frame * this.frameHeight) / this.width);
        //}

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);
            // console.log("Time: " + (Date.now() - this.lastUpdate));
            if (Date.now() - this.lastUpdate > this.frequency ){
                if (!Game.game.paused) {
                    this.incrementFrame();
                    // this.updateFramePos();
                    this.lastUpdate = Date.now();
                }
            }
        }
    }

    // This is like a sprite but has a draw method which you should override with drawing commands
    // you should draw to the cacheCanvas which is drawn instead of an image for render
    export class Shape extends Sprite {
        cacheCanvas: HTMLCanvasElement;
        width: number;
        height: number;
        cacheDrawn: bool = false;


        constructor(x: number, y: number, width:number, height:number) {
            super(x, y, "noimage");
            this.cacheCanvas = <HTMLCanvasElement>document.createElement("canvas");
            this.cacheCanvas.width = width;
            this.cacheCanvas.height = height;
            this.width = width;
            this.height = height;
        }

        draw(ctx: CanvasRenderingContext2D) {
        }

        render(ctx: CanvasRenderingContext2D) {
            var cacheCtx = this.cacheCanvas.getContext("2d");
            if(!this.cacheDrawn) this.draw(cacheCtx);
            this.cacheDrawn = true;
            ctx.translate(this.x, this.y);
            var rotAmt = Util.degToRad(this._rotation);
            ctx.rotate(rotAmt);
            ctx.globalAlpha = this.alpha;
            ctx.globalCompositeOperation = this.compositeMode;
            ctx.drawImage(this.cacheCanvas, 0, 0, this.width, this.height, -this.regX, -this.regY, this.width * this.scaleX, this.height * this.scaleY);
            ctx.rotate(-rotAmt);
        }
        
    }

    export class ShapeRectangle extends Shape {
        color: Color;
        strokeColor: Color;

        stroke: bool = true;
        fill: bool = true;

        constructor (x: number, y: number, width: number, height: number) {
            super(x, y, width, height);
            this.zIndex = 1;
            this.color = new Color(0, 0, 0, 1);
            this.strokeColor = new Color(255, 0, 0, 1);
        }
        draw(ctx: CanvasRenderingContext2D) {
            console.log("Drawing");
            ctx.fillStyle = this.color.toString();
            ctx.strokeStyle = this.strokeColor.toString();
            ctx.rect(0, 0, this.width, this.height);
            if (this.fill) ctx.fill();
            if (this.stroke) ctx.stroke();
        }
    }

    export class FOVTester extends ShapeRectangle {
        constructor (x: number, y: number) {
            super(x, y, 32, 32);
            this.regX = 16;
            this.regY = 16;
        }
        update(delta?: number) {
            var inFOV = Util.checkFOV(this, Game.game.player);
            if (inFOV) this.color.setRGB(0, 0, 255);
            else this.color.setRGB(255, 0, 0);
            this.rotation += 1;
        }

    }

    export class RoomShape extends ShapeRectangle {
        constructor (x: number, y: number, width: number, height: number) {
            super(x, y, width, height);
            this.color.setRGB(60, 60, 255, 0.5);
        }
    }
}