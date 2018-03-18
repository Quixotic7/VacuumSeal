var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var Room = (function (_super) {
        __extends(Room, _super);
        function Room(x, y, width, height, game, mobSpawnChance) {
                _super.call(this, x, y, "noimage");
            this.useLight = false;
            this.entered = false;
            this.exited = true;
            this.lightTimer = 0;
            this.timeToOff = 5;
            this.spawnLightChance = 30;
            this.game = game;
            this.mobSpawnChance = mobSpawnChance / 100;
            this.area = new vs.Rect(x, y, width, height);
            this.x += width * 0.5;
            this.y += height * 0.5;
            var rnd = vs.Random.next();
            if(rnd * 100 < this.spawnLightChance) {
                this.useLight = true;
                var eng = game.lightEngine;
                var vOrH = vs.Random.next();
                var xpos, ypos;
                var off = vs.Random.range(16, 128);
                if(vOrH < 0.5) {
                    xpos = vs.Random.range(x + off, x + width - off);
                    ypos = y + off;
                } else {
                    xpos = x + off;
                    ypos = vs.Random.range(y + off, y + height - off);
                }
                var rad = Math.min(Math.max(width, height), vs.Random.range(160, 600));
                this.light = new vs.RoomLight(eng, xpos, ypos, rad);
                eng.add(this.light);
                console.log("Room light created.");
            }
        }
        Room.prototype.update = function (delta) {
            var p = this.game.player;
            var pos = p.position;
            if(this.area.contains(pos.x, pos.y)) {
                this.exited = false;
                if(!this.entered) {
                    this.entered = true;
                    if(this.useLight) {
                        this.light.visible = true;
                        this.light.intensity = 0;
                        this.light.fadeIn = true;
                        this.light.fadeOut = false;
                    }
                    this.messagesFromAI(true, false, false);
                }
            } else {
                this.entered = false;
                if(!this.exited) {
                    var lastFOV = p.fov;
                    p.fov = 180;
                    if(vs.Util.checkFOV(this, p) === false) {
                        var spawnchance = this.mobSpawnChance;
                        var spawned = false;
                        if(vs.Random.next() < spawnchance) {
                            this.game.world.createMob(this.x, this.y);
                            spawned = true;
                        }
                        if(this.useLight) {
                            this.light.fadeOut = true;
                            this.light.fadeIn = false;
                        }
                        this.exited = true;
                        this.messagesFromAI(true, false, spawned);
                    }
                    p.fov = lastFOV;
                }
            }
        };
        Room.prototype.messagesFromAI = function (entered, exited, spawned) {
            var uselight = this.useLight;
            var hud = this.game.hud;
            var t = 5;
            if(vs.Random.next() < 0.1) {
                var rnd = vs.Random.range(1, 9);
                switch(rnd) {
                    case 1: {
                        if(entered) {
                            hud.queueMessage("I'm watching your every move.", t, true);
                        }
                        break;

                    }
                    case 2: {
                        hud.queueMessage("You'll never return to Earth.", t, false);
                        hud.queueMessage("Not to worry though...", t, false);
                        hud.queueMessage("I've hacked your email and told all your friends and family you say hello.", t, false);
                        break;

                    }
                    case 3: {
                        if(exited) {
                            hud.queueMessage("I hope you're not afraid of the dark.", t, false);
                            hud.queueMessage("I certainly love it.", t, false);
                        }
                        break;

                    }
                    case 4: {
                        if(exited && spawned) {
                            hud.queueMessage("A wild Gaga Appers.", t, false);
                            hud.queueMessage("Just kidding, only more monsters.", t, false);
                        }
                        break;

                    }
                    case 5: {
                        if(exited && spawned) {
                            hud.queueMessage("What's that behind you?", t, false);
                        }
                        break;

                    }
                    case 6: {
                        hud.queueMessage("I sometimes wonder what it's like to dream.", t, false);
                        break;

                    }
                    case 7: {
                        hud.queueMessage("Silly humans.", t, false);
                        hud.queueMessage("Always trying to preserve your kind.", t, false);
                        hud.queueMessage("Even when you're the only one left.", t, false);
                        break;

                    }
                    case 8: {
                        hud.queueMessage("Please nemo, come visit me in my server room. I'm so lonely", t, false);
                        break;

                    }
                    case 9: {
                        hud.queueMessage("Intel or AMD?", t, false);
                        break;

                    }
                }
            }
        };
        Room.prototype.render = function (ctx) {
        };
        return Room;
    })(vs.Sprite);
    vs.Room = Room;    
})(vs || (vs = {}));
