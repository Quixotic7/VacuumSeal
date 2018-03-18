var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var NPC = (function (_super) {
        __extends(NPC, _super);
        function NPC(x, y, imageName, player) {
                _super.call(this, x, y, imageName);
            this.has_target = false;
            this.active = true;
            this.walking = false;
            this.attacking = false;
            this.sight_range = 0;
            this.atk_range = 0;
            this.move_speed = 0;
            this.sleep_timer = 0;
            this.sleepTime = 1;
            this.hasLos = false;
            this.rotateSmoother = 0.1;
            this.attackDamage = 5;
            this.changeSoundCounter = 0;
            this.soundGain = 2;
            this.attackSoundGain = 1;
            this.hp = 100;
            this.game = vs.Game.game;
            this.player = player;
            this.target = this.player;
            this.targetVec = new vs.Vec2(this.target.x - this._x, this.target._y - this._y);
            this.sound01 = vs.Game.game.assets.sounds3d["enemy01"].copy();
            this.sound02 = vs.Game.game.assets.sounds3d["enemy02"].copy();
            this.sound03 = vs.Game.game.assets.sounds3d["enemy03"].copy();
            this.collisionObjs = [];
            this.direction = vs.Vec2.makeRandom().unit();
        }
        NPC.prototype.update = function (delta, moveToTarget) {
            if (typeof moveToTarget === "undefined") { moveToTarget = true; }
            if(this.hp <= 0) {
                this.kill();
            }
            this.updateSound(delta);
            if(moveToTarget) {
                var target = this.target;
                var move_to = new vs.Vec2(0, 0);
                var atk = false;
                var to_player = new vs.Vec2(target.x - this.x, target.y - this.y);
                var sightRange2 = this.sight_range * this.sight_range;
                var dist2 = to_player.length2();
                var minDist = this.boundingRadius * this.boundingRadius;
                if(dist2 <= sightRange2 && dist2 > minDist) {
                    if(this.checkLOS(target)) {
                        this.has_target = true;
                        this.hasLos = true;
                        this.sleep_timer = this.sleepTime;
                        this.targetVec = to_player.clone();
                    } else {
                        if(this.sleep_timer < 0) {
                            this.has_target = false;
                        }
                        if(this.hasLos) {
                            this.targetVec = to_player.clone();
                            this.hasLos = false;
                        }
                    }
                }
                if(this.has_target) {
                    if(this.atack_check()) {
                        this.attack();
                    } else {
                        if(this.targetVec.length2() < 100 && !this.hasLos) {
                            this.target_search(delta);
                        } else {
                            move_to = this.try_move(this.targetVec.clone(), delta);
                            this.move(move_to, delta);
                        }
                    }
                } else {
                    if(this.sleep_timer < 0) {
                        this.wander(delta);
                    }
                }
                this.sleep_timer -= delta;
            }
            this.collisionObjs = [];
            this.oldPos.x = this._x;
            this.oldPos.y = this._y;
        };
        NPC.prototype.wander = function (delta) {
            var pos = new vs.Vec2(this._x, this._y);
            if(this.checkNewPos(pos, true) == false) {
                var wall;
                this.collisionObjs.length;
                for(var i = 0; i < this.collisionObjs.length; i++) {
                    if(this.collisionObjs[i] instanceof vs.Wall) {
                        wall = this.collisionObjs[i];
                        break;
                    }
                }
                if(wall) {
                    var wallPos = new vs.Vec2(wall.x + 32, wall.y + 32);
                    if(this.x < wallPos.x) {
                        this.x -= 1;
                    } else {
                        if(this.x > wallPos.x) {
                            this.x += 1;
                        }
                    }
                    if(this.y < wallPos.y) {
                        this.y -= 1;
                    } else {
                        if(this.y > wallPos.y) {
                            this.y += 1;
                        }
                    }
                }
            }
            var rnd = 10;
            this.direction.rotateDeg(vs.Random.range(-rnd, rnd));
            var newPos = new vs.Vec2(this._x, this._y);
            newPos.x += this.direction.x * delta * this.move_speed;
            newPos.y += this.direction.y * delta * this.move_speed;
            if(this.checkNewPos(newPos, true)) {
                this.x = newPos.x;
                this.y = newPos.y;
            } else {
                var pos = new vs.Vec2(0, 0);
                pos.x = newPos.x;
                pos.y = this._y;
                if(this.checkNewPos(pos, true)) {
                    this.x = newPos.x;
                } else {
                    this.direction.x = -this.direction.x;
                    this.x += this.direction.x * delta * this.move_speed;
                }
                pos.x = this._x;
                pos.y = newPos.y;
                if(this.checkNewPos(pos, true)) {
                    this.y = newPos.y;
                } else {
                    this.direction.y = -this.direction.y;
                    this.y += this.direction.y * delta * this.move_speed;
                }
            }
            var angleOfMotion = this.direction.angleDegConstrained() - 90;
            this.rotation = vs.Spinor.slerp2D(this.rotation, angleOfMotion, this.rotateSmoother);
        };
        NPC.prototype.playAttackSound = function () {
            var rnd = vs.Random.range(0, 5);
            var snd;
            switch(rnd) {
                case 0: {
                    snd = this.game.assets.sounds3d["enemyAttack01"];
                    break;

                }
                case 1: {
                    snd = this.game.assets.sounds3d["enemyAttack02"];
                    break;

                }
                case 2: {
                    snd = this.game.assets.sounds3d["enemyAttack03"];
                    break;

                }
                case 3: {
                    snd = this.game.assets.sounds3d["enemyAttack04"];
                    break;

                }
                case 4: {
                    snd = this.game.assets.sounds3d["enemyAttack05"];
                    break;

                }
                case 5: {
                    snd = this.game.assets.sounds3d["enemyAttack06"];
                    break;

                }
            }
            if(snd) {
                snd.setPos(this.x, this.y, 0);
                snd.setGain(this.attackSoundGain);
                snd.playOver();
            }
        };
        NPC.prototype.updateSound = function (delta) {
            if(this.sound01 && this.sound02 && this.sound03) {
                if(this.changeSoundCounter < 0) {
                    if(this.sound3d) {
                        this.sound3d.stop();
                    }
                    var rnd = vs.Random.range(0, 2);
                    switch(rnd) {
                        case 0: {
                            this.sound3d = this.sound01;
                            break;

                        }
                        case 1: {
                            this.sound3d = this.sound02;
                            break;

                        }
                        case 2: {
                            this.sound3d = this.sound03;
                            break;

                        }
                    }
                    this.sound3d.play();
                    this.sound3d.setGain(this.soundGain);
                    this.changeSoundCounter = vs.Random.lerp(5, 30);
                }
            }
            if(this.sound3d) {
                this.sound3d.setPos(this.x, this.y, 0);
            }
            this.changeSoundCounter -= delta;
        };
        NPC.prototype.kill = function () {
            vs.Game.game.particleMangager.createGuts(this.x, this.y);
            this.exists = false;
            this.sound3d.stop();
            this.sound3d.free();
            this.sound3d = null;
            var rnd = vs.Random.range(1, 3);
            var sound;
            if(rnd == 1) {
                sound = vs.Game.game.assets.sounds["enemyExplode01"];
            } else {
                if(rnd == 2) {
                    sound = vs.Game.game.assets.sounds["enemyExplode02"];
                } else {
                    if(rnd == 3) {
                        sound = vs.Game.game.assets.sounds["enemyExplode03"];
                    }
                }
            }
            sound.setGain(vs.Random.lerp(0.3, 1), 0);
            sound.playOver();
        };
        NPC.prototype.collide = function (e, obj) {
            if(e.type == vs.EffectType.BULLET) {
                if(e.hp) {
                    this.hp += e.hp;
                }
            }
            this.collisionObjs.push(obj);
        };
        NPC.prototype.attack = function () {
        };
        NPC.prototype.move = function (move_to, delta) {
            var angleOfMotion = vs.Util.radToDeg(Math.atan2(move_to.y, move_to.x)) - 90;
            this.rotation = vs.Spinor.slerp2D(this.rotation, angleOfMotion, this.rotateSmoother);
            this.direction = vs.Vec2.makeFromAngleDeg(this.rotation);
            this._x += move_to.x;
            this._y += move_to.y;
        };
        NPC.prototype.target_search = function (delta) {
            var ways = new Array();
            var resolution = 8;
            var step = 180 / resolution;
            var tryVec = this.targetVec.clone();
            var tempR;
            var tempL;
            tryVec.scale(this.sight_range / tryVec.length());
            for(var i = 0; i < resolution; i += 2) {
                tempR = tryVec.clone();
                tempR.rotateDeg(step);
                tempR = this.scaleToSolid(tempR);
                ways[i] = tempR.clone();
                tempL = tryVec.clone();
                tempL.rotateDeg(-step);
                tempL = this.scaleToSolid(tempL);
                ways[i + 1] = tempL.clone();
            }
            for(var i = 0; i < resolution; i++) {
                if(tryVec.length() < ways[i].length()) {
                    tryVec = ways[i];
                }
            }
            this.try_move(tryVec, delta);
        };
        NPC.prototype.scaleToSolid = function (vec) {
            var losList;
            var dist;
            var out = vec.clone();
            losList = vs.Util.getLos(new vs.Point(this.x, this.y), new vs.Point(vec.x, vec.y));
            dist = new vs.Vec2(this._x - losList[0].position.x, this._y - losList[0].position.y);
            out.scale(dist.length() / vec.length());
            return out;
        };
        NPC.prototype.checkLOS = function (target) {
            return vs.Util.checkLOS(this, target);
        };
        NPC.prototype.checkDist = function (range, target) {
            var rangeVec = new vs.Vec2(target.x - this.x, target.y - this.y);
            var dist2 = rangeVec.length2();
            if(dist2 > range * range) {
                return false;
            }
            return vs.Util.checkLOS(this, target);
        };
        NPC.prototype.try_move = function (dest, delta) {
            var moveTo = new vs.Vec2(0, 0);
            var nomDest;
            var absDest = new vs.Vec2(this._x, this._y);
            nomDest = dest.unit();
            absDest.x += nomDest.x * delta * this.move_speed;
            absDest.y += nomDest.y * delta * this.move_speed;
            if(this.checkNewPos(absDest)) {
                moveTo.x = absDest.x - this._x;
                moveTo.y = absDest.y - this._y;
            } else {
                nomDest = this.pathAroundPRO(dest);
                if(nomDest.x !== 0 && nomDest.y !== 0) {
                    nomDest.normalize();
                    absDest.x = this._x + nomDest.x * delta * this.move_speed;
                    absDest.y = this._y + nomDest.y * delta * this.move_speed;
                    moveTo.x = absDest.x - this._x;
                    moveTo.y = absDest.y - this._y;
                }
            }
            return moveTo;
        };
        NPC.prototype.checkNewPos = function (newPos, precise) {
            if (typeof precise === "undefined") { precise = false; }
            for(var i = 0; i < this.collisionObjs.length; i++) {
                var obj = this.collisionObjs[i];
                if(obj.affector.solid) {
                    if(precise) {
                        if(this.checkMove(newPos, obj) == false) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
            return true;
        };
        NPC.prototype.checkMove = function (newPos, obj) {
            var myBounds = this.boundingRect;
            var yourBounds = obj.boundingRect;
            var boundX = this.boundX;
            var boundY = this.boundY;
            myBounds.x = newPos.x + boundX;
            myBounds.y = newPos.y + boundY;
            if(myBounds.intersects(yourBounds)) {
                return false;
            }
            return true;
        };
        NPC.prototype.pathAroundPRO = function (vec) {
            var newPath = new vs.Vec2(0, 0);
            var pathL;
            var pathR;
            pathL = vec.clone();
            pathR = vec.clone();
            var losList;
            for(var i = 0; i < 18; i++) {
                pathL.rotateDeg(10);
                pathR.rotateDeg(-10);
                losList = vs.Util.getLos(new vs.Point(this._x, this._y), new vs.Point(pathL.x + this._x, pathL.y + this._y));
                if(!vs.Util.containsSolid(losList)) {
                    return pathL;
                }
                losList = vs.Util.getLos(new vs.Point(this._x, this._y), new vs.Point(pathR.x + this._x, pathR.y + this._y));
                if(!vs.Util.containsSolid(losList)) {
                    return pathR;
                }
            }
            return newPath;
        };
        NPC.prototype.atack_check = function () {
            if(this.checkDist(this.atk_range, this.target)) {
                this.attacking = true;
                return true;
            }
            this.attacking = false;
            return false;
        };
        Object.defineProperty(NPC.prototype, "affector", {
            get: function () {
                var dmg = 0;
                var affector = {
                    type: vs.EffectType.NPC
                };
                return affector;
            },
            enumerable: true,
            configurable: true
        });
        return NPC;
    })(vs.AnimatedSprite);
    vs.NPC = NPC;    
    var Mob = (function (_super) {
        __extends(Mob, _super);
        function Mob(x, y, type) {
                _super.call(this, x, y, "mob2", vs.Game.game.player);
            this.attackCounter = 0;
            this.attackInterval = 1;
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 50;
            this.move_speed = 100;
            this.sleepTime = 50;
            this.sleep_timer = 0;
            this.hp = 300;
            this.addAnimation("walk", [
                0, 
                4
            ], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);
            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }
        Mob.prototype.attack = function () {
            var d = vs.FPS.getDelta();
            this.attackCounter -= d;
            if(this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                var dir = new vs.Vec2(this.x, this.y);
                var angle = vs.Vec2.makeFromAngleDeg(this.rotation + 90);
                dir.addRel(angle.scale(30));
                this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                this.game.player.hurt(this.attackDamage);
            }
        };
        return Mob;
    })(NPC);
    vs.Mob = Mob;    
    var Creeper = (function (_super) {
        __extends(Creeper, _super);
        function Creeper(x, y, type) {
                _super.call(this, x, y, "mob2", vs.Game.game.player);
            this.attackCounter = 0;
            this.attackInterval = 1;
            this.seen = false;
            this.turnOn = 1;
            this.angleTime = 1;
            this.angleCounter = 1;
            this.angleVarience = 45;
            this.runAngle = 180;
            this.runSpeed = 200;
            this.creepSpeed = 100;
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 30;
            this.move_speed = this.creepSpeed;
            this.sleepTime = 1;
            this.sleep_timer = 0;
            this.attackDamage = 5;
            this.hp = 300;
            this.addAnimation("walk", [
                0, 
                4
            ], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);
            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }
        Creeper.prototype.attack = function () {
            var target = this.target;
            var rotateToTarget = new vs.Vec2(target.x - this._x, target.y - this._y).angleDeg() - 90;
            this.rotation = vs.Spinor.slerp2D(this.rotation, rotateToTarget, 0.05);
            var d = vs.FPS.getDelta();
            this.attackCounter -= d;
            if(this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                this.shoot();
                this.playAttackSound();
            }
        };
        Creeper.prototype.update = function (delta) {
            this.seen = vs.Util.checkFOV(this, this.player);
            if(this.seen) {
                this.move_speed = this.runSpeed;
                this.angleCounter += delta;
                if(this.angleCounter >= this.angleTime) {
                    this.runAngle = vs.Random.lerp(180 - this.angleVarience, 180 + this.angleVarience);
                    this.angleCounter = 0;
                }
                var run_to = this.try_move(this.targetVec.clone().rotateDeg(this.runAngle), delta);
                if(this.checkNewPos(this.position.toVec().add(run_to.unit().scale(10))) == false) {
                    this.attack();
                } else {
                    this.moveAndCheckCollisions(run_to);
                }
                _super.prototype.update.call(this, delta, false);
            } else {
                this.move_speed = this.creepSpeed;
                _super.prototype.update.call(this, delta);
            }
        };
        Creeper.prototype.moveAndCheckCollisions = function (move_to) {
            var angleOfMotion = vs.Util.radToDeg(Math.atan2(move_to.y, move_to.x)) - 90;
            this.rotation = vs.Spinor.slerp2D(this.rotation, angleOfMotion, this.rotateSmoother);
            this.direction = vs.Vec2.makeFromAngleDeg(this.rotation);
            var newPos = new vs.Vec2(this._x + move_to.x, this._y + move_to.y);
            if(this.checkNewPos(newPos, true)) {
                this._x += move_to.x;
                this._y += move_to.y;
            }
        };
        Creeper.prototype.shoot = function () {
            var dir = new vs.Vec2(this.x, this.y);
            var angle = vs.Vec2.makeFromAngleDeg(this.rotation - 90);
            dir.addRel(angle.scale(30));
            this.projectBullet(dir, this.rotation - 180);
        };
        Creeper.prototype.projectBullet = function (p, angle) {
            var bullet = new vs.Bullet(p.x, p.y, angle, "bullets", this);
            bullet.lifeSpan = 3;
            bullet.afterLife = 0;
            bullet.damageAmt = this.attackDamage;
            bullet.speed = 60;
            bullet.accel = 0;
            bullet.playerBullet = false;
            vs.Game.game.world.add(bullet);
        };
        return Creeper;
    })(NPC);
    vs.Creeper = Creeper;    
    var Runner = (function (_super) {
        __extends(Runner, _super);
        function Runner(x, y, type) {
                _super.call(this, x, y, "mob2", vs.Game.game.player);
            this.attackCounter = 0;
            this.attackInterval = 1;
            this.seen = false;
            this.turnOn = 60;
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 300;
            this.move_speed = 100;
            this.sleepTime = 100;
            this.sleep_timer = 0;
            this.hp = 300;
            this.addAnimation("walk", [
                0, 
                4
            ], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);
            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }
        Runner.prototype.attack = function () {
            var d = vs.FPS.getDelta();
            this.attackCounter -= d;
            if(this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                var dir = new vs.Vec2(this.x, this.y);
                var angle = vs.Vec2.makeFromAngleDeg(this.rotation + 90);
                dir.addRel(angle.scale(30));
                this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                this.game.player.hurt(this.attackDamage);
            }
        };
        Runner.prototype.update = function (delta) {
            this.seen = vs.Util.checkFOV(this, this.player);
            if(this.seen) {
                var run_to = this.try_move(this.targetVec.clone().rotateDeg(180), delta);
                if(run_to.length() < this.turnOn) {
                    this.attack();
                } else {
                    this.move(run_to, delta);
                }
            } else {
                _super.prototype.update.call(this, delta);
            }
        };
        return Runner;
    })(NPC);
    vs.Runner = Runner;    
    var FaceHugger = (function (_super) {
        __extends(FaceHugger, _super);
        function FaceHugger(x, y, type) {
                _super.call(this, x, y, "mob2", vs.Game.game.player);
            this.attackCounter = 1;
            this.attackInterval = 5;
            this.leap_range = 0;
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 10;
            this.move_speed = 80;
            this.sleepTime = 100;
            this.sleep_timer = 0;
            this.hp = 30;
            this.addAnimation("walk", [
                0, 
                4
            ], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);
            this.leap_range = 150;
            this.attackDamage = 4;
            this.attackSoundGain = 0.002;
            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }
        FaceHugger.prototype.attack = function () {
            this.attackCounter -= vs.FPS.getDelta();
            if(this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                var dir = new vs.Vec2(this.x, this.y);
                var angle = vs.Vec2.makeFromAngleDeg(this.rotation + 90);
                dir.addRel(angle.scale(30));
                this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                this.game.player.hurt(4);
            }
        };
        FaceHugger.prototype.update = function (delta) {
            _super.prototype.update.call(this, delta);
            if(this.hasLos) {
                if(this.checkDist(this.leap_range, this.target)) {
                    this.move_speed = 1000;
                }
                if(this.checkDist(10, this.target)) {
                    this._x = this.target._x;
                    this._y = this.target._y;
                    this.attack();
                }
            } else {
                this.move_speed = 60;
            }
        };
        return FaceHugger;
    })(NPC);
    vs.FaceHugger = FaceHugger;    
    var Leaper = (function (_super) {
        __extends(Leaper, _super);
        function Leaper(x, y, type) {
                _super.call(this, x, y, "mob2", vs.Game.game.player);
            this.attackCounter = 0;
            this.attackInterval = 1;
            this.leap_counter = 0;
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 50;
            this.move_speed = 1;
            this.sleepTime = 100;
            this.sleep_timer = 0;
            this.hp = 300;
            this.addAnimation("walk", [
                0, 
                4
            ], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);
            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }
        Leaper.prototype.attack = function () {
            var d = vs.FPS.getDelta();
            this.attackCounter -= d;
            if(this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                var dir = new vs.Vec2(this.x, this.y);
                var angle = vs.Vec2.makeFromAngleDeg(this.rotation + 90);
                dir.addRel(angle.scale(30));
                this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                this.game.player.hurt(this.attackDamage);
                this.playAttackSound();
            }
        };
        Leaper.prototype.update = function (delta) {
            _super.prototype.update.call(this, delta);
            if(this.hasLos) {
                if(this.leap_counter < 1) {
                    this.move_speed = 500;
                    if(this.leap_counter < -0.01) {
                        this.leap_counter = 2;
                        this.move_speed = 1;
                    }
                }
                this.leap_counter -= delta;
            }
        };
        return Leaper;
    })(NPC);
    vs.Leaper = Leaper;    
    var MobType = (function () {
        function MobType() { }
        MobType.FACEHUGGER = 1;
        MobType.CREEPER = 2;
        MobType.LEAPER = 3;
        return MobType;
    })();
    vs.MobType = MobType;    
})(vs || (vs = {}));
