module vs {
    // I am Particle King, King over all things tiny. 
    export class ParticleKing {
        canvas: HTMLCanvasElement;

        emiters: ParticleEmiter[];

        game: Game;

        image: HTMLImageElement;
        imgTint: TintImage;

        constructor (width:number, height: number, game:Game) {
            this.canvas = <HTMLCanvasElement>document.createElement("canvas");
            this.canvas.width = width;
            this.canvas.height = height;

            this.game = game;

            this.emiters = [];
            this.image = game.assets.images["particles"];
            this.imgTint = new TintImage(this.image);
        }

        add(emiter:ParticleEmiter) {
            this.emiters.push(emiter);
            return emiter;
        }

        createAcidSpit(x:number, y:number, dir:Vec2) {
            this.add(new PFX_AcidSpit(x, y, this, this.game, dir));
        }

        createSpark(x:number, y:number) {
            this.add(new PFX_Spark(x, y, this, this.game));
        }

        createGuts(x: number, y: number) {
            this.add(new PFX_Guts(x, y, this, this.game));
        }

        remove(emiter: ParticleEmiter) {
            this.emiters.splice(this.emiters.indexOf(emiter), 1);
            return emiter;
        }

        restart() {
            this.emiters = [];
        }

        update(delta: number) {
            this.emiters.forEach((e: ParticleEmiter) =>{
                e.update(delta);
            });
        }

        draw() {
            var ctx = this.canvas.getContext("2d");
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.emiters.forEach((e: ParticleEmiter) =>{
                e.render(ctx, this.game);
            });
        }

        render(ctx: CanvasRenderingContext2D) {
            this.draw();
            ctx.drawImage(this.canvas, 0, 0);
        }

    }

    export class ParticleEmiter {
        pool: PoolManager;

        particles: LinkedList;
        parent: ParticleKing;
        game: Game;
        
        nextSpawnIn: number; 
        secsPassed: number;

        image: TintImage;
        frame: Pair;
        frameWidth: number = 1;
        frameHeight: number = 1;
        useImage: bool = false;
        tintImage: bool = false; // If this is true, the image will be tinted via the start and end colors
        // TintImage is an AWESOME feature, but will slow down the engine, not horribly, but only recommend for certain effects, like fire. 

        emitLifeCounter: number = 0;
        emitLifeDest: number = 1;
        alive: bool = true; // when alive is false the emitter will be killed after all the particles have died and will emit no more. 
        
        pos: Vec2;
        oneShot: bool;
        shots: number;
        private shotCounter: number = 0;
        burst: Pair; // How many particles are spawned each time
        secPerSpawn: Pair; // Seconds between spawns, doesn't matter if one shot is true
        budget: number; // This should be more then burst, if the emiter is over it's budget it won't emit until it has room
        spawnDirection: Vec2; // The initial direction
        autoDirection: bool = true; // If true the direction will be calculated by the difference from the emiter's center and where the particle is spawned
        spawnNoiseAngle: Pair; // Two angles defining variances to the direction
        endNoiseAngle: Pair; // this represents the varience in the end vector, if 0, it will be the same as the start, vary it to make particles curve
        frictionMultiplier: number = 0.1; // This represents dampening that is applied during the particles afterlife 
        spin: Pair; // How much the particle spins
        spinFriction: number = 1; // This is multiplied agaist spin every update;
        autoRot: bool = true; // If true, the start and end angle will be set to match the velocity
        startLife: Pair; // A range for each particles life
        afterLife: Pair; // A range for each particles afterlife
        emitLife: Pair; // This is only taken in to account if one shot is false;
        invincible: bool = false; // If the emiter is invincible it will never die
        startMass: Pair;
        endMass: Pair;
        startScale: Pair; 
        endScale: Pair;
        startColor: ObjPair; // Tints image if true, or draws a particle of that color if not using an image
        endColor: ObjPair;
        useLight: bool = false;
        particleFrame: Pair;
        lightIntensity: Pair;
        //startLightIntensity: Pair;
        //endLightIntensity: Pair; // this will need to be between 0 and 1; 
        startSpeed: Pair;
        endSpeed: Pair;
        accel: Pair;

