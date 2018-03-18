module vs {
    export class HUDMessage {
        text: string;
        timer: number;

        constructor (text:string, timer: number) {
            this.text = text;
            this.timer = timer;
        }
    
    }
    export class HUD {
        static itemClicked: bool = false;
        game: Game;

        topAlert: string = "";
        bottomAlert: string = "";
        weaponMessage: string = "";
        itemMessage: string = "";

        ColorTopAlert: Color;
        ColorBottomAlert: Color;


        messageQueue: LinkedList;

        alertTimer: number = 0;
        alertNext: number = 1;

        menu: HUDElement;

        constructor (game:Game) {
            this.game = game;
        }

        init() {
            var game = this.game;
            this.messageQueue = new LinkedList();

            var menuWidth = 740;
            var menuHeight = 500;
            var menuX = (Game.game.width * 0.5) - (menuWidth * 0.5);
            var menuY = (Game.game.height * 0.5) - (menuHeight * 0.5);
            this.menu = new menu.Menu(menuX, menuY, menuWidth, menuHeight, game);

            this.game = game;

            this.ColorTopAlert = new Color(0, 190, 210, 1);
            this.ColorBottomAlert = new Color(0, 230, 240, 1);
        }

        alert(message: string) {
            this.topAlert = message;
        }

        clear() {
            this.messageQueue.clear();
            this.bottomAlert = "";
            this.alertTimer = 0;
            this.alertNext = 0;
        }


        // TODO: implement timed alert system
        queueMessage(message: string, time: number, now:bool = false) {
            if (!now) {
                this.messageQueue.add(new HUDMessage(message, time));
            } else {
                // this.messageQueue.prepend(new HUDMessage(message, time));
                this.alertTimer = 0;
                this.alertNext = time;
                this.bottomAlert = message;
            }
        }

        alertItem(message: string) {
            this.itemMessage = message;
        }

        update(delta: number) {
            if (this.alertTimer >= this.alertNext) {
                if (this.messageQueue.size() > 0) {
                    var message: HUDMessage = this.messageQueue.popHead();
                    this.alertNext = message.timer;
                    this.bottomAlert = message.text;
                    // console.log("Switching message to : " + message.text + " for " + message.timer + " seconds.");
                    this.alertTimer = 0;
                } else {
                    this.bottomAlert = "";
                }
            }

            this.alertTimer += delta;
        }

        render(ctx: CanvasRenderingContext2D, paused:bool) {
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.font = " 14px Audiowide";
            ctx.textBaseline = "top";

            if (!paused) {
                this.drawHealth(ctx);
                ctx.fillStyle = "white";
                this.drawText(ctx, this.weaponMessage, 6, 6, 20);
                //ctx.fillText(this.bottomAlert, 256, 64);

                

            } else {
                ctx.font = " 20px Audiowide";
                var y = Game.game.canvas.height * 0.5;
                var x = Game.game.canvas.width * 0.5;
                this.drawText(ctx, "Paused", x - 30, y, 20);
            }
            // this.drawMenu(ctx);
        }

        drawIngame(ctx: CanvasRenderingContext2D) {

            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.font = " 14px Audiowide";
            ctx.textBaseline = "top";

            this.drawHealth(ctx);
            ctx.fillStyle = "rgba(200,220,220,1)";
            this.drawText(ctx, this.weaponMessage, 6, 6, 20);

            var h = this.game.height;
            var d = this.getDimensions(ctx, this.bottomAlert, 14);
            var pad = 50;
            ctx.font = "14px Audiowide";
            ctx.fillStyle = this.ColorBottomAlert.toString();
            this.drawText(ctx, this.bottomAlert, 0, h - d.y - pad, 16, true);
            ctx.font = "16px Audiowide";
            ctx.fillStyle = this.ColorTopAlert.toString();
            this.drawText(ctx, this.topAlert, 0, 100, 14, true);
            this.topAlert = "";

            // this.drawTesting(ctx);
        }

        reinit() {
            this.weaponMessage = "";
            this.bottomAlert = "";
            this.topAlert = "";
        }

        drawBasic(ctx: CanvasRenderingContext2D, message:string) {
            ctx.fillStyle = ctx.fillStyle = "rgba(0,230,240,1)";
            ctx.font = " 16px Audiowide";
            var h = this.game.height;
            var d = this.getDimensions(ctx, message, 16);
            var y = (h * 0.5) - (d.y * 0.5);
            this.drawText(ctx, message, 0, y, 16, true);
        }

        drawIngamePaused(ctx: CanvasRenderingContext2D) {
        }

        getDimensions(ctx: CanvasRenderingContext2D, text: string, lineHeight: number): Point {
            var sections = text.split('\n');
            var m: TextMetrics;
            var w: number = 0;
            var h: number = 0;
            for (var i = 0; i < sections.length; i++) {
                m = ctx.measureText(sections[i]);
                w = Math.max(w, m.width);
                h += lineHeight;
            }
            return new Point(w, h);
        }

        // Add drawing code here to test things out
        drawTesting(ctx:CanvasRenderingContext2D) {
            var player = this.game.player;
            var l = 300;
            var pVec = player.directionVector;
            var p = player.positionLocal;
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            this.drawLineFromPosAndDir(ctx, p, pVec, l);
            ctx.stroke();
            //ctx.strokeStyle = "blue";
            //pVec = player.fovMaxVec;
            //this.drawLineFromPosAndDir(ctx, p, pVec, l);
            //ctx.stroke();
            //ctx.strokeStyle = "green";
            //pVec = player.fovMinVec;
            //this.drawLineFromPosAndDir(ctx, p, pVec, l);
            //ctx.stroke();
            ctx.strokeStyle = "orange";

            pVec = new Vec2(Mouse.x - p.x, Mouse.y - p.y);
            this.drawLineFromPosAndDir(ctx, p, pVec, l);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + pVec.x, p.y + pVec.y);
            ctx.closePath();
            ctx.stroke();
            var mouseRot = pVec.angleDeg() - player.rotationOffset;
            // this.drawText(ctx, "MouseRot " + mouseRot.toFixed(0) + " Rotation " + player.rotation.toFixed(0) + " MinFov " + (player.rotation + player.fovMin).toFixed(0) + " MaxFov " + (player.rotation + player.fovMax).toFixed(0), 30,60, 16, false);

            ctx.restore();
        }

        drawLineFromPosAndDir(ctx: CanvasRenderingContext2D, pos: Point, dir: Vec2, length:number) {
            var dirV = dir.clone();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            dirV.scale(length);
            ctx.lineTo(pos.x + dirV.x, pos.y + dirV.y);
            ctx.closePath();
        }

        drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, lineHeight: number, centerX?: bool = false) {
            var sections = text.split('\n');
            if (centerX) {
                var d = this.getDimensions(ctx, text, lineHeight);
                x = (this.game.width * 0.5) - (d.x * 0.5);
            }
            for (var i = 0; i < sections.length; i++) {
                ctx.fillText(sections[i], x, y);
                y += lineHeight;
            }
        }

        drawHealth(ctx:CanvasRenderingContext2D) {
            var width = 100;
            var margin = 6;
            var height = 16;
            var pos = new Point(Game.game.canvas.width - (width + margin), margin);
            
            var healthWidth = Game.game.player.hp * (width / 100);
            ctx.strokeStyle = "white";
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.fillRect(pos.x, pos.y, healthWidth, height);
            ctx.rect(pos.x, pos.y, width, height);
            ctx.stroke();
        }

        pauseScreen() {
            
        }

        drawMenu(ctx:CanvasRenderingContext2D) {
            this.menu.checkMouse(Mouse.x, Mouse.y);
            this.menu.render(ctx);
        }

        static drawWrapText(ctx:CanvasRenderingContext2D, text:string, x:number, y:number, maxWidth:number, lineHeight: number) : number {
            var sections = text.split('\n');
            var line = "";
            for (var s = 0; s < sections.length; s++) {
                var words = sections[s].split(" ");
                line = "";

                for (var i = 0; i < words.length; i++) {
                    var testLine = line + words[i] + " ";
                    var metrics = ctx.measureText(testLine);
                    var testWidth = metrics.width;
                    if (testWidth > maxWidth) {
                        ctx.fillText(line, x, y);
                        line = words[i] + " ";
                        y += lineHeight;
                    }
                    else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, x, y);
                y += lineHeight;
            }

            return y;
        }
    }

    // Just defines an object that can be added to a HUDElement
    export interface HUDObject {
    }

    // A simple Sprite designed for use in the HUD. Doesn't feature all the fancy features the regular sprite has.
    export class HUDSprite implements HUDObject {
        private _game: Game;
        private _x: number;
        private _y: number;
        private _image: HTMLImageElement;
        private _frame: number;
        private _frameX: number;
        private _frameY: number;
        private _frameWidth: number;
        private _frameHeight: number;

        constructor (imageName: string, frame?: number, frameWidth?: number, frameHeight?: number) {
            this._x = 0;
            this._y = 0;
            this._image = <HTMLImageElement>Game.game.assets.images[imageName];

            this._frameWidth = frameWidth || this._image.width;
            this._frameHeight = frameHeight || this._image.height;
            this.frame = frame || 0;
        }

        render(ctx: CanvasRenderingContext2D) {
            ctx.drawImage(this._image, this._frameX, this._frameY, this._frameWidth, this._frameHeight, this._x, this._y, this._frameWidth, this._frameHeight);
        }

        set frame(frame: number) {
            this._frame = frame;
            this._frameX = (frame * this._frameWidth) % this._image.width;
            this._frameY = Math.floor((this._frame * this._frameHeight) / this._image.width);
        }

        get x() { return this._x; }
        set x(x: number) { this._x = x; }
        get y() { return this._y; }
        set y(y: number) { this._y = y; }
    }

    export class HUDElement implements HUDObject {
        private _x: number;
        private _y: number;
        private _width: number;
        private _height: number;
        name: string = "";
        alpha: number = 1;
        // bgAlpha: number = 1;

        sprites: HUDSprite[] = [];


        _bounds: Rect;

        cacheCanvas: HTMLCanvasElement;
        parent: HUDElement;

        borderWidth: number = 4;
        margin: number = 4;

        backgroundColor: string = "";
        borderColor: string = "";
        textColor: string = "";
        
        backgroundColorActive: string = "black";
        backgroundColorInactive: string = "black";
        borderColorActive: string = "white";
        borderColorInactive: string = "white";
        textColorActive: string = "white";
        textColorInactive: string = "white";

        font: string = "Arial";
        textSize: number = 14;
        lineHeight: number = 20;

        _text: string = "";
        _textDrawHeight: number = 0;
        textAutoEnlarge: bool = false;
        textAutoWrap: bool = true;

        drawBackground: bool = true;
        drawSprite: bool = false;
        drawBorder: bool = true;
        drawText: bool = true;
        draggable: bool = false;
        clickable: bool = false;
        justClicked: bool = false;
        centerText: bool = false;

        children: HUDElement[];

        childrenOnLastUpdate: number = 0;

        _active: bool = false;
        _activeLast: bool = true;
        _cacheDrawn: bool = false;

        _followMouse: bool = false;
        _childFollowing: bool = false;
        _childChanged: bool = false;

        _mouseClickPoint: Point;
        _oldPos: Point;

        constructor (x:number, y:number, width:number, height:number) {
            this.x = x;
            this.y = y;
            
            this.children = [];

            this._bounds = new Rect(0, 0, width, height);
            this._mouseClickPoint = new Point(0, 0);
            this._oldPos = new Point(0, 0);

            this.updateColors();

            this.cacheCanvas = <HTMLCanvasElement>document.createElement("canvas");
            this.width = width;
            this.height = height;

            this.drawCache();
        }

        add(obj: HUDObject) {
            if (obj instanceof HUDElement) {
                var element = <HUDElement>obj;
                element.parent = this;
                this.children.push(element);
            } else if (obj instanceof HUDSprite) {
                var sprite = <HUDSprite>obj;
                this.sprites.push(sprite);
            }
        }

        remove(obj: HUDObject) {
            if (obj instanceof HUDElement) {
                var element = <HUDElement>obj;
                this.children.splice(this.children.indexOf(element), 1);
            } else if (obj instanceof HUDSprite) {
                var sprite = <HUDSprite>obj;
                this.sprites.splice(this.sprites.indexOf(sprite), 1);
            }
        }

        render(ctx: CanvasRenderingContext2D) {
            //if (this.parent == undefined && (this._active !== this._activeLast || this._followMouse || !this._cacheDrawn)) {
            //    this.drawCache();
            //}
            //else if(this.parent) {
            //    this.drawCache();
            //}

            this.drawCache();

            //if (this._active !== this._activeLast && this.parent == undefined && !this._followMouse && !this._cacheDrawn) {
            //    return;
            //}

            //this.drawCache();

            if (this._followMouse) this.updatePos();
            if (this.alpha < 1) ctx.globalAlpha = this.alpha;
            ctx.drawImage(this.cacheCanvas, 0, 0, this.width, this.height, this.localX, this.localY, this.width, this.height);
            if (this.alpha < 1) ctx.globalAlpha = 1;
        }

        drawCache() {
            if (this._childChanged) this._childChanged = false;
            var ctx = this.cacheCanvas.getContext("2d");
            this.draw(ctx);
            this._cacheDrawn = true;
        }

        // Insert your custom drawing code here
        drawCustom(ctx: CanvasRenderingContext2D) {
        }

        drawLast(ctx: CanvasRenderingContext2D) {
        }

        private draw(ctx:CanvasRenderingContext2D) {
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.fillStyle = this.backgroundColor;
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderWidth;
            ctx.beginPath();
            ctx.rect(0, 0, this.width, this.height);

            if (this.drawBackground) {
                ctx.fill();
            }

            if (this.drawSprite) {
                this.sprites.forEach((sprite: HUDSprite) =>{
                    sprite.render(ctx);
                });
            }

            if (this.drawText) {
                ctx.font = this.textSize + "px " + this.font;
                ctx.textBaseline = "top";
                ctx.fillStyle = this.textColor;
                // ctx.fillText(this._text, this.margin, this.margin - 1);

                if (this.textAutoWrap) {
                    this._textDrawHeight = HUD.drawWrapText(ctx, this._text, this.margin, this.margin - 1, this.width - this.margin, this.lineHeight);
                    if (this._textDrawHeight > this.height && this.textAutoEnlarge) {
                        this.height = this._textDrawHeight + this.margin * 2;
                    }
                } else {
                    var pos = new Point(this.margin, this.margin - 1);

                    if (this.centerText) {
                        var m = ctx.measureText(this._text);
                        pos.x = (this.width * 0.5) - (m.width * 0.5);
                    }

                    ctx.fillText(this._text, pos.x, pos.y, this.width - (this.margin + this.margin));
                }
            }

            this.drawCustom(ctx);

            // draw the children
            this.children.forEach((child: HUDElement) =>{
                child.render(ctx);
            });

            if (this.drawBorder) {
                ctx.stroke();
            }

            this.childrenOnLastUpdate = this.children.length;

            if (this.parent) this.parent._childChanged = true;

            ctx.closePath();

            this.drawLast(ctx);
        }

        checkMouse(mX:number, mY:number):bool {
            this._activeLast = this._active;
            if (this.hitTest(mX, mY)) {
                this._active = true;
            }
            else this._active = false;

            var childActive = false;

            this.children.forEach((child: HUDElement) =>{
                if (child.checkMouse(mX, mY)) childActive = true;
            });

            if (this.draggable) {
                var click = Mouse.down();
                if (click && this._active && !childActive) {
                    this.onDrag();
                }
                if (!click) this.offClick();
            }

            if (this.clickable) {
                if (Mouse.down() && !this.justClicked && this._active) {
                    // console.log("Click on " + this._text);
                    this.justClicked = true;
                    this.onClick();
                }
                if (!Mouse.down()) {
                    this.justClicked = false;
                    this.offClick();
                }
            }

            if(!this._followMouse)
                this.updateColors();

            if (this._active) return true;
            return false;
        }

        hitTest(x: number, y: number):bool {
            if (this.parent) {
                if (this.parent.hitTest(x, y)) {
                    if (this.bounds.contains(x, y)) {
                        return true;
                    }
                }
            }
            else {
                if (this.bounds.contains(x, y)) {
                    return true;
                }
            }
            return false;
        }

        // Meant to be overriden
        onClick() {
        }

        onDrag() {
            if (!HUD.itemClicked) {
                if (!this._followMouse) {
                    this._mouseClickPoint = new Point(Mouse.x, Mouse.y);
                    this._oldPos = new Point(this._x, this._y);
                    HUD.itemClicked = true;
                    this._followMouse = true;
                }
            }
        }

        offClick() {
            if (HUD.itemClicked) {
                HUD.itemClicked = false;
            }
            this._followMouse = false;
        }

        updatePos() {
             this._x = this._oldPos.x + (Mouse.x - this._mouseClickPoint.x);
             this._y = this._oldPos.y + (Mouse.y - this._mouseClickPoint.y);

             // Game.game.hud.alert("X:" + this.x + " Y:" + this.y, 0.001);
        }

        updateColors() {
            if (this._active) {
                this.textColor = this.textColorActive;
                this.backgroundColor = this.backgroundColorActive;
                this.borderColor = this.borderColorActive;
            }
            else {
                this.textColor = this.textColorInactive;
                this.backgroundColor = this.backgroundColorInactive;
                this.borderColor = this.borderColorInactive;
            }
        }

        get bounds() : Rect {
            this._bounds.x = this.x;
            this._bounds.y = this.y;
            this._bounds.width = this.width;
            this._bounds.height = this.height;
            return this._bounds;
        }

        get x() {
            if (this.parent) {
                return this._x + this.parent.x;
            }
            return this._x;
        }
        set x(x: number) {
            this._x = x;
        }

        get y() {
            if (this.parent) {
                return this._y + this.parent.y;
            }
            return this._y;
        }
        set y(y: number) {
            this._y = y;
        }

        get localX() {
            return this._x;
        }
        set localX(x:number) {
            this._x = x;
        }

        get localY() {
            return this._y;
        }
        set localY(y: number) {
            this._y = y;
        }

        get text() {
            return this._text;
        }
        set text(x: string) {
            this._text = x;
        }

        get width() {
            return this._width;
        }
        set width(x: number) {
            this.cacheCanvas.width = x;
            this._width = x;
        }
        get height() {
            return this._height;
        }
        set height(x: number) {
            this.cacheCanvas.height = x;
            this._height = x;
        }

    }

    export class HUDVerticalScrollGrip extends HUDElement {
        min: number = 0;
        max: number = 100;

        constructor (x: number, y: number, width: number, height: number) {
            super(x, y, width, height);

            this.borderColorInactive = this.borderColorActive = "white";
            this.backgroundColorActive = "green";
            this.backgroundColorInactive = "black";
            this.draggable = true;

            this.updateColors();
        }

        updatePos() {
             this.localY = this._oldPos.y + (Mouse.y - this._mouseClickPoint.y);

             if (this.localY < this.min) this.localY = this.min;
             if (this.localY > this.max) this.localY = this.max;
        }

        scroll(increment: number) {
            this.localY += increment;
            if (this.localY < this.min) this.localY = this.min;
            if (this.localY > this.max) this.localY = this.max;
        }
    }

    export class HUDScrollBar extends HUDElement {
        bounds: Rect;
        scrollGrip: HUDVerticalScrollGrip;

        constructor (x:number, y:number, width: number, height:number, gripHeight:number) {
            super(x, y, width, height);

            this.scrollGrip = new HUDVerticalScrollGrip(0, 0, width, gripHeight);
            this.scrollGrip.min = 0;
            this.scrollGrip.max = height - gripHeight;
            this.add(this.scrollGrip);

            this.borderColorInactive = "white";
            this.backgroundColorActive = "blue";
            this.updateColors();
            this.drawCache();

            this.draggable = false;
        }

        scroll(increment: number) {
            this.scrollGrip.scroll(increment);
        }

        get value() {
            return (this.scrollGrip.localY - this.scrollGrip.min) / (this.scrollGrip.max - this.scrollGrip.min);
        }

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);
            // console.log("Scroll Value = " + this.value);
        }
    }

    export class HUDScrollBox extends HUDElement {
        scrollBar: HUDScrollBar;
        content: HUDElement;
        scrollStep: number = 30;

        constructor (x: number, y: number, width: number, height: number, scrollLeft?:bool = false) {
            super(x, y, width, height);


            var sWidth = 16;
            var sX = width - sWidth;
            var cX = 0;

            if (scrollLeft) {
                cX = sWidth;
                sX = 0;
            }

            this.scrollBar = new HUDScrollBar(sX, 0,16, height, 60);
            this.content = new HUDElement(cX, 0, width - this.scrollBar.width, 0);
            this.content.textAutoEnlarge = true;

            this.add(this.scrollBar);
            this.add(this.content);

        }

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);

            var maxY = Math.max((this.content.height - this.height), 0);

            this.content.localY = -( maxY * this.scrollBar.value);

            if (this._active) {
                var wheelDelta = Mouse.mouseWheel();
                if (wheelDelta < 0) {
                    this.scrollBar.scroll(this.scrollStep);
                } 
                if (wheelDelta > 0) {
                    this.scrollBar.scroll(-this.scrollStep);
                }
            }
        }

        get text() {
            return this.content.text;
        }
        set text(x: string) {
            this.content.text = x;
        }
        
    }

    export class HUDButton extends HUDElement {
        callback: { (): void; };
        label: string;
        private _clicked: bool;

        constructor (label: string, x: number, y: number, width: number, height: number) {
            super(x, y, width, height);

            this.label = label;
            this.text = label;
            this.drawText = true;
            this.textAutoWrap = false;
            this.draggable = false;
            this.clickable = true;
            this.textAutoEnlarge = false;
            this.margin = 1;

            this.callback = () => { };

            this.backgroundColorActive = "blue";
        }

        onClick() {
            this._clicked = true;
            this.callback();
        }

        offClick() {
            super.offClick();
            this._clicked = false;
        }

        get clicked() {
            return this._clicked;
        }
    }

    export class HUDMenu extends HUDElement {
        game: Game;
        buttonClicked: bool = false;

        bInventory: HUDButton;
        bWeapons: HUDButton;

        buttonFont: string = "Orbitron";
        buttonTextSize: number = 20;

        header: HUDElement;

        current: HUDElement;
        inventory: HUDInventory;
        weapons: HUDElement;
        
        constructor (x: number, y: number, width: number, height: number, game: Game) {
            super(x, y, width, height);

            this.game = game;

            this.draggable = true;
            
            this.header = new HUDElement(0, 0, width, 40);
            this.header.font = "Orbitron";
            this.header.textSize = 24;
            this.header.drawBorder = false;
            this.header.drawBackground = false;
            this.add(this.header);

            this.drawBorder = false;
            this.drawBackground = false;

            var cX = 0;
            var cY = this.header.height;
            var cW = width;
            var cH = height - (this.header.height + 30);
            this.inventory = new HUDInventory(cX, cY, cW, cH, game);
            this.weapons = new HUDWeapons(cX, cY, cW, cH, game);
            this.switch(this.inventory);

            this.createButtons();
        }

        createButtons() {
            var bWidth =  120;
            var bHeight = 30;
            var bMargin = 4;

            var xPos = 0;
            var yPos = this.height - bHeight;

            this.bInventory = new HUDButton("Inventory", xPos, yPos, bWidth, bHeight);
            this.bInventory.callback = () =>{
                this.switch(this.inventory);
            };
            this.bInventory.font = this.buttonFont;
            this.bInventory.textSize = this.buttonTextSize;
            this.bInventory.margin = bMargin;

            this.bWeapons = new HUDButton("Weapons", xPos + bWidth, yPos, bWidth, bHeight);

            this.bWeapons.callback = () =>{
                this.switch(this.weapons);
            };
            this.bWeapons.font = this.buttonFont;
            this.bWeapons.textSize = this.buttonTextSize;
            this.bWeapons.margin = bMargin;

            this.add(this.bInventory);
            this.add(this.bWeapons);
        }

        switch(element: HUDElement) {
            if(this.current !== undefined)
                this.remove(this.current);
            this.current = element;
            this.add(this.current);
            this.header.text = element.name;
        }
    }

    export class HUDItemList extends HUDElement {
        game: Game;
        scrollbox: HUDScrollBox;
        sideBox: HUDElement;

        labels: string[] = [];
        buttons: HUDButton[] = [];

        buttonLabel: string = "button";

        constructor (x: number, y: number, width: number, height: number, game: Game, scrollLeft: bool) {
            super(x, y, width, height);

            this.game = game;

            this.scrollbox = new HUDScrollBox(0, 0, 300, height, scrollLeft);
            this.add(this.scrollbox);

            this.sideBox = new HUDElement(300, 0, width - 300, height);
            this.sideBox.drawBorder = false;
            this.add(this.sideBox);

            // this.createButtons();
        }

        createButtons(game: Game) {
            var numButtons = 30;
            var bWidth = this.scrollbox.content.width;
            var bHeight = 30;
            var borderWidth = 1;
            var font = "Orbitron";
            var textSize = 20;
            var margin = 4;

            var button: HUDButton;
            var label: string;

            this.scrollbox.content.height = numButtons * bHeight;

            for (var i = 0; i < numButtons; i++) {
                label = this.buttonLabel + " " + i;

                button = new HUDButton(label, 0, bHeight * i, bWidth, bHeight);
                button.borderWidth = borderWidth;
                button.font = font;
                button.textSize = textSize;
                button.margin = margin;
                this.scrollbox.content.add(button);

                this.labels.push(label);
                this.buttons.push(button);
            }
        }

        rebuild() {
            this.buttons.forEach((button: HUDButton) =>{
                this.scrollbox.content.remove(button);
            });
            this.buttons = [];

            this.createButtons(this.game);
            this.game.itemManager.changed = false;
        }

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);

            this.checkButtons();
        }

        checkButtons() {
            if (this.game.itemManager.changed) {
                this.rebuild();
            }

            // console.log("Checking Buttons");
            var size = this.buttons.length;
            var button: HUDButton;
            for (var i = 0; i < size; i++) {
                button = this.buttons[i];
                if (button.clicked) {
                    this.buttonClicked(button, i);
                }
            }
        }

        buttonClicked(button: HUDButton, index: number) {
            this.sideBox.text = button.label;
        }
    }

    export class HUDInventoryButton extends HUDButton {
        private _name: String;
        private _size: number;
        private _wg: number;
        private _val: number;

        private _nameBox: HUDElement;
        private _wgBox: HUDElement;
        private _valBox: HUDElement;

        private _attributes: HUDElement[];
        private _drawLabels: bool;

        constructor (x: number, y: number, width: number, height: number, font: string, textSize: number, margin: number, name: string, size: number, wg: number, val: number, drawLabels?: bool = false) {
            super("", x, y, width, height);
            this._name = name;
            this._size = size;
            this._wg = wg;
            this._val = val;

            this.font = font;
            this.textSize = textSize;
            this.margin = margin;
            this.drawBorder = false;

            this._drawLabels = drawLabels;
            if (drawLabels) {
                this.drawBackground = false;
            }
            
            var aX = Math.floor(width * 0.56);
            var aY = 4;
            var aWidth = Math.floor((width - aX) / 2);
            var aHeight = height - 4;

            console.log("Width: " + width + " Height: " + height + " aX: " + aX + " aWidth: " + aWidth);

            this._nameBox = new HUDElement(0, 0, aX, aHeight);
            this._wgBox = new HUDElement(aX, 0, aWidth, aHeight);
            this._valBox = new HUDElement(aX + aWidth, 0, aWidth, aHeight);

            this.add(this._nameBox);
            this.add(this._wgBox);
            this.add(this._valBox);

            this.children.forEach((e: HUDElement) =>{
                e.font = this.font;
                e.textSize = this.textSize;
                e.margin = this.margin;
                e.drawBorder = false;
                e.drawBackground = false;
                e.textAutoEnlarge = false;
                e.textAutoWrap = false;
            });

            this.size = size;
            this.itemName = name;
            this.wg = wg;
            this.val = val;
        }

        get itemName() { return this._name; }
        set itemName(n: string) { 
            this._name = n;
            if (this._drawLabels) {
                this._nameBox.text = "Name";
            }
            else {
                this._nameBox.text = n + " (" + this.size + ")";
            }
        }
        get size() { return this._size; }
        set size(v: number) { 
            this._size = v; 
        }
        get wg() { return this._wg; }
        set wg(n: number) { 
            this._wg = n; 
            if (this._drawLabels) {
                this._wgBox.text = "WG";
            }
            else {
                this._wgBox.text = " " + n;
            }
        }
        get val() { return this._val; }
        set val(n: number) { 
            this._val = n; 
            if (this._drawLabels) {
                this._valBox.text = "VAL";
            }
            else {
                this._valBox.text = " " + n;
            }
        }
        
    }

    export class HUDInventory extends HUDItemList {
        headerBox: HUDElement;
        headerBox2: HUDElement;
        scrollboxHeader: HUDInventoryButton;
        descriptionBox: HUDElement;
        imageBox: HUDElement;
        sprite: HUDSprite;
        currentItem: ItemContainer;

        constructor (x: number, y: number, width: number, height: number, game: Game) {
            super(x, y, width, height, game, true);
            this.name = "Inventory";
            this.font = "Orbitron";

            this.backgroundColorActive = this.backgroundColorInactive = Util.rgba(0, 0, 0, 0.7);



            //this.scrollbox.drawBackground = false;
            //this.scrollbox.drawBorder = false;
            this.scrollbox.content.drawBackground = false;
            this.scrollbox.content.drawBorder = false;
            this.scrollbox.scrollBar.drawBorder = false;
            this.scrollbox.localY = 24;
            this.scrollbox.height = height - 24;
            this.scrollbox.scrollBar.drawBackground = false;
            this.scrollbox.scrollBar.scrollGrip.backgroundColorActive = Util.rgba(28, 47, 73, 0.9);
            this.scrollbox.scrollBar.scrollGrip.backgroundColorInactive = Util.rgba(0, 0, 0, 0);

            this.scrollboxHeader = new HUDInventoryButton(this.scrollbox.content.localX, 0, this.scrollbox.content.width, 24, this.font, 12, 4, "", 0, 0, 0, true);
            this.add(this.scrollboxHeader);

            this.sideBox.drawBackground = false;

            this.headerBox = new HUDElement(0, 0, this.sideBox.width, 28);
            //this.headerBox.drawBackground = false;
            //this.headerBox.drawBorder = false;
            //this.headerBox.font = this.font;
            this.headerBox.textAutoWrap = false;
            this.headerBox.textSize = 20;
            this.headerBox.margin = 4;
            this.sideBox.add(this.headerBox);

            this.headerBox2 = new HUDElement(0, this.headerBox.height, this.sideBox.width, 20);
            //this.headerBox2.drawBackground = false;
            //this.headerBox2.drawBorder = false;
            //this.headerBox2.font = this.font;
            this.headerBox2.textAutoWrap = false;
            this.headerBox2.textSize = 10;
            this.headerBox2.lineHeight = 12;
            this.headerBox2.margin = 4;
            this.sideBox.add(this.headerBox2);

            this.imageBox = new HUDElement(10, this.headerBox.height + this.headerBox2.height + 10, this.sideBox.width - 20, 64);
            //this.imageBox.drawBackground = false;
            //this.imageBox.drawBorder = false;
            this.imageBox.drawSprite = true;
            this.sideBox.add(this.imageBox);

            this.descriptionBox = new HUDElement(0, this.imageBox.localY + this.imageBox.height, this.sideBox.width, this.sideBox.height - (this.imageBox.localY + this.imageBox.height));
            //this.descriptionBox.drawBackground = false;
            //this.descriptionBox.drawBorder = false;
            //this.descriptionBox.font = this.font;
            this.descriptionBox.textSize = 14;
            this.descriptionBox.lineHeight = 16;
            this.sideBox.add(this.descriptionBox);


            this.children.forEach((child: HUDElement) =>{
                child.drawBackground = false;
                child.drawBorder = false;
                child.font = this.font;
            });

            this.sideBox.children.forEach((child: HUDElement) =>{
                child.drawBackground = false;
                child.drawBorder = false;
                child.font = this.font;
                
            });

            this.createButtons(game);
        }

        createButtons(game: Game) {
            var containers = game.itemManager.containers;

            var numButtons = containers.length;
            var bWidth = this.scrollbox.content.width;
            var bHeight = 24;
            var borderWidth = 1;
            var font = "Orbitron";
            var textSize = 12;
            var margin = 4;

            var colorActive = Util.rgba(28, 47, 73, 0.9);
            var colorInactive = Util.rgba(0, 0, 0, 0);

            var button: HUDInventoryButton;
            var label: string;
            var container: ItemContainer;

            this.scrollbox.content.height = this.scrollbox.height * 2;


            for (var i = 0; i < numButtons; i++) {
                container = containers[i];
                label = container.name + " x " + container.size + "    WG " + container.totalWeight + " VAL " + container.totalValue;
                button = new HUDInventoryButton(0, bHeight * i, bWidth, bHeight, font, textSize, margin, container.name, container.size, container.totalWeight, container.totalValue);
                button.backgroundColorActive = colorActive;
                button.backgroundColorInactive = colorInactive;
                this.scrollbox.content.add(button);
                this.labels.push(label);
                this.buttons.push(button);
            }
        }

        buttonClicked(button: HUDButton, index: number) {
            var containers = this.game.itemManager.containers;
            var c = containers[index];
            this.currentItem = c;
            this.headerBox.text = c.name;
            this.headerBox2.text = "    QTY  " + c.size + "   WG  " + c.totalWeight + "   VAL  " + c.totalValue;
            this.descriptionBox.text = "LEVEL   " +c.level + "\nVAL   " + c.value + "\nWG   " + c.weight + "\n\n    " + c.description;

            if (this.sprite) {
                this.imageBox.remove(this.sprite);
            }

            this.sprite = c.sprite;

            if (this.sprite) {
                this.imageBox.add(this.sprite);
            }
        }

        clearSideBox() {
            this.currentItem = null;
            this.headerBox.text = "";
            this.headerBox2.text = "";
            this.descriptionBox.text = "";
            if (this.sprite) {
                this.imageBox.remove(this.sprite);
            }
            this.sprite = null;
        }

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);

            this.checkKeys();
        }

        checkKeys() {
            if (this.currentItem) {
                if (Keyboard.justPressed(Keys.R)) {
                        this.currentItem.pop(this.game);
                }
                if (Keyboard.justPressed(Keys.E)) {
                        this.currentItem.use(this.game);
                }
                if (this.currentItem.size < 1) this.clearSideBox();
            }
        }
    }

    export class HUDWeapons extends HUDItemList {
        constructor (x: number, y: number, width: number, height: number, game: Game) {
            super(x, y, width, height, game, false);
            this.name = "Weapons";

            this.buttonLabel = "Weapon";
            this.createButtons(game);
        }
    }
}