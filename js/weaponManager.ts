module vs {
    export class WeaponManager {
        game:Game;
        itemManager: ItemManager;
        owner: GameObject;
        current: Weapon;
        weapons: Weapon[];
        
        constructor (game:Game, owner) {
            this.owner = owner;
            this.game = game;
            this.itemManager = game.itemManager;
            this.init();
        }

        init() {
            this.weapons = [];
            var blaster = new WPN_Blaster(this.owner);
            var machineGun = new WPN_MachineGun(this.owner);
            var stickyRicky = new WPN_StickyGun(this.owner);

            this.current = null;
            
            this.weapons.push(blaster);
            this.weapons.push(machineGun);
            this.weapons.push(stickyRicky);
        }

        restart() {
            this.init();
        }

        addAmmo(v:number, type:string) {
            var weapon = this.findType(type);
            if (weapon !== null) {
                weapon.addAmmo(v, type);
            }
        }

        findType(type:string): Weapon {
            var weapon: Weapon;
            for (var i = 0; i < this.weapons.length; i++) {
                weapon = this.weapons[i];
                if (weapon.ammoType == type) {
                    return weapon;
                }
            }
            return null;
        }

        update(delta:number) {
            this.checkInput();
            this.updateHud();
            
            this.weapons.forEach((weapon: Weapon) =>{
                weapon.update(delta);
            });

               
        }

        fire(position: Point, rotation: number) {
            if (this.current) {
                this.current.shoot(position, rotation);
            }
        }

        checkInput() {  
            if (Keyboard.check(Keys._1)) {
                this._switchTo("blaster");
            }
            if (Keyboard.check(Keys._2)) {
                this._switchTo("machineGun");
            }
            if (Keyboard.check(Keys._3)) {
                this._switchTo("sticky");
            }
            if (Keyboard.justPressed(Keys.R)) {
                if(this.current)
                    this.current.reload();
            }
        
        }

        _switchTo(name: string) {
            if (this.itemManager.hasWeapon(name)) {
                this.switchTo(name);
            }
            // this.switchTo(name);
        }

        switchTo(name:string) {
            switch (name) {
                case "empty":
                    this.current = undefined;
                break;
                case "blaster":
                    this.current = this.weapons[0];
                break;
                case "machineGun":
                    this.current = this.weapons[1];
                break;
                case "sticky":
                    this.current = this.weapons[2];
                break;
            }
        }

        updateHud() {
            if (this.current) {
                if (this.current.infinite) {
                    Game.game.hud.weaponMessage =
                        "Weapon: " + this.current.name +
                        "\nAmmo: Infinite";
                } else {
                    Game.game.hud.weaponMessage =
                        "Weapon: " + this.current.name +
                        "\nAmmo: " + this.current.ammo + "/" + this.current.maxAmmo +
                        " Clip: " + this.current.clip + "/" + this.current.clipSize;
                }
            }
            else {
                Game.game.hud.weaponMessage = "";
                
            }
        }

    }

    export class Weapon {
        name: string = "Default Weapon";
        ammoType: string = "";
        ammo: number = 0;
        maxAmmo: number = 0;
        clip: number = 0;
        clipSize: number = 0;
        infinite: bool = false;

        // How many shots can be shot in a second
        rateOfFire: number = 0; 

        reloadDelay: number = 0;
        reloadTimer: number = 0;
        reloading: bool = false;

        bulletLife: number = 0;
        bulletAfterLife: number = 0;
        bulletSpeed: number = 0;
        hitDamage: number = 0;

        burstAmount: number = 0;

        accuracy: number = 0;

        bulletType: number = 0;

        owner: GameObject;

        sound: snd.Sound;
        reloadSound: snd.Sound;
        emptySound: snd.Sound;


        bulletSparkSound: string = "spark01";
        bulletSparkGain: number = 0.5;

        private delayCounter: number = 0;

        private shotFired: bool = false;

        constructor (owner:GameObject, sound?:string = "bullet01") {
            this.owner = owner;
            this.sound = Game.game.assets.sounds[sound];
            this.reloadSound = Game.game.assets.sounds["reload"];
            this.emptySound = Game.game.assets.sounds["emptyClip"];
            this.sound.setGain(0.06);
            this.reloadSound.setGain(0.06);
            this.emptySound.setGain(0.16);
        }

        addAmmo(v: number, type:string) {
            Game.game.hud.queueMessage("Does "+type+" == "+this.ammoType + "?", 5, false);
            
            if (this.ammoType == type) {
                this.ammo += v;
                if (this.ammo > this.maxAmmo) {
                    this.ammo = this.maxAmmo;
                }
            }
        }

        shoot(p:Point, angle:number) {
            if ((this.clip > 0 || this.infinite) && this.canShoot()) {

                for (var i = 0; i < this.burstAmount; i++) {
                    if (this.canShoot()) {
                        var adjustedAngle = angle - (this.accuracy * 0.5) + (Math.random() * this.accuracy);
                        this.projectBullet(p, adjustedAngle);
                        this.delayCounter = 0;
                    }
                } 

                this.shotFired = true;
                if(!this.infinite)
                    this.clip--;
            }
            
            if (this.clip <= 0) {
                this.emptySound.play();
            }
        }

        reload() {
            if (!this.reloading && this.ammo > 0 && this.clip < this.clipSize) {
                this.reloading = true;
                this.reloadTimer = this.reloadDelay;
                this.reloadSound.play();
            }
        }
        checkReload() {
            if (this.reloading && this.reloadTimer < 0) {
                this._reload();
                this.reloading = false;
            }
        }

        _reload() {
            var numBullets = this.clipSize - this.clip;
            if (this.ammo - numBullets >= 0) {
                this.ammo -= numBullets;
                this.clip += numBullets;
            }
            else {
                this.clip += this.ammo;
                this.ammo = 0;
            }
        }



        update(delta: number) {
            var increment = this.rateOfFire * delta;
            this.delayCounter += increment;
            this.reloadTimer -= delta;
            this.checkReload();
            
        }

        // Made this separate class so child can easily extend
        projectBullet(p:Point, angle:number) {
            
            var bullet = new Bullet(p.x, p.y, angle, "bullets", this.owner, this.bulletSparkSound, this.bulletSparkGain);
            bullet.lifeSpan = this.bulletLife;
            bullet.afterLife = this.bulletAfterLife;
            bullet.damageAmt = this.hitDamage;
            bullet.speed = this.bulletSpeed;
            bullet.accel = this.bulletSpeed;
            bullet.playerBullet = this.owner instanceof Player ? true : false;
            Game.game.world.add(bullet);
            this.playsound();
        }

        canShoot() {
            if (this.delayCounter >= 1) {
                return true;
            }
            return false;
        }

        playsound() {
            this.sound.play();
        }



    }

    export class Bullet extends Sprite {
        lifeSpan: number = 0;
        afterLife: number = 0;
        speed: number = 0;
        accel: number = 0;
        damageAmt: number = 0;
        owner: GameObject;

        vel: Vec2;
        direction: Vec2;

        bulletOffset: number = 32;
        playerBullet: bool = false;

        private lifeCounter: number = 0;

        light: Light;

        stopped: bool = false;

        spark3d: snd.Sound3d;

        constructor (x: number, y: number, angle, imageName:string, owner:GameObject, sound?:string = "spark01", gain?:number = 0.5) {
            super(x,y,imageName);

            this.spark3d = Game.game.assets.sounds3d[sound];
            this.spark3d.setGain(gain);

            this.owner = owner;

            angle = angle - 90;
            this.direction = Vec2.makeFromAngleDeg(angle);

            this.vel = this.direction.multN(this.speed,this.speed);

            this.x += this.direction.x * this.bulletOffset;
            this.y += this.direction.y * this.bulletOffset;

            this.zIndex = 20;
            this.movable = true;
            this.enableCollisionDetection = true;
            this.collidable = true;
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.regX = 8;
            this.regY = 8;

            // this.light = Game.game.lightEngine.createLight(this.x, this.y, 8);

            //this.light = new ParticleLight(Game.game.lightEngine, this.x, this.y, 0, new Color(0, 0, 255, 0.5));
            //this.light.enableTint = false;
            //Game.game.lightEngine.add(this.light);

            this.boundX = -2;
            this.boundY = -2;
            this.boundWidth = 4;
            this.boundHeight = 4;
        }

        get affector() {
            var e: Effect = {
                type: EffectType.BULLET, 
                owner: this.owner,  
                hp: -this.damageAmt 
            };
            return e;
        }

        update(delta?:number) {
            this.lifeCounter += delta;

            if (this.lifeCounter >= this.lifeSpan) {
                this.stopped = true;
            }
            if (this.lifeCounter >= this.lifeSpan + this.afterLife) {
                this.destroy();
            }

            if (!this.stopped) {
                this.updatePosition(delta);
            }
        }

        updatePosition(delta: number) {
            var scale = this.speed * delta;
            this.vel = this.vel.add(this.direction.multN(scale,scale));
            this.oldPos.setN(this.x, this.y);

            this.x += this.vel.x;
            this.y += this.vel.y;

            //this.light.setPos(this.x, this.y);
        }

        collide(e: Effect, obj: GameObject) {
            if (e.solid) {
                if (this.checkCollisionAndMove(obj)) {
                    //this.light.setPos(this.x, this.y);
                    if (!this.stopped) {
                        this.stopped = true;
                        this.lifeCounter = this.lifeSpan;
                    }
                }
            }
            if (obj instanceof NPC && this.owner instanceof Player) {
                if (this.checkCollisionAndMove(obj)) {
                    this.destroy();
                }
            }
        }

        checkCollision(obj:GameObject) {
            var yourBounds = obj.boundingRect;
            var collision: bool = false;

            var pos = this.position;
            var oldPos = this.oldPos;

            if(yourBounds.contains(this.x, this.y)){
                collision = true;
                var diffX = Math.abs(pos.x - yourBounds.x);
                var diffY = Math.abs(pos.y - yourBounds.y);

                if (yourBounds.contains(pos.x, oldPos.y)) {
                    if (pos.x > oldPos.x) {
                        this.x = yourBounds.x - (this.boundX + this.boundWidth);
                        // this.x -= diffX;
                    } else if (pos.x < oldPos.x) {
                        this.x = yourBounds.x + yourBounds.width + (this.boundX + this.boundWidth);
                        // this.x += diffX;
                    }
                }
                if (yourBounds.contains(oldPos.x, pos.y)) {
                    if (pos.y > oldPos.y) {
                        this.y = yourBounds.y - (this.boundY + this.boundHeight);
                    } else if (pos.y < oldPos.y) {
                        this.y = yourBounds.y + yourBounds.height + (this.boundY + this.boundHeight);
                    }
                }
            }
            if (collision) {
                //this.light.setPos(this.x, this.y);
                if (!this.stopped) {
                    this.stopped = true;
                    this.lifeCounter = this.lifeSpan;
                }
            }
            
        }

        destroy() {
            this.exists = false;
            Game.game.particleMangager.createSpark(this.x, this.y);

            this.spark3d.setPos(this.x, this.y, 1);
            this.spark3d.playOver();
        }

        // This is only to be called by World
        remove() {
            // Remove the light if it exists
            //if(this.light !== null)
            //    Game.game.lightEngine.remove(this.light);
        }
    
    }

    export class WPN_Blaster extends Weapon {
        name: string = "ArriTech Blaster 550D";
        // ammotype: string = "blaster";
        ammo: number = 10;
        infinite: bool = true;
        maxAmmo: number = 100;
        clip: number = 10;
        clipSize: number = 10;
        rateOfFire: number = 1;
        reloadDelay: number = 1;
        bulletLife: number = 3;
        bulletAfterLife: number = 0;
        bulletSpeed: number = 50;
        hitDamage: number = 20;
        burstAmount: number = 1;
        accuracy: number = 5;
        bulletType: number = 0;

        constructor (owner:GameObject) {
            super(owner);
            this.ammoType = "blaster";
        }
    }

    export class WPN_MachineGun extends Weapon {
        name: string = "ArriTech RapidBlaster 2000 Mark II";
        ammo: number = 100;
        maxAmmo: number = 300;
        clip: number = 50;
        clipSize: number = 50;
        rateOfFire: number = 10;
        reloadDelay: number = 1;
        bulletLife: number = 3;
        bulletAfterLife: number = 0;
        bulletSpeed: number = 200;
        hitDamage: number = 20;
        burstAmount: number = 1;
        accuracy: number = 20;
        bulletType: number = 0;

        constructor (owner:GameObject) {
            super(owner, "bullet02");
            this.sound.setGain(0.06);
            this.ammoType = ItemType.AmmoMachinegunCarton.gun;
        }

        //projectBullet(p:Point, angle: number) {
        //    angle += Math.random() * 10 - 20;

        //    super.projectBullet(p, angle);
        //}
    }

    export class WPN_StickyGun extends Weapon {
        name: string = "ArriTech Sticky Light-nade 400";
        ammo: number = 100;
        maxAmmo: number = 300;
        clip: number = 50;
        clipSize: number = 50;
        rateOfFire: number = 10;
        reloadDelay: number = 1;
        bulletLife: number = 4;
        bulletAfterLife: number = 2;
        bulletSpeed: number = 100;
        hitDamage: number = 20;
        burstAmount: number = 1;
        accuracy: number = 20;
        bulletType: number = 0;

        constructor (owner:GameObject) {
            super(owner);
            this.ammoType = ItemType.AmmoSticky.gun;
            this.bulletSparkSound = "explosion01";
            this.bulletSparkGain = 10;
        }
    }
}