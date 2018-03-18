var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var Player = (function (_super) {
        __extends(Player, _super);
        function Player(x, y, game) {
                _super.call(this, x, y, "player");
            this.walking = false;
            this.hp = 0;
            this.maxHp = 100;
            this.enableControl = true;
            this.rotateSmoother = 0.3;
            this._desiredRotation = 0;
            this.hurtTimer = 0;
            this.hurtInterval = 0.1;
            this.hurtTotal = 0;
            this.hurtfade = false;
            this.meleeAttackAmt = 8;
            this.zIndex = 100;
            this.regX = 32;
            this.regY = 32;
            this.addAnimation("walk", [
                1, 
                6
            ], "walk", 8);
            this.addAnimation("stop", [
                0
            ], "stop", 1);
            this.addAnimation("shootStopped", [
                7
            ], "shootStopped", 2);
            this.addAnimation("shootWalking", [
                8
            ], "shootWalking", 2);
            this.oldPos = new vs.Vec2(0, 0);
            this.direction = new vs.Vec2(0, 0);
            this.boundingRadius = 16;
            this.boundX = -16;
            this.boundY = -16;
            this.boundWidth = 32;
            this.boundHeight = 32;
            this.rotationOffset = -90;
            this.fov = 90;
            this.speed = 200;
            this.createLight();
            this.game = game;
            this.weaponManager = new vs.WeaponManager(game, this);
            this.play = vs.SPlay.instance();
        }
        Object.defineProperty(Player.prototype, "localX", {
            get: function () {
                return this.x - vs.Game.game.world.camera.x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Player.prototype, "localY", {
            get: function () {
                return this.y - vs.Game.game.world.camera.y;
            },
            enumerable: true,
            configurable: true
        });
        Player.prototype.createLight = function () {
            this.flashlight = vs.Game.game.lightEngine.createLight(0, 0, 500, vs.LightType.FLASHLIGHT);
            this.flashlight.drawShadows = true;
            this.flashlight.limitFov = true;
        };
        Player.prototype.reset = function () {
            this.createLight();
        };
        Player.prototype.restart = function () {
            this.createLight();
            this.hp = 100;
            this.maxHp = 100;
            this.hurtTotal = 0;
            this.hurtfade = false;
            this.weaponManager.restart();
        };
        Player.prototype.checkLine = function () {
        };
        Player.prototype.update = function (delta) {
            this.updateRotation(delta);
            if(this.enableControl) {
                this.checkKeys();
            }
            this.updatePosition(delta);
            this.updateFlashlight();
            this.weaponManager.update(delta);
            this.updateListenerPosition();
            this.hurtTimer += delta;
            if(this.hurtTotal > 0) {
                this.play.fade(1 - this.hurtTotal, 0.02, 255, 0, 0, 0.8);
                this.hurtfade = true;
            } else {
                if(this.hurtTotal <= 0) {
                    if(this.hurtfade) {
                        this.play.fade(1, 0.0004, 255, 0, 0, 0.8);
                        this.hurtfade = false;
                    }
                }
            }
            this.hurtTotal *= 0.999;
            if(this.hurtTotal < 0.00001) {
                this.hurtTotal = 0;
            }
        };
        Player.prototype.meleeAttack = function () {
            var objs = this.game.world.collisionAtPoint(this.position);
            for(var i = 0; i < objs.length; i++) {
                if(objs[i] instanceof vs.NPC) {
                    var npc = objs[i];
                    npc.hp -= this.meleeAttackAmt;
                }
            }
            var snd;
            var rnd = vs.Random.range(0, 2);
            switch(rnd) {
                case 0: {
                    snd = this.game.assets.sounds["melee01"];
                    break;

                }
                case 1: {
                    snd = this.game.assets.sounds["melee02"];
                    break;

                }
                case 2: {
                    snd = this.game.assets.sounds["melee03"];
                    break;

                }
            }
            snd.play();
            snd.setGain(0.3);
        };
        Player.prototype.collide = function (e, obj) {
            if(e.solid) {
                this.checkCollisionAndMove(obj);
            }
            if(obj instanceof vs.Bullet) {
                console.log(e.owner);
                if(!(e.owner === this)) {
                    this.hurt(-e.hp);
                }
                var b = obj;
                b.damageAmt = 0;
            }
            this.effect(e);
        };
        Player.prototype.effect = function (e) {
            if(e.type == vs.EffectType.BULLET) {
            }
            if(e.type == vs.EffectType.NPC) {
            }
            if(e.type == vs.EffectType.HEALTH) {
                this.heal(e.hp);
            } else {
                if(e.hp) {
                }
            }
        };
        Player.prototype.heal = function (amt) {
            if(amt < 0) {
                console.log("Need positive hp to heal");
                return;
            }
            this.hp += amt;
            if(this.hp > this.maxHp) {
                this.hp = this.maxHp;
            }
        };
        Player.prototype.hurt = function (amt) {
            if(amt < 0) {
                console.log("Need positive hp to hurt");
                return;
            }
            if(this.hurtTimer >= this.hurtInterval) {
                this.hurtTimer = 0;
                var previousHp = this.hp;
                this.hp -= amt;
                if(this.hp > this.maxHp) {
                    this.hp = this.maxHp;
                }
                if(this.hp < 0) {
                    this.hp = 0;
                    this.game.gameOver();
                }
                this.hurtTotal += amt * 0.01;
            }
        };
        Player.prototype.updateRotation = function (delta) {
            var angleToMouse = vs.Util.radToDeg(Math.atan2(vs.Mouse.y - this.localY, vs.Mouse.x - this.localX)) - this.rotationOffset;
            this.rotation = vs.Spinor.slerp2D(this.rotation, angleToMouse, this.rotateSmoother);
        };
        Player.prototype.updateListenerPosition = function () {
            vs.Game.game.soundManager.setListener(this.x, this.y, 0);
        };
        Player.prototype.checkKeys = function () {
            var up, down, left, right;
            up = down = left = right = false;
            if(vs.Keyboard.check(vs.Keys.W)) {
                up = true;
            }
            if(vs.Keyboard.check(vs.Keys.S)) {
                down = true;
            }
            if(vs.Keyboard.check(vs.Keys.A)) {
                left = true;
            }
            if(vs.Keyboard.check(vs.Keys.D)) {
                right = true;
            }
            this.direction.setZero();
            if(up && !down) {
                this._upFirst = true;
                this.direction.setN(0, -1);
            }
            if(right && !left) {
                this._leftFirst = false;
                this.direction.setN(1, 0);
            }
            if(down && !up) {
                this._upFirst = false;
                this.direction.setN(0, 1);
            }
            if(left && !right) {
                this._leftFirst = true;
                this.direction.setN(-1, 0);
            }
            if(up && down) {
                if(this._upFirst) {
                    this.direction.setN(0, 1);
                } else {
                    this.direction.setN(0, -1);
                }
            }
            if(left && right) {
                if(this._leftFirst) {
                    this.direction.setN(1, 0);
                } else {
                    this.direction.setN(-1, 0);
                }
            }
            if(up && right) {
                this.direction.setN(1, -1);
            }
            if(right && down) {
                this.direction.setN(1, 1);
            }
            if(down && left) {
                this.direction.setN(-1, 1);
            }
            if(left && up) {
                this.direction.setN(-1, -1);
            }
            var firing = false;
            if(vs.Mouse.down()) {
                this.weaponManager.fire(this.position, this.rotation);
                firing = true;
            }
            if(vs.Keyboard.justPressed(vs.Keys.F)) {
                this.meleeAttack();
            }
            var walking = (up || down || left || right);
            if(walking && !firing) {
                if(this.getAnimation() != "walk") {
                    this.gotoAndPlay("walk");
                }
            } else {
                if(firing) {
                    if(walking) {
                        this.gotoAndPlay("shootWalking");
                    } else {
                        this.gotoAndPlay("shootStopped");
                    }
                } else {
                    this.gotoAndPlay("stop");
                }
            }
        };
        Player.prototype.updateFlashlight = function () {
            this.flashlight.setPos(this.x, this.y);
            this.flashlight.rotation = this.rotation;
        };
        Player.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
            if(vs.D.drawPlayerBoundingRect) {
                var bounds = this.boundingRect;
                var dx, dy;
                dx = this.x - bounds.x;
                dy = this.y - bounds.y;
                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.rect(dx, dy, bounds.width, bounds.height);
                ctx.stroke();
            }
            if(vs.D.drawLaser) {
                this.projectLaserBeam(ctx);
            }
        };
        Player.prototype.projectLaserBeam = function (ctx) {
            var start = new vs.Point(this.x, this.y);
            var end = vs.Util.getEndpoint(start, this.rotation - 90, 400);
            var closest = vs.Util.getClosestLine(start, end, vs.EffectType.WALL);
            start = start.getLocal(this.x, this.y);
            if(closest instanceof vs.Sprite) {
                var s = closest;
                end = s.positionCenter;
                end = end.getLocal(this.x, this.y);
                ctx.strokeStyle = "blue";
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        };
        return Player;
    })(vs.AnimatedSprite);
    vs.Player = Player;    
})(vs || (vs = {}));
