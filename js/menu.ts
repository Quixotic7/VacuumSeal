module menu {
    export class Menu extends vs.HUDElement {
        static font: string = "Orbitron";
        static cBackground: string = "rgba(0,0,0,0.5)";
        static cBorderMain: string = "rgba(201, 199, 255, 1)";
        static cBorderButton: string = "rgba(40, 40, 50, 1)";
        static cBorderStatbar: string = "rgba(63, 68, 63, 1)";
        // static cButtSel: string = "rgba(214, 171, 78, 1)";
        static cButtSel: string = "white";
        static cButtActive: string = "rgba(193, 222, 0, 1)";
        static cButtInactive: string = "rgba(113, 122, 113, 1)";
        static cTitle: string = "rgba(167, 165, 255, 1)";
        // static cTitle: string = "rgba(0, 0, 0, 1)";
        static cTitleGlow: string = "rgba(245, 245, 245, 1)";
        static cStatbarTitle: string = "rgba(245, 245, 245, 1)";
        static cStatbarVal: string = "rgba(57, 208, 169, 1)";
        static cListHeader: string = "rgba(113, 122, 113, 1)";
        static cListName: string = "rgba(245, 245, 245, 1)";
        static cListQTY: string = "rgba(214, 171, 78, 1)";
        static cListVal: string = "rgba(57, 208, 169, 1)";
        static cInfoHeader: string = "rgba(181, 180, 236, 1)";
        static cInfoName: string = "rgba(245, 245, 245, 1)";
        static cInfoVal: string = "rgba(57, 208, 169, 1)";
        static cInfoText: string = "rgba(202, 201, 247, 1)";

        game: vs.Game;
        itemManager: vs.ItemManager;

        // Buttons
        bStats: Button;
        bItems: Button;
        bWeapons: Button;
        

        // Pages
        current: vs.HUDElement;
        stats: Stats;
        // items: vs.HUDInventory;
        items: ItemList;
        weapons: ItemList;

        // Properties
        _ready: bool = false;

        _buttons: Button[];
        _bTextSize:number = 20;
        _buttonsPos: vs.Point;
        _buttonsWidth: number;
        _buttonsMargin: number;
        _buttonsHeight: number;

        _bSelected: Button;

        _title: string = "Vacuum Seal";
        _titleTextSize: number;
        _titlePos: vs.Point;

        _headerY: number = 40;

        _borderMainWidth: number = 5;
        _borderMainCornerOffset: number = 20;
        _borderMin: vs.Point;
        _borderMax: vs.Point;


        _statbarPos: vs.Point;
        _statbarWidth: number;
        _statbarHeight: number;
        _statbarMargin: number;
        _statbarTextSize: number;

        _borderStatbarWidth: number = 4;
        _borderStatbarMargin: number = 6;
        _borderStatbarPos: vs.Point;
        _borderStatbarLength: number;

        constructor (x: number, y: number, width: number, height: number, game: vs.Game) {
            super(x, y, width, height);
            this.game = game;
            this.itemManager = game.itemManager;
            this.init();
            this.switchTo("Items");
        }

        init() {
            


            this.drawBackground = false;
            this.drawText = false;
            this.drawBorder = false;
            this.drawSprite = false;

            this.draggable = true;

            this.textAutoEnlarge = false;
            this.textAutoWrap = false;

            this._titlePos = new vs.Point(4, 8);
            this._titleTextSize = 18;

            this._borderStatbarPos = new vs.Point(this._borderStatbarMargin, this._headerY - this._borderStatbarMargin - this._borderStatbarWidth);
            this._borderStatbarLength = this.width - this._borderStatbarMargin * 2 - this._borderMainCornerOffset;

            this._borderMin = new vs.Point(0, this._headerY);
            this._borderMax = new vs.Point(this.width, this.height);
            this._ready = true;

            this._statbarPos = new vs.Point(150, 8);
            this._statbarHeight = this._borderStatbarPos.y - this._statbarPos.y;
            this._statbarWidth = this.width - this._statbarPos.x - this._borderMainCornerOffset - this._borderStatbarMargin;
            this._statbarMargin = 4;
            this._statbarTextSize = this._statbarHeight - this._statbarMargin * 2;

            this.createButtons();


            var pos = new vs.Point(2, this._buttonsPos.y + this._buttonsHeight);
            // this.items = new vs.HUDInventory(pos.x, pos.y, this.width - 2, this.height - pos.y - this._borderMainCornerOffset, this.game);


            this.items = new ItemList(pos.x, pos.y, this.width - 2, this.height - pos.y, this.game, ItemListType.ITEMS);
            this.weapons = new ItemList(pos.x, pos.y, this.width - 2, this.height - pos.y, this.game, ItemListType.WEAPONS);
        }

        createButtons() {
            this._buttons = [];
            this._bTextSize = 16;
            this._buttonsPos = new vs.Point(2, this._headerY + 4);
            this._buttonsMargin = 6;
            this._buttonsWidth = this.width - this._borderMainCornerOffset - 4;
            this._buttonsHeight = this._bTextSize + this._buttonsMargin * 2;
            
            var pos = this._buttonsPos.clone();
            
            
            var height = this._buttonsHeight;

            var butts: string[] = ["Stats", "Items", "Weapons", "Help"];
            var numButts = butts.length;

            var width = Math.floor(this._buttonsWidth / numButts);

            for (var i = 0; i < numButts; i++) {
                console.log("Creating Butt: " + butts[i] + " at " + pos.x, +" " + pos.y + " width: " + width + " height: " + height);
                var butt = new Button(butts[i], pos.x, pos.y, width, height);
                butt.textSize = this._bTextSize;
                butt.font = Menu.font;
                this.add(butt);
                this._buttons.push(butt);
                pos.x += width;
            }

            //this.bItems = new Button("Items", pos.x, pos.y, 100, height);
            //this.bItems.textSize = this._bTextSize;
            //this.bItems.font = Menu.font;
            //this.add(this.bItems);
        }

        checkButtons() {
            this._buttons.forEach((button: Button) =>{
                if (button.clicked) {
                    button.selected = true;
                    button.clicked = false;
                    if(this._bSelected) this._bSelected.selected = false;
                    this._bSelected = button;

                    this.switchTo(button.label);

                    // this._title = button.label;
                } 
            });
        }

        switchTo(label: string) {
            switch(label) {
                case "Items":
                    this.switchE(this.items);
                break;
                case "Weapons":
                    this.switchE(this.weapons);
                break;
            }
            
        }

        switchE(element: vs.HUDElement) {
            if(this.current !== undefined)
                this.remove(this.current);
            this.current = element;
            this.add(this.current);
            this.itemManager.changed = true;
            // this.header.text = element.name;
        }

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);
            this.checkButtons();
            
        }

        // erases the overlapping corner and strokes the border for perfection
        drawLast(ctx: CanvasRenderingContext2D) {
            if (this._ready) {
                ctx.save();
                ctx.fillStyle = "black";
                ctx.globalCompositeOperation = "destination-out";
                ctx.beginPath();
                ctx.moveTo(0, this.height - this._borderMainCornerOffset);
                ctx.lineTo(this._borderMainCornerOffset, this.height);
                ctx.lineTo(0, this.height);
                ctx.fill();
                ctx.closePath();
                ctx.restore();
                this.drawBorderMain(ctx);
                ctx.stroke();
            }
        }

        drawCustom(ctx: CanvasRenderingContext2D) {
            if (this._ready) {
                this.drawTitle(ctx);
                this.drawStatbar(ctx);
                this.drawBorderMain(ctx);
                ctx.fill();
            }
        }

        drawTitle(ctx: CanvasRenderingContext2D) {
            ctx.font = this._titleTextSize + "px " + Menu.font;
            ctx.fillStyle = Menu.cTitle;
            ctx.fillText(this._title, this._titlePos.x, this._titlePos.y);
        }

        drawStatbar(ctx: CanvasRenderingContext2D) {
            var pos = this._statbarPos.clone();
            var width = this._statbarWidth;
            var height = this._statbarHeight;
            var margin = this._statbarMargin;

            var im = this.game.itemManager;

            var credits:string = im.credits + "  ";
            var xp: string = im.xp + "  ";
            var wg: string = im.totalWeight + "/" + im.maxWeight + "  ";
            var hp: string = this.game.player.hp + "/" + this.game.player.maxHp + "  ";

            ctx.beginPath();
            ctx.fillStyle = Menu.cBorderStatbar;
            ctx.fillRect(this._borderStatbarPos.x, this._borderStatbarPos.y, this._borderStatbarLength, this._borderStatbarWidth);

            // ctx.fillRect(this._statbarPos.x, this._statbarPos.y, this._statbarWidth, this._statbarHeight);
            
            ctx.font = this._statbarTextSize + "px " + Menu.font;

            var credW = ctx.measureText("Credits ");
            var credV = ctx.measureText(credits);
            var xpW = ctx.measureText("XP ");
            var xpV = ctx.measureText(xp);
            var wgW = ctx.measureText("WG ");
            var wgV = ctx.measureText(wg);
            var hpW = ctx.measureText("HP ");
            var hpV = ctx.measureText(hp);

            pos.x += margin;
            pos.y += margin;

            ctx.fillStyle = Menu.cStatbarTitle;

            var off: number = 0;

            ctx.fillText("Credits ", pos.x, pos.y);
            off += credW.width + credV.width;
            ctx.fillText("XP ", pos.x + off, pos.y);
            off += xpW.width + xpV.width;
            ctx.fillText("WG ", pos.x + off, pos.y);
            off += wgW.width + wgV.width;
            ctx.fillText("HP ", pos.x + off, pos.y);

            ctx.fillStyle = Menu.cStatbarVal;

            off = credW.width;
            ctx.fillText(credits, pos.x + off, pos.y);
            off += credV.width + xpW.width;
            ctx.fillText(xp, pos.x + off, pos.y);
            off += xpV.width + wgW.width;
            ctx.fillText(wg, pos.x + off, pos.y);
            off += wgV.width + hpW.width;
            ctx.fillText(hp, pos.x + off, pos.y);

            ctx.closePath();
        }

        drawBorderMain(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.lineWidth = this._borderMainWidth; 
            ctx.fillStyle = Menu.cBackground;
            ctx.strokeStyle = Menu.cBorderMain;

            var cOff = this._borderMainCornerOffset;

            var min = this._borderMin;
            var max = this._borderMax;

            ctx.moveTo(min.x, min.y);
            ctx.lineTo(max.x - cOff, min.y);
            ctx.lineTo(max.x, min.y + cOff);
            ctx.lineTo(max.x, max.y);
            ctx.lineTo(min.x + cOff, max.y);
            ctx.lineTo(min.x, max.y - cOff);
            ctx.closePath();
        }
    }

    export class Button extends vs.HUDElement {
        callback: { (): void; };
        label: string;
        private _clicked: bool = false;
        private _selected: bool = false;
        backgroundColorSelected: string = "red";

        constructor (label: string, x: number, y: number, width: number, height: number) {
            super(x, y, width, height);

            this.label = label;
            this.text = label;
            this.font = Menu.font;
            this.drawText = true;
            this.drawBackground = false;
            this.drawBorder = false;
            this.textAutoWrap = false;
            this.draggable = false;
            this.clickable = true;
            this.textAutoEnlarge = false;
            this.centerText = true;
            this.margin = 4;

            this.callback = () => { };

            this.borderColor = "white";

            this.textColorActive = Menu.cButtActive;
            this.textColorInactive = Menu.cButtInactive;
        }

        onClick() {
            this._clicked = true;
            this.callback();
        }

        offClick() {
            super.offClick();
            this._clicked = false;
        }

        updateColors() {
            if (this._selected) {
                this.textColor = Menu.cButtSel;
                 this.backgroundColor = this.backgroundColorSelected;
            }
            else {
                if (this._active) {
                    this.textColor = this.textColorActive;
                    this.backgroundColor = this.backgroundColorActive;
                }
                else {
                    this.textColor = this.textColorInactive;
                    this.backgroundColor = this.backgroundColorInactive;
                }
            }
        }

        get clicked() {
            return this._clicked;
        }
        set clicked(v: bool) {
            this._clicked = v;
        }
        get selected() {
            return this._selected;
        }
        set selected(v:bool) {
            this._selected = v;
        }
    }

    export class ItemListButton extends Button {
        qty: number = 0;
        lvl: string = "lvl";
        wg: string = "wg";
        val: string = "val";

        labelWidth: number = 100;

        cHeader: string = Menu.cListHeader;
        cName: string = Menu.cListName;
        cVal: string = Menu.cListVal;
        cQty: string = Menu.cListQTY;

        header: bool = false;

        container: vs.ItemContainer;

        constructor (container: vs.ItemContainer, x: number, y: number, width: number, height: number) {
            super("", x, y, width, height);
            this.drawText = false;
            this.labelWidth = width * 0.5;
            this.drawBackground = true;

            this.container = container;
            this.update();
        }

        update() {
            var container = this.container;
            if (container !== null) {
                this.label = container.name;
                this.text = this.label;
                this.qty = container.size;
                this.lvl = container.level + "";
                this.wg = container.totalWeight + "";
                this.val = container.totalValue + "";
            } else {
                this.label = "name";
                this.text = this.label;
                this.qty = 0;
                this.lvl = "lvl";
                this.wg = "wg";
                this.val = "val";
            }
        }

        drawCustom(ctx: CanvasRenderingContext2D) {
            var width = this.width;
            var height = this.height;
            var margin = this.margin;

            var pos = new vs.Point(margin, margin);

            ctx.font = this.textSize + "px " + Menu.font;
            if (this.header) {
                ctx.fillStyle = this.cHeader;
            }
            else {
                ctx.fillStyle = this.cName;
            }
            ctx.fillText(this.label, pos.x, pos.y);
            var m = ctx.measureText(this.label + " ");
            pos.x += m.width;
            if(!this.header) ctx.fillStyle = this.cQty;
            if(this.qty > 0)
                ctx.fillText("["+this.qty+"]", pos.x, pos.y);

            var pWidth = Math.floor((this.width - this.labelWidth) / 3);
            pos.x = this.labelWidth;
            if(!this.header) ctx.fillStyle = this.cVal;
            ctx.fillText(this.lvl, pos.x, pos.y);

            pos.x += pWidth;
            ctx.fillText(this.wg, pos.x, pos.y);

            pos.x += pWidth;
            ctx.fillText(this.val, pos.x, pos.y);
        }
        
    }

    export class Property {
        label: string;
        value: string;

        constructor (label: string, value: string) {
            this.label = label;
            this.value = value;
        }
    }

    export class ItemListType {
        static ITEMS: number = 1;
        static WEAPONS: number = 2;
    }

    export class ItemList extends vs.HUDElement {
        game: vs.Game;
        type: number;
        scrollbox: vs.HUDScrollBox;
        scrollLeft: bool = true;

        bUse: Button;
        bDrop: Button;

        labels: string[] = [];
        buttons: ItemListButton[] = [];

        headerText: string = "";
        headerTextSize: number = 18;

        properties: Property[] = [];
        propertyLabelWidth: number = 40;
        propertyTextSize: number = 14;

        descriptionText: string = " ";
        descriptionTextSize: number = 14;

        currentItem: vs.ItemContainer;
        selected: ItemListButton;

        _scrollBoxWidthPercent: number = 0.5;

        _scrollHeaderPos: vs.Point;
        _scrollHeaderTextSize: number = 14;
        _scrollHeaderWidth: number;
        _scrollHeaderHeight: number;
        _scrollHeaderMargin: number = 4;
        scrollHeader: ItemListButton;

        _sideboxPos: vs.Point;
        _sideboxWidth: number;
        _sideboxHeight: number;
        _sideboxMargin: number; 

        _ready: bool = false;

        constructor (x: number, y: number, width: number, height: number, game: vs.Game, type:number) {
            super(x, y, width, height);

            this.game = game;
            this.type = type;

            this.drawBorder = false;
            this.drawBackground = false;

            var sWidth = width * this._scrollBoxWidthPercent;

            this._scrollHeaderPos = new vs.Point(16, 0);
            this._scrollHeaderHeight = this._scrollHeaderTextSize + this._scrollHeaderMargin * 2;
            this._scrollHeaderWidth = sWidth - this._scrollHeaderPos.x;

            this.scrollHeader = new ItemListButton(null, this._scrollHeaderPos.x, this._scrollHeaderPos.y, this._scrollHeaderWidth, this._scrollHeaderHeight);
            this.scrollHeader.font = Menu.font;
            this.scrollHeader.margin = this._scrollHeaderMargin;
            this.scrollHeader.textSize = this._scrollHeaderTextSize;
            this.scrollHeader.header = true;
            this.add(this.scrollHeader);
            
            this.scrollbox = new vs.HUDScrollBox(0, this._scrollHeaderHeight, sWidth, height - this._scrollHeaderHeight, this.scrollLeft);
            this.scrollbox.drawBackground = false;
            this.scrollbox.drawBorder = false;
            this.scrollbox.drawText = false;
            this.scrollbox.content.drawBorder = false;
            this.scrollbox.content.drawBackground = false;
            this.scrollbox.scrollBar.drawBorder = false;
            this.scrollbox.scrollBar.drawBackground = false;
            this.add(this.scrollbox);

            this._sideboxPos = new vs.Point(sWidth, 0);
            this._sideboxWidth = width - sWidth;
            this._sideboxHeight = height;
            this._sideboxMargin = 10;

            this.headerText = "An Item";
            this.properties.push(new Property("lvl", "2"));
            this.properties.push(new Property("wg", "20"));

            this.descriptionText = "A description will go here. It will tell you all sorts of cool things about the item";

            var bTextSize = 14;
            var bMargin = 4;
            var bWidth = Math.floor(this._sideboxWidth * 0.5);
            var bHeight = 30;

            this.bUse = new Button("Use [E]", sWidth, this.height - bHeight, bWidth, bHeight);
            this.bUse.centerText = false;
            this.bUse.textSize = bTextSize;
            this.bUse.margin = bMargin;
            this.add(this.bUse);

            this.bDrop = new Button("Drop [R]", sWidth + bWidth, this.height - bHeight, bWidth, bHeight);

            // this.bDrop = new Button("Drop[r]", sWidth + bWidth,100, bWidth, bHeight);

            // this.bDrop = new Button("Drop[r]", 100, 100, 100, 100);
            this.bDrop.centerText = true;
            this.bDrop.textSize = bTextSize;
            this.bDrop.margin = bMargin;
            this.add(this.bDrop);


            //var element = new vs.HUDElement(100, 100, 100, 100);
            //this.add(element);

            this.createButtons(this.game);
            this.clear();
            this._ready = true;
        }

        rebuild() {
            this.buttons.forEach((button: ItemListButton) =>{
                this.scrollbox.content.remove(button);
            });
            this.buttons = [];

            this.createButtons(this.game);
            this.game.itemManager.changed = false;
        }

        setProperties(c:vs.ItemContainer) {
            this.properties = [];
            this.properties.push(new Property("qty", c.size+""));
            this.properties.push(new Property("lvl", c.level+""));
            this.properties.push(new Property("wg", c.weight+""));
            this.properties.push(new Property("val", c.value+""));
        }

        createButtons(game:vs.Game) {
            var containers: vs.ItemContainer[];
            if(this.type === ItemListType.ITEMS) containers = game.itemManager.containers;
            if (this.type === ItemListType.WEAPONS) containers = game.itemManager.weaponContainers;
            var numButtons = containers.length;
            var bWidth = this.scrollbox.content.width;
            var bHeight = this._scrollHeaderHeight;
            var font = Menu.font;
            var textSize = this._scrollHeaderTextSize;
            var margin = 4;

            var colorActive = "rgba(28, 47, 73, 0.9)";
            var colorInactive = "rgba(0, 0, 0, 0)";

            var button: ItemListButton;
            var label: string;
            var container: vs.ItemContainer;

            this.scrollbox.content.height = numButtons * bHeight;

            for (var i = 0; i < numButtons; i++) {
                container = containers[i];
                label = container.name;
                button = new ItemListButton(container, 0, bHeight * i, bWidth, bHeight);
                // button.container = container;
                //button.qty = container.size;
                //button.wg = container.totalWeight+"";
                //button.lvl = container.level + "";
                //button.val = container.value + "";

                button.backgroundColorActive = colorActive;
                button.backgroundColorInactive = colorInactive;
                button.font = font;
                button.textSize = textSize;
                button.margin = margin;
                this.scrollbox.content.add(button);
                this.labels.push(label);
                this.buttons.push(button);

                if (this.selected) {
                    if (this.selected.container == container) {
                        this.selected = button;
                        button.selected = true;
                    }
                }
            }

        }

        render(ctx: CanvasRenderingContext2D) {
            super.render(ctx);

            this.checkKeys();
            this.checkButtons();
        }

        checkButtons() {
            if (this.game.itemManager.changed) {
                this.rebuild();
            }

            // console.log("Checking Buttons");
            var size = this.buttons.length;
            var button: ItemListButton;
            for (var i = 0; i < size; i++) {
                button = this.buttons[i];
                if (button.clicked) {
                    console.log("button clicked");
                    this.buttonClicked(button);
                    button.selected = true;
                    button.clicked = false;
                    if(this.selected && this.selected !== button) this.selected.selected = false;
                    this.selected = button;
                }
            }
            if (this.currentItem) {
                if (this.bUse.clicked) {
                    this.bUse.clicked = false;
                    this.currentItem.use(this.game);
                }
                if (this.bDrop.clicked) {
                    this.bDrop.clicked = false;
                    this.currentItem.pop(this.game);
                }
            }
        }

        //buttonClicked(button: ItemListButton, index: number) {
        //    this.headerText = button.label;
        //}

        buttonClicked(button: ItemListButton) {
            var containers = this.game.itemManager.containers;
            var c = button.container;
            this.currentItem = c;
            this.headerText = c.name;
            // this.headerBox2.text = "    QTY  " + c.size + "   WG  " + c.totalWeight + "   VAL  " + c.totalValue;


            this.descriptionText = c.description;

            this.setProperties(c);

            //if (this.sprite) {
            //    this.imageBox.remove(this.sprite);
            //}

            // this.sprite = c.sprite;

            //if (this.sprite) {
            //    this.imageBox.add(this.sprite);
            //}
        }

        clear() {
            this.currentItem = null;
            this.headerText = "";
            this.descriptionText = "";
            //if (this.sprite) {
            //    this.imageBox.remove(this.sprite);
            //}
            //this.sprite = null;
        }

        drawCustom(ctx: CanvasRenderingContext2D) {
            if (this._ready) {
                this.drawSidebox(ctx);
            }
        }

        drawSidebox(ctx:CanvasRenderingContext2D) {
            if(this.currentItem == null || this.currentItem == undefined) return;
            var pos = this._sideboxPos.clone();
            var margin = this._sideboxMargin;
            var width = this._sideboxWidth - margin * 2;

            var lineSpacing = 4;

            pos.x += margin;
            pos.y += margin;

            ctx.fillStyle = Menu.cInfoHeader;
            ctx.font = this.headerTextSize + "px " + Menu.font;
            ctx.fillText(this.headerText, pos.x, pos.y);

            pos.y += this.headerTextSize + lineSpacing;

            ctx.fillStyle = Menu.cInfoName;
            ctx.font = this.propertyTextSize + "px " + Menu.font;
            var prev = pos.clone();
            for (var i = 0; i < this.properties.length; i++) {
                var label = this.properties[i].label;
                ctx.fillText(label, pos.x, pos.y);
                pos.y += this.propertyTextSize + lineSpacing;
            }
            pos.y = prev.y;
            pos.x += this.propertyLabelWidth;
            ctx.fillStyle = Menu.cInfoVal;
            ctx.font = this.propertyTextSize + "px " + Menu.font;
            for (var i = 0; i < this.properties.length; i++) {
                var value = this.properties[i].value;
                ctx.fillText(value, pos.x, pos.y);
                pos.y += this.propertyTextSize + lineSpacing;
            }
            pos.x = prev.x;

            pos.y += lineSpacing * 2;
            ctx.fillStyle = Menu.cInfoText;
            ctx.font = this.descriptionTextSize + "px " + Menu.font;
            vs.HUD.drawWrapText(ctx, this.descriptionText, pos.x, pos.y, width, this.descriptionTextSize + lineSpacing);
        }

        checkKeys() {
            if (this.currentItem) {
                if (vs.Keyboard.justPressed(vs.Keys.R)) {
                        this.currentItem.pop(this.game);
                }
                if (vs.Keyboard.justPressed(vs.Keys.E)) {
                        this.currentItem.use(this.game);
                }
                if (this.currentItem.size < 1) this.clear();
            }
        }
    }

    

    export class Stats {
    }

    export class Items {
    }

    export class Weapons {
    }


}