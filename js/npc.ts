/// <reference path="game.ts" />
module vs {

    // Class
    export class NPC extends AnimatedSprite {
        game: Game;
        has_target: bool = false;
        // Active must be true if you want the sprite to be updated by world
        active: bool = true;
        walking: bool = false;
        attacking: bool = false;
        player: Player;
        //distance in squared pixels that the mob will wake on seeing the pc
        sight_range: number = 0;
        atk_range: number = 0;
        move_speed: number = 0;
        sleep_timer: number = 0;
        sleepTime: number = 1;
        target: Sprite;
        targetVec: Vec2;
        hasLos: bool = false;
        rotateSmoother: number = .1;

        attackDamage: number = 5;

        sound3d: snd.Sound3d;


        sound01: snd.Sound3d;
        sound02: snd.Sound3d;
        sound03: snd.Sound3d;
        changeSoundCounter: number = 0;
        soundGain: number = 2;
        attackSoundGain: number = 1;

        // A list of objects the NPC is colliding with
        collisionObjs: GameObject[];
        


        hp: number = 100;

        constructor (x: number, y: number, imageName: string, player: Player) {
            super(x, y, imageName);
            this.game = Game.game;
            this.player = player;
            //DEBUG this just sets the target  to player, but some ai may want a different target OVERRIDE
            this.target = this.player;
            this.targetVec = new Vec2(this.target.x - this._x, this.target._y - this._y);
            //this.sound3d = Game.game.assets.sounds3d["enemy01"].copy();
            //this.sound3d.loop();

            this.sound01 = Game.game.assets.sounds3d["enemy01"].copy();
            this.sound02 = Game.game.assets.sounds3d["enemy02"].copy();
            this.sound03 = Game.game.assets.sounds3d["enemy03"].copy();

            this.collisionObjs = [];
            this.direction = Vec2.makeRandom().unit();
        }

        update(delta?: number, moveToTarget?:bool = true) {
            // Check HP
            if (this.hp <= 0) {
                this.kill();
            }
            // Update the 3d Sound Position

            this.updateSound(delta);


            // return;            if (this.hp <= 0) this.destroy();
            if (moveToTarget) {
                var target = this.target;
                var move_to: Vec2 = new Vec2(0, 0);
                var atk: bool = false;
                var to_player: Vec2 = new Vec2(target.x - this.x, target.y - this.y);
                var sightRange2 = this.sight_range * this.sight_range;
                var dist2 = to_player.length2();
                var minDist = this.boundingRadius * this.boundingRadius;

                // Check to see if the target is within range and within los
                // I changed this to use length2 instead of length as length2 is faster
                if (dist2 <= sightRange2 && dist2 > minDist) {
                    if (this.checkLOS(target)) {
                        // console.log("Has Target");
                        this.has_target = true;
                        this.hasLos = true;
                        this.sleep_timer = this.sleepTime;
                        this.targetVec = to_player.clone();
                    } else {
                        if (this.sleep_timer < 0) {
                            this.has_target = false;
                        }
                        if (this.hasLos) {
                            this.targetVec = to_player.clone();
                            this.hasLos = false;
                        }
                    }
                }

                // What to do if we have a target?
                if (this.has_target) {
                    // Check to see if the target is in range to attack
                    if (this.atack_check()) {
                        this.attack();
                    } else {
                        if (this.targetVec.length2() < 100 && !this.hasLos) {
                            this.target_search(delta);
                        } else {
                            move_to = this.try_move(this.targetVec.clone(), delta);
                            //console.log("try move " + move_to.x + " , " + move_to.y);
                            this.move(move_to, delta);
                        }
                    }
                } else {
                    if (this.sleep_timer < 0)
                        this.wander(delta);

                    //if (this.sleep_timer < 0) {
                    //    this.targetVec = new Vec2((Math.random() * this.move_speed * 2) - (this.move_speed * 2), (Math.random() * this.move_speed * 2) - (this.move_speed * 2));
                    //    this.sleep_timer = this.sleepTime;
                    //}
                    //move_to = this.try_move(this.targetVec.clone(), delta);
                    //this.move(move_to, delta);
                }
                this.sleep_timer -= delta;
            }
            this.collisionObjs = [];

            this.oldPos.x = this._x;
            this.oldPos.y = this._y;
        }