        spawnRadius: number = 1;
        forces: Vec2; // this will accumulate forces by using addForce(v:Vec2), forces is then added to each particle and cleared, meaning you will want to addForce every update

        constructor (x: number, y: number, parent:ParticleKing, game:Game, direction?:Vec2) {
            this.pool = new PoolManager(100, 50);
            this.pos = new Vec2(x, y);
            this.parent = parent;
            this.game = game;
            this.particles = new LinkedList();
            this.forces = new Vec2();

            if (direction) this.spawnDirection = direction.clone();

            this.setup();

            this.nextSpawnIn = Random.lerpP(this.secPerSpawn);
            this.secsPassed = this.nextSpawnIn;

            this.emitLifeCounter = 0;
            this.emitLifeDest = Random.lerpP(this.emitLife);
            this.alive = true;
        }

        // Override this in child emiters
        setup() {
            this.oneShot = true;
            this.shots = 1;
            this.burst = new Pair(15, 20);
            this.secPerSpawn = new Pair(0, 1);
            this.budget = 100;
            this.spawnDirection = new Vec2(0, 1);
            this.spawnNoiseAngle = new Pair(-180, 180);
            this.endNoiseAngle = new Pair(0, 0);
            this.startLife = new Pair(0.2, 0.5);
            this.afterLife = new Pair(0, 2);
            this.emitLife = new Pair(1, 10);
            this.frictionMultiplier = 0.01;
            this.startMass = new Pair(1, 1);
            this.endMass = new Pair(1, 1);
            this.startScale = new Pair(1, 1);
            this.endScale = new Pair(1, 0);
            //this.startColor = new ObjPair(new Color(0, 0, 255, 1), new Color(255, 255, 255, 1));
            //this.endColor = new ObjPair(new Color(0, 0, 255, 0.5), new Color(255, 255, 255, 0.8));

            this.startColor = new ObjPair(new Color(0, 0, 0, 1), new Color(255, 255, 255, 0.8));
            this.endColor = new ObjPair(new Color(50, 50, 50, 0), new Color(200, 200, 200, 0.2));

            this.startSpeed = new Pair(1, 800);
            this.endSpeed = new Pair(1, 10);
            this.accel = new Pair(0, 1);
            this.spin = new Pair(-1, 1);
            this.spinFriction = 1;
            this.frame = new Pair(0, 9);
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.image = this.parent.imgTint;
            this.useImage = true;
        }

        // This force will be added to the particles when they update
        addForce(force:Vec2) {
            this.forces.add(force);
        }

        update(delta: number) {
            this.secsPassed += delta;
            if (this.secsPassed >= this.nextSpawnIn) {
                if (this.particles.size() < this.budget) {
                    if (this.oneShot) {
                        if (this.shotCounter < this.shots) {
                            this.emit();
                            this.shotCounter++;
                        } else {
                            if (this.particles.size() == 0) {
                                this.kill();
                            }
                        }
                    } else {
                        if (this.alive) {
                            this.emit();
                        } else {
                            if (this.particles.size() == 0) {
                                this.kill();
                            }
                        }
                    }
                    this.secsPassed = -this.nextSpawnIn;
                    this.nextSpawnIn = Random.lerpP(this.secPerSpawn);
                }
            }
            if (!this.oneShot && !this.invincible) {
                this.emitLifeCounter += delta;
                if (this.emitLifeCounter >= this.emitLifeDest) {
                    this.alive = false;
                }
            }

            var itr = this.particles.iterator();
            var p: Particle;
            var isAlive: bool;
            while (itr.hasNext()) {
                p = itr.next();
                p.addforce(this.forces);
                isAlive = p.update(delta);
                if (!isAlive) {
                    itr.remove();
                    this.pool.dispose(p);
                    p.kill();
                }
            }
            this.forces.setZero();
        }

        kill() {
            this.parent.remove(this);
        }

        emit() {
            var burst = Random.range(this.burst.a, this.burst.b);
            for (var i = 0; i < burst; i++) {
                this.spawn();
            }
        }

