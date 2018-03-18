var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var Elevator = (function (_super) {
        __extends(Elevator, _super);
        function Elevator(x, y, start) {
                _super.call(this, x, y, "elevator");
            this.zIndex = 5;
            this.isStart = start;
            this.addAnimation("screenStatic", [
                0, 
                4
            ], "screenStatic", 12);
            this.gotoAndPlay("screenStatic");
            var color = new vs.Color(255, 255, 255, 1);
            var rad = 8;
            var off = 6;
            var w = x + 64;
            var h = y + 64;
            this.zIndex = 2;
            var e = vs.Game.game.lightEngine;
            var fadeToFrom = new vs.Pair(0, 1);
            var fadeTime = 2;
            var color;
            if(start) {
                color = new vs.Color(0, 0, 255, 1);
            } else {
                color = new vs.Color(255, 0, 0, 1);
            }
            this.lights = [];
            var light = new vs.LEDLight(e, x + off, y + off, color, rad, 1, true, fadeToFrom, fadeTime);
            e.add(light);
            this.lights.push(light);
            light = new vs.LEDLight(e, w - off, y + off, color, rad, 1, true, fadeToFrom, fadeTime);
            e.add(light);
            this.lights.push(light);
            light = new vs.LEDLight(e, x + off, h - off, color, rad, 1, true, fadeToFrom, fadeTime);
            e.add(light);
            this.lights.push(light);
            light = new vs.LEDLight(e, w - off, h - off, color, rad, 1, true, fadeToFrom, fadeTime);
            e.add(light);
            this.lights.push(light);
            if(!start) {
                this.switchLights(false);
            }
            this.active = true;
            this.movable = false;
            this.enableCollisionDetection = true;
            this.collidable = true;
        }
        Elevator.prototype.switchLights = function (v) {
            var l = this.lights[0];
            if(v && l.visible) {
                return;
            } else {
                if(!v && !l.visible) {
                    return;
                }
            }
            this.lights.forEach(function (light) {
                light.visible = v;
                light.intensity = 0;
            });
        };
        Elevator.prototype.collide = function (e, obj) {
            if(!this.isStart) {
                if(obj instanceof vs.Player) {
                    vs.Game.game.hud.alert("Do you want to continue to the next level? Y/N");
                    if(vs.Keyboard.justPressed(vs.Keys.Y)) {
                        vs.Game.game.nextLevel();
                    }
                }
            }
        };
        Elevator.prototype.update = function (delta) {
            if(!this.isStart) {
                var los = vs.Util.getLos(this.position, vs.Game.game.player.position);
                if(this.containsPlayer(los)) {
                    this.switchLights(true);
                } else {
                    this.switchLights(false);
                }
            }
        };
        Elevator.prototype.containsPlayer = function (list) {
            if(list) {
                for(var i = 0; i < list.length; i++) {
                    if(list[i] instanceof vs.Wall) {
                        return false;
                    }
                    if(list[i] instanceof vs.Player) {
                        return true;
                    }
                }
            }
            return false;
        };
        return Elevator;
    })(vs.AnimatedSprite);
    vs.Elevator = Elevator;    
})(vs || (vs = {}));
