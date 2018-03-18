/// <reference path="definitions.d.ts" />
/// <reference path="interfaces.ts" />
/// <reference path="util.ts" />
/// <reference path="linkedList.ts" />
/// <reference path="hashMap.ts" />
/// <reference path="input.ts" />
/// <reference path="geom.ts" />
/// <reference path="gameState.ts" />
/// <reference path="camera.ts" />
/// <reference path="preloader.ts" />
/// <reference path="sprite.ts" />
/// <reference path="lightEngine.ts" />
/// <reference path="world.ts" />
/// <reference path="room.ts" />
/// <reference path="dungeon.d.ts" />
/// <reference path="weaponManager.ts" />
/// <reference path="itemManager.ts" />
/// <reference path="hud.ts" />
/// <reference path="menu.ts" />
/// <reference path="particles.ts" />
/// <reference path="audioManager.ts" />
/// <reference path="player.ts" />
/// <reference path="lightEngine.ts" />
/// <reference path="wall.ts" />
/// <reference path="elevator.ts" />
/// <reference path="items.ts" />
/// <reference path="npc.ts" />

// Module vs for VacuumSeal
// All classes for the game should be placed within this module
module vs {
    // This glass handles the preloading of the games assets and the master game loop
    export class Game {
        // Static reference to itself
        static game: Game;
        // the manifest holds references to all the games assets for the preload
        static manifest: manifestItem[] = [
            { type: "image", id: "player", src: "images/player.png" },
            { type: "image", id: "wall", src: "images/walls.png" },
            { type: "image", id: "elevator", src: "images/elevator.png" },
            { type: "image", id: "door", src: "images/door.png" },
            { type: "image", id: "flashlightMask", src: "images/flashlightMask01.png" },
            { type: "image", id: "floor", src: "images/floor.png" },
            { type: "image", id: "items", src: "images/items.png" },
            { type: "image", id: "mob2", src: "images/mob2.png" },
            { type: "image", id: "bullets", src: "images/bullets.png" },
            { type: "image", id: "weapons", src: "images/weapons.png" },
            { type: "image", id: "particles", src: "images/particles.png" },
            { type: "image", id: "particleLights", src: "images/particleLights.png" },
            { type: "image", id: "circularLight", src: "images/circularLight.png" },
            { type: "audio", id: "enemy01", src: "media/enemy01.mp3" },
            { type: "audio", id: "enemyExplode01", src: "media/enemyExplode01.mp3" },
            { type: "audio", id: "enemyExplode02", src: "media/enemyExplode02.mp3" },
            { type: "audio", id: "enemyExplode03", src: "media/enemyExplode03.mp3" },
            { type: "audio", id: "bullet01", src: "media/bullet01.mp3" },
            { type: "audio", id: "bullet02", src: "media/bullet02.mp3" },
            { type: "audio", id: "reload", src: "media/reload.ogg" },
            { type: "audio", id: "emptyClip", src: "media/emptyClip.mp3" },
            { type: "audio", id: "itemAdded", src: "media/itemToInventory.mp3" },
            { type: "audio", id: "moneyAdded", src: "media/money.mp3" },
            { type: "audio", id: "weaponAdded", src: "media/weaponPickup.mp3" },
            { type: "audio", id: "melee01", src: "media/melee01.mp3" },
            { type: "audio", id: "melee02", src: "media/melee02.mp3" },
            { type: "audio", id: "melee03", src: "media/melee03.mp3" },
            { type: "sound3d", id: "enemy01", src: "media/enemy01.mp3" } ,
            { type: "sound3d", id: "enemy02", src: "media/enemy02.mp3" } ,
            { type: "sound3d", id: "enemy03", src: "media/enemy03.mp3" } ,
            { type: "sound3d", id: "enemyAttack01", src: "media/enemyAttack01.mp3" } ,
            { type: "sound3d", id: "enemyAttack02", src: "media/enemyAttack02.mp3" } ,
            { type: "sound3d", id: "enemyAttack03", src: "media/enemyAttack03.mp3" } ,
            { type: "sound3d", id: "enemyAttack04", src: "media/enemyAttack04.mp3" } ,
            { type: "sound3d", id: "enemyAttack05", src: "media/enemyAttack05.mp3" } ,
            { type: "sound3d", id: "enemyAttack06", src: "media/enemyAttack06.mp3" } ,
            { type: "sound3d", id: "spark01", src: "media/spark01.mp3" } ,
            { type: "sound3d", id: "explosion01", src: "media/explosion01.mp3" } ,
            ];
        static TILESIZE: number = 64;
        assets: Preloader;

        // Canvas Variables
        canvas: HTMLCanvasElement;
        gameCanvasPos: Point;

        gameScalar: number;
        gameWidth: number;
        gameHeight: number;

        // Vital Game objects
        lightEngine: LightEngine;
        hud: HUD;
        world: World;
        player: Player;
        itemManager: ItemManager;
        soundManager: snd.AudioManager;
        particleMangager: ParticleKing;
        //weaponManager: WeaponManager;

