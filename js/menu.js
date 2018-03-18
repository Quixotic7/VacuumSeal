var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var menu;
(function (menu) {
    var Menu = (function (_super) {
        __extends(Menu, _super);
        function Menu(x, y, width, height, game) {
                _super.call(this, x, y, width, height);
            this._ready = false;
            this._bTextSize = 20;
            this._title = "Vacuum Seal";
            this._headerY = 40;
            this._borderMainWidth = 5;
            this._borderMainCornerOffset = 20;
            this._borderStatbarWidth = 4;
            this._borderStatbarMargin = 6;
            this.game = game;
            this.itemManager = game.itemManager;
            this.init();
            this.switchTo("Items");
        }
        Menu.font = "Orbitron";
        Menu.cBackground = "rgba(0,0,0,0.5)";
        Menu.cBorderMain = "rgba(201, 199, 255, 1)";
        Menu.cBorderButton = "rgba(40, 40, 50, 1)";
        Menu.cBorderStatbar = "rgba(63, 68, 63, 1)";
        Menu.cButtSel = "white";
        Menu.cButtActive = "rgba(193, 222, 0, 1)";
        Menu.cButtInactive = "rgba(113, 122, 113, 1)";
        Menu.cTitle = "rgba(167, 165, 255, 1)";
        Menu.cTitleGlow = "rgba(245, 245, 245, 1)";
        Menu.cStatbarTitle = "rgba(245, 245, 245, 1)";
        Menu.cStatbarVal = "rgba(57, 208, 169, 1)";
        Menu.cListHeader = "rgba(113, 122, 113, 1)";
        Menu.cListName = "rgba(245, 245, 245, 1)";
        Menu.cListQTY = "rgba(214, 171, 78, 1)";
        Menu.cListVal = "rgba(57, 208, 169, 1)";
        Menu.cInfoHeader = "rgba(181, 180, 236, 1)";
        Menu.cInfoName = "rgba(245, 245, 245, 1)";
        Menu.cInfoVal = "rgba(57, 208, 169, 1)";
        Menu.cInfoText = "rgba(202, 201, 247, 1)";
        Menu.prototype.init = function () {
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
            this.items = new ItemList(pos.x, pos.y, this.width - 2, this.height - pos.y, this.game, ItemListType.ITEMS);
            this.weapons = new ItemList(pos.x, pos.y, this.width - 2, this.height - pos.y, this.game, ItemListType.WEAPONS);
        };
        Menu.prototype.createButtons = function () {
            this._buttons = [];
            this._bTextSize = 16;
            this._buttonsPos = new vs.Point(2, this._headerY + 4);
            this._buttonsMargin = 6;
            this._buttonsWidth = this.width - this._borderMainCornerOffset - 4;
            this._buttonsHeight = this._bTextSize + this._buttonsMargin * 2;
            var pos = this._buttonsPos.clone();
            var height = this._buttonsHeight;
            var butts = [
                "Stats", 
                "Items", 
                "Weapons", 
                "Help"
            ];
            var numButts = butts.length;
            var width = Math.floor(this._buttonsWidth / numButts);
            for(var i = 0; i < numButts; i++) {
                console.log("Creating Butt: " + butts[i] + " at " + pos.x, +" " + pos.y + " width: " + width + " height: " + height);
                var butt = new Button(butts[i], pos.x, pos.y, width, height);
                butt.textSize = this._bTextSize;
                butt.font = Menu.font;
                this.add(butt);
                this._buttons.push(butt);
                pos.x += width;
            }
        };
        Menu.prototype.checkButtons = function () {
            var _this = this;
            this._buttons.forEach(function (button) {
                if(button.clicked) {
                    button.selected = true;
                    button.clicked = false;
                    if(_this._bSelected) {
                        _this._bSelected.selected = false;
                    }
                    _this._bSelected = button;
                    _this.switchTo(button.label);
                }
            });
        };
        Menu.prototype.switchTo = function (label) {
            switch(label) {
                case "Items": {
                    this.switchE(this.items);
                    break;

                }
                case "Weapons": {
                    this.switchE(this.weapons);
                    break;

                }
            }
        };
        Menu.prototype.switchE = function (element) {
            if(this.current !== undefined) {
                this.remove(this.current);
            }
            this.current = element;
            this.add(this.current);
            this.itemManager.changed = true;
        };
        Menu.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
            this.checkButtons();
        };
        Menu.prototype.drawLast = function (ctx) {
            if(this._ready) {
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
        };
        Menu.prototype.drawCustom = function (ctx) {
            if(this._ready) {
                this.drawTitle(ctx);
                this.drawStatbar(ctx);
                this.drawBorderMain(ctx);
                ctx.fill();
            }
        };
        Menu.prototype.drawTitle = function (ctx) {
            ctx.font = this._titleTextSize + "px " + Menu.font;
            ctx.fillStyle = Menu.cTitle;
            ctx.fillText(this._title, this._titlePos.x, this._titlePos.y);
        };
        Menu.prototype.drawStatbar = function (ctx) {
            var pos = this._statbarPos.clone();
            var width = this._statbarWidth;
            var height = this._statbarHeight;
            var margin = this._statbarMargin;
            var im = this.game.itemManager;
            var credits = im.credits + "  ";
            var xp = im.xp + "  ";
            var wg = im.totalWeight + "/" + im.maxWeight + "  ";
            var hp = this.game.player.hp + "/" + this.game.player.maxHp + "  ";
            ctx.beginPath();
            ctx.fillStyle = Menu.cBorderStatbar;
            ctx.fillRect(this._borderStatbarPos.x, this._borderStatbarPos.y, this._borderStatbarLength, this._borderStatbarWidth);
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
            var off = 0;
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
        };
        Menu.prototype.drawBorderMain = function (ctx) {
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
        };
        return Menu;
    })(vs.HUDElement);
    menu.Menu = Menu;    
    var Button = (function (_super) {
        __extends(Button, _super);
        function Button(label, x, y, width, height) {
                _super.call(this, x, y, width, height);
            this._clicked = false;
            this._selected = false;
            this.backgroundColorSelected = "red";
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
            this.callback = function () {
            };
            this.borderColor = "white";
            this.textColorActive = Menu.cButtActive;
            this.textColorInactive = Menu.cButtInactive;
        }
        Button.prototype.onClick = function () {
            this._clicked = true;
            this.callback();
        };
        Button.prototype.offClick = function () {
            _super.prototype.offClick.call(this);
            this._clicked = false;
        };
        Button.prototype.updateColors = function () {
            if(this._selected) {
                this.textColor = Menu.cButtSel;
                this.backgroundColor = this.backgroundColorSelected;
            } else {
                if(this._active) {
                    this.textColor = this.textColorActive;
                    this.backgroundColor = this.backgroundColorActive;
                } else {
                    this.textColor = this.textColorInactive;
                    this.backgroundColor = this.backgroundColorInactive;
                }
            }
        };
        Object.defineProperty(Button.prototype, "clicked", {
            get: function () {
                return this._clicked;
            },
            set: function (v) {
                this._clicked = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Button.prototype, "selected", {
            get: function () {
                return this._selected;
            },
            set: function (v) {
                this._selected = v;
            },
            enumerable: true,
            configurable: true
        });
        return Button;
    })(vs.HUDElement);
    menu.Button = Button;    
    var ItemListButton = (function (_super) {
        __extends(ItemListButton, _super);
        function ItemListButton(container, x, y, width, height) {
                _super.call(this, "", x, y, width, height);
            this.qty = 0;
            this.lvl = "lvl";
            this.wg = "wg";
            this.val = "val";
            this.labelWidth = 100;
            this.cHeader = Menu.cListHeader;
            this.cName = Menu.cListName;
            this.cVal = Menu.cListVal;
            this.cQty = Menu.cListQTY;
            this.header = false;
            this.drawText = false;
            this.labelWidth = width * 0.5;
            this.drawBackground = true;
            this.container = container;
            this.update();
        }
        ItemListButton.prototype.update = function () {
            var container = this.container;
            if(container !== null) {
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
        };
        ItemListButton.prototype.drawCustom = function (ctx) {
            var width = this.width;
            var height = this.height;
            var margin = this.margin;
            var pos = new vs.Point(margin, margin);
            ctx.font = this.textSize + "px " + Menu.font;
            if(this.header) {
                ctx.fillStyle = this.cHeader;
            } else {
                ctx.fillStyle = this.cName;
            }
            ctx.fillText(this.label, pos.x, pos.y);
            var m = ctx.measureText(this.label + " ");
            pos.x += m.width;
            if(!this.header) {
                ctx.fillStyle = this.cQty;
            }
            if(this.qty > 0) {
                ctx.fillText("[" + this.qty + "]", pos.x, pos.y);
            }
            var pWidth = Math.floor((this.width - this.labelWidth) / 3);
            pos.x = this.labelWidth;
            if(!this.header) {
                ctx.fillStyle = this.cVal;
            }
            ctx.fillText(this.lvl, pos.x, pos.y);
            pos.x += pWidth;
            ctx.fillText(this.wg, pos.x, pos.y);
            pos.x += pWidth;
            ctx.fillText(this.val, pos.x, pos.y);
        };
        return ItemListButton;
    })(Button);
    menu.ItemListButton = ItemListButton;    
    var Property = (function () {
        function Property(label, value) {
            this.label = label;
            this.value = value;
        }
        return Property;
    })();
    menu.Property = Property;    
    var ItemListType = (function () {
        function ItemListType() { }
        ItemListType.ITEMS = 1;
        ItemListType.WEAPONS = 2;
        return ItemListType;
    })();
    menu.ItemListType = ItemListType;    
    var ItemList = (function (_super) {
        __extends(ItemList, _super);
        function ItemList(x, y, width, height, game, type) {
                _super.call(this, x, y, width, height);
            this.scrollLeft = true;
            this.labels = [];
            this.buttons = [];
            this.headerText = "";
            this.headerTextSize = 18;
            this.properties = [];
            this.propertyLabelWidth = 40;
            this.propertyTextSize = 14;
            this.descriptionText = " ";
            this.descriptionTextSize = 14;
            this._scrollBoxWidthPercent = 0.5;
            this._scrollHeaderTextSize = 14;
            this._scrollHeaderMargin = 4;
            this._ready = false;
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
            this.bDrop.centerText = true;
            this.bDrop.textSize = bTextSize;
            this.bDrop.margin = bMargin;
            this.add(this.bDrop);
            this.createButtons(this.game);
            this.clear();
            this._ready = true;
        }
        ItemList.prototype.rebuild = function () {
            var _this = this;
            this.buttons.forEach(function (button) {
                _this.scrollbox.content.remove(button);
            });
            this.buttons = [];
            this.createButtons(this.game);
            this.game.itemManager.changed = false;
        };
        ItemList.prototype.setProperties = function (c) {
            this.properties = [];
            this.properties.push(new Property("qty", c.size + ""));
            this.properties.push(new Property("lvl", c.level + ""));
            this.properties.push(new Property("wg", c.weight + ""));
            this.properties.push(new Property("val", c.value + ""));
        };
        ItemList.prototype.createButtons = function (game) {
            var containers;
            if(this.type === ItemListType.ITEMS) {
                containers = game.itemManager.containers;
            }
            if(this.type === ItemListType.WEAPONS) {
                containers = game.itemManager.weaponContainers;
            }
            var numButtons = containers.length;
            var bWidth = this.scrollbox.content.width;
            var bHeight = this._scrollHeaderHeight;
            var font = Menu.font;
            var textSize = this._scrollHeaderTextSize;
            var margin = 4;
            var colorActive = "rgba(28, 47, 73, 0.9)";
            var colorInactive = "rgba(0, 0, 0, 0)";
            var button;
            var label;
            var container;
            this.scrollbox.content.height = numButtons * bHeight;
            for(var i = 0; i < numButtons; i++) {
                container = containers[i];
                label = container.name;
                button = new ItemListButton(container, 0, bHeight * i, bWidth, bHeight);
                button.backgroundColorActive = colorActive;
                button.backgroundColorInactive = colorInactive;
                button.font = font;
                button.textSize = textSize;
                button.margin = margin;
                this.scrollbox.content.add(button);
                this.labels.push(label);
                this.buttons.push(button);
                if(this.selected) {
                    if(this.selected.container == container) {
                        this.selected = button;
                        button.selected = true;
                    }
                }
            }
        };
        ItemList.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
            this.checkKeys();
            this.checkButtons();
        };
        ItemList.prototype.checkButtons = function () {
            if(this.game.itemManager.changed) {
                this.rebuild();
            }
            var size = this.buttons.length;
            var button;
            for(var i = 0; i < size; i++) {
                button = this.buttons[i];
                if(button.clicked) {
                    console.log("button clicked");
                    this.buttonClicked(button);
                    button.selected = true;
                    button.clicked = false;
                    if(this.selected && this.selected !== button) {
                        this.selected.selected = false;
                    }
                    this.selected = button;
                }
            }
            if(this.currentItem) {
                if(this.bUse.clicked) {
                    this.bUse.clicked = false;
                    this.currentItem.use(this.game);
                }
                if(this.bDrop.clicked) {
                    this.bDrop.clicked = false;
                    this.currentItem.pop(this.game);
                }
            }
        };
        ItemList.prototype.buttonClicked = function (button) {
            var containers = this.game.itemManager.containers;
            var c = button.container;
            this.currentItem = c;
            this.headerText = c.name;
            this.descriptionText = c.description;
            this.setProperties(c);
        };
        ItemList.prototype.clear = function () {
            this.currentItem = null;
            this.headerText = "";
            this.descriptionText = "";
        };
        ItemList.prototype.drawCustom = function (ctx) {
            if(this._ready) {
                this.drawSidebox(ctx);
            }
        };
        ItemList.prototype.drawSidebox = function (ctx) {
            if(this.currentItem == null || this.currentItem == undefined) {
                return;
            }
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
            for(var i = 0; i < this.properties.length; i++) {
                var label = this.properties[i].label;
                ctx.fillText(label, pos.x, pos.y);
                pos.y += this.propertyTextSize + lineSpacing;
            }
            pos.y = prev.y;
            pos.x += this.propertyLabelWidth;
            ctx.fillStyle = Menu.cInfoVal;
            ctx.font = this.propertyTextSize + "px " + Menu.font;
            for(var i = 0; i < this.properties.length; i++) {
                var value = this.properties[i].value;
                ctx.fillText(value, pos.x, pos.y);
                pos.y += this.propertyTextSize + lineSpacing;
            }
            pos.x = prev.x;
            pos.y += lineSpacing * 2;
            ctx.fillStyle = Menu.cInfoText;
            ctx.font = this.descriptionTextSize + "px " + Menu.font;
            vs.HUD.drawWrapText(ctx, this.descriptionText, pos.x, pos.y, width, this.descriptionTextSize + lineSpacing);
        };
        ItemList.prototype.checkKeys = function () {
            if(this.currentItem) {
                if(vs.Keyboard.justPressed(vs.Keys.R)) {
                    this.currentItem.pop(this.game);
                }
                if(vs.Keyboard.justPressed(vs.Keys.E)) {
                    this.currentItem.use(this.game);
                }
                if(this.currentItem.size < 1) {
                    this.clear();
                }
            }
        };
        return ItemList;
    })(vs.HUDElement);
    menu.ItemList = ItemList;    
    var Stats = (function () {
        function Stats() { }
        return Stats;
    })();
    menu.Stats = Stats;    
    var Items = (function () {
        function Items() { }
        return Items;
    })();
    menu.Items = Items;    
    var Weapons = (function () {
        function Weapons() { }
        return Weapons;
    })();
    menu.Weapons = Weapons;    
})(menu || (menu = {}));