        spawn() {
            var p = this.pool.getParticle();
            var radius = this.spawnRadius;
            var pos = new Vec2();
            pos.x = Random.lerp(this.pos.x - radius, this.pos.x + radius) ;
            pos.y = Random.lerp(this.pos.y - radius, this.pos.y + radius);
            
            var lifeSpan = Random.lerpP(this.startLife);
            var afterLife = Random.lerpP(this.afterLife);

            var startSpeed = Random.lerpP(this.startSpeed);
            var endSpeed = Random.lerpP(this.endSpeed);

            var startAngle = Util.degToRad(Random.lerpP(this.spawnNoiseAngle));
            var endAngle = Util.degToRad(Random.lerpP(this.endNoiseAngle));


            if (this.autoDirection) {
                var spawnDirection = Util.findDir(pos.toPoint(), this.pos.toPoint());
            } else {
                var spawnDirection = this.spawnDirection;
            }

            var startVel = spawnDirection.normalize().rotateDeg(startAngle).scale(startSpeed);
            var endVel = startVel.unit().rotateDeg(endAngle).scale(endSpeed);

            var accel = Random.lerpP(this.accel);
            var fric = this.frictionMultiplier;

            var startMass = Random.lerpP(this.startMass);
            var endMass = Random.lerpP(this.endMass);
            var startScale = Random.lerpP(this.startScale);
            var endScale = Random.lerpP(this.endScale);
            var startRot: number, endRot: number;

            if (this.autoRot) {
                startRot = startVel.angleDeg();
                endRot = endVel.angle();
            } else {
                startRot = endRot = 0;
            }
            var spin = Random.lerpP(this.spin);
            var spinFrict = this.spinFriction;
            var startColor = Color.lerp(this.startColor.a, this.startColor.b, Math.random());
            var endColor = Color.lerp(this.endColor.a, this.endColor.b, Math.random());
            var image = this.image;
            var frame = Random.rangeP(this.frame);
            var frameWidth = this.frameWidth;
            var frameHeight = this.frameHeight;
            var tintImage = this.tintImage;

            var useLight = this.useLight;
            var particleFrame = Random.rangeP(this.particleFrame);
            var lightIntensity = this.lightIntensity;
            var useImage = this.useImage;

            if (this.useImage || this.useLight) {
                p.giveLife(this, this.game, pos, lifeSpan, afterLife, startVel, endVel, accel, fric, startMass, endMass, startScale, endScale, startRot, endRot, spin, spinFrict, startColor, endColor, useLight, particleFrame, lightIntensity, useImage, image, frame, frameWidth, frameHeight, this.tintImage);
            } else {
                p.giveLife(this, this.game, pos, lifeSpan, afterLife, startVel, endVel, accel, fric, startMass, endMass, startScale, endScale, startRot, endRot, spin, spinFrict, startColor, endColor, useLight, particleFrame, lightIntensity);
            }
            this.particles.add(p);
        }

        clear() {
            this.particles.forEach((p: Particle) =>{
                this.pool.dispose(p);
            });
            this.particles.clear();
        }

        render(ctx: CanvasRenderingContext2D, game:Game) {
            var cam = game.world.camera;
            var xOff = (game.width * 0.5) - ((cam.width * cam.scale) * 0.5);
            var yOff = (game.height * 0.5) - ((cam.height * cam.scale) * 0.5);

            this.particles.forEach((particle: Particle) =>{
                if (game.world.camera.bounds.contains(particle.pos.x, particle.pos.y)) {
                    ctx.save();
                    ctx.setTransform(1, 0, 0, 1, xOff - (cam.x * cam.scale), yOff - (cam.y * cam.scale));
                    ctx.scale(cam.scale, cam.scale);
                    particle.draw(ctx);
                    ctx.restore();
                }
            });
        }
        
    }

    export class PFX_Spark extends ParticleEmiter {
        constructor (x:number, y:number, parent:ParticleKing, game:Game) {
            super(x, y, parent, game);
        }

