module vs {
     // Generic class for a static sprite to be used in game
    //export class StaticSprite extends Sprite {
    //    frame: number;
    //    tilesize: number;

    //    constructor (x: number, y: number, type: number, imageName:string) {
    //        super(imageName);
    //        this.x = x;
    //        this.y = y;

    //        this.tilesize = Game.TILESIZE;
    //        this.updateType(type);
    //    }

    //    get affector():Effect {
    //        var affector = {
    //        };
    //        return affector;
    //    }

    //    updateType(type: number) {
    //        this.frame = type;
    //        this.frameWidth = this.frameHeight = this.tilesize;
    //        this.frameX = this.frame * this.tilesize;
    //    }
    //    render(ctx:CanvasRenderingContext2D) {
    //        super.render(ctx);
    //    }
    //}

    export class WallType {

        static DEFAULT: number = 0;
        static BLACK: number = 11;

        static HORIZONTAL: number = 1;
        static VERTICAL: number = 2;

        static CAP_N: number = 3;
        static CAP_S: number = 4;
        static CAP_W: number = 5;
        static CAP_E: number = 6;

        static CORNER_NW: number = 7;
        static CORNER_NE: number = 8;
        static CORNER_SW: number = 9;
        static CORNER_SE: number = 10;

        static TRI_N: number = 12;
        static TRI_S: number = 13;
        static TRI_W: number = 14;
        static TRI_E: number = 15;

        static CROSS: number = 16;

        
    }
    export class Wall extends Sprite {
        caster: ShadowCaster;
        width: number;
        type:number;

        constructor (x: number, y: number, type: number) {
            super(x,y,"wall");
            this.type = type;
            this.frame = type;
            this.width = this.image.width;
            this.addToLightEngine(Game.game.lightEngine);
            this.active = false;
            this.movable = false;
            this.enableCollisionDetection = false;
            this.collidable = true;

        }

        addToLightEngine(l: LightEngine) {
            this.caster = l.createCasterRect(this.x, this.y, this.frameWidth, this.frameHeight);
        }

        render(ctx:CanvasRenderingContext2D) {
            super.render(ctx);
        }

        get boundingBox() {
            return { 
                min: new Point(this.x, this.y), 
                max: new Point(this.x + this.frameWidth - 1, this.y + this.frameHeight - 1) };
        }

        get affector() : Effect{
            var affector: Effect = {
                type: EffectType.WALL,
                solid: true
            };
            return affector;
        }
    }

    export class Floor extends Sprite {
        constructor (x: number, y: number, type: number) {
            super(x,y,"floor");
            this.frame = type;
            this.movable = false;
            this.active = false;
            this.collidable = false;
            this.enableCollisionDetection = false;
            this.collidable = false;
        }
    }
}