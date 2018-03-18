module vs {
    export class StateManager {
    }
    export class GameState {
        constructor () {
        }
        // This is called when the state changes
        init(game: Game) {
        }
        // This is called when the state exits. 
        exit() {
        }
        // This is called when a state is pushed on top of the current state
        pause() {
        }
        // This is called when the state resumes from a pause
        resume() {
        }
        // This should check input and stuff
        handleEvents(game: Game) {
        }
        // This is called before render and all logic should be handled her
        update(delta: number, game: Game) {
        }
        // This should handle all the graphical stuff
        render(ctx: CanvasRenderingContext2D, game: Game) {
        }
        changeState(game: Game, state: GameState) {
        }
    }

    export class SIntro extends GameState {
        private static _instance: GameState;

        constructor () {
            super();
        }

        static instance(): GameState {
            if(SIntro._instance) return SIntro._instance;
            SIntro._instance = new SIntro();
            return SIntro._instance;
        }
    }

    export class SPlay extends GameState {
        player: Player;
        lightEngine: LightEngine;
        hud: HUD;
        world: World;

        drawMap: bool = false;
        drawLights: bool = D.renderLights;

        pKing: ParticleKing;

        flashLightImage: HTMLImageElement;

        private static _instance: SPlay;

        _currentLevel: number;
        displayLevel: number;
        levels: Level[];
        totalLevels: number;

        switchingLevels: bool = false;

        zoomScale: number = 0.1;

        fadeAlpha: number = 1;
        desiredFade: number = 1;

        fadeScalar: number = 0.5;
        fadeColor: Color;

        debugkeyspressed: bool;

        constructor () {
            super();
            this.makeLevels();
            this.fadeColor = new Color(0, 0, 0, 1);
        }

        makeLevels() {
            this.levels = [];
            this._currentLevel = 0;
            this.displayLevel = 1;
            var level: Level;
            var levels = this.levels;
            // Level 1
            level = {
                level: 0,
                mapFeatures: 6,
                itemDensity: 2,
                itemType: ItemType.WEAPON,
                npcDensity: 0,
                roomDensity: 96,
                corridorDensity: 16,
                weaponRatios: [Random.createProportion(ItemType.WPNBlaster,100)],
                mobSpawnChance: 0,
                mobRatios: []
            };

            levels.push(level);

            // Level 2
            level = {
                level: 1,
                mapFeatures: 6,
                itemDensity: 2,
                itemType: -1,
                npcDensity: 1,
                roomDensity: 96,
                corridorDensity: 16,
                weaponRatios: [Random.createProportion(ItemType.WPNBlaster,100)],
                mobSpawnChance: 10,
                mobRatios: [Random.createProportion(MobType.CREEPER,100)],
            };

            levels.push(level);

            // Level 3
            level = {
                level: 2,
                mapFeatures: 13,
                itemDensity: 5,
                itemType: -1,
                npcDensity: 4,
                roomDensity: 96,
                corridorDensity: 34,
                weaponRatios: [Random.createProportion(ItemType.WPNBlaster,100)],
                mobSpawnChance: 10,
                mobRatios: [Random.createProportion(MobType.CREEPER,100)],
            };

            levels.push(level);

            // Level 4
            level = {
                level: 3,
                mapFeatures: 13,
                itemDensity: 10,
                itemType: -1,
                npcDensity: 6,
                roomDensity: 96,
                corridorDensity: 34,
                weaponRatios: [ Random.createProportion(ItemType.WPNBlaster,90),
                                Random.createProportion(ItemType.WPNMachineGun,10)],
                mobSpawnChance: 10,
                mobRatios: [Random.createProportion(MobType.CREEPER,60), 
                            Random.createProportion(MobType.LEAPER,40)],
            };

            levels.push(level);

            // Level 5
            level = {
                level: 4,
                mapFeatures: 32,
                itemDensity: 25,
                itemType: -1,
                npcDensity: 25,
                roomDensity: 96,
                corridorDensity: 34,
                weaponRatios: [ Random.createProportion(ItemType.WPNBlaster,60),
                                Random.createProportion(ItemType.WPNMachineGun,20),
                                Random.createProportion(ItemType.WPNSticky,20)],
                mobSpawnChance: 20,
                mobRatios: [Random.createProportion(MobType.CREEPER,40), 
                            Random.createProportion(MobType.LEAPER,40),
                            Random.createProportion(MobType.FACEHUGGER,20)],
            };
            levels.push(level);

            // Level 6
            level = {
                level: 5,
                mapFeatures: 90,
                itemDensity: 64,
                itemType: -1,
                npcDensity: 65,
                roomDensity: 96,
                corridorDensity: 55,
                weaponRatios: [ Random.createProportion(ItemType.WPNBlaster,60),
                                Random.createProportion(ItemType.WPNMachineGun,20),
                                Random.createProportion(ItemType.WPNSticky,20)],
                mobSpawnChance: 20,
                mobRatios: [Random.createProportion(MobType.CREEPER,40), 
                            Random.createProportion(MobType.LEAPER,40),
                            Random.createProportion(MobType.FACEHUGGER,20)],
            };
            levels.push(level);            

            this.totalLevels = this.levels.length;
        }

        init(game: Game) {
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
        }

        storyTime() {
            this.hud.queueMessage("Welcome Nemo to The Ceres Geological Exploitation Facility", 5);
            this.hud.queueMessage("The year is 2059", 3);
            this.hud.queueMessage("How did I get here? How long have I been sleeping? You wonder.", 5);
            this.hud.queueMessage("The air smells of fresh solvents and cleaning solutions", 5);
            this.hud.queueMessage("Where's the lights, this is quite strange.", 5);
            this.hud.queueMessage("I better find a way out of here", 5);
        }

        exit() {
        }

        handleEvents(game: Game) {
            if (Keyboard.justPressed(Keys.PAUSEBREAK) || (Keyboard.check(Keys.PLUS) && Keyboard.check(Keys.MINUS)) && !this.debugkeyspressed) {
                this.debugkeyspressed = true;
                D.debug = !D.debug;
                this.hud.queueMessage("Debug Mode: " + D.debug, 3, true);
                Game.checkHUDDiv();
            }
            if ((Keyboard.check(Keys.PLUS) && Keyboard.check(Keys.MINUS)) == false) {
                this.debugkeyspressed = false;
            }
            if (Keyboard.justPressed(Keys.ESC) || Keyboard.justPressed(Keys.TAB)) {
                game.pushState(SMenu.instance());
            }
            if (D.debug) {
                if (Keyboard.justPressed(Keys._9)) {
                    var r = new FOVTester(this.player.x, this.player.y);
                    game.world.add(r);
                }
                if (Keyboard.justPressed(Keys.BRACKETRIGHT)) {
                    this.hud.clear();
                    this.nextLevel();
                }
                if (Keyboard.justPressed(Keys.BRACKETLEFT)) {
                    this.switchLevel(1);
                    this.hud.clear();
                }
                if (Keyboard.justPressed(Keys.M)) {
                    this.drawMap = !this.drawMap;
                }
                if (Keyboard.justPressed(Keys.L)) {
                    this.drawLights = !this.drawLights;
                }
                if (Keyboard.justPressed(Keys.T)) {
                    // var l = new FlickerLight(game.lightEngine, game.player.x, game.player.y, Random.range(100, 600), Color.random());
                    var l = new RoomLight(game.lightEngine, game.player.x, game.player.y, 300);
                    game.lightEngine.add(l);
                    l.drawShadows = true;
                }
                if (Keyboard.justPressed(Keys.X)) {
                    Util.getLinePlayerToMouse();
                }
                if (Keyboard.justPressed(Keys.P)) {
                    this.pKing.createGuts(this.player.x, this.player.y);
                }
                if (Keyboard.justPressed(Keys.B)) {
                    var sound: snd.Sound = game.assets.sounds["enemy01"];
                    sound.playOver();
                }
                if (Keyboard.justPressed(Keys._0)) {
                    var sound3d: snd.Sound3d = game.assets.sounds3d["enemy01"].copy();
                    //var sound3d = snd.copy();
                    sound3d.setPos(game.player.x, game.player.y, 1);
                    sound3d.loop();
                }
                var wheelDelta = Mouse.mouseWheel();
                if (this.drawMap) {
                    if (wheelDelta !== 0) {
                        this.world.scaleMinimap(wheelDelta);
                    }
                } else {
                    if (wheelDelta !== 0) {
                        this.world.camera.scrollScale(wheelDelta);
                    }
                }
            }
        }

        update(delta: number, game: Game) {
            if (!this.switchingLevels) {
                this.world.update(delta);
                this.hud.update(delta);
                this.pKing.update(delta);
                //this.checkFlash(delta);
            } else {
                this.updateRebuild(delta);
            }

            if (D.debug) {
                this.updateHTMLDivs();
            }
        }

        render(ctx: CanvasRenderingContext2D, game: Game) {
            this.world.render(ctx, game.width, game.height);
            this.pKing.render(ctx);
            if (this.drawLights) this.lightEngine.render(ctx, this.world.camera.bounds, false);
            if (this.drawMap) this.world.drawMinimap(ctx);
            this.hud.drawIngame(ctx);

            this.renderFade(ctx, game);

            //var image: HTMLImageElement = game.assets.images["flashlightMask"];

            //console.log("Image width = " + image.width + " height = " + image.height);
             
            //ctx.drawImage(game.assets.images["flashlightMask"], 0, 0, 2000, 2000, 0, 0, 300, 300);

            // ctx.drawImage(game.assets.images["flashlightMask"], 0, 0, 1600, 1600, 0,0, 200, 200);
            
        }

        updateHTMLDivs() {
            var game = Game.game;
            var world = game.world;
            document.getElementById("infoDIV").innerHTML = "Level " + this._currentLevel + "<br />";
            document.getElementById("DIVPlayerSpeed").innerHTML = "PlayerSpeed " + game.player.speed;
            document.getElementById("DIVCorridorDensity").innerHTML = "CorridorDensity " + world.corridorDensity;
            document.getElementById("DIVFeatureDensity").innerHTML = "FeatureDensity " + world.mapFeatures;
            document.getElementById("DIVItemDensity").innerHTML = "ItemDensity " + world.itemDensity;
            document.getElementById("DIVNPCDensity").innerHTML = "NPCDensity " + world.npcDensity;
            document.getElementById("DIVRoomDensity").innerHTML = "RoomDensity " + world.roomDensity;
        }

        pause() {
            var game = Game.game;
            var ctx = Game.game.canvas.getContext("2d");
            this.world.render(ctx, game.width, game.height);
            this.pKing.render(ctx);
            this.fadeColor.setRGB(0, 0, 0, 1);
            if(this.drawLights) this.lightEngine.render(ctx, this.world.camera.bounds, false);
        }

        resume() {
        }

        nextLevel() {
            this._currentLevel++;
            this.displayLevel++;
            if (this._currentLevel >= this.totalLevels) {
                this._currentLevel = this.totalLevels - 1;
            }

            this.rebuild();


        }

        rebuild() {
            this.switchingLevels = true;
            this.world.camera.desiredScale = this.zoomScale;
            this.fadeOut();
        }

        updateRebuild(delta: number) {
            this.world.camera.update(delta);
            if (this.world.camera.scale <= this.zoomScale) {
                this.switchingLevels = false;
                this._rebuild();
                this.world.camera.desiredScale = 1;
                this.fadeIn();
            }
        }

        renderFade(ctx:CanvasRenderingContext2D, game:Game) {
            var step = (this.fadeAlpha - this.desiredFade) * this.fadeScalar;
            var minStep = 0.0001;
            if (this.fadeAlpha !== this.desiredFade) {
                this.fadeAlpha -= step;
                if (this.fadeAlpha < 0) this.fadeAlpha = 0;
                if (this.fadeAlpha > 1) this.fadeAlpha = 1;
                if (Math.abs(this.fadeAlpha - this.desiredFade) < minStep) {
                    this.fadeAlpha = this.desiredFade;
                }
            }
            if (this.fadeAlpha !== 1) {
                ctx.save();
                ctx.fillStyle = this.fadeColor.toString();
                ctx.globalAlpha = 1 - this.fadeAlpha;
                ctx.globalCompositeOperation = "source-over";
                ctx.fillRect(0, 0, game.width, game.height);
                ctx.restore();
            }
        }

        fadeIn() {
            this.fade(1, 0.05, 0, 0, 0, 1);
        }

        fadeOut() {
            this.fade(0, 0.05, 0, 0, 0, 1);
        }

        fade(desiredFade: number, scalar: number, r:number, g: number, b:number, a:number) {
            this.desiredFade = Math.max(Math.min(desiredFade,1),0);
            this.fadeScalar = scalar;
            this.fadeColor.setRGB(r, g, b, a);
        }

        private _rebuild() {
            this.setWorldToLevel();
            this.rebuildWorld();
        }


        reset() {
        }

        switchLevel(level: number) {
            if (level == this.currentLevel) {
                return;
            }
            if (level > 0 && level <= this.totalLevels) {
                this._currentLevel = level - 1;
                this.rebuild();
                return;
            }
            alert("Cannot Switch to level: " + level);
        }

        // This sets the world's properties to the current level's
        setWorldToLevel() {
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

        }

        rebuildWorld() {
            this.world.nextlevel();
        }

        getCurrentLevel(): Level {
            return this.levels[this._currentLevel];
        }

        changeState(game: Game, state: GameState) {
        }

        get currentLevel() { return this._currentLevel + 1; }

        static instance(): SPlay {
            if(SPlay._instance) return SPlay._instance;
            SPlay._instance = new SPlay();
            return SPlay._instance;
        }
    }

    export class SMenu extends GameState {
        game: Game;
        hud: HUD;
        cacheCanvas: HTMLCanvasElement;

        private static _instance: GameState;
        constructor () {
            super();
            this.cacheCanvas = <HTMLCanvasElement>document.createElement("canvas");
        }

        init(game: Game) {
            this.game = game;
            this.hud = game.hud;
            this.cacheCanvas.width = game.width;
            this.cacheCanvas.height = game.height;
            var ctx = this.cacheCanvas.getContext("2d");
            ctx.drawImage(game.canvas, 0, 0);
        }

        exit() {
        }
        
        handleEvents(game: Game) {
            if (Keyboard.justPressed(Keys.ESC) || Keyboard.justPressed(Keys.TAB)) {
                game.popState();
            }
        }

        update(delta: number, game: Game) {
        }

        render(ctx: CanvasRenderingContext2D, game: Game) {
            ctx.clearRect(0, 0, game.width, game.height);
            ctx.drawImage(this.cacheCanvas, 0, 0);
            this.hud.drawMenu(ctx);
        }

        pause() {
        }

        resume() {
        }

        changeState(game: Game, state: GameState) {
        }

        static instance(): GameState {
            if(SMenu._instance) return SMenu._instance;
            SMenu._instance = new SMenu();
            return SMenu._instance;
        }
    }

    export class SLoading extends GameState {
        game: Game;
        hud: HUD;
        assetsCreated: bool = false;

        private static _instance: GameState;

        constructor () {
            super();
        }

        init(game: Game) {
            this.game = game;
            this.hud = game.hud;
        }

        exit() {
        }
        
        handleEvents(game: Game) {
            //if (Keyboard.justPressed(Keys.Y)) {
            //    game.restart();
            //}
        }

        update(delta: number, game: Game) {
            if (!this.assetsCreated) {
                game.loadAssets();
                this.assetsCreated = true;
            }
        }

        render(ctx: CanvasRenderingContext2D, game: Game) {
            ctx.clearRect(0, 0, game.width, game.height);
            this.hud.drawBasic(ctx, "Welcome to Vacuum Seal.\nLoading... " + game.assets.percentDone +"%");
        }

        pause() {
        }

        resume() {
        }

        changeState(game: Game, state: GameState) {
        }

        static instance(): GameState {
            if(SLoading._instance) return SLoading._instance;
            SLoading._instance = new SLoading();
            return SLoading._instance;
        }
    }

    export class SGameOver extends GameState {
        game: Game;
        hud: HUD;
        cacheCanvas: HTMLCanvasElement;

        private static _instance: GameState;

        constructor () {
            super();
            this.cacheCanvas = <HTMLCanvasElement>document.createElement("canvas");
        }

        init(game: Game) {
            this.game = game;
            this.hud = game.hud;
            this.cacheCanvas.width = game.width;
            this.cacheCanvas.height = game.height;
            var ctx = this.cacheCanvas.getContext("2d");
            ctx.drawImage(game.canvas, 0, 0);

        }

        exit() {
        }
        
        handleEvents(game: Game) {
            if (Keyboard.justPressed(Keys.Y)) {
                game.restart();
            }
        }

        update(delta: number, game: Game) {
        }

        render(ctx: CanvasRenderingContext2D, game: Game) {
            ctx.clearRect(0, 0, game.width, game.height);
            ctx.drawImage(this.cacheCanvas, 0, 0);
            this.hud.drawBasic(ctx, "Unfortunatly you have been lost to the dark void of space.\nWould you like to be reborn? Y / N");
        }

        pause() {
        }

        resume() {
        }

        changeState(game: Game, state: GameState) {
        }

        static instance(): GameState {
            if(SGameOver._instance) return SGameOver._instance;
            SGameOver._instance = new SGameOver();
            return SGameOver._instance;
        }
    }
}