        setup() {
            this.oneShot = true;
            this.shots = 1;
            this.burst = new Pair(2, 10);
            this.secPerSpawn = new Pair(0, 1);
            this.budget = 10;
            this.spawnDirection = new Vec2(0, 1);
            this.spawnNoiseAngle = new Pair(-180, 180);
            this.endNoiseAngle = new Pair(0, 0);
            this.startLife = new Pair(0.5, 1);
            this.afterLife = new Pair(0, 0);
            this.emitLife = new Pair(1, 10);
            this.invincible = false;
            this.startMass = new Pair(1, 1);
            this.endMass = new Pair(1, 1);
            this.frictionMultiplier = 1;
            this.startScale = new Pair(1, 4);
            this.endScale = new Pair(1, 2);
            this.startColor = new ObjPair(new Color(230, 230, 255, 0.2), new Color(255, 255, 255, 1));
            this.endColor = new ObjPair(new Color(200, 200, 255, 0), new Color(200, 200, 255, 0));
            this.startSpeed = new Pair(5, 600);
            this.endSpeed = new Pair(1, 20);
            this.accel = new Pair(0, 1);
            this.spin = new Pair(0, 0);
            this.spinFriction = 1;
            this.frame = new Pair(0, 9);
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.image = this.parent.imgTint;
            this.useImage = false;
            this.particleFrame = new Pair(7, 7);
            this.lightIntensity = new Pair(0, 0.9);
            this.useLight = true;
            this.tintImage = false;
        }
        
    }

    export class PFX_Guts extends ParticleEmiter {
        constructor (x:number, y:number, parent:ParticleKing, game:Game) {
            super(x, y, parent, game);
        }

        setup() {
            this.oneShot = true;
            this.shots = 1;
            this.spawnRadius = 20;
            this.burst = new Pair(10, 50);
            this.secPerSpawn = new Pair(0, 1);
            this.budget = 100;
            this.spawnDirection = new Vec2(0, 1);
            this.spawnNoiseAngle = new Pair(0, 0);
            this.endNoiseAngle = new Pair(0, 0);
            this.startLife = new Pair(0.5, 1);
            this.afterLife = new Pair(1, 10);
            this.emitLife = new Pair(1, 10);
            this.invincible = false;
            this.startMass = new Pair(1, 1);
            this.endMass = new Pair(1, 1);
            this.frictionMultiplier = 0;
            this.startScale = new Pair(1, 1);
            this.endScale = new Pair(1, 1);
            this.startColor = new ObjPair(new Color(255, 240, 240, 1), new Color(255, 0, 0, 1));
            this.endColor = new ObjPair(new Color(255, 255, 200, 0.2), new Color(255, 0, 0, 1));
            this.startSpeed = new Pair(5, 800);
            this.endSpeed = new Pair(10, 1);
            this.accel = new Pair(0, 1);
            this.spin = new Pair(-45,45);
            this.spinFriction = 0.99;
            this.autoRot = false;
            this.frame = new Pair(0, 9);
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.image = this.parent.imgTint;
            this.useImage = true;
            this.tintImage = false;
            this.particleFrame = new Pair(0, 2);
        }
        
    }

    export class PFX_AcidSpit extends ParticleEmiter {
        constructor (x:number, y:number, parent:ParticleKing, game:Game, direction:Vec2) {
            super(x, y, parent, game, direction);
        }

        setup() {
            this.autoDirection = false;
            this.oneShot = true;
            this.spawnRadius = 2;
            this.shots = 1;
            this.burst = new Pair(5, 40);
            this.secPerSpawn = new Pair(0, 1);
            this.budget = 100;
            this.spawnNoiseAngle = new Pair(-4, 4);
            this.endNoiseAngle = new Pair(-10, 10);
            this.startLife = new Pair(0, 0.4);
            this.afterLife = new Pair(0, 0);
            this.emitLife = new Pair(1, 1);
            this.invincible = false;
            this.startMass = new Pair(1, 1);
            this.endMass = new Pair(1, 1);
            this.frictionMultiplier = 1;
            this.startScale = new Pair(1, 4);
            this.endScale = new Pair(1, 1);
            this.startColor = new ObjPair(new Color(0, 0, 0, 1), new Color(100, 100, 0, 1));
            this.endColor = new ObjPair(new Color(0, 0, 0, 1), new Color(100, 0, 0, 1));
            this.startSpeed = new Pair(5, 300);
            this.endSpeed = new Pair(1, 30);
            this.accel = new Pair(1, 1);
            this.spin = new Pair(-5, 5);
            this.spinFriction = 1;
            this.frame = new Pair(0, 9);
            this.frameWidth = 16;
            this.frameHeight = 16;
            this.image = this.parent.imgTint;
            this.useImage = false;
            this.particleFrame = new Pair(8, 8);
            this.lightIntensity = new Pair(0, 1);
            this.useLight = true;
            this.tintImage = false;
        }
        
    }