        paused: bool;

        states: GameState[];

        static createGame() {
            Game.game = new Game();
            return Game.game;
        }

        constructor() {
        
            Game.checkHUDDiv();

            this.canvas = <HTMLCanvasElement>document.getElementById("VS_Canvas");

            // this.resize();

            // This prevents the cursor from turning to a text selection
            this.canvas.onselectstart = function () { return false; } // ie
            this.canvas.onmousedown = function () { return false; } // mozilla

            Keyboard.init();
            Mouse.init(this.canvas);

            this.hud = new HUD(this);
            this.states = [];
            this.changeState(SLoading.instance());

            this.animationFrame = () =>{
                this.gameLoop();
                requestAnimationFrame(this.animationFrame);
            };
            this.animationFrame();
        }

        get ready() {
            return (this.canvas!== undefined || this.canvas !== null);
        }

        loadAssets() {
            this.assets = new Preloader(Game.manifest);
            // This tells the preloader to start the game once it's finished loading
            this.assets.callback = () => { this.init(); };
        }

        init() {
            this.lightEngine = new LightEngine(this);
            this.soundManager = this.assets.soundManager;
            this.player = new Player(0, 0, this);
            this.itemManager = new ItemManager(this);
            this.player.weaponManager.itemManager = this.itemManager;
            this.itemManager.weaponManager = this.player.weaponManager;
            this.particleMangager = new ParticleKing(this.width, this.height, this);
            this.hud.init();
            
            this.world = new World(this);
            this.paused = false;
            //this.weaponManager.owner = this.player;

        
            //var play = SPlay.instance();
            this.changeState(SPlay.instance());
            //play.switchLevel(0);

            // var bgmusic: snd.Sound = this.assets.sounds["singing"];
            //bgmusic.loop();
            //bgmusic.setGain(0.2);

            //this.animationFrame = () =>{
            //    this.gameLoop();
            //    requestAnimationFrame(this.animationFrame);
            //};
            //this.animationFrame();
        }

        animationFrame: {(): void; };

        gameLoop() {
            if(!this.ready) return;
            var ctx = this.canvas.getContext("2d");
            this.handleEvents();
            this.update();
            this.render(ctx);
        }

        handleEvents() {
            this.states[this.states.length - 1].handleEvents(this);
        }

        update() {
            var fps = FPS.getFPS();
            var delta = FPS.getDelta();

            if (D.debug) {
                var d = document.getElementById("MessageDIV");
                d.innerHTML = "FPS: " + fps.toFixed(0)
            }

            this.states[this.states.length - 1].update(delta, this);
        }

        render(ctx: CanvasRenderingContext2D) {
            this.states[this.states.length - 1].render(ctx, this);
        }

        resize() {
            var gameWidth = window.innerWidth;
            var gameHeight = window.innerHeight;
            var scaleToFitX = gameWidth / this.canvas.width;

            this.gameScalar = scaleToFitX;
            //var scaleToFitY = gameHeight / this.canvas.height;

            //var currentScreenRatio = gameWidth / gameHeight;
            //var optimalRatio = Math.min(scaleToFitX, scaleToFitY);


            this.gameWidth = this.canvas.width * scaleToFitX;
            this.gameHeight = this.canvas.height * scaleToFitX;

            this.canvas.style.width = this.gameWidth + "px";
            this.canvas.style.height = this.gameHeight + "px";

        }

        nextLevel() {
            var state = this.getCurrent();
            if (state instanceof SPlay) {
                var play = <SPlay>state;
                play.nextLevel();
            }
        }

        getCurrent(): GameState{
            return this.states[this.states.length - 1];
        }

        changeState(state: GameState) {
            if (this.states.length > 0) {
                var back = this.states.pop();
                back.exit();
            }
            this.states.push(state);
            state.init(this);
        }
        pushState(state: GameState) {
            if (this.states.length > 0) {
                this.states[this.states.length - 1].pause();
            }
            this.states.push(state);
            state.init(this);
        }
        popState() {
            if (this.states.length > 0) {
                var back = this.states.pop();
                back.exit();
            }
            if (this.states.length > 0) {
                this.states[this.states.length - 1].resume();
            }
        }
        currentState() {
            return this.states[this.states.length - 1];
        }
        cleanup() {
        }
        quit() {
        }

        gameOver() {
            this.pushState(SGameOver.instance());
        }
        restart() {
            this.player.restart();
            this.itemManager.restart();
            //this.weaponManager.restart();
            this.lightEngine.reset();
            this.particleMangager.restart();
            this.world.restart();
            this.states = [];
            this.changeState(SPlay.instance());
        }

        static checkHUDDiv() {
            var huddiv = document.getElementById("hudDIV");
            if(vs.D.debug) {
                huddiv.style.visibility = "visible";
            } else {
                huddiv.style.visibility  = "hidden";
            }
        }

        get width() { return this.canvas.width; }
        get height() { return this.canvas.height; }
    }


    
}