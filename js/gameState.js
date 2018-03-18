var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var StateManager = (function () {
        function StateManager() { }
        return StateManager;
    })();
    vs.StateManager = StateManager;    
    var GameState = (function () {
        function GameState() {
        }
        GameState.prototype.init = function (game) {
        };
        GameState.prototype.exit = function () {
        };
        GameState.prototype.pause = function () {
        };
        GameState.prototype.resume = function () {
        };
        GameState.prototype.handleEvents = function (game) {
        };
        GameState.prototype.update = function (delta, game) {
        };
        GameState.prototype.render = function (ctx, game) {
        };
        GameState.prototype.changeState = function (game, state) {
        };
        return GameState;
    })();
    vs.GameState = GameState;    
    var SIntro = (function (_super) {
        __extends(SIntro, _super);
        function SIntro() {
                _super.call(this);
        }
        SIntro._instance = null;
        SIntro.instance = function instance() {
            if(SIntro._instance) {
                return SIntro._instance;
            }
            SIntro._instance = new SIntro();
            return SIntro._instance;
        }
        return SIntro;
    })(GameState);
    vs.SIntro = SIntro;    
    var SPlay = (function (_super) {
        __extends(SPlay, _super);
        function SPlay() {
                _super.call(this);
            this.drawMap = false;
            this.drawLights = vs.D.renderLights;
            this.switchingLevels = false;
            this.zoomScale = 0.1;
            this.fadeAlpha = 1;
            this.desiredFade = 1;
            this.fadeScalar = 0.5;
            this.makeLevels();
            this.fadeColor = new vs.Color(0, 0, 0, 1);
        }
        SPlay._instance = null;
        SPlay.prototype.makeLevels = function () {
            this.levels = [];
            this._currentLevel = 0;
            this.displayLevel = 1;
            var level;
            var levels = this.levels;
            level = {
                level: 0,
                mapFeatures: 6,
                itemDensity: 2,
                itemType: vs.ItemType.WEAPON,
                npcDensity: 0,
                roomDensity: 96,
                corridorDensity: 16,
                weaponRatios: [
                    vs.Random.createProportion(vs.ItemType.WPNBlaster, 100)
                ],
                mobSpawnChance: 0,
                mobRatios: []
            };
            levels.push(level);
            level = {
                level: 1,
                mapFeatures: 6,
                itemDensity: 2,
                itemType: -1,
                npcDensity: 1,
                roomDensity: 96,
                corridorDensity: 16,
                weaponRatios: [
                    vs.Random.createProportion(vs.ItemType.WPNBlaster, 100)
                ],
                mobSpawnChance: 10,
                mobRatios: [
                    vs.Random.createProportion(vs.MobType.CREEPER, 100)
                ]
            };
            levels.push(level);
            level = {
                level: 2,
                mapFeatures: 13,
                itemDensity: 5,
                itemType: -1,
                npcDensity: 4,
                roomDensity: 96,
                corridorDensity: 34,
                weaponRatios: [
                    vs.Random.createProportion(vs.ItemType.WPNBlaster, 100)
                ],
                mobSpawnChance: 10,
                mobRatios: [
                    vs.Random.createProportion(vs.MobType.CREEPER, 100)
                ]
            };
            levels.push(level);
            level = {
                level: 3,
                mapFeatures: 13,
                itemDensity: 10,
                itemType: -1,
                npcDensity: 6,
                roomDensity: 96,
                corridorDensity: 34,
                weaponRatios: [
                    vs.Random.createProportion(vs.ItemType.WPNBlaster, 90), 
                    vs.Random.createProportion(vs.ItemType.WPNMachineGun, 10)
                ],
                mobSpawnChance: 10,
                mobRatios: [
                    vs.Random.createProportion(vs.MobType.CREEPER, 60), 
                    vs.Random.createProportion(vs.MobType.LEAPER, 40)
                ]
            };
            levels.push(level);
            level = {
                level: 4,
                mapFeatures: 32,
                itemDensity: 25,
                itemType: -1,
                npcDensity: 25,
                roomDensity: 96,
                corridorDensity: 34,
                weaponRatios: [
                    vs.Random.createProportion(vs.ItemType.WPNBlaster, 60), 
                    vs.Random.createProportion(vs.ItemType.WPNMachineGun, 20), 
                    vs.Random.createProportion(vs.ItemType.WPNSticky, 20)
                ],
                mobSpawnChance: 20,
                mobRatios: [
                    vs.Random.createProportion(vs.MobType.CREEPER, 40), 
                    vs.Random.createProportion(vs.MobType.LEAPER, 40), 
                    vs.Random.createProportion(vs.MobType.FACEHUGGER, 20)
                ]
            };
            levels.push(level);
            level = {
                level: 5,
                mapFeatures: 90,
                itemDensity: 64,
                itemType: -1,
                npcDensity: 65,
                roomDensity: 96,
                corridorDensity: 55,
                weaponRatios: [
                    vs.Random.createProportion(vs.ItemType.WPNBlaster, 60), 
                    vs.Random.createProportion(vs.ItemType.WPNMachineGun, 20), 
                    vs.Random.createProportion(vs.ItemType.WPNSticky, 20)
                ],
                mobSpawnChance: 20,
                mobRatios: [
                    vs.Random.createProportion(vs.MobType.CREEPER, 40), 
                    vs.Random.createProportion(vs.MobType.LEAPER, 40), 
                    vs.Random.createProportion(vs.MobType.FACEHUGGER, 20)
                ]
            };
            levels.push(level);
            this.totalLevels = this.levels.length;
        };
        SPlay.prototype.init = function (game) {
            this.player = game.player;
            this.lightEngine = game.lightEngine;
            this.hud = game.hud;
            this.world = game.world;
            this.lightEngine.reset();
            this.player.restart();
            this._currentLevel = 0;
            this.setWorldToLevel();
            this.world.init();
            this.pKing = game.particleMangager;
            this.fadeAlpha = 0;
            this.fade(1, 0.035, 0, 0, 0, 1);
            this.storyTime();
        };
        SPlay.prototype.storyTime = function () {
            this.hud.queueMessage("Welcome Nemo to The Ceres Geological Exploitation Facility", 5);
            this.hud.queueMessage("The year is 2059", 3);
            this.hud.queueMessage("How did I get here? How long have I been sleeping? You wonder.", 5);
            this.hud.queueMessage("The air smells of fresh solvents and cleaning solutions", 5);
            this.hud.queueMessage("Where's the lights, this is quite strange.", 5);
            this.hud.queueMessage("I better find a way out of here", 5);
        };
        SPlay.prototype.exit = function () {
        };
        SPlay.prototype.handleEvents = function (game) {
            if(vs.Keyboard.justPressed(vs.Keys.PAUSEBREAK) || (vs.Keyboard.check(vs.Keys.PLUS) && vs.Keyboard.check(vs.Keys.MINUS)) && !this.debugkeyspressed) {
                this.debugkeyspressed = true;
                vs.D.debug = !vs.D.debug;
                this.hud.queueMessage("Debug Mode: " + vs.D.debug, 3, true);
                vs.Game.checkHUDDiv();
            }
            if((vs.Keyboard.check(vs.Keys.PLUS) && vs.Keyboard.check(vs.Keys.MINUS)) == false) {
                this.debugkeyspressed = false;
            }
            if(vs.Keyboard.justPressed(vs.Keys.ESC) || vs.Keyboard.justPressed(vs.Keys.TAB)) {
                game.pushState(SMenu.instance());
            }
            if(vs.D.debug) {
                if(vs.Keyboard.justPressed(vs.Keys._9)) {
                    var r = new vs.FOVTester(this.player.x, this.player.y);
                    game.world.add(r);
                }
                if(vs.Keyboard.justPressed(vs.Keys.BRACKETRIGHT)) {
                    this.hud.clear();
                    this.nextLevel();
                }
                if(vs.Keyboard.justPressed(vs.Keys.BRACKETLEFT)) {
                    this.switchLevel(1);
                    this.hud.clear();
                }
                if(vs.Keyboard.justPressed(vs.Keys.M)) {
                    this.drawMap = !this.drawMap;
                }
                if(vs.Keyboard.justPressed(vs.Keys.L)) {
                    this.drawLights = !this.drawLights;
                }
                if(vs.Keyboard.justPressed(vs.Keys.T)) {
                    var l = new vs.RoomLight(game.lightEngine, game.player.x, game.player.y, 300);
                    game.lightEngine.add(l);
                    l.drawShadows = true;
                }
                if(vs.Keyboard.justPressed(vs.Keys.X)) {
                    vs.Util.getLinePlayerToMouse();
                }
                if(vs.Keyboard.justPressed(vs.Keys.P)) {
                    this.pKing.createGuts(this.player.x, this.player.y);
                }
                if(vs.Keyboard.justPressed(vs.Keys.B)) {
                    var sound = game.assets.sounds["enemy01"];
                    sound.playOver();
                }
                if(vs.Keyboard.justPressed(vs.Keys._0)) {
                    var sound3d = game.assets.sounds3d["enemy01"].copy();
                    sound3d.setPos(game.player.x, game.player.y, 1);
                    sound3d.loop();
                }
                var wheelDelta = vs.Mouse.mouseWheel();
                if(this.drawMap) {
                    if(wheelDelta !== 0) {
                        this.world.scaleMinimap(wheelDelta);
                    }
                } else {
                    if(wheelDelta !== 0) {
                        this.world.camera.scrollScale(wheelDelta);
                    }
                }
            }
        };
        SPlay.prototype.update = function (delta, game) {
            if(!this.switchingLevels) {
                this.world.update(delta);
                this.hud.update(delta);
                this.pKing.update(delta);
            } else {
                this.updateRebuild(delta);
            }
            if(vs.D.debug) {
                this.updateHTMLDivs();
            }
        };
        SPlay.prototype.render = function (ctx, game) {
            this.world.render(ctx, game.width, game.height);
            this.pKing.render(ctx);
            if(this.drawLights) {
                this.lightEngine.render(ctx, this.world.camera.bounds, false);
            }
            if(this.drawMap) {
                this.world.drawMinimap(ctx);
            }
            this.hud.drawIngame(ctx);
            this.renderFade(ctx, game);
        };
        SPlay.prototype.updateHTMLDivs = function () {
            var game = vs.Game.game;
            var world = game.world;
            document.getElementById("infoDIV").innerHTML = "Level " + this._currentLevel + "<br />";
            document.getElementById("DIVPlayerSpeed").innerHTML = "PlayerSpeed " + game.player.speed;
            document.getElementById("DIVCorridorDensity").innerHTML = "CorridorDensity " + world.corridorDensity;
            document.getElementById("DIVFeatureDensity").innerHTML = "FeatureDensity " + world.mapFeatures;
            document.getElementById("DIVItemDensity").innerHTML = "ItemDensity " + world.itemDensity;
            document.getElementById("DIVNPCDensity").innerHTML = "NPCDensity " + world.npcDensity;
            document.getElementById("DIVRoomDensity").innerHTML = "RoomDensity " + world.roomDensity;
        };
        SPlay.prototype.pause = function () {
            var game = vs.Game.game;
            var ctx = vs.Game.game.canvas.getContext("2d");
            this.world.render(ctx, game.width, game.height);
            this.pKing.render(ctx);
            this.fadeColor.setRGB(0, 0, 0, 1);
            if(this.drawLights) {
                this.lightEngine.render(ctx, this.world.camera.bounds, false);
            }
        };
        SPlay.prototype.resume = function () {
        };
        SPlay.prototype.nextLevel = function () {
            this._currentLevel++;
            this.displayLevel++;
            if(this._currentLevel >= this.totalLevels) {
                this._currentLevel = this.totalLevels - 1;
            }
            this.rebuild();
        };
        SPlay.prototype.rebuild = function () {
            this.switchingLevels = true;
            this.world.camera.desiredScale = this.zoomScale;
            this.fadeOut();
        };
        SPlay.prototype.updateRebuild = function (delta) {
            this.world.camera.update(delta);
            if(this.world.camera.scale <= this.zoomScale) {
                this.switchingLevels = false;
                this._rebuild();
                this.world.camera.desiredScale = 1;
                this.fadeIn();
            }
        };
        SPlay.prototype.renderFade = function (ctx, game) {
            var step = (this.fadeAlpha - this.desiredFade) * this.fadeScalar;
            var minStep = 0.0001;
            if(this.fadeAlpha !== this.desiredFade) {
                this.fadeAlpha -= step;
                if(this.fadeAlpha < 0) {
                    this.fadeAlpha = 0;
                }
                if(this.fadeAlpha > 1) {
                    this.fadeAlpha = 1;
                }
                if(Math.abs(this.fadeAlpha - this.desiredFade) < minStep) {
                    this.fadeAlpha = this.desiredFade;
                }
            }
            if(this.fadeAlpha !== 1) {
                ctx.save();
                ctx.fillStyle = this.fadeColor.toString();
                ctx.globalAlpha = 1 - this.fadeAlpha;
                ctx.globalCompositeOperation = "source-over";
                ctx.fillRect(0, 0, game.width, game.height);
                ctx.restore();
            }
        };
        SPlay.prototype.fadeIn = function () {
            this.fade(1, 0.05, 0, 0, 0, 1);
        };
        SPlay.prototype.fadeOut = function () {
            this.fade(0, 0.05, 0, 0, 0, 1);
        };
        SPlay.prototype.fade = function (desiredFade, scalar, r, g, b, a) {
            this.desiredFade = Math.max(Math.min(desiredFade, 1), 0);
            this.fadeScalar = scalar;
            this.fadeColor.setRGB(r, g, b, a);
        };
        SPlay.prototype._rebuild = function () {
            this.setWorldToLevel();
            this.rebuildWorld();
        };
        SPlay.prototype.reset = function () {
        };
        SPlay.prototype.switchLevel = function (level) {
            if(level == this.currentLevel) {
                return;
            }
            if(level > 0 && level <= this.totalLevels) {
                this._currentLevel = level - 1;
                this.rebuild();
                return;
            }
            alert("Cannot Switch to level: " + level);
        };
        SPlay.prototype.setWorldToLevel = function () {
            var level = this.getCurrentLevel();
            this.world.mapFeatures = level.mapFeatures;
            this.world.corridorDensity = level.corridorDensity;
            this.world.npcDensity = level.npcDensity;
            this.world.itemDensity = level.itemDensity;
            this.world.roomDensity = level.roomDensity;
            this.world.itemType = level.itemType;
            this.world.weaponRatios = level.weaponRatios;
            this.world.roomSpawnChance = level.mobSpawnChance;
            this.world.mobRatios = level.mobRatios;
        };
        SPlay.prototype.rebuildWorld = function () {
            this.world.nextlevel();
        };
        SPlay.prototype.getCurrentLevel = function () {
            return this.levels[this._currentLevel];
        };
        SPlay.prototype.changeState = function (game, state) {
        };
        Object.defineProperty(SPlay.prototype, "currentLevel", {
            get: function () {
                return this._currentLevel + 1;
            },
            enumerable: true,
            configurable: true
        });
        SPlay.instance = function instance() {
            if(SPlay._instance) {
                return SPlay._instance;
            }
            SPlay._instance = new SPlay();
            return SPlay._instance;
        }
        return SPlay;
    })(GameState);
    vs.SPlay = SPlay;    
    var SMenu = (function (_super) {
        __extends(SMenu, _super);
        function SMenu() {
                _super.call(this);
            this.cacheCanvas = document.createElement("canvas");
        }
        SMenu._instance = null;
        SMenu.prototype.init = function (game) {
            this.game = game;
            this.hud = game.hud;
            this.cacheCanvas.width = game.width;
            this.cacheCanvas.height = game.height;
            var ctx = this.cacheCanvas.getContext("2d");
            ctx.drawImage(game.canvas, 0, 0);
        };
        SMenu.prototype.exit = function () {
        };
        SMenu.prototype.handleEvents = function (game) {
            if(vs.Keyboard.justPressed(vs.Keys.ESC) || vs.Keyboard.justPressed(vs.Keys.TAB)) {
                game.popState();
            }
        };
        SMenu.prototype.update = function (delta, game) {
        };
        SMenu.prototype.render = function (ctx, game) {
            ctx.clearRect(0, 0, game.width, game.height);
            ctx.drawImage(this.cacheCanvas, 0, 0);
            this.hud.drawMenu(ctx);
        };
        SMenu.prototype.pause = function () {
        };
        SMenu.prototype.resume = function () {
        };
        SMenu.prototype.changeState = function (game, state) {
        };
        SMenu.instance = function instance() {
            if(SMenu._instance) {
                return SMenu._instance;
            }
            SMenu._instance = new SMenu();
            return SMenu._instance;
        }
        return SMenu;
    })(GameState);
    vs.SMenu = SMenu;    
    var SLoading = (function (_super) {
        __extends(SLoading, _super);
        function SLoading() {
                _super.call(this);
            this.assetsCreated = false;
        }
        SLoading._instance = null;
        SLoading.prototype.init = function (game) {
            this.game = game;
            this.hud = game.hud;
        };
        SLoading.prototype.exit = function () {
        };
        SLoading.prototype.handleEvents = function (game) {
        };
        SLoading.prototype.update = function (delta, game) {
            if(!this.assetsCreated) {
                game.loadAssets();
                this.assetsCreated = true;
            }
        };
        SLoading.prototype.render = function (ctx, game) {
            ctx.clearRect(0, 0, game.width, game.height);
            this.hud.drawBasic(ctx, "Welcome to Vacuum Seal.\nLoading... " + game.assets.percentDone + "%");
        };
        SLoading.prototype.pause = function () {
        };
        SLoading.prototype.resume = function () {
        };
        SLoading.prototype.changeState = function (game, state) {
        };
        SLoading.instance = function instance() {
            if(SLoading._instance) {
                return SLoading._instance;
            }
            SLoading._instance = new SLoading();
            return SLoading._instance;
        }
        return SLoading;
    })(GameState);
    vs.SLoading = SLoading;    
    var SGameOver = (function (_super) {
        __extends(SGameOver, _super);
        function SGameOver() {
                _super.call(this);
            this.cacheCanvas = document.createElement("canvas");
        }
        SGameOver._instance = null;
        SGameOver.prototype.init = function (game) {
            this.game = game;
            this.hud = game.hud;
            this.cacheCanvas.width = game.width;
            this.cacheCanvas.height = game.height;
            var ctx = this.cacheCanvas.getContext("2d");
            ctx.drawImage(game.canvas, 0, 0);
        };
        SGameOver.prototype.exit = function () {
        };
        SGameOver.prototype.handleEvents = function (game) {
            if(vs.Keyboard.justPressed(vs.Keys.Y)) {
                game.restart();
            }
        };
        SGameOver.prototype.update = function (delta, game) {
        };
        SGameOver.prototype.render = function (ctx, game) {
            ctx.clearRect(0, 0, game.width, game.height);
            ctx.drawImage(this.cacheCanvas, 0, 0);
            this.hud.drawBasic(ctx, "Unfortunatly you have been lost to the dark void of space.\nWould you like to be reborn? Y / N");
        };
        SGameOver.prototype.pause = function () {
        };
        SGameOver.prototype.resume = function () {
        };
        SGameOver.prototype.changeState = function (game, state) {
        };
        SGameOver.instance = function instance() {
            if(SGameOver._instance) {
                return SGameOver._instance;
            }
            SGameOver._instance = new SGameOver();
            return SGameOver._instance;
        }
        return SGameOver;
    })(GameState);
    vs.SGameOver = SGameOver;    
})(vs || (vs = {}));
