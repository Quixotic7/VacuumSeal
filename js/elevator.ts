module vs {
    export class Elevator extends AnimatedSprite {
        lights: Light[];
        isStart: bool;

        constructor (x:number, y:number, start:bool) {
            super(x, y, "elevator");
            this.zIndex = 5;

            this.isStart = start;

            this.addAnimation("screenStatic", [0, 4], "screenStatic", 12);
            this.gotoAndPlay("screenStatic");

            var color = new Color(255, 255, 255, 1);
            var rad = 8;
            var off = 6;
            var w = x + 64;
            var h = y + 64;
            this.zIndex = 2;
            var e = Game.game.lightEngine;
            var fadeToFrom = new Pair(0, 1);
            var fadeTime = 2;
            var color: Color;
            if (start) color = new Color(0, 0, 255, 1);
            else color = new Color(255, 0, 0, 1);

            this.lights = [];
            var light = new LEDLight(e, x + off, y + off, color, rad, 1, true, fadeToFrom, fadeTime);
            e.add(light);
            this.lights.push(light);
            light = new LEDLight(e, w - off, y + off, color, rad, 1, true, fadeToFrom, fadeTime);
            e.add(light);
            this.lights.push(light);
            light = new LEDLight(e, x + off, h - off, color, rad, 1, true, fadeToFrom, fadeTime);
            e.add(light);
            this.lights.push(light);
            light = new LEDLight(e, w - off, h - off, color, rad, 1, true, fadeToFrom, fadeTime);
            e.add(light);
            this.lights.push(light);

            if(!start)
                this.switchLights(false);

            this.active = true;
            this.movable = false;
            this.enableCollisionDetection = true;
            this.collidable = true;
        }

        switchLights(v: bool) {
            var l = this.lights[0];
            if(v && l.visible) return;
            else if( !v && !l.visible) return;
            this.lights.forEach((light: Light) =>{
                light.visible = v;
                light.intensity = 0;
            });
        }

        collide(e: Effect, obj:GameObject) {
            if (!this.isStart) {
                if (obj instanceof Player) {
                    Game.game.hud.alert("Do you want to continue to the next level? Y/N");
                    if (Keyboard.justPressed(Keys.Y)) {
                        Game.game.nextLevel();
                    }
                }
            }
        }

        update(delta?: number) {
            if (!this.isStart) {
                var los = Util.getLos(this.position, Game.game.player.position);
                if (this.containsPlayer(los)) this.switchLights(true);
                else this.switchLights(false);
            }
        }

        containsPlayer(list:GameObject[]) {
            if (list) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i] instanceof Wall) return false;
                    if (list[i] instanceof Player) {
                        return true;
                    }
                }
            }
            return false;
        }


    }
}