    // Manages a pool of particles
    export class PoolManager {
        max: number;
        growth: number;
        counter: number;
        pool: Particle[];
        current: Particle;

        constructor (max: number, growth: number) {
            this.init(max, growth);
        }

        init(max: number, growth: number) {
            this.max = max;
            this.growth = growth;
            this.counter = max;

            var i: number = max;

            this.pool = new Array(max);
            while (--i > -1) {
                this.pool[i] = new Particle();
            }
        }

        getParticle() : Particle {
            if(this.counter > 0)
                return this.current = this.pool[--this.counter];

            var i = this.growth;
            while (--i > -1) {
                this.pool.unshift(new Particle());
            }
            this.counter = this.growth;
            return this.getParticle();
        }

        dispose(p:Particle) {
            this.pool[this.counter++] = p;
        }
    }

    export class Particle {
        // The size of the particle in pixels
        size: number = 2;

        pos: Vec2;
        oldPos: Vec2;
        off: Vec2;
        vel: Vec2;
        forces: Vec2;
        radius: number;
        dir: Vec2;
        startDir: Vec2;
        endDir: Vec2;
        speed: number = 1;
        mass: number = 1;
        rotation: number = 0;
        colorRGB: string = "255,255,255";

        collideWithWorld: bool = true;

        startVel: Vec2;
        endVel: Vec2;

        startScale: number = 1;
        endScale: number = 10;

        startRot: number;
        endRot: number;
        spin: number = 1;
        spinFriction: number;

        startColor: Color;
        endColor: Color;

        startSpeed: number = 1;
        endSpeed: number = 1;

        // added to the velocity to accelerate and counter friction
        accel: number = 1;

        startMass: number = 1;
        endMass: number = 1;

        frictionMultiplier: number = 0.01;

        callback: { (p: Particle): void; };

        parent: ParticleEmiter;

        // Life in seconds
        lifeSpan: number = 3;
        lifeClock: number;

        afterLife: number = 5;

        collideClock: number = 0;

        // A value between 0 and 1 representing the amount of life, 1 is full life, 0 is dead
        life: number = 1;;
        
        // Alpha
        alpha: number = 1;

        image: TintImage;
        tintImage: bool;
        drawImage: bool;

        useLight: bool = false;

        light: Light;
        

        game: Game;

        _frame: number = 1;
        framePos: Vec2;
        frameWidth: number = 1;
        frameHeight: number = 1;
        particleFrame: number = 1;
        lightIntensity: Pair;

        constructor () {
            this.pos = new Vec2(0, 0);
            this.oldPos = new Vec2(0, 0);
            this.off = new Vec2(0, 0);
            this.vel = new Vec2(0, 0);
            this.dir = new Vec2();
            this.forces = new Vec2(0, 0);
            this.startVel = new Vec2();
            this.endVel = new Vec2();
            this.framePos = new Vec2();

            this.lifeClock = this.lifeSpan;

            // Color.from
        }

