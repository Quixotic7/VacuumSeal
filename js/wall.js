var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var WallType = (function () {
        function WallType() { }
        WallType.DEFAULT = 0;
        WallType.BLACK = 11;
        WallType.HORIZONTAL = 1;
        WallType.VERTICAL = 2;
        WallType.CAP_N = 3;
        WallType.CAP_S = 4;
        WallType.CAP_W = 5;
        WallType.CAP_E = 6;
        WallType.CORNER_NW = 7;
        WallType.CORNER_NE = 8;
        WallType.CORNER_SW = 9;
        WallType.CORNER_SE = 10;
        WallType.TRI_N = 12;
        WallType.TRI_S = 13;
        WallType.TRI_W = 14;
        WallType.TRI_E = 15;
        WallType.CROSS = 16;
        return WallType;
    })();
    vs.WallType = WallType;    
    var Wall = (function (_super) {
        __extends(Wall, _super);
        function Wall(x, y, type) {
                _super.call(this, x, y, "wall");
            this.type = type;
            this.frame = type;
            this.width = this.image.width;
            this.addToLightEngine(vs.Game.game.lightEngine);
            this.active = false;
            this.movable = false;
            this.enableCollisionDetection = false;
            this.collidable = true;
        }
        Wall.prototype.addToLightEngine = function (l) {
            this.caster = l.createCasterRect(this.x, this.y, this.frameWidth, this.frameHeight);
        };
        Wall.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
        };
        Object.defineProperty(Wall.prototype, "boundingBox", {
            get: function () {
                return {
                    min: new vs.Point(this.x, this.y),
                    max: new vs.Point(this.x + this.frameWidth - 1, this.y + this.frameHeight - 1)
                };
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Wall.prototype, "affector", {
            get: function () {
                var affector = {
                    type: vs.EffectType.WALL,
                    solid: true
                };
                return affector;
            },
            enumerable: true,
            configurable: true
        });
        return Wall;
    })(vs.Sprite);
    vs.Wall = Wall;    
    var Floor = (function (_super) {
        __extends(Floor, _super);
        function Floor(x, y, type) {
                _super.call(this, x, y, "floor");
            this.frame = type;
            this.movable = false;
            this.active = false;
            this.collidable = false;
            this.enableCollisionDetection = false;
            this.collidable = false;
        }
        return Floor;
    })(vs.Sprite);
    vs.Floor = Floor;    
})(vs || (vs = {}));
