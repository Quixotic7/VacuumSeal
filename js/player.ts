
module vs {
    export class Player extends AnimatedSprite {
        game: Game;
        walking: bool = false;
        flashlight: Light;
        weaponManager: WeaponManager;

        hp: number = 0;
        maxHp: number = 100;

        enableControl: bool = true;

        rotateSmoother: number = 0.3;

        play: SPlay;

        private _upFirst: bool;
        private _leftFirst: bool;
        private _desiredRotation: number = 0;

        hurtTimer: number = 0;
        hurtInterval: number = 0.1;

        hurtTotal: number = 0;
        hurtfade: bool = false;

        meleeAttackAmt: number = 8;

        constructor (x: number, y: number, game:Game) {
            super(x,y,"player");

            this.zIndex = 100;

            this.regX = 32;
            this.regY = 32;

            this.addAnimation("walk", [1, 6], "walk", 8);
            this.addAnimation("stop", [0], "stop", 1);
            this.addAnimation("shootStopped", [7], "shootStopped", 2);
            this.addAnimation("shootWalking", [8], "shootWalking", 2);


            this.oldPos = new Vec2(0, 0);
            this.direction = new Vec2(0, 0);

            this.boundingRadius = 16;

            this.boundX = -16;
            this.boundY = -16;

            this.boundWidth = 32;
            this.boundHeight = 32;

            this.rotationOffset = -90;
            this.fov = 90;
            // this.fovMin = -45;

            this.speed = 200;

            this.createLight();

            this.game = game;
            this.weaponManager = new WeaponManager(game, this);

            this.play = SPlay.instance();
        }

        get localX() {
            return this.x - Game.game.world.camera.x;
        }

        get localY() {
            return this.y - Game.game.world.camera.y;
        }

        createLight() {
            this.flashlight = Game.game.lightEngine.createLight(0, 0, 500, LightType.FLASHLIGHT);
            this.flashlight.drawShadows = true;
            this.flashlight.limitFov = true;
        }

        reset() {
            this.createLight();
            // this.weaponManager = new WeaponManager(this);
            // this.hp = 100;
        }

        restart() {
            this.createLight();
            //this.weaponManager = new WeaponManager(this);
            this.hp = 100;
            this.maxHp = 100;
            this.hurtTotal = 0;
            this.hurtfade = false;
            this.weaponManager.restart();
        }

        checkLine() {
            
        }


        update(delta?:number) {
            this.updateRotation(delta);
            if(this.enableControl) this.checkKeys();
            this.updatePosition(delta);
            this.updateFlashlight();
            this.weaponManager.update(delta);
            this.updateListenerPosition();
            this.hurtTimer += delta;

            if (this.hurtTotal > 0) {
                this.play.fade(1 - this.hurtTotal, 0.02, 255, 0, 0, 0.8);
                //this.hurtTotal = 0;
                this.hurtfade = true;
            } else if (this.hurtTotal <= 0) {
                if (this.hurtfade) {
                    this.play.fade(1, 0.0004, 255, 0, 0, 0.8);
                    this.hurtfade = false;
                }
                
            }

            this.hurtTotal *= 0.999;
            if (this.hurtTotal < 0.00001) this.hurtTotal = 0;
        }

        meleeAttack() {
            var objs = this.game.world.collisionAtPoint(this.position);

            for (var i = 0; i < objs.length; i++) {
                if (objs[i] instanceof NPC) {
                    var npc = <NPC>objs[i];
                    npc.hp -= this.meleeAttackAmt;
                }
            }

            var snd: snd.Sound;

            var rnd = Random.range(0, 2);
            switch (rnd) {
                case 0:
                    snd = this.game.assets.sounds["melee01"];
                break;
                case 1:
                    snd = this.game.assets.sounds["melee02"];
                break;
                case 2:
                    snd = this.game.assets.sounds["melee03"];
                break;
            }

            
            snd.play();
            snd.setGain(0.3);

        }

        collide(e: Effect, obj:GameObject) {
            // If the effect is solid, we can't walk through it and will check 
            // collisions on each axis, putting the player back to non colliding position
            if (e.solid) {
                this.checkCollisionAndMove(obj);
            }

            if (obj instanceof Bullet) {
                console.log(e.owner);
                if (!(e.owner === this)) {
                    this.hurt(-e.hp);
                }
                var b = <Bullet>obj;
                b.damageAmt = 0;
            }

            this.effect(e);
        }

        effect(e: Effect) {
            if (e.type == EffectType.BULLET) {
                
            } if (e.type == EffectType.NPC) {
                // this.hurt(-e.hp);
            } if (e.type == EffectType.HEALTH) {
                this.heal(e.hp);
            }
            else if (e.hp) {
                // Game.game.hud.alert("Mmmm.... Health. +" + e.hp + " HP",1 );
                // console.log("Adding HP: " + e.hp);
                // this.hp += e.hp;
            }
            
        }