        giveLife(parent: ParticleEmiter, game: Game, pos: Vec2, lifeSpan: number, afterLife: number, startVel: Vec2, endVel: Vec2, accel: number, frictionMultiplier: number, startMass: number, endMass: number, startScale: number, endScale: number, startRot: number, endRot: number, spin: number, spinFriction: number, startColor: Color, endColor: Color, useLight: bool, particleFrame?: number = 1, lightIntensity?: Pair, useImage?:bool = false, image?: TintImage, frame?: number = 1, frameWidth?:number = 1, frameHeight?:number = 1, tintImage?:bool = true) {
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

            if (useImage) {
                this.image = image;
                this.drawImage = true;
                // Just going to assert that we'll want every particle to be centered
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

            if (this.useLight) {
                this.light = new ParticleLight(this.game.lightEngine, this.pos.x, this.pos.y, this.particleFrame, this.startColor, this.lightIntensity);
                // this.light = this.game.lightEngine.createLight(this.pos.x, this.pos.y, 20);
                this.light.drawShadows = false;
                this.game.lightEngine.add(this.light);
            }
        }

        set frame(frame:number) {
            this._frame = frame;
            this.framePos.x = (frame * this.frameWidth) % this.image.width;
            this.framePos.y = Math.floor((this.frame * this.frameHeight) / this.image.width);
        }
        get frame() {
            return this._frame;
        }

        addforce(force: Vec2) {
            force = force.divideN(this.mass);
            this.forces.addRel(force);
        }

        // Returns true if alive, false if dead
        update(delta:number) : bool {
            this.lifeClock -= delta;
            this.collideClock -= delta;
            
            this.oldPos.setV(this.pos);

            var friction: Vec2, accel: Vec2;
           
            if (this.lifeClock > 0) {
                this.life = (Math.max(this.lifeClock, 0) / this.lifeSpan);
                this.vel = Vec2.lerp(this.endVel, this.vel, this.life);
                accel = this.vel.unit().multN(this.accel);
                this.addforce(accel);
                this.vel.addRel(this.forces);
                this.forces.setZero();
                this.pos = this.pos.addN(this.vel.x * delta, this.vel.y * delta);

                this.rotation = Util.lerp(this.rotation, this.startRot, this.life);
            } else {
                this.vel;
                friction = this.vel.unit().multN(-1).multN(this.frictionMultiplier);
                this.addforce(friction);
                this.vel.addRel(this.forces);
                this.forces.setZero();
                this.pos = this.pos.addN(this.vel.x * delta, this.vel.y * delta);
            }

            if (this.collideWithWorld && this.collideClock <= 0) {
                if (this.game.world.checkCollisionAtPoint(this.pos.toPoint())) {
                    this.vel.scale(-1);
                    this.endVel.scale(-1);
                    this.pos.setV(this.oldPos);
                    this.collideClock = 1;
                }
            }

            this.rotation += this.spin * delta;
            this.startRot += this.spin * delta;
            this.spin *= this.spinFriction;

            if (this.useLight) {
                this.light.setPos(this.pos.x, this.pos.y);
            }

            if (this.dead) {
                this.kill();
                return this.hideTheBodies();
            } 
            return true;
        }

        get dead(): bool {
            return (this.lifeClock <= -this.afterLife);
        }

        // Override to do something special when the particle dies
        kill() {
            if (this.useLight) {
                this.game.lightEngine.remove(this.light);
            }
        }

        hideTheBodies() {
            return false;
        }

        draw(ctx: CanvasRenderingContext2D) {
            ctx.translate(this.pos.x, this.pos.y);
            ctx.rotate(Util.degToRad(this.rotation));

            if (this.drawImage) {
                this.drawSprite(ctx);
            } else {
                this.drawPixels(ctx);
            }
        }

        drawPixels(ctx: CanvasRenderingContext2D) {
            var color = Color.lerp(this.endColor, this.startColor, this.life);
            var scale = Util.lerp(this.endScale, this.startScale, this.life);
            ctx.fillStyle = color.toString();
            ctx.fillRect(-(scale * 0.5), -(scale * 0.5), scale, scale);
            if (this.useLight) {
                this.light.intensity = color.a;
                // this.light.color = color;
            }
        }

        drawSprite(ctx: CanvasRenderingContext2D) {
            var color = Color.lerp(this.endColor, this.startColor, this.life);
            var scale = Util.lerp(this.endScale, this.startScale, this.life);
            if (this.tintImage) {
                var color = Color.lerp(this.endColor, this.startColor, this.life);
                this.image.render(ctx, color, this.framePos.x, this.framePos.y, this.frameWidth, this.frameHeight, -(this.off.x * scale), -(this.off.y * scale), this.frameWidth * scale, this.frameHeight * scale);
            } else {
                this.image.renderNoTint(ctx, this.framePos.x, this.framePos.y, this.frameWidth, this.frameHeight, -(this.off.x * scale), -(this.off.y * scale), this.frameWidth * scale, this.frameHeight * scale);
            }
            if (this.useLight) {
                // this.light.color = color;
            }
        }
    }
}