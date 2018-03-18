var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var ParticleKing = (function () {
        function ParticleKing(width, height, game) {
            this.canvas = document.createElement("canvas");
            this.canvas.width = width;
            this.canvas.height = height;
            this.game = game;
            this.emiters = [];
            this.image = game.assets.images["particles"];
            this.imgTint = new vs.TintImage(this.image);
        }
        ParticleKing.prototype.add = function (emiter) {
            this.emiters.push(emiter);
            return emiter;
        };
        ParticleKing.prototype.createAcidSpit = function (x, y, dir) {
            this.add(new PFX_AcidSpit(x, y, this, this.game, dir));
        };
        ParticleKing.prototype.createSpark = function (x, y) {
            this.add(new PFX_Spark(x, y, this, this.game));
        };
        ParticleKing.prototype.createGuts = function (x, y) {
            this.add(new PFX_Guts(x, y, this, this.game));
        };
        ParticleKing.prototype.remove = function (emiter) {
            this.emiters.splice(this.emiters.indexOf(emiter), 1);
            return emiter;
        };
        ParticleKing.prototype.restart = function () {
            this.emiters = [];
        };
        ParticleKing.prototype.update = function (delta) {
            this.emiters.forEach(function (e) {
                e.update(delta);
            });
        };
        ParticleKing.prototype.draw = function () {
            var _this = this;
            var ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.emiters.forEach(function (e) {
                e.render(ctx, _this.game);
            });
        };
        ParticleKing.prototype.render = function (ctx) {
            this.draw();
            ctx.drawImage(this.canvas, 0, 0);
        };
        return ParticleKing;
    })();
    vs.ParticleKing = ParticleKing;    
    var ParticleEmiter = (function () {
        function ParticleEmiter(x, y, parent, game, direction) {
            this.frameWidth = 1;
            this.frameHeight = 1;
            this.useImage = false;
            this.tintImage = false;
            this.emitLifeCounter = 0;
            this.emitLifeDest = 1;
            this.alive = true;
            this.shotCounter = 0;
            this.autoDirection = true;
            this.frictionMultiplier = 0.1;
            this.spinFriction = 1;
            this.autoRot = true;
            this.invincible = false;
            this.useLight = false;
            this.spawnRadius = 1;
            this.pool = new PoolManager(100, 50);
            this.pos = new vs.Vec2(x, y);
            this.parent = parent;
            this.game = game;
            this.particles = new vs.LinkedList();
            this.forces = new vs.Vec2();
            if(direction) {
                this.spawnDirection = direction.clone();
            }
            this.setup();
            this.nextSpawnIn = vs.Random.lerpP(this.secPerSpawn);
            this.secsPassed = this.nextSpawnIn;
            this.emitLifeCounter = 0;
            this.emitLifeDest = vs.Random.lerpP(this.emitLife);
            this.alive = true;
        }
        ParticleEmiter.prototype.setup = function () {
            this.oneShot = true;
            this.shots = 1;
            this.burst = new vs.Pair(15, 20);
            this.secPerSpawn = new vs.Pair(0, 1);
            this.budget = 100;
            this.spawnDirection = new vs.Vec2(0, 1);
            this.spawnNoiseAngle = new vs.Pair(-180, 180);
            this.endNoiseAngle = new vs.Pair(0, 0);
            this.startLife = new vs.Pair(0.2, 0.5);
            this.afterLife = new vs.Pair(0, 2);
            this.emitLife = new vs.Pair(1, 10);
            this.frictionMultiplier = 0.01;
            this.startMass = new vs.Pair(1, 1);
            this.endMass = new vs.Pair(1, 1);
            this.startScale = new vs.Pair(1, 1);
            this.endScale = new vs.Pair(1, 0);
            this.startColor = new vs.ObjPair(new vs.Color(0, 0, 0, 1), new vs.Color(255, 255, 255, 0.8));
            this.endColor = new vs.ObjPair(new vs.Color(50, 50, 50, 0), new vs.Color(200, 200, 200, 0.2));
            this.startSpeed = new vs.Pair(1, 800);
            this.endSpeed = new vs.Pair(1, 10);
            this.accel = new vs.Pair(0, 1);
            this.spin = new vs.Pair(-1, 1);
            this.spinFriction = 1;
            this.frame = new vs.Pair(0, 9);
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.image = this.parent.imgTint;
            this.useImage = true;
        };
        ParticleEmiter.prototype.addForce = function (force) {
            this.forces.add(force);
        };
        ParticleEmiter.prototype.update = function (delta) {
            this.secsPassed += delta;
            if(this.secsPassed >= this.nextSpawnIn) {
                if(this.particles.size() < this.budget) {
                    if(this.oneShot) {
                        if(this.shotCounter < this.shots) {
                            this.emit();
                            this.shotCounter++;
                        } else {
                            if(this.particles.size() == 0) {
                                this.kill();
                            }
                        }
                    } else {
                        if(this.alive) {
                            this.emit();
                        } else {
                            if(this.particles.size() == 0) {
                                this.kill();
                            }
                        }
                    }
                    this.secsPassed = -this.nextSpawnIn;
                    this.nextSpawnIn = vs.Random.lerpP(this.secPerSpawn);
                }
            }
            if(!this.oneShot && !this.invincible) {
                this.emitLifeCounter += delta;
                if(this.emitLifeCounter >= this.emitLifeDest) {
                    this.alive = false;
                }
            }
            var itr = this.particles.iterator();
            var p;
            var isAlive;
            while(itr.hasNext()) {
                p = itr.next();
                p.addforce(this.forces);
                isAlive = p.update(delta);
                if(!isAlive) {
                    itr.remove();
                    this.pool.dispose(p);
                    p.kill();
                }
            }
            this.forces.setZero();
        };
        ParticleEmiter.prototype.kill = function () {
            this.parent.remove(this);
        };
        ParticleEmiter.prototype.emit = function () {
            var burst = vs.Random.range(this.burst.a, this.burst.b);
            for(var i = 0; i < burst; i++) {
                this.spawn();
            }
        };
        ParticleEmiter.prototype.spawn = function () {
            var p = this.pool.getParticle();
            var radius = this.spawnRadius;
            var pos = new vs.Vec2();
            pos.x = vs.Random.lerp(this.pos.x - radius, this.pos.x + radius);
            pos.y = vs.Random.lerp(this.pos.y - radius, this.pos.y + radius);
            var lifeSpan = vs.Random.lerpP(this.startLife);
            var afterLife = vs.Random.lerpP(this.afterLife);
            var startSpeed = vs.Random.lerpP(this.startSpeed);
            var endSpeed = vs.Random.lerpP(this.endSpeed);
            var startAngle = vs.Util.degToRad(vs.Random.lerpP(this.spawnNoiseAngle));
            var endAngle = vs.Util.degToRad(vs.Random.lerpP(this.endNoiseAngle));
            if(this.autoDirection) {
                var spawnDirection = vs.Util.findDir(pos.toPoint(), this.pos.toPoint());
            } else {
                var spawnDirection = this.spawnDirection;
            }
            var startVel = spawnDirection.normalize().rotateDeg(startAngle).scale(startSpeed);
            var endVel = startVel.unit().rotateDeg(endAngle).scale(endSpeed);
            var accel = vs.Random.lerpP(this.accel);
            var fric = this.frictionMultiplier;
            var startMass = vs.Random.lerpP(this.startMass);
            var endMass = vs.Random.lerpP(this.endMass);
            var startScale = vs.Random.lerpP(this.startScale);
            var endScale = vs.Random.lerpP(this.endScale);
            var startRot, endRot;
            if(this.autoRot) {
                startRot = startVel.angleDeg();
                endRot = endVel.angle();
            } else {
                startRot = endRot = 0;
            }
            var spin = vs.Random.lerpP(this.spin);
            var spinFrict = this.spinFriction;
            var startColor = vs.Color.lerp(this.startColor.a, this.startColor.b, Math.random());
            var endColor = vs.Color.lerp(this.endColor.a, this.endColor.b, Math.random());
            var image = this.image;
            var frame = vs.Random.rangeP(this.frame);
            var frameWidth = this.frameWidth;
            var frameHeight = this.frameHeight;
            var tintImage = this.tintImage;
            var useLight = this.useLight;
            var particleFrame = vs.Random.rangeP(this.particleFrame);
            var lightIntensity = this.lightIntensity;
            var useImage = this.useImage;
            if(this.useImage || this.useLight) {
                p.giveLife(this, this.game, pos, lifeSpan, afterLife, startVel, endVel, accel, fric, startMass, endMass, startScale, endScale, startRot, endRot, spin, spinFrict, startColor, endColor, useLight, particleFrame, lightIntensity, useImage, image, frame, frameWidth, frameHeight, this.tintImage);
            } else {
                p.giveLife(this, this.game, pos, lifeSpan, afterLife, startVel, endVel, accel, fric, startMass, endMass, startScale, endScale, startRot, endRot, spin, spinFrict, startColor, endColor, useLight, particleFrame, lightIntensity);
            }
            this.particles.add(p);
        };
        ParticleEmiter.prototype.clear = function () {
            var _this = this;
            this.particles.forEach(function (p) {
                _this.pool.dispose(p);
            });
            this.particles.clear();
        };
        ParticleEmiter.prototype.render = function (ctx, game) {
            var cam = game.world.camera;
            var xOff = (game.width * 0.5) - ((cam.width * cam.scale) * 0.5);
            var yOff = (game.height * 0.5) - ((cam.height * cam.scale) * 0.5);
            this.particles.forEach(function (particle) {
                if(game.world.camera.bounds.contains(particle.pos.x, particle.pos.y)) {
                    ctx.save();
                    ctx.setTransform(1, 0, 0, 1, xOff - (cam.x * cam.scale), yOff - (cam.y * cam.scale));
                    ctx.scale(cam.scale, cam.scale);
                    particle.draw(ctx);
                    ctx.restore();
                }
            });
        };
        return ParticleEmiter;
    })();
    vs.ParticleEmiter = ParticleEmiter;    
    var PFX_Spark = (function (_super) {
        __extends(PFX_Spark, _super);
        function PFX_Spark(x, y, parent, game) {
                _super.call(this, x, y, parent, game);
        }
        PFX_Spark.prototype.setup = function () {
            this.oneShot = true;
            this.shots = 1;
            this.burst = new vs.Pair(2, 10);
            this.secPerSpawn = new vs.Pair(0, 1);
            this.budget = 10;
            this.spawnDirection = new vs.Vec2(0, 1);
            this.spawnNoiseAngle = new vs.Pair(-180, 180);
            this.endNoiseAngle = new vs.Pair(0, 0);
            this.startLife = new vs.Pair(0.5, 1);
            this.afterLife = new vs.Pair(0, 0);
            this.emitLife = new vs.Pair(1, 10);
            this.invincible = false;
            this.startMass = new vs.Pair(1, 1);
            this.endMass = new vs.Pair(1, 1);
            this.frictionMultiplier = 1;
            this.startScale = new vs.Pair(1, 4);
            this.endScale = new vs.Pair(1, 2);
            this.startColor = new vs.ObjPair(new vs.Color(230, 230, 255, 0.2), new vs.Color(255, 255, 255, 1));
            this.endColor = new vs.ObjPair(new vs.Color(200, 200, 255, 0), new vs.Color(200, 200, 255, 0));
            this.startSpeed = new vs.Pair(5, 600);
            this.endSpeed = new vs.Pair(1, 20);
            this.accel = new vs.Pair(0, 1);
            this.spin = new vs.Pair(0, 0);
            this.spinFriction = 1;
            this.frame = new vs.Pair(0, 9);
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.image = this.parent.imgTint;
            this.useImage = false;
            this.particleFrame = new vs.Pair(7, 7);
            this.lightIntensity = new vs.Pair(0, 0.9);
            this.useLight = true;
            this.tintImage = false;
        };
        return PFX_Spark;
    })(ParticleEmiter);
    vs.PFX_Spark = PFX_Spark;    
    var PFX_Guts = (function (_super) {
        __extends(PFX_Guts, _super);
        function PFX_Guts(x, y, parent, game) {
                _super.call(this, x, y, parent, game);
        }
        PFX_Guts.prototype.setup = function () {
            this.oneShot = true;
            this.shots = 1;
            this.spawnRadius = 20;
            this.burst = new vs.Pair(10, 50);
            this.secPerSpawn = new vs.Pair(0, 1);
            this.budget = 100;
            this.spawnDirection = new vs.Vec2(0, 1);
            this.spawnNoiseAngle = new vs.Pair(0, 0);
            this.endNoiseAngle = new vs.Pair(0, 0);
            this.startLife = new vs.Pair(0.5, 1);
            this.afterLife = new vs.Pair(1, 10);
            this.emitLife = new vs.Pair(1, 10);
            this.invincible = false;
            this.startMass = new vs.Pair(1, 1);
            this.endMass = new vs.Pair(1, 1);
            this.frictionMultiplier = 0;
            this.startScale = new vs.Pair(1, 1);
            this.endScale = new vs.Pair(1, 1);
            this.startColor = new vs.ObjPair(new vs.Color(255, 240, 240, 1), new vs.Color(255, 0, 0, 1));
            this.endColor = new vs.ObjPair(new vs.Color(255, 255, 200, 0.2), new vs.Color(255, 0, 0, 1));
            this.startSpeed = new vs.Pair(5, 800);
            this.endSpeed = new vs.Pair(10, 1);
            this.accel = new vs.Pair(0, 1);
            this.spin = new vs.Pair(-45, 45);
            this.spinFriction = 0.99;
            this.autoRot = false;
            this.frame = new vs.Pair(0, 9);
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.image = this.parent.imgTint;
            this.useImage = true;
            this.tintImage = false;
            this.particleFrame = new vs.Pair(0, 2);
        };
        return PFX_Guts;
    })(ParticleEmiter);
    vs.PFX_Guts = PFX_Guts;    
    var PFX_AcidSpit = (function (_super) {
        __extends(PFX_AcidSpit, _super);
        function PFX_AcidSpit(x, y, parent, game, direction) {
                _super.call(this, x, y, parent, game, direction);
        }
        PFX_AcidSpit.prototype.setup = function () {
            this.autoDirection = false;
            this.oneShot = true;
            this.spawnRadius = 2;
            this.shots = 1;
            this.burst = new vs.Pair(5, 40);
            this.secPerSpawn = new vs.Pair(0, 1);
            this.budget = 100;
            this.spawnNoiseAngle = new vs.Pair(-4, 4);
            this.endNoiseAngle = new vs.Pair(-10, 10);
            this.startLife = new vs.Pair(0, 0.4);
            this.afterLife = new vs.Pair(0, 0);
            this.emitLife = new vs.Pair(1, 1);
            this.invincible = false;
            this.startMass = new vs.Pair(1, 1);
            this.endMass = new vs.Pair(1, 1);
            this.frictionMultiplier = 1;
            this.startScale = new vs.Pair(1, 4);
            this.endScale = new vs.Pair(1, 1);
            this.startColor = new vs.ObjPair(new vs.Color(0, 0, 0, 1), new vs.Color(100, 100, 0, 1));
            this.endColor = new vs.ObjPair(new vs.Color(0, 0, 0, 1), new vs.Color(100, 0, 0, 1));
            this.startSpeed = new vs.Pair(5, 300);
            this.endSpeed = new vs.Pair(1, 30);
            this.accel = new vs.Pair(1, 1);
            this.spin = new vs.Pair(-5, 5);
            this.spinFriction = 1;
            this.frame = new vs.Pair(0, 9);
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.image = this.parent.imgTint;
            this.useImage = false;
            this.particleFrame = new vs.Pair(8, 8);
            this.lightIntensity = new vs.Pair(0, 1);
            this.useLight = true;
            this.tintImage = false;
        };
        return PFX_AcidSpit;
    })(ParticleEmiter);
    vs.PFX_AcidSpit = PFX_AcidSpit;    
    var PoolManager = (function () {
        function PoolManager(max, growth) {
            this.init(max, growth);
        }
        PoolManager.prototype.init = function (max, growth) {
            this.max = max;
            this.growth = growth;
            this.counter = max;
            var i = max;
            this.pool = new Array(max);
            while(--i > -1) {
                this.pool[i] = new Particle();
            }
        };
        PoolManager.prototype.getParticle = function () {
            if(this.counter > 0) {
                return this.current = this.pool[--this.counter];
            }
            var i = this.growth;
            while(--i > -1) {
                this.pool.unshift(new Particle());
            }
            this.counter = this.growth;
            return this.getParticle();
        };
        PoolManager.prototype.dispose = function (p) {
            this.pool[this.counter++] = p;
        };
        return PoolManager;
    })();
    vs.PoolManager = PoolManager;    
    var Particle = (function () {
        function Particle() {
            this.size = 2;
            this.speed = 1;
            this.mass = 1;
            this.rotation = 0;
            this.colorRGB = "255,255,255";
            this.collideWithWorld = true;
            this.startScale = 1;
            this.endScale = 10;
            this.spin = 1;
            this.startSpeed = 1;
            this.endSpeed = 1;
            this.accel = 1;
            this.startMass = 1;
            this.endMass = 1;
            this.frictionMultiplier = 0.01;
            this.lifeSpan = 3;
            this.afterLife = 5;
            this.collideClock = 0;
            this.life = 1;
            this.alpha = 1;
            this.useLight = false;
            this._frame = 1;
            this.frameWidth = 1;
            this.frameHeight = 1;
            this.particleFrame = 1;
            this.pos = new vs.Vec2(0, 0);
            this.oldPos = new vs.Vec2(0, 0);
            this.off = new vs.Vec2(0, 0);
            this.vel = new vs.Vec2(0, 0);
            this.dir = new vs.Vec2();
            this.forces = new vs.Vec2(0, 0);
            this.startVel = new vs.Vec2();
            this.endVel = new vs.Vec2();
            this.framePos = new vs.Vec2();
            this.lifeClock = this.lifeSpan;
        }
        Particle.prototype.giveLife = function (parent, game, pos, lifeSpan, afterLife, startVel, endVel, accel, frictionMultiplier, startMass, endMass, startScale, endScale, startRot, endRot, spin, spinFriction, startColor, endColor, useLight, particleFrame, lightIntensity, useImage, image, frame, frameWidth, frameHeight, tintImage) {
            if (typeof particleFrame === "undefined") { particleFrame = 1; }
            if (typeof useImage === "undefined") { useImage = false; }
            if (typeof frame === "undefined") { frame = 1; }
            if (typeof frameWidth === "undefined") { frameWidth = 1; }
            if (typeof frameHeight === "undefined") { frameHeight = 1; }
            if (typeof tintImage === "undefined") { tintImage = true; }
            this.game = game;
            this.pos.setV(pos);
            this.vel.setV(startVel);
            this.startVel.setV(startVel);
            this.endVel.setV(endVel);
            this.forces.setZero();
            this.dir = startVel.unit();
            this.accel = accel;
            this.frictionMultiplier = frictionMultiplier;
            this.startMass = startMass;
            this.endMass = endMass;
            this.lifeSpan = lifeSpan;
            this.lifeClock = lifeSpan;
            this.afterLife = afterLife;
            this.startScale = startScale;
            this.endScale = endScale;
            this.rotation = startRot;
            this.startRot = startRot;
            this.endRot = endRot;
            this.spin = spin;
            this.spinFriction = spinFriction;
            this.startColor = startColor;
            this.endColor = endColor;
            this.useLight = useLight;
            this.particleFrame = particleFrame;
            this.lightIntensity = lightIntensity;
            if(useImage) {
                this.image = image;
                this.drawImage = true;
                this.off.x = Math.floor(frameWidth / 2);
                this.off.y = Math.floor(frameHeight / 2);
                this.frameWidth = frameWidth;
                this.frameHeight = frameHeight;
                this.frame = frame;
                this.tintImage = tintImage;
            } else {
                this.image = undefined;
                this.drawImage = false;
                this.off.x = Math.floor(this.size / 2);
                this.off.y = Math.floor(this.size / 2);
            }
            if(this.useLight) {
                this.light = new vs.ParticleLight(this.game.lightEngine, this.pos.x, this.pos.y, this.particleFrame, this.startColor, this.lightIntensity);
                this.light.drawShadows = false;
                this.game.lightEngine.add(this.light);
            }
        };
        Object.defineProperty(Particle.prototype, "frame", {
            get: function () {
                return this._frame;
            },
            set: function (frame) {
                this._frame = frame;
                this.framePos.x = (frame * this.frameWidth) % this.image.width;
                this.framePos.y = Math.floor((this.frame * this.frameHeight) / this.image.width);
            },
            enumerable: true,
            configurable: true
        });
        Particle.prototype.addforce = function (force) {
            force = force.divideN(this.mass);
            this.forces.addRel(force);
        };
        Particle.prototype.update = function (delta) {
            this.lifeClock -= delta;
            this.collideClock -= delta;
            this.oldPos.setV(this.pos);
            var friction, accel;
            if(this.lifeClock > 0) {
                this.life = (Math.max(this.lifeClock, 0) / this.lifeSpan);
                this.vel = vs.Vec2.lerp(this.endVel, this.vel, this.life);
                accel = this.vel.unit().multN(this.accel);
                this.addforce(accel);
                this.vel.addRel(this.forces);
                this.forces.setZero();
                this.pos = this.pos.addN(this.vel.x * delta, this.vel.y * delta);
                this.rotation = vs.Util.lerp(this.rotation, this.startRot, this.life);
            } else {
                this.vel;
                friction = this.vel.unit().multN(-1).multN(this.frictionMultiplier);
                this.addforce(friction);
                this.vel.addRel(this.forces);
                this.forces.setZero();
                this.pos = this.pos.addN(this.vel.x * delta, this.vel.y * delta);
            }
            if(this.collideWithWorld && this.collideClock <= 0) {
                if(this.game.world.checkCollisionAtPoint(this.pos.toPoint())) {
                    this.vel.scale(-1);
                    this.endVel.scale(-1);
                    this.pos.setV(this.oldPos);
                    this.collideClock = 1;
                }
            }
            this.rotation += this.spin * delta;
            this.startRot += this.spin * delta;
            this.spin *= this.spinFriction;
            if(this.useLight) {
                this.light.setPos(this.pos.x, this.pos.y);
            }
            if(this.dead) {
                this.kill();
                return this.hideTheBodies();
            }
            return true;
        };
        Object.defineProperty(Particle.prototype, "dead", {
            get: function () {
                return (this.lifeClock <= -this.afterLife);
            },
            enumerable: true,
            configurable: true
        });
        Particle.prototype.kill = function () {
            if(this.useLight) {
                this.game.lightEngine.remove(this.light);
            }
        };
        Particle.prototype.hideTheBodies = function () {
            return false;
        };
        Particle.prototype.draw = function (ctx) {
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(vs.Util.degToRad(this.rotation));
            if(this.drawImage) {
                this.drawSprite(ctx);
            } else {
                this.drawPixels(ctx);
            }
        };
        Particle.prototype.drawPixels = function (ctx) {
            var color = vs.Color.lerp(this.endColor, this.startColor, this.life);
            var scale = vs.Util.lerp(this.endScale, this.startScale, this.life);
            ctx.fillStyle = color.toString();
            ctx.fillRect(-(scale * 0.5), -(scale * 0.5), scale, scale);
            if(this.useLight) {
                this.light.intensity = color.a;
            }
        };
        Particle.prototype.drawSprite = function (ctx) {
            var color = vs.Color.lerp(this.endColor, this.startColor, this.life);
            var scale = vs.Util.lerp(this.endScale, this.startScale, this.life);
            if(this.tintImage) {
                var color = vs.Color.lerp(this.endColor, this.startColor, this.life);
                this.image.render(ctx, color, this.framePos.x, this.framePos.y, this.frameWidth, this.frameHeight, -(this.off.x * scale), -(this.off.y * scale), this.frameWidth * scale, this.frameHeight * scale);
            } else {
                this.image.renderNoTint(ctx, this.framePos.x, this.framePos.y, this.frameWidth, this.frameHeight, -(this.off.x * scale), -(this.off.y * scale), this.frameWidth * scale, this.frameHeight * scale);
            }
            if(this.useLight) {
            }
        };
        return Particle;
    })();
    vs.Particle = Particle;    
})(vs || (vs = {}));
