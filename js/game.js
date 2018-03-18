var vs;
(function (vs) {
    var Game = (function () {
        function Game() {
            var _this = this;
            Game.checkHUDDiv();
            this.canvas = document.getElementById("VS_Canvas");
            this.canvas.onselectstart = function () {
                return false;
            };
            this.canvas.onmousedown = function () {
                return false;
            };
            vs.Keyboard.init();
            vs.Mouse.init(this.canvas);
            this.hud = new vs.HUD(this);
            this.states = [];
            this.changeState(vs.SLoading.instance());
            this.animationFrame = function () {
                _this.gameLoop();
                requestAnimationFrame(_this.animationFrame);
            };
            this.animationFrame();
        }
        Game.game = null;
        Game.manifest = [
            {
                type: "image",
                id: "player",
                src: "images/player.png"
            }, 
            {
                type: "image",
                id: "wall",
                src: "images/walls.png"
            }, 
            {
                type: "image",
                id: "elevator",
                src: "images/elevator.png"
            }, 
            {
                type: "image",
                id: "door",
                src: "images/door.png"
            }, 
            {
                type: "image",
                id: "flashlightMask",
                src: "images/flashlightMask01.png"
            }, 
            {
                type: "image",
                id: "floor",
                src: "images/floor.png"
            }, 
            {
                type: "image",
                id: "items",
                src: "images/items.png"
            }, 
            {
                type: "image",
                id: "mob2",
                src: "images/mob2.png"
            }, 
            {
                type: "image",
                id: "bullets",
                src: "images/bullets.png"
            }, 
            {
                type: "image",
                id: "weapons",
                src: "images/weapons.png"
            }, 
            {
                type: "image",
                id: "particles",
                src: "images/particles.png"
            }, 
            {
                type: "image",
                id: "particleLights",
                src: "images/particleLights.png"
            }, 
            {
                type: "image",
                id: "circularLight",
                src: "images/circularLight.png"
            }, 
            {
                type: "audio",
                id: "enemy01",
                src: "media/enemy01.mp3"
            }, 
            {
                type: "audio",
                id: "enemyExplode01",
                src: "media/enemyExplode01.mp3"
            }, 
            {
                type: "audio",
                id: "enemyExplode02",
                src: "media/enemyExplode02.mp3"
            }, 
            {
                type: "audio",
                id: "enemyExplode03",
                src: "media/enemyExplode03.mp3"
            }, 
            {
                type: "audio",
                id: "bullet01",
                src: "media/bullet01.mp3"
            }, 
            {
                type: "audio",
                id: "bullet02",
                src: "media/bullet02.mp3"
            }, 
            {
                type: "audio",
                id: "reload",
                src: "media/reload.ogg"
            }, 
            {
                type: "audio",
                id: "emptyClip",
                src: "media/emptyClip.mp3"
            }, 
            {
                type: "audio",
                id: "itemAdded",
                src: "media/itemToInventory.mp3"
            }, 
            {
                type: "audio",
                id: "moneyAdded",
                src: "media/money.mp3"
            }, 
            {
                type: "audio",
                id: "weaponAdded",
                src: "media/weaponPickup.mp3"
            }, 
            {
                type: "audio",
                id: "melee01",
                src: "media/melee01.mp3"
            }, 
            {
                type: "audio",
                id: "melee02",
                src: "media/melee02.mp3"
            }, 
            {
                type: "audio",
                id: "melee03",
                src: "media/melee03.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemy01",
                src: "media/enemy01.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemy02",
                src: "media/enemy02.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemy03",
                src: "media/enemy03.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemyAttack01",
                src: "media/enemyAttack01.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemyAttack02",
                src: "media/enemyAttack02.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemyAttack03",
                src: "media/enemyAttack03.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemyAttack04",
                src: "media/enemyAttack04.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemyAttack05",
                src: "media/enemyAttack05.mp3"
            }, 
            {
                type: "sound3d",
                id: "enemyAttack06",
                src: "media/enemyAttack06.mp3"
            }, 
            {
                type: "sound3d",
                id: "spark01",
                src: "media/spark01.mp3"
            }, 
            {
                type: "sound3d",
                id: "explosion01",
                src: "media/explosion01.mp3"
            }, 
            
        ];
        Game.TILESIZE = 64;
        Game.createGame = function createGame() {
            Game.game = new Game();
            return Game.game;
        }
        Object.defineProperty(Game.prototype, "ready", {
            get: function () {
                return (this.canvas !== undefined || this.canvas !== null);
            },
            enumerable: true,
            configurable: true
        });
        Game.prototype.loadAssets = function () {
            var _this = this;
            this.assets = new vs.Preloader(Game.manifest);
            this.assets.callback = function () {
                _this.init();
            };
        };
        Game.prototype.init = function () {
            this.lightEngine = new vs.LightEngine(this);
            this.soundManager = this.assets.soundManager;
            this.player = new vs.Player(0, 0, this);
            this.itemManager = new vs.ItemManager(this);
            this.player.weaponManager.itemManager = this.itemManager;
            this.itemManager.weaponManager = this.player.weaponManager;
            this.particleMangager = new vs.ParticleKing(this.width, this.height, this);
            this.hud.init();
            this.world = new vs.World(this);
            this.paused = false;
            this.changeState(vs.SPlay.instance());
        };
        Game.prototype.gameLoop = function () {
            if(!this.ready) {
                return;
            }
            var ctx = this.canvas.getContext("2d");
            this.handleEvents();
            this.update();
            this.render(ctx);
        };
        Game.prototype.handleEvents = function () {
            this.states[this.states.length - 1].handleEvents(this);
        };
        Game.prototype.update = function () {
            var fps = vs.FPS.getFPS();
            var delta = vs.FPS.getDelta();
            if(vs.D.debug) {
                var d = document.getElementById("MessageDIV");
                d.innerHTML = "FPS: " + fps.toFixed(0);
            }
            this.states[this.states.length - 1].update(delta, this);
        };
        Game.prototype.render = function (ctx) {
            this.states[this.states.length - 1].render(ctx, this);
        };
        Game.prototype.resize = function () {
            var gameWidth = window.innerWidth;
            var gameHeight = window.innerHeight;
            var scaleToFitX = gameWidth / this.canvas.width;
            this.gameScalar = scaleToFitX;
            this.gameWidth = this.canvas.width * scaleToFitX;
            this.gameHeight = this.canvas.height * scaleToFitX;
            this.canvas.style.width = this.gameWidth + "px";
            this.canvas.style.height = this.gameHeight + "px";
        };
        Game.prototype.nextLevel = function () {
            var state = this.getCurrent();
            if(state instanceof vs.SPlay) {
                var play = state;
                play.nextLevel();
            }
        };
        Game.prototype.getCurrent = function () {
            return this.states[this.states.length - 1];
        };
        Game.prototype.changeState = function (state) {
            if(this.states.length > 0) {
                var back = this.states.pop();
                back.exit();
            }
            this.states.push(state);
            state.init(this);
        };
        Game.prototype.pushState = function (state) {
            if(this.states.length > 0) {
                this.states[this.states.length - 1].pause();
            }
            this.states.push(state);
            state.init(this);
        };
        Game.prototype.popState = function () {
            if(this.states.length > 0) {
                var back = this.states.pop();
                back.exit();
            }
            if(this.states.length > 0) {
                this.states[this.states.length - 1].resume();
            }
        };
        Game.prototype.currentState = function () {
            return this.states[this.states.length - 1];
        };
        Game.prototype.cleanup = function () {
        };
        Game.prototype.quit = function () {
        };
        Game.prototype.gameOver = function () {
            this.pushState(vs.SGameOver.instance());
        };
        Game.prototype.restart = function () {
            this.player.restart();
            this.itemManager.restart();
            this.lightEngine.reset();
            this.particleMangager.restart();
            this.world.restart();
            this.states = [];
            this.changeState(vs.SPlay.instance());
        };
        Game.checkHUDDiv = function checkHUDDiv() {
            var huddiv = document.getElementById("hudDIV");
            if(vs.D.debug) {
                huddiv.style.visibility = "visible";
            } else {
                huddiv.style.visibility = "hidden";
            }
        }
        Object.defineProperty(Game.prototype, "width", {
            get: function () {
                return this.canvas.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Game.prototype, "height", {
            get: function () {
                return this.canvas.height;
            },
            enumerable: true,
            configurable: true
        });
        return Game;
    })();
    vs.Game = Game;    
})(vs || (vs = {}));