        heal(amt: number) {
            if (amt < 0) {
                console.log("Need positive hp to heal");
                return;
            }

            this.hp += amt;
            if (this.hp > this.maxHp) this.hp = this.maxHp;
        }

        hurt(amt:number) {
            if (amt < 0) {
                console.log("Need positive hp to hurt");
                return;
            }

            //console.log("Hurt amt = " + amt);
            
            if (this.hurtTimer >= this.hurtInterval) {
                this.hurtTimer = 0;
                var previousHp = this.hp;
                this.hp -= amt;
                if (this.hp > this.maxHp) {
                    this.hp = this.maxHp;
                }
                if (this.hp < 0) {
                    this.hp = 0;
                    this.game.gameOver();
                }
                // var amount = ((1 / (this.hp - previousHp)));
                // var amount = 
                this.hurtTotal += amt * 0.01;
                
            }
        }

        updateRotation(delta:number) {
            var angleToMouse = Util.radToDeg(Math.atan2(Mouse.y - this.localY, Mouse.x - this.localX)) - this.rotationOffset;
            this.rotation = Spinor.slerp2D(this.rotation, angleToMouse, this.rotateSmoother);
        }

        updateListenerPosition() {
            Game.game.soundManager.setListener(this.x, this.y, 0);
        }

        checkKeys() {
            var up, down, left, right;
            up = down = left = right = false;

            if (Keyboard.check(Keys.W)) up = true;
            if (Keyboard.check(Keys.S)) down = true;
            if (Keyboard.check(Keys.A)) left = true;
            if (Keyboard.check(Keys.D)) right = true;

            this.direction.setZero();
            if (up && !down) {
                this._upFirst = true;
                this.direction.setN(0, -1);
            }
            if (right && !left) {
                this._leftFirst = false;
                this.direction.setN(1, 0);
            }
            if (down && !up) {
                this._upFirst = false;
                this.direction.setN(0, 1);
            }
            if (left && !right) {
                this._leftFirst = true;
                this.direction.setN(-1, 0);
            }
            if (up && down) {
                if (this._upFirst) {
                    this.direction.setN(0, 1);
                } else {
                    this.direction.setN(0, -1);
                }
            }
            if (left && right) {
                if (this._leftFirst) {
                    this.direction.setN(1, 0);
                } else {
                    this.direction.setN(-1, 0);
                }
            }
            if (up && right)    this.direction.setN(1, -1);
            if (right && down)  this.direction.setN(1, 1);
            if (down && left)   this.direction.setN(-1, 1);
            if (left && up)     this.direction.setN(-1, -1);

            var firing = false;
            if (Mouse.down()) {
                this.weaponManager.fire(this.position, this.rotation);
                firing = true;
            }
            if (Keyboard.justPressed(Keys.F)) {
                this.meleeAttack();
            }

            var walking = (up || down || left || right)

            if (walking && !firing) {
                if (this.getAnimation() != "walk") {
                    this.gotoAndPlay("walk");
                }
            } else if (firing) {
                if (walking) {
                    this.gotoAndPlay("shootWalking");
                } else {
                    this.gotoAndPlay("shootStopped");
                }
            }
            else {
                this.gotoAndPlay("stop");
            }
        }

        updateFlashlight() {
            this.flashlight.setPos(this.x, this.y);
            // this.flashlight.setRotation(this.rotation);
            this.flashlight.rotation = this.rotation;
            // console.log("Flashlight: " + this.flashlight.light.x + ":" + this.flashlight.light.y);
        }

        render(ctx:CanvasRenderingContext2D) {
            super.render(ctx);

            if (D.drawPlayerBoundingRect) {
                var bounds = this.boundingRect;
                var dx, dy;
                dx = this.x - bounds.x;
                dy = this.y - bounds.y;

                ctx.beginPath();
                ctx.strokeStyle = "red";
                ctx.rect(dx, dy, bounds.width, bounds.height);
                ctx.stroke();                
            }

            if(D.drawLaser)
                this.projectLaserBeam(ctx);


        }

        projectLaserBeam(ctx:CanvasRenderingContext2D) {
            var start = new Point(this.x, this.y);
            var end = Util.getEndpoint(start, this.rotation - 90, 400);

            var closest:GameObject = Util.getClosestLine(start, end, EffectType.WALL);

            start = start.getLocal(this.x, this.y);
            if (closest instanceof Sprite) {
                var s = <Sprite>closest;
                end = s.positionCenter;
                end = end.getLocal(this.x, this.y);

                ctx.strokeStyle = "blue";
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(end.x, end.y);
                ctx.stroke();
            }
        }
    }
}