        wander(delta:number) {
            var pos = new Vec2(this._x, this._y);
            if (this.checkNewPos(pos, true) == false) {
                var wall: Wall;
                this.collisionObjs.length;

                for (var i = 0; i < this.collisionObjs.length; i++) {
                    if (this.collisionObjs[i] instanceof Wall) {
                        wall = <Wall>this.collisionObjs[i];
                        break;
                    }
                }

                if (wall) {
                    var wallPos = new Vec2(wall.x + 32, wall.y + 32);
                    if (this.x < wallPos.x) this.x -= 1;
                    else if (this.x > wallPos.x) this.x += 1;
                    if (this.y < wallPos.y) this.y -= 1;
                    else if (this.y > wallPos.y) this.y += 1;
                }
            }



            var rnd = 10;

            this.direction.rotateDeg(Random.range(-rnd, rnd));
            
            var newPos = new Vec2(this._x, this._y);
            newPos.x += this.direction.x * delta * this.move_speed;
            newPos.y += this.direction.y * delta * this.move_speed;

            if (this.checkNewPos(newPos, true)) {
                this.x = newPos.x;
                this.y = newPos.y;
            }
            else {
                var pos = new Vec2(0, 0);
                pos.x = newPos.x;
                pos.y = this._y;
                if (this.checkNewPos(pos, true)) {
                    this.x = newPos.x;
                }
                else {
                    this.direction.x = -this.direction.x;
                    this.x += this.direction.x * delta * this.move_speed;
                }

                pos.x = this._x;
                pos.y = newPos.y;

                if (this.checkNewPos(pos, true)) {
                    this.y = newPos.y;
                }
                else {
                    this.direction.y = -this.direction.y;
                    this.y += this.direction.y * delta * this.move_speed;
                }
            }


            var angleOfMotion = this.direction.angleDegConstrained() - 90;
            this.rotation = Spinor.slerp2D(this.rotation, angleOfMotion, this.rotateSmoother);
        }

        playAttackSound() {
            var rnd = Random.range(0, 5);
            var snd: snd.Sound3d;
            switch (rnd) {
                case 0:
                    snd = this.game.assets.sounds3d["enemyAttack01"];
                break;
                case 1:
                    snd = this.game.assets.sounds3d["enemyAttack02"];
                break;
                case 2:
                    snd = this.game.assets.sounds3d["enemyAttack03"];
                break;
                case 3:
                    snd = this.game.assets.sounds3d["enemyAttack04"];
                break;
                case 4:
                    snd = this.game.assets.sounds3d["enemyAttack05"];
                break;
                case 5:
                    snd = this.game.assets.sounds3d["enemyAttack06"];
                break;
            }
            if (snd) {
                snd.setPos(this.x, this.y, 0);
                snd.setGain(this.attackSoundGain);
                snd.playOver();
            }
        }

        updateSound(delta: number) {
            if (this.sound01 && this.sound02 && this.sound03) {
                if (this.changeSoundCounter < 0) {
                    if (this.sound3d) {
                        this.sound3d.stop();
                    }
                    var rnd = Random.range(0, 2);
                    switch (rnd) {
                        case 0:
                            this.sound3d = this.sound01;
                        break;
                        case 1:
                            this.sound3d = this.sound02;
                        break;
                        case 2:
                            this.sound3d = this.sound03;
                        break;
                    }
                    this.sound3d.play();
                    this.sound3d.setGain(this.soundGain);
                    this.changeSoundCounter = Random.lerp(5, 30);
                }
            }

            if (this.sound3d)
                this.sound3d.setPos(this.x, this.y, 0);

            this.changeSoundCounter -= delta;
        }

        kill() {
            Game.game.particleMangager.createGuts(this.x, this.y);
            this.exists = false;

            this.sound3d.stop();
            this.sound3d.free();
            this.sound3d = null;

            var rnd = Random.range(1, 3);
            var sound: snd.Sound;
            if (rnd == 1) {
                sound = Game.game.assets.sounds["enemyExplode01"];
            }
            else if (rnd == 2) {
                sound = Game.game.assets.sounds["enemyExplode02"];
            }
            else if (rnd == 3) {
                sound = Game.game.assets.sounds["enemyExplode03"];
            }

            sound.setGain(Random.lerp(0.3, 1), 0);
            sound.playOver();
        }

        collide(e: Effect, obj: GameObject) {
            if (e.type == EffectType.BULLET) {
                if (e.hp) {
                    this.hp += e.hp;
                }
            }

            this.collisionObjs.push(obj);

            //if (obj instanceof Bullet) {
            //    this.destroy();
            //}
        }

        attack() {
            //start attack cycle
            //fire projectile or just deal damage for melee
        }
        move(move_to: Vec2, delta: number) {
            //start the walk cycle
            //TODO
            var angleOfMotion = Util.radToDeg(Math.atan2(move_to.y, move_to.x)) - 90;
            this.rotation = Spinor.slerp2D(this.rotation, angleOfMotion, this.rotateSmoother);

            this.direction = Vec2.makeFromAngleDeg(this.rotation);

            //move the sprite to the new location

            //var newPos = new Vec2(this._x + move_to.x, this._y + move_to.y);
            //var oldPos = this.oldPos;
            //if (newPos.x !== oldPos.x || newPos.y !== oldPos.y) {
            //    if (this.checkNewPos(newPos, true)) {
            //        this._x += move_to.x;
            //        this._y += move_to.y;
            //    }
            //}

            this._x += move_to.x;
            this._y += move_to.y;
        }

        target_search(delta: number): void {
            var ways: Vec2[] = new Vec2[];
            //Must be odd
            var resolution: number = 8;
            var step: number = 180 / resolution;
            var tryVec: Vec2 = this.targetVec.clone();
            var tempR: Vec2;
            var tempL: Vec2;
            tryVec.scale(this.sight_range / tryVec.length());
            //check for best direction to seek

            for (var i = 0; i < resolution; i += 2) {
                tempR = tryVec.clone();
                tempR.rotateDeg(step);
                tempR = this.scaleToSolid(tempR);
                ways[i] = tempR.clone();

                tempL = tryVec.clone();
                tempL.rotateDeg(-step);
                tempL = this.scaleToSolid(tempL);
                ways[i + 1] = tempL.clone();
            }
            for (var i = 0; i < resolution; i++) {
                if (tryVec.length() < ways[i].length()) {
                    tryVec = ways[i];
                }
            }
            this.try_move(tryVec, delta);

        }

        scaleToSolid(vec: Vec2): Vec2 {
            var losList: GameObject[];
            var dist: Vec2;
            var out: Vec2 = vec.clone();
            losList = Util.getLos(new Point(this.x, this.y), new Point(vec.x, vec.y));
            dist = new Vec2(this._x - losList[0].position.x, this._y - losList[0].position.y);
            out.scale(dist.length() / vec.length());
            return out;
        }

        // Replaced target_seek with this, since you already checked the distance to the target in update, don't see any need to check it again and complicated things
        // Just determine if the target is within the LOS
        checkLOS(target: Sprite) {
            return Util.checkLOS(this, target);
        }

        // checks the give range against the target
        // Returns true if target is within that range
        // And not blocked by a wall
        // Pretty similar to target_seek
        checkDist(range: number, target: Sprite) {
            var rangeVec = new Vec2(target.x - this.x, target.y - this.y);
            var dist2 = rangeVec.length2();
            if (dist2 > range * range) return false;
            return Util.checkLOS(this, target);
        }

        //target_seek(range: number): bool {
        //    var target_found: bool = false;
        //    // find the player within the given sight radius
        //    var losList: GameObject[];
        //    var range_vec: Vec2 = new Vec2(this.target.x - this.x, this.target.y - this.y);
        //    if (range_vec.length() > range) {
        //        return false;
        //    }
        //    //check los
        //    losList = Util.getLos(new Point(this.x, this.y), new Point(this.target.x, this.target.y));
        //    var containsSolid = Util.containsSolid(losList);
        //    if (containsSolid) {
        //        target_found = false;
        //    } else {
        //        target_found = true;
        //    }
        //    return target_found;
        //}
        try_move(dest: Vec2, delta: number): Vec2 {

            var moveTo: Vec2 = new Vec2(0, 0);
            var nomDest: Vec2;
            var absDest: Vec2 = new Vec2(this._x, this._y);
            nomDest = dest.unit();

            absDest.x += nomDest.x * delta * this.move_speed;
            absDest.y += nomDest.y * delta * this.move_speed;
            //console.log("position = " + this._x + " " + this._y + " moveTo = " + moveTo.x + " " + moveTo.y + " nomDest = " + nomDest.x + " " + nomDest.y + " delta = " + delta);
            //check if the most direct route to target is viable
            //var path: GameObject[];
            //path = Util.getLos(new Point(this.x, this.y), absDest.toPoint());
            //var containsSolid = Util.containsSolid(path);
            // console.log(path);
            if (this.checkNewPos(absDest)) {
                //moveTo.x = nomDest.x * delta * this.move_speed;
                //moveTo.y = nomDest.y * delta * this.move_speed;
                moveTo.x = absDest.x - this._x;
                moveTo.y = absDest.y - this._y;
            } else {
                // if not try a differnt route,
                nomDest = this.pathAroundPRO(dest);
                if (nomDest.x !== 0 && nomDest.y !== 0) {
                    nomDest.normalize();
                    // console.log("nomDest.x = " + nomDest.x + " nomDest.y = " + nomDest.y);
                    absDest.x = this._x + nomDest.x * delta * this.move_speed;
                    absDest.y = this._y + nomDest.y * delta * this.move_speed;
                    //if (this.checkNewPos(absDest)) {
                    //    moveTo.x = absDest.x - this._x;
                    //    moveTo.y = absDest.y - this._y;
                    //}
                    moveTo.x = absDest.x - this._x;
                    moveTo.y = absDest.y - this._y;
                } 
            }

            // console.log("Moveto.x = " + moveTo.x + " Moveto.y = " + moveTo.y);

            return moveTo;


        }

