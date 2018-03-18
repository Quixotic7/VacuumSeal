var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var WeaponManager = (function () {
        function WeaponManager(game, owner) {
            this.owner = owner;
            this.game = game;
            this.itemManager = game.itemManager;
            this.init();
        }
        WeaponManager.prototype.init = function () {
            this.weapons = [];
            var blaster = new WPN_Blaster(this.owner);
            var machineGun = new WPN_MachineGun(this.owner);
            var stickyRicky = new WPN_StickyGun(this.owner);
            this.current = null;
            this.weapons.push(blaster);
            this.weapons.push(machineGun);
            this.weapons.push(stickyRicky);
        };
        WeaponManager.prototype.restart = function () {
            this.init();
        };
        WeaponManager.prototype.addAmmo = function (v, type) {
            var weapon = this.findType(type);
            if(weapon !== null) {
                weapon.addAmmo(v, type);
            }
        };
        WeaponManager.prototype.findType = function (type) {
            var weapon;
            for(var i = 0; i < this.weapons.length; i++) {
                weapon = this.weapons[i];
                if(weapon.ammoType == type) {
                    return weapon;
                }
            }
            return null;
        };
        WeaponManager.prototype.update = function (delta) {
            this.checkInput();
            this.updateHud();
            this.weapons.forEach(function (weapon) {
                weapon.update(delta);
            });
        };
        WeaponManager.prototype.fire = function (position, rotation) {
            if(this.current) {
                this.current.shoot(position, rotation);
            }
        };
        WeaponManager.prototype.checkInput = function () {
            if(vs.Keyboard.check(vs.Keys._1)) {
                this._switchTo("blaster");
            }
            if(vs.Keyboard.check(vs.Keys._2)) {
                this._switchTo("machineGun");
            }
            if(vs.Keyboard.check(vs.Keys._3)) {
                this._switchTo("sticky");
            }
            if(vs.Keyboard.justPressed(vs.Keys.R)) {
                if(this.current) {
                    this.current.reload();
                }
            }
        };
        WeaponManager.prototype._switchTo = function (name) {
            if(this.itemManager.hasWeapon(name)) {
                this.switchTo(name);
            }
        };
        WeaponManager.prototype.switchTo = function (name) {
            switch(name) {
                case "empty": {
                    this.current = undefined;
                    break;

                }
                case "blaster": {
                    this.current = this.weapons[0];
                    break;

                }
                case "machineGun": {
                    this.current = this.weapons[1];
                    break;

                }
                case "sticky": {
                    this.current = this.weapons[2];
                    break;

                }
            }
        };
        WeaponManager.prototype.updateHud = function () {
            if(this.current) {
                if(this.current.infinite) {
                    vs.Game.game.hud.weaponMessage = "Weapon: " + this.current.name + "\nAmmo: Infinite";
                } else {
                    vs.Game.game.hud.weaponMessage = "Weapon: " + this.current.name + "\nAmmo: " + this.current.ammo + "/" + this.current.maxAmmo + " Clip: " + this.current.clip + "/" + this.current.clipSize;
                }
            } else {
                vs.Game.game.hud.weaponMessage = "";
            }
        };
        return WeaponManager;
    })();
    vs.WeaponManager = WeaponManager;    
    var Weapon = (function () {
        function Weapon(owner, sound) {
            if (typeof sound === "undefined") { sound = "bullet01"; }
            this.name = "Default Weapon";
            this.ammoType = "";
            this.ammo = 0;
            this.maxAmmo = 0;
            this.clip = 0;
            this.clipSize = 0;
            this.infinite = false;
            this.rateOfFire = 0;
            this.reloadDelay = 0;
            this.reloadTimer = 0;
            this.reloading = false;
            this.bulletLife = 0;
            this.bulletAfterLife = 0;
            this.bulletSpeed = 0;
            this.hitDamage = 0;
            this.burstAmount = 0;
            this.accuracy = 0;
            this.bulletType = 0;
            this.bulletSparkSound = "spark01";
            this.bulletSparkGain = 0.5;
            this.delayCounter = 0;
            this.shotFired = false;
            this.owner = owner;
            this.sound = vs.Game.game.assets.sounds[sound];
            this.reloadSound = vs.Game.game.assets.sounds["reload"];
            this.emptySound = vs.Game.game.assets.sounds["emptyClip"];
            this.sound.setGain(0.06);
            this.reloadSound.setGain(0.06);
            this.emptySound.setGain(0.16);
        }
        Weapon.prototype.addAmmo = function (v, type) {
            vs.Game.game.hud.queueMessage("Does " + type + " == " + this.ammoType + "?", 5, false);
            if(this.ammoType == type) {
                this.ammo += v;
                if(this.ammo > this.maxAmmo) {
                    this.ammo = this.maxAmmo;
                }
            }
        };
        Weapon.prototype.shoot = function (p, angle) {
            if((this.clip > 0 || this.infinite) && this.canShoot()) {
                for(var i = 0; i < this.burstAmount; i++) {
                    if(this.canShoot()) {
                        var adjustedAngle = angle - (this.accuracy * 0.5) + (Math.random() * this.accuracy);
                        this.projectBullet(p, adjustedAngle);
                        this.delayCounter = 0;
                    }
                }
                this.shotFired = true;
                if(!this.infinite) {
                    this.clip--;
                }
            }
            if(this.clip <= 0) {
                this.emptySound.play();
            }
        };
        Weapon.prototype.reload = function () {
            if(!this.reloading && this.ammo > 0 && this.clip < this.clipSize) {
                this.reloading = true;
                this.reloadTimer = this.reloadDelay;
                this.reloadSound.play();
            }
        };
        Weapon.prototype.checkReload = function () {
            if(this.reloading && this.reloadTimer < 0) {
                this._reload();
                this.reloading = false;
            }
        };
        Weapon.prototype._reload = function () {
            var numBullets = this.clipSize - this.clip;
            if(this.ammo - numBullets >= 0) {
                this.ammo -= numBullets;
                this.clip += numBullets;
            } else {
                this.clip += this.ammo;
                this.ammo = 0;
            }
        };
        Weapon.prototype.update = function (delta) {
            var increment = this.rateOfFire * delta;
            this.delayCounter += increment;
            this.reloadTimer -= delta;
            this.checkReload();
        };
        Weapon.prototype.projectBullet = function (p, angle) {
            var bullet = new Bullet(p.x, p.y, angle, "bullets", this.owner, this.bulletSparkSound, this.bulletSparkGain);
            bullet.lifeSpan = this.bulletLife;
            bullet.afterLife = this.bulletAfterLife;
            bullet.damageAmt = this.hitDamage;
            bullet.speed = this.bulletSpeed;
            bullet.accel = this.bulletSpeed;
            bullet.playerBullet = this.owner instanceof vs.Player ? true : false;
            vs.Game.game.world.add(bullet);
            this.playsound();
        };
        Weapon.prototype.canShoot = function () {
            if(this.delayCounter >= 1) {
                return true;
            }
            return false;
        };
        Weapon.prototype.playsound = function () {
            this.sound.play();
        };
        return Weapon;
    })();
    vs.Weapon = Weapon;    
    var Bullet = (function (_super) {
        __extends(Bullet, _super);
        function Bullet(x, y, angle, imageName, owner, sound, gain) {
            if (typeof sound === "undefined") { sound = "spark01"; }
            if (typeof gain === "undefined") { gain = 0.5; }
                _super.call(this, x, y, imageName);
            this.lifeSpan = 0;
            this.afterLife = 0;
            this.speed = 0;
            this.accel = 0;
            this.damageAmt = 0;
            this.bulletOffset = 32;
            this.playerBullet = false;
            this.lifeCounter = 0;
            this.stopped = false;
            this.spark3d = vs.Game.game.assets.sounds3d[sound];
            this.spark3d.setGain(gain);
            this.owner = owner;
            angle = angle - 90;
            this.direction = vs.Vec2.makeFromAngleDeg(angle);
            this.vel = this.direction.multN(this.speed, this.speed);
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
            this.boundX = -2;
            this.boundY = -2;
            this.boundWidth = 4;
            this.boundHeight = 4;
        }
        Object.defineProperty(Bullet.prototype, "affector", {
            get: function () {
                var e = {
                    type: vs.EffectType.BULLET,
                    owner: this.owner,
                    hp: -this.damageAmt
                };
                return e;
            },
            enumerable: true,
            configurable: true
        });
        Bullet.prototype.update = function (delta) {
            this.lifeCounter += delta;
            if(this.lifeCounter >= this.lifeSpan) {
                this.stopped = true;
            }
            if(this.lifeCounter >= this.lifeSpan + this.afterLife) {
                this.destroy();
            }
            if(!this.stopped) {
                this.updatePosition(delta);
            }
        };
        Bullet.prototype.updatePosition = function (delta) {
            var scale = this.speed * delta;
            this.vel = this.vel.add(this.direction.multN(scale, scale));
            this.oldPos.setN(this.x, this.y);
            this.x += this.vel.x;
            this.y += this.vel.y;
        };
        Bullet.prototype.collide = function (e, obj) {
            if(e.solid) {
                if(this.checkCollisionAndMove(obj)) {
                    if(!this.stopped) {
                        this.stopped = true;
                        this.lifeCounter = this.lifeSpan;
                    }
                }
            }
            if(obj instanceof vs.NPC && this.owner instanceof vs.Player) {
                if(this.checkCollisionAndMove(obj)) {
                    this.destroy();
                }
            }
        };
        Bullet.prototype.checkCollision = function (obj) {
            var yourBounds = obj.boundingRect;
            var collision = false;
            var pos = this.position;
            var oldPos = this.oldPos;
            if(yourBounds.contains(this.x, this.y)) {
                collision = true;
                var diffX = Math.abs(pos.x - yourBounds.x);
                var diffY = Math.abs(pos.y - yourBounds.y);
                if(yourBounds.contains(pos.x, oldPos.y)) {
                    if(pos.x > oldPos.x) {
                        this.x = yourBounds.x - (this.boundX + this.boundWidth);
                    } else {
                        if(pos.x < oldPos.x) {
                            this.x = yourBounds.x + yourBounds.width + (this.boundX + this.boundWidth);
                        }
                    }
                }
                if(yourBounds.contains(oldPos.x, pos.y)) {
                    if(pos.y > oldPos.y) {
                        this.y = yourBounds.y - (this.boundY + this.boundHeight);
                    } else {
                        if(pos.y < oldPos.y) {
                            this.y = yourBounds.y + yourBounds.height + (this.boundY + this.boundHeight);
                        }
                    }
                }
            }
            if(collision) {
                if(!this.stopped) {
                    this.stopped = true;
                    this.lifeCounter = this.lifeSpan;
                }
            }
        };
        Bullet.prototype.destroy = function () {
            this.exists = false;
            vs.Game.game.particleMangager.createSpark(this.x, this.y);
            this.spark3d.setPos(this.x, this.y, 1);
            this.spark3d.playOver();
        };
        Bullet.prototype.remove = function () {
        };
        return Bullet;
    })(vs.Sprite);
    vs.Bullet = Bullet;    
    var WPN_Blaster = (function (_super) {
        __extends(WPN_Blaster, _super);
        function WPN_Blaster(owner) {
                _super.call(this, owner);
            this.name = "ArriTech Blaster 550D";
            this.ammo = 10;
            this.infinite = true;
            this.maxAmmo = 100;
            this.clip = 10;
            this.clipSize = 10;
            this.rateOfFire = 1;
            this.reloadDelay = 1;
            this.bulletLife = 3;
            this.bulletAfterLife = 0;
            this.bulletSpeed = 50;
            this.hitDamage = 20;
            this.burstAmount = 1;
            this.accuracy = 5;
            this.bulletType = 0;
            this.ammoType = "blaster";
        }
        return WPN_Blaster;
    })(Weapon);
    vs.WPN_Blaster = WPN_Blaster;    
    var WPN_MachineGun = (function (_super) {
        __extends(WPN_MachineGun, _super);
        function WPN_MachineGun(owner) {
                _super.call(this, owner, "bullet02");
            this.name = "ArriTech RapidBlaster 2000 Mark II";
            this.ammo = 100;
            this.maxAmmo = 300;
            this.clip = 50;
            this.clipSize = 50;
            this.rateOfFire = 10;
            this.reloadDelay = 1;
            this.bulletLife = 3;
            this.bulletAfterLife = 0;
            this.bulletSpeed = 200;
            this.hitDamage = 20;
            this.burstAmount = 1;
            this.accuracy = 20;
            this.bulletType = 0;
            this.sound.setGain(0.06);
            this.ammoType = vs.ItemType.AmmoMachinegunCarton.gun;
        }
        return WPN_MachineGun;
    })(Weapon);
    vs.WPN_MachineGun = WPN_MachineGun;    
    var WPN_StickyGun = (function (_super) {
        __extends(WPN_StickyGun, _super);
        function WPN_StickyGun(owner) {
                _super.call(this, owner);
            this.name = "ArriTech Sticky Light-nade 400";
            this.ammo = 100;
            this.maxAmmo = 300;
            this.clip = 50;
            this.clipSize = 50;
            this.rateOfFire = 10;
            this.reloadDelay = 1;
            this.bulletLife = 4;
            this.bulletAfterLife = 2;
            this.bulletSpeed = 100;
            this.hitDamage = 20;
            this.burstAmount = 1;
            this.accuracy = 20;
            this.bulletType = 0;
            this.ammoType = vs.ItemType.AmmoSticky.gun;
            this.bulletSparkSound = "explosion01";
            this.bulletSparkGain = 10;
        }
        return WPN_StickyGun;
    })(Weapon);
    vs.WPN_StickyGun = WPN_StickyGun;    
})(vs || (vs = {}));