        checkNewPos(newPos: Vec2, precise?:bool = false) {
            for (var i = 0; i < this.collisionObjs.length; i++) {
                var obj = this.collisionObjs[i];
                if (obj.affector.solid) {
                    if (precise) {
                        if (this.checkMove(newPos, obj) == false) return false;
                    }
                    else {
                        return false;
                    }
                }
            }
            return true;
        }

        checkMove(newPos: Vec2, obj:GameObject) {
            var myBounds = this.boundingRect;
            var yourBounds = obj.boundingRect;

            //var x = this.x;
            //var y = this.y;
            //var oldPos = this.position;
            // var newPos: Vec2 = new Vec2(x,y);

            var boundX = this.boundX;
            var boundY = this.boundY;
            //var boundW = this.boundWidth;
            //var boundH = this.boundHeight;

            //var width = this.boundWidth * 0.5;
            //var height = this.boundHeight * 0.5;

            myBounds.x = newPos.x + boundX;
            myBounds.y = newPos.y + boundY;

            if (myBounds.intersects(yourBounds)) return false;
            return true;
        }

        // this.checkCollision(spr, other)

        pathAroundPRO(vec: Vec2): Vec2 {

            var newPath: Vec2 = new Vec2(0, 0);
            var pathL: Vec2;
            var pathR: Vec2;
            pathL = vec.clone();
            pathR = vec.clone();
            var losList: GameObject[];

            for (var i = 0; i < 18; i++) {
                pathL.rotateDeg(10);
                pathR.rotateDeg(-10);
                //check los
                losList = Util.getLos(new Point(this._x, this._y), new Point(pathL.x + this._x, pathL.y + this._y));
                if (!Util.containsSolid(losList)) {
                    return pathL;
                }
                losList = Util.getLos(new Point(this._x, this._y), new Point(pathR.x + this._x, pathR.y + this._y));
                if (!Util.containsSolid(losList)) {
                    return pathR;
                }
            }
            return newPath;
        }

        


        atack_check(): bool {
            // var attack: bool;
            //check if player is close enough to attack
            //check if an attack will hit the player first, and not a wall or something
            // attack = this.target_seek(this.atk_range);
            if (this.checkDist(this.atk_range, this.target)) {
                this.attacking = true;
                return true;
            }
            this.attacking = false;
            return false;
            //if the player is inrange and will be hit return true to proceed with atack
        }

        get affector(): Effect {
            var dmg: number = 0;
            var affector: Effect = {
                type: EffectType.NPC,
            };
            return affector;
        }
    }

    export class Mob extends NPC {
        attackCounter: number = 0;
        attackInterval: number = 1;


        constructor (x: number, y: number, type: number) {
            super(x, y, "mob2", Game.game.player);
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 50;
            this.move_speed = 100;
            this.sleepTime = 50;
            this.sleep_timer = 0;
            this.hp = 300;
            this.addAnimation("walk", [0, 4], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);

            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }

        attack() {
            
            var d = FPS.getDelta();
            this.attackCounter -= d;
            if (this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                var dir = new Vec2(this.x, this.y);
                var angle = Vec2.makeFromAngleDeg(this.rotation + 90);
                dir.addRel(angle.scale(30));
                this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                this.game.player.hurt(this.attackDamage);
            }

        }
    }
    export class Creeper extends NPC {
        attackCounter: number = 0;
        attackInterval: number = 1;
        seen: bool = false;
        turnOn: number = 1;

        angleTime: number = 1;
        angleCounter: number = 1;
        angleVarience: number = 45;
        runAngle: number = 180;

        runSpeed: number = 200;
        creepSpeed: number = 100;

        constructor (x: number, y: number, type: number) {
            super(x, y, "mob2", Game.game.player);
            this.zIndex = 30;

            this.sight_range = 1000;
            this.atk_range = 30;
            this.move_speed = this.creepSpeed;
            this.sleepTime = 1;
            this.sleep_timer = 0;

            this.attackDamage = 5;

            this.hp = 300;
            this.addAnimation("walk", [0, 4], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);

            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }

        attack() {
            var target = this.target;
            var rotateToTarget = new Vec2(target.x - this._x, target.y - this._y).angleDeg() - 90;

            this.rotation = Spinor.slerp2D(this.rotation, rotateToTarget, 0.05);




            var d = FPS.getDelta();
            this.attackCounter -= d;
            if (this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                //var dir = new Vec2(this.x, this.y);
                //var angle = Vec2.makeFromAngleDeg(this.rotation + 90);
                //dir.addRel(angle.scale(30));
                //this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                //this.game.player.hurt(this.attackDamage);

                this.shoot();
                this.playAttackSound();
            }
        }

        update(delta?: number) {
            this.seen = Util.checkFOV(this, this.player);
            if (this.seen) {
                this.move_speed = this.runSpeed;
                this.angleCounter += delta;
                if (this.angleCounter >= this.angleTime) {
                    this.runAngle = Random.lerp(180 - this.angleVarience, 180 + this.angleVarience);
                    this.angleCounter = 0;
                }
                var run_to: Vec2 = this.try_move(this.targetVec.clone().rotateDeg(this.runAngle), delta);
             
                if (this.checkNewPos(this.position.toVec().add(run_to.unit().scale(10))) == false) {
                    this.attack();
                }
                else {
                    this.moveAndCheckCollisions(run_to);
                }
                super.update(delta, false);
            } else {
                this.move_speed = this.creepSpeed;
                super.update(delta);
            }
            
        }

        moveAndCheckCollisions(move_to: Vec2) {
            //start the walk cycle
            //TODO
            var angleOfMotion = Util.radToDeg(Math.atan2(move_to.y, move_to.x)) - 90;
            this.rotation = Spinor.slerp2D(this.rotation, angleOfMotion, this.rotateSmoother);

            this.direction = Vec2.makeFromAngleDeg(this.rotation);

            //move the sprite to the new location

            var newPos = new Vec2(this._x + move_to.x, this._y + move_to.y);
            //var oldPos = this.oldPos;
            //if (newPos.x !== oldPos.x || newPos.y !== oldPos.y) {
            //    if (this.checkNewPos(newPos, true)) {
            //        this._x += move_to.x;
            //        this._y += move_to.y;
            //    }
            //}

            if (this.checkNewPos(newPos, true)) {
                this._x += move_to.x;
                this._y += move_to.y;
            }

            //this._x += move_to.x;
            //this._y += move_to.y;
        }

        shoot() {
            var dir = new Vec2(this.x, this.y);
            var angle = Vec2.makeFromAngleDeg(this.rotation - 90);
            dir.addRel(angle.scale(30));
            this.projectBullet(dir, this.rotation - 180);
        }

        projectBullet(p:Vec2, angle:number) {
            var bullet = new Bullet(p.x, p.y, angle, "bullets", this);
            bullet.lifeSpan = 3;
            bullet.afterLife = 0;
            bullet.damageAmt = this.attackDamage;
            bullet.speed = 60;
            bullet.accel = 0;
            bullet.playerBullet = false;
            Game.game.world.add(bullet);
            // this.playsound();
        }
    }


    export class Runner extends NPC {
        attackCounter: number = 0;
        attackInterval: number = 1;
        seen: bool = false;
        turnOn: number = 60;

        constructor (x: number, y: number, type: number) {
            super(x, y, "mob2", Game.game.player);
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 300;
            this.move_speed = 100;
            this.sleepTime = 100;
            this.sleep_timer = 0;
            this.hp = 300;
            this.addAnimation("walk", [0, 4], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);

            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }

        attack() {
            var d = FPS.getDelta();
            this.attackCounter -= d;
            if (this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                var dir = new Vec2(this.x, this.y);
                var angle = Vec2.makeFromAngleDeg(this.rotation + 90);
                dir.addRel(angle.scale(30));
                this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                this.game.player.hurt(this.attackDamage);
            }
        }
        update(delta?: number) {

            this.seen = Util.checkFOV(this, this.player);
            if (this.seen) {
                var run_to: Vec2 = this.try_move(this.targetVec.clone().rotateDeg(180), delta);
                if (run_to.length() < this.turnOn) {
                    this.attack();
                } else {
                    this.move(run_to, delta);
                }
            } else {
                super.update(delta);
            }

        }
    }
    export class FaceHugger extends NPC {
        attackCounter: number = 1;
        attackInterval: number = 5;
        leap_range: number = 0;

        constructor (x: number, y: number, type: number) {
            super(x, y, "mob2", Game.game.player);
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 10;
            this.move_speed = 80;
            this.sleepTime = 100;
            this.sleep_timer = 0;
            this.hp = 30;
            this.addAnimation("walk", [0, 4], "walk", 6);
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

        //attack() {
            
            
        //    var d = FPS.getDelta();
        //    this.attackCounter -= d;
        //    if (this.attackCounter < 0) {
        //        this.attackCounter = this.attackInterval;
        //        var dir = new Vec2(this.x, this.y);
        //        var angle = Vec2.makeFromAngleDeg(this.rotation + 90);
        //        dir.addRel(angle.scale(30));
        //        this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
        //        // console.log("Facehugging, attackDamage = " + this.attackDamage);
        //        Game.game.player.hurt(this.attackDamage);

        //        // Game.game.player.hp -= this.attackDamage;
        //        // this.playAttackSound();
        //    }
        //}

        attack() {
            this.attackCounter -= FPS.getDelta();
            if (this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                var dir = new Vec2(this.x, this.y);
                var angle = Vec2.makeFromAngleDeg(this.rotation + 90);
                dir.addRel(angle.scale(30));
                this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                this.game.player.hurt(4);
                // this.playAttackSound();
            }
        }


        update(delta?: number) {
            super.update(delta);
            if (this.hasLos) {
                if (this.checkDist(this.leap_range, this.target)) {
                    this.move_speed = 1000;
                }
                if (this.checkDist(10, this.target)) {
                    this._x = this.target._x;
                    this._y = this.target._y;
                    this.attack();
                }
            }
            else {
                this.move_speed = 60;
            }
        }
    }
    export class Leaper extends NPC {
        attackCounter: number = 0;
        attackInterval: number = 1;
        leap_counter: number = 0;

        constructor (x: number, y: number, type: number) {
            super(x, y, "mob2", Game.game.player);
            this.zIndex = 30;
            this.sight_range = 1000;
            this.atk_range = 50;
            this.move_speed = 1;
            this.sleepTime = 100;
            this.sleep_timer = 0;
            this.hp = 300;
            this.addAnimation("walk", [0, 4], "walk", 6);
            this.gotoAndPlay("walk");
            this.regX = Math.floor(this.frameWidth / 2);
            this.regY = Math.floor(this.frameHeight / 2);

            this.boundX = -20;
            this.boundY = -20;
            this.boundWidth = 40;
            this.boundHeight = 40;
        }

        attack() {
            var d = FPS.getDelta();
            this.attackCounter -= d;
            if (this.attackCounter < 0) {
                this.attackCounter = this.attackInterval;
                var dir = new Vec2(this.x, this.y);
                var angle = Vec2.makeFromAngleDeg(this.rotation + 90);
                dir.addRel(angle.scale(30));
                this.game.particleMangager.createAcidSpit(dir.x, dir.y, angle);
                this.game.player.hurt(this.attackDamage);
                this.playAttackSound();
            }
        }
        update(delta?: number) {
            super.update(delta);
            if (this.hasLos) {
                if (this.leap_counter < 1) {
                    this.move_speed = 500;
                    if (this.leap_counter < -.01) {
                        this.leap_counter = 2;
                        this.move_speed = 1;
                    }
                }
                this.leap_counter -= delta;
            }
        }

    }

    export class MobType {
        static FACEHUGGER: number = 1;
        static CREEPER: number = 2;
        static LEAPER: number = 3;
    }
}
