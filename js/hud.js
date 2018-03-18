var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var HUDMessage = (function () {
        function HUDMessage(text, timer) {
            this.text = text;
            this.timer = timer;
        }
        return HUDMessage;
    })();
    vs.HUDMessage = HUDMessage;    
    var HUD = (function () {
        function HUD(game) {
            this.topAlert = "";
            this.bottomAlert = "";
            this.weaponMessage = "";
            this.itemMessage = "";
            this.alertTimer = 0;
            this.alertNext = 1;
            this.game = game;
        }
        HUD.itemClicked = false;
        HUD.prototype.init = function () {
            var game = this.game;
            this.messageQueue = new vs.LinkedList();
            var menuWidth = 740;
            var menuHeight = 500;
            var menuX = (vs.Game.game.width * 0.5) - (menuWidth * 0.5);
            var menuY = (vs.Game.game.height * 0.5) - (menuHeight * 0.5);
            this.menu = new menu.Menu(menuX, menuY, menuWidth, menuHeight, game);
            this.game = game;
            this.ColorTopAlert = new vs.Color(0, 190, 210, 1);
            this.ColorBottomAlert = new vs.Color(0, 230, 240, 1);
        };
        HUD.prototype.alert = function (message) {
            this.topAlert = message;
        };
        HUD.prototype.clear = function () {
            this.messageQueue.clear();
            this.bottomAlert = "";
            this.alertTimer = 0;
            this.alertNext = 0;
        };
        HUD.prototype.queueMessage = function (message, time, now) {
            if (typeof now === "undefined") { now = false; }
            if(!now) {
                this.messageQueue.add(new HUDMessage(message, time));
            } else {
                this.alertTimer = 0;
                this.alertNext = time;
                this.bottomAlert = message;
            }
        };
        HUD.prototype.alertItem = function (message) {
            this.itemMessage = message;
        };
        HUD.prototype.update = function (delta) {
            if(this.alertTimer >= this.alertNext) {
                if(this.messageQueue.size() > 0) {
                    var message = this.messageQueue.popHead();
                    this.alertNext = message.timer;
                    this.bottomAlert = message.text;
                    this.alertTimer = 0;
                } else {
                    this.bottomAlert = "";
                }
            }
            this.alertTimer += delta;
        };
        HUD.prototype.render = function (ctx, paused) {
            ctx.fillStyle = "rgba(255,255,255,1)";
            ctx.font = " 14px Audiowide";
            ctx.textBaseline = "top";
            if(!paused) {
                this.drawHealth(ctx);
                ctx.fillStyle = "white";
                this.drawText(ctx, this.weaponMessage, 6, 6, 20);
            } else {
                ctx.font = " 20px Audiowide";
                var y = vs.Game.game.canvas.height * 0.5;
                var x = vs.Game.game.canvas.width * 0.5;
                this.drawText(ctx, "Paused", x - 30, y, 20);
            }
        };
        HUD.prototype.drawIngame = function (ctx) {
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
        };
        HUD.prototype.reinit = function () {
            this.weaponMessage = "";
            this.bottomAlert = "";
            this.topAlert = "";
        };
        HUD.prototype.drawBasic = function (ctx, message) {
            ctx.fillStyle = ctx.fillStyle = "rgba(0,230,240,1)";
            ctx.font = " 16px Audiowide";
            var h = this.game.height;
            var d = this.getDimensions(ctx, message, 16);
            var y = (h * 0.5) - (d.y * 0.5);
            this.drawText(ctx, message, 0, y, 16, true);
        };
        HUD.prototype.drawIngamePaused = function (ctx) {
        };
        HUD.prototype.getDimensions = function (ctx, text, lineHeight) {
            var sections = text.split('\n');
            var m;
            var w = 0;
            var h = 0;
            for(var i = 0; i < sections.length; i++) {
                m = ctx.measureText(sections[i]);
                w = Math.max(w, m.width);
                h += lineHeight;
            }
            return new vs.Point(w, h);
        };
        HUD.prototype.drawTesting = function (ctx) {
            var player = this.game.player;
            var l = 300;
            var pVec = player.directionVector;
            var p = player.positionLocal;
            ctx.save();
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            this.drawLineFromPosAndDir(ctx, p, pVec, l);
            ctx.stroke();
            ctx.strokeStyle = "orange";
            pVec = new vs.Vec2(vs.Mouse.x - p.x, vs.Mouse.y - p.y);
            this.drawLineFromPosAndDir(ctx, p, pVec, l);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + pVec.x, p.y + pVec.y);
            ctx.closePath();
            ctx.stroke();
            var mouseRot = pVec.angleDeg() - player.rotationOffset;
            ctx.restore();
        };
        HUD.prototype.drawLineFromPosAndDir = function (ctx, pos, dir, length) {
            var dirV = dir.clone();
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            dirV.scale(length);
            ctx.lineTo(pos.x + dirV.x, pos.y + dirV.y);
            ctx.closePath();
        };
        HUD.prototype.drawText = function (ctx, text, x, y, lineHeight, centerX) {
            if (typeof centerX === "undefined") { centerX = false; }
            var sections = text.split('\n');
            if(centerX) {
                var d = this.getDimensions(ctx, text, lineHeight);
                x = (this.game.width * 0.5) - (d.x * 0.5);
            }
            for(var i = 0; i < sections.length; i++) {
                ctx.fillText(sections[i], x, y);
                y += lineHeight;
            }
        };
        HUD.prototype.drawHealth = function (ctx) {
            var width = 100;
            var margin = 6;
            var height = 16;
            var pos = new vs.Point(vs.Game.game.canvas.width - (width + margin), margin);
            var healthWidth = vs.Game.game.player.hp * (width / 100);
            ctx.strokeStyle = "white";
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.fillRect(pos.x, pos.y, healthWidth, height);
            ctx.rect(pos.x, pos.y, width, height);
            ctx.stroke();
        };
        HUD.prototype.pauseScreen = function () {
        };
        HUD.prototype.drawMenu = function (ctx) {
            this.menu.checkMouse(vs.Mouse.x, vs.Mouse.y);
            this.menu.render(ctx);
        };
        HUD.drawWrapText = function drawWrapText(ctx, text, x, y, maxWidth, lineHeight) {
            var sections = text.split('\n');
            var line = "";
            for(var s = 0; s < sections.length; s++) {
                var words = sections[s].split(" ");
                line = "";
                for(var i = 0; i < words.length; i++) {
                    var testLine = line + words[i] + " ";
                    var metrics = ctx.measureText(testLine);
                    var testWidth = metrics.width;
                    if(testWidth > maxWidth) {
                        ctx.fillText(line, x, y);
                        line = words[i] + " ";
                        y += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, x, y);
                y += lineHeight;
            }
            return y;
        }
        return HUD;
    })();
    vs.HUD = HUD;    
    var HUDSprite = (function () {
        function HUDSprite(imageName, frame, frameWidth, frameHeight) {
            this._x = 0;
            this._y = 0;
            this._image = vs.Game.game.assets.images[imageName];
            this._frameWidth = frameWidth || this._image.width;
            this._frameHeight = frameHeight || this._image.height;
            this.frame = frame || 0;
        }
        HUDSprite.prototype.render = function (ctx) {
            ctx.drawImage(this._image, this._frameX, this._frameY, this._frameWidth, this._frameHeight, this._x, this._y, this._frameWidth, this._frameHeight);
        };
        Object.defineProperty(HUDSprite.prototype, "frame", {
            set: function (frame) {
                this._frame = frame;
                this._frameX = (frame * this._frameWidth) % this._image.width;
                this._frameY = Math.floor((this._frame * this._frameHeight) / this._image.width);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDSprite.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDSprite.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (y) {
                this._y = y;
            },
            enumerable: true,
            configurable: true
        });
        return HUDSprite;
    })();
    vs.HUDSprite = HUDSprite;    
    var HUDElement = (function () {
        function HUDElement(x, y, width, height) {
            this.name = "";
            this.alpha = 1;
            this.sprites = [];
            this.borderWidth = 4;
            this.margin = 4;
            this.backgroundColor = "";
            this.borderColor = "";
            this.textColor = "";
            this.backgroundColorActive = "black";
            this.backgroundColorInactive = "black";
            this.borderColorActive = "white";
            this.borderColorInactive = "white";
            this.textColorActive = "white";
            this.textColorInactive = "white";
            this.font = "Arial";
            this.textSize = 14;
            this.lineHeight = 20;
            this._text = "";
            this._textDrawHeight = 0;
            this.textAutoEnlarge = false;
            this.textAutoWrap = true;
            this.drawBackground = true;
            this.drawSprite = false;
            this.drawBorder = true;
            this.drawText = true;
            this.draggable = false;
            this.clickable = false;
            this.justClicked = false;
            this.centerText = false;
            this.childrenOnLastUpdate = 0;
            this._active = false;
            this._activeLast = true;
            this._cacheDrawn = false;
            this._followMouse = false;
            this._childFollowing = false;
            this._childChanged = false;
            this.x = x;
            this.y = y;
            this.children = [];
            this._bounds = new vs.Rect(0, 0, width, height);
            this._mouseClickPoint = new vs.Point(0, 0);
            this._oldPos = new vs.Point(0, 0);
            this.updateColors();
            this.cacheCanvas = document.createElement("canvas");
            this.width = width;
            this.height = height;
            this.drawCache();
        }
        HUDElement.prototype.add = function (obj) {
            if(obj instanceof HUDElement) {
                var element = obj;
                element.parent = this;
                this.children.push(element);
            } else {
                if(obj instanceof HUDSprite) {
                    var sprite = obj;
                    this.sprites.push(sprite);
                }
            }
        };
        HUDElement.prototype.remove = function (obj) {
            if(obj instanceof HUDElement) {
                var element = obj;
                this.children.splice(this.children.indexOf(element), 1);
            } else {
                if(obj instanceof HUDSprite) {
                    var sprite = obj;
                    this.sprites.splice(this.sprites.indexOf(sprite), 1);
                }
            }
        };
        HUDElement.prototype.render = function (ctx) {
            this.drawCache();
            if(this._followMouse) {
                this.updatePos();
            }
            if(this.alpha < 1) {
                ctx.globalAlpha = this.alpha;
            }
            ctx.drawImage(this.cacheCanvas, 0, 0, this.width, this.height, this.localX, this.localY, this.width, this.height);
            if(this.alpha < 1) {
                ctx.globalAlpha = 1;
            }
        };
        HUDElement.prototype.drawCache = function () {
            if(this._childChanged) {
                this._childChanged = false;
            }
            var ctx = this.cacheCanvas.getContext("2d");
            this.draw(ctx);
            this._cacheDrawn = true;
        };
        HUDElement.prototype.drawCustom = function (ctx) {
        };
        HUDElement.prototype.drawLast = function (ctx) {
        };
        HUDElement.prototype.draw = function (ctx) {
            ctx.clearRect(0, 0, this.width, this.height);
            ctx.fillStyle = this.backgroundColor;
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderWidth;
            ctx.beginPath();
            ctx.rect(0, 0, this.width, this.height);
            if(this.drawBackground) {
                ctx.fill();
            }
            if(this.drawSprite) {
                this.sprites.forEach(function (sprite) {
                    sprite.render(ctx);
                });
            }
            if(this.drawText) {
                ctx.font = this.textSize + "px " + this.font;
                ctx.textBaseline = "top";
                ctx.fillStyle = this.textColor;
                if(this.textAutoWrap) {
                    this._textDrawHeight = HUD.drawWrapText(ctx, this._text, this.margin, this.margin - 1, this.width - this.margin, this.lineHeight);
                    if(this._textDrawHeight > this.height && this.textAutoEnlarge) {
                        this.height = this._textDrawHeight + this.margin * 2;
                    }
                } else {
                    var pos = new vs.Point(this.margin, this.margin - 1);
                    if(this.centerText) {
                        var m = ctx.measureText(this._text);
                        pos.x = (this.width * 0.5) - (m.width * 0.5);
                    }
                    ctx.fillText(this._text, pos.x, pos.y, this.width - (this.margin + this.margin));
                }
            }
            this.drawCustom(ctx);
            this.children.forEach(function (child) {
                child.render(ctx);
            });
            if(this.drawBorder) {
                ctx.stroke();
            }
            this.childrenOnLastUpdate = this.children.length;
            if(this.parent) {
                this.parent._childChanged = true;
            }
            ctx.closePath();
            this.drawLast(ctx);
        };
        HUDElement.prototype.checkMouse = function (mX, mY) {
            this._activeLast = this._active;
            if(this.hitTest(mX, mY)) {
                this._active = true;
            } else {
                this._active = false;
            }
            var childActive = false;
            this.children.forEach(function (child) {
                if(child.checkMouse(mX, mY)) {
                    childActive = true;
                }
            });
            if(this.draggable) {
                var click = vs.Mouse.down();
                if(click && this._active && !childActive) {
                    this.onDrag();
                }
                if(!click) {
                    this.offClick();
                }
            }
            if(this.clickable) {
                if(vs.Mouse.down() && !this.justClicked && this._active) {
                    this.justClicked = true;
                    this.onClick();
                }
                if(!vs.Mouse.down()) {
                    this.justClicked = false;
                    this.offClick();
                }
            }
            if(!this._followMouse) {
                this.updateColors();
            }
            if(this._active) {
                return true;
            }
            return false;
        };
        HUDElement.prototype.hitTest = function (x, y) {
            if(this.parent) {
                if(this.parent.hitTest(x, y)) {
                    if(this.bounds.contains(x, y)) {
                        return true;
                    }
                }
            } else {
                if(this.bounds.contains(x, y)) {
                    return true;
                }
            }
            return false;
        };
        HUDElement.prototype.onClick = function () {
        };
        HUDElement.prototype.onDrag = function () {
            if(!HUD.itemClicked) {
                if(!this._followMouse) {
                    this._mouseClickPoint = new vs.Point(vs.Mouse.x, vs.Mouse.y);
                    this._oldPos = new vs.Point(this._x, this._y);
                    HUD.itemClicked = true;
                    this._followMouse = true;
                }
            }
        };
        HUDElement.prototype.offClick = function () {
            if(HUD.itemClicked) {
                HUD.itemClicked = false;
            }
            this._followMouse = false;
        };
        HUDElement.prototype.updatePos = function () {
            this._x = this._oldPos.x + (vs.Mouse.x - this._mouseClickPoint.x);
            this._y = this._oldPos.y + (vs.Mouse.y - this._mouseClickPoint.y);
        };
        HUDElement.prototype.updateColors = function () {
            if(this._active) {
                this.textColor = this.textColorActive;
                this.backgroundColor = this.backgroundColorActive;
                this.borderColor = this.borderColorActive;
            } else {
                this.textColor = this.textColorInactive;
                this.backgroundColor = this.backgroundColorInactive;
                this.borderColor = this.borderColorInactive;
            }
        };
        Object.defineProperty(HUDElement.prototype, "bounds", {
            get: function () {
                this._bounds.x = this.x;
                this._bounds.y = this.y;
                this._bounds.width = this.width;
                this._bounds.height = this.height;
                return this._bounds;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDElement.prototype, "x", {
            get: function () {
                if(this.parent) {
                    return this._x + this.parent.x;
                }
                return this._x;
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDElement.prototype, "y", {
            get: function () {
                if(this.parent) {
                    return this._y + this.parent.y;
                }
                return this._y;
            },
            set: function (y) {
                this._y = y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDElement.prototype, "localX", {
            get: function () {
                return this._x;
            },
            set: function (x) {
                this._x = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDElement.prototype, "localY", {
            get: function () {
                return this._y;
            },
            set: function (y) {
                this._y = y;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDElement.prototype, "text", {
            get: function () {
                return this._text;
            },
            set: function (x) {
                this._text = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDElement.prototype, "width", {
            get: function () {
                return this._width;
            },
            set: function (x) {
                this.cacheCanvas.width = x;
                this._width = x;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDElement.prototype, "height", {
            get: function () {
                return this._height;
            },
            set: function (x) {
                this.cacheCanvas.height = x;
                this._height = x;
            },
            enumerable: true,
            configurable: true
        });
        return HUDElement;
    })();
    vs.HUDElement = HUDElement;    
    var HUDVerticalScrollGrip = (function (_super) {
        __extends(HUDVerticalScrollGrip, _super);
        function HUDVerticalScrollGrip(x, y, width, height) {
                _super.call(this, x, y, width, height);
            this.min = 0;
            this.max = 100;
            this.borderColorInactive = this.borderColorActive = "white";
            this.backgroundColorActive = "green";
            this.backgroundColorInactive = "black";
            this.draggable = true;
            this.updateColors();
        }
        HUDVerticalScrollGrip.prototype.updatePos = function () {
            this.localY = this._oldPos.y + (vs.Mouse.y - this._mouseClickPoint.y);
            if(this.localY < this.min) {
                this.localY = this.min;
            }
            if(this.localY > this.max) {
                this.localY = this.max;
            }
        };
        HUDVerticalScrollGrip.prototype.scroll = function (increment) {
            this.localY += increment;
            if(this.localY < this.min) {
                this.localY = this.min;
            }
            if(this.localY > this.max) {
                this.localY = this.max;
            }
        };
        return HUDVerticalScrollGrip;
    })(HUDElement);
    vs.HUDVerticalScrollGrip = HUDVerticalScrollGrip;    
    var HUDScrollBar = (function (_super) {
        __extends(HUDScrollBar, _super);
        function HUDScrollBar(x, y, width, height, gripHeight) {
                _super.call(this, x, y, width, height);
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
        HUDScrollBar.prototype.scroll = function (increment) {
            this.scrollGrip.scroll(increment);
        };
        Object.defineProperty(HUDScrollBar.prototype, "value", {
            get: function () {
                return (this.scrollGrip.localY - this.scrollGrip.min) / (this.scrollGrip.max - this.scrollGrip.min);
            },
            enumerable: true,
            configurable: true
        });
        HUDScrollBar.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
        };
        return HUDScrollBar;
    })(HUDElement);
    vs.HUDScrollBar = HUDScrollBar;    
    var HUDScrollBox = (function (_super) {
        __extends(HUDScrollBox, _super);
        function HUDScrollBox(x, y, width, height, scrollLeft) {
            if (typeof scrollLeft === "undefined") { scrollLeft = false; }
                _super.call(this, x, y, width, height);
            this.scrollStep = 30;
            var sWidth = 16;
            var sX = width - sWidth;
            var cX = 0;
            if(scrollLeft) {
                cX = sWidth;
                sX = 0;
            }
            this.scrollBar = new HUDScrollBar(sX, 0, 16, height, 60);
            this.content = new HUDElement(cX, 0, width - this.scrollBar.width, 0);
            this.content.textAutoEnlarge = true;
            this.add(this.scrollBar);
            this.add(this.content);
        }
        HUDScrollBox.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
            var maxY = Math.max((this.content.height - this.height), 0);
            this.content.localY = -(maxY * this.scrollBar.value);
            if(this._active) {
                var wheelDelta = vs.Mouse.mouseWheel();
                if(wheelDelta < 0) {
                    this.scrollBar.scroll(this.scrollStep);
                }
                if(wheelDelta > 0) {
                    this.scrollBar.scroll(-this.scrollStep);
                }
            }
        };
        Object.defineProperty(HUDScrollBox.prototype, "text", {
            get: function () {
                return this.content.text;
            },
            set: function (x) {
                this.content.text = x;
            },
            enumerable: true,
            configurable: true
        });
        return HUDScrollBox;
    })(HUDElement);
    vs.HUDScrollBox = HUDScrollBox;    
    var HUDButton = (function (_super) {
        __extends(HUDButton, _super);
        function HUDButton(label, x, y, width, height) {
                _super.call(this, x, y, width, height);
            this.label = label;
            this.text = label;
            this.drawText = true;
            this.textAutoWrap = false;
            this.draggable = false;
            this.clickable = true;
            this.textAutoEnlarge = false;
            this.margin = 1;
            this.callback = function () {
            };
            this.backgroundColorActive = "blue";
        }
        HUDButton.prototype.onClick = function () {
            this._clicked = true;
            this.callback();
        };
        HUDButton.prototype.offClick = function () {
            _super.prototype.offClick.call(this);
            this._clicked = false;
        };
        Object.defineProperty(HUDButton.prototype, "clicked", {
            get: function () {
                return this._clicked;
            },
            enumerable: true,
            configurable: true
        });
        return HUDButton;
    })(HUDElement);
    vs.HUDButton = HUDButton;    
    var HUDMenu = (function (_super) {
        __extends(HUDMenu, _super);
        function HUDMenu(x, y, width, height, game) {
                _super.call(this, x, y, width, height);
            this.buttonClicked = false;
            this.buttonFont = "Orbitron";
            this.buttonTextSize = 20;
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
        HUDMenu.prototype.createButtons = function () {
            var _this = this;
            var bWidth = 120;
            var bHeight = 30;
            var bMargin = 4;
            var xPos = 0;
            var yPos = this.height - bHeight;
            this.bInventory = new HUDButton("Inventory", xPos, yPos, bWidth, bHeight);
            this.bInventory.callback = function () {
                _this.switch(_this.inventory);
            };
            this.bInventory.font = this.buttonFont;
            this.bInventory.textSize = this.buttonTextSize;
            this.bInventory.margin = bMargin;
            this.bWeapons = new HUDButton("Weapons", xPos + bWidth, yPos, bWidth, bHeight);
            this.bWeapons.callback = function () {
                _this.switch(_this.weapons);
            };
            this.bWeapons.font = this.buttonFont;
            this.bWeapons.textSize = this.buttonTextSize;
            this.bWeapons.margin = bMargin;
            this.add(this.bInventory);
            this.add(this.bWeapons);
        };
        HUDMenu.prototype.switch = function (element) {
            if(this.current !== undefined) {
                this.remove(this.current);
            }
            this.current = element;
            this.add(this.current);
            this.header.text = element.name;
        };
        return HUDMenu;
    })(HUDElement);
    vs.HUDMenu = HUDMenu;    
    var HUDItemList = (function (_super) {
        __extends(HUDItemList, _super);
        function HUDItemList(x, y, width, height, game, scrollLeft) {
                _super.call(this, x, y, width, height);
            this.labels = [];
            this.buttons = [];
            this.buttonLabel = "button";
            this.game = game;
            this.scrollbox = new HUDScrollBox(0, 0, 300, height, scrollLeft);
            this.add(this.scrollbox);
            this.sideBox = new HUDElement(300, 0, width - 300, height);
            this.sideBox.drawBorder = false;
            this.add(this.sideBox);
        }
        HUDItemList.prototype.createButtons = function (game) {
            var numButtons = 30;
            var bWidth = this.scrollbox.content.width;
            var bHeight = 30;
            var borderWidth = 1;
            var font = "Orbitron";
            var textSize = 20;
            var margin = 4;
            var button;
            var label;
            this.scrollbox.content.height = numButtons * bHeight;
            for(var i = 0; i < numButtons; i++) {
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
        };
        HUDItemList.prototype.rebuild = function () {
            var _this = this;
            this.buttons.forEach(function (button) {
                _this.scrollbox.content.remove(button);
            });
            this.buttons = [];
            this.createButtons(this.game);
            this.game.itemManager.changed = false;
        };
        HUDItemList.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
            this.checkButtons();
        };
        HUDItemList.prototype.checkButtons = function () {
            if(this.game.itemManager.changed) {
                this.rebuild();
            }
            var size = this.buttons.length;
            var button;
            for(var i = 0; i < size; i++) {
                button = this.buttons[i];
                if(button.clicked) {
                    this.buttonClicked(button, i);
                }
            }
        };
        HUDItemList.prototype.buttonClicked = function (button, index) {
            this.sideBox.text = button.label;
        };
        return HUDItemList;
    })(HUDElement);
    vs.HUDItemList = HUDItemList;    
    var HUDInventoryButton = (function (_super) {
        __extends(HUDInventoryButton, _super);
        function HUDInventoryButton(x, y, width, height, font, textSize, margin, name, size, wg, val, drawLabels) {
            if (typeof drawLabels === "undefined") { drawLabels = false; }
            var _this = this;
                _super.call(this, "", x, y, width, height);
            this._name = name;
            this._size = size;
            this._wg = wg;
            this._val = val;
            this.font = font;
            this.textSize = textSize;
            this.margin = margin;
            this.drawBorder = false;
            this._drawLabels = drawLabels;
            if(drawLabels) {
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
            this.children.forEach(function (e) {
                e.font = _this.font;
                e.textSize = _this.textSize;
                e.margin = _this.margin;
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
        Object.defineProperty(HUDInventoryButton.prototype, "itemName", {
            get: function () {
                return this._name;
            },
            set: function (n) {
                this._name = n;
                if(this._drawLabels) {
                    this._nameBox.text = "Name";
                } else {
                    this._nameBox.text = n + " (" + this.size + ")";
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDInventoryButton.prototype, "size", {
            get: function () {
                return this._size;
            },
            set: function (v) {
                this._size = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDInventoryButton.prototype, "wg", {
            get: function () {
                return this._wg;
            },
            set: function (n) {
                this._wg = n;
                if(this._drawLabels) {
                    this._wgBox.text = "WG";
                } else {
                    this._wgBox.text = " " + n;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HUDInventoryButton.prototype, "val", {
            get: function () {
                return this._val;
            },
            set: function (n) {
                this._val = n;
                if(this._drawLabels) {
                    this._valBox.text = "VAL";
                } else {
                    this._valBox.text = " " + n;
                }
            },
            enumerable: true,
            configurable: true
        });
        return HUDInventoryButton;
    })(HUDButton);
    vs.HUDInventoryButton = HUDInventoryButton;    
    var HUDInventory = (function (_super) {
        __extends(HUDInventory, _super);
        function HUDInventory(x, y, width, height, game) {
            var _this = this;
                _super.call(this, x, y, width, height, game, true);
            this.name = "Inventory";
            this.font = "Orbitron";
            this.backgroundColorActive = this.backgroundColorInactive = vs.Util.rgba(0, 0, 0, 0.7);
            this.scrollbox.content.drawBackground = false;
            this.scrollbox.content.drawBorder = false;
            this.scrollbox.scrollBar.drawBorder = false;
            this.scrollbox.localY = 24;
            this.scrollbox.height = height - 24;
            this.scrollbox.scrollBar.drawBackground = false;
            this.scrollbox.scrollBar.scrollGrip.backgroundColorActive = vs.Util.rgba(28, 47, 73, 0.9);
            this.scrollbox.scrollBar.scrollGrip.backgroundColorInactive = vs.Util.rgba(0, 0, 0, 0);
            this.scrollboxHeader = new HUDInventoryButton(this.scrollbox.content.localX, 0, this.scrollbox.content.width, 24, this.font, 12, 4, "", 0, 0, 0, true);
            this.add(this.scrollboxHeader);
            this.sideBox.drawBackground = false;
            this.headerBox = new HUDElement(0, 0, this.sideBox.width, 28);
            this.headerBox.textAutoWrap = false;
            this.headerBox.textSize = 20;
            this.headerBox.margin = 4;
            this.sideBox.add(this.headerBox);
            this.headerBox2 = new HUDElement(0, this.headerBox.height, this.sideBox.width, 20);
            this.headerBox2.textAutoWrap = false;
            this.headerBox2.textSize = 10;
            this.headerBox2.lineHeight = 12;
            this.headerBox2.margin = 4;
            this.sideBox.add(this.headerBox2);
            this.imageBox = new HUDElement(10, this.headerBox.height + this.headerBox2.height + 10, this.sideBox.width - 20, 64);
            this.imageBox.drawSprite = true;
            this.sideBox.add(this.imageBox);
            this.descriptionBox = new HUDElement(0, this.imageBox.localY + this.imageBox.height, this.sideBox.width, this.sideBox.height - (this.imageBox.localY + this.imageBox.height));
            this.descriptionBox.textSize = 14;
            this.descriptionBox.lineHeight = 16;
            this.sideBox.add(this.descriptionBox);
            this.children.forEach(function (child) {
                child.drawBackground = false;
                child.drawBorder = false;
                child.font = _this.font;
            });
            this.sideBox.children.forEach(function (child) {
                child.drawBackground = false;
                child.drawBorder = false;
                child.font = _this.font;
            });
            this.createButtons(game);
        }
        HUDInventory.prototype.createButtons = function (game) {
            var containers = game.itemManager.containers;
            var numButtons = containers.length;
            var bWidth = this.scrollbox.content.width;
            var bHeight = 24;
            var borderWidth = 1;
            var font = "Orbitron";
            var textSize = 12;
            var margin = 4;
            var colorActive = vs.Util.rgba(28, 47, 73, 0.9);
            var colorInactive = vs.Util.rgba(0, 0, 0, 0);
            var button;
            var label;
            var container;
            this.scrollbox.content.height = this.scrollbox.height * 2;
            for(var i = 0; i < numButtons; i++) {
                container = containers[i];
                label = container.name + " x " + container.size + "    WG " + container.totalWeight + " VAL " + container.totalValue;
                button = new HUDInventoryButton(0, bHeight * i, bWidth, bHeight, font, textSize, margin, container.name, container.size, container.totalWeight, container.totalValue);
                button.backgroundColorActive = colorActive;
                button.backgroundColorInactive = colorInactive;
                this.scrollbox.content.add(button);
                this.labels.push(label);
                this.buttons.push(button);
            }
        };
        HUDInventory.prototype.buttonClicked = function (button, index) {
            var containers = this.game.itemManager.containers;
            var c = containers[index];
            this.currentItem = c;
            this.headerBox.text = c.name;
            this.headerBox2.text = "    QTY  " + c.size + "   WG  " + c.totalWeight + "   VAL  " + c.totalValue;
            this.descriptionBox.text = "LEVEL   " + c.level + "\nVAL   " + c.value + "\nWG   " + c.weight + "\n\n    " + c.description;
            if(this.sprite) {
                this.imageBox.remove(this.sprite);
            }
            this.sprite = c.sprite;
            if(this.sprite) {
                this.imageBox.add(this.sprite);
            }
        };
        HUDInventory.prototype.clearSideBox = function () {
            this.currentItem = null;
            this.headerBox.text = "";
            this.headerBox2.text = "";
            this.descriptionBox.text = "";
            if(this.sprite) {
                this.imageBox.remove(this.sprite);
            }
            this.sprite = null;
        };
        HUDInventory.prototype.render = function (ctx) {
            _super.prototype.render.call(this, ctx);
            this.checkKeys();
        };
        HUDInventory.prototype.checkKeys = function () {
            if(this.currentItem) {
                if(vs.Keyboard.justPressed(vs.Keys.R)) {
                    this.currentItem.pop(this.game);
                }
                if(vs.Keyboard.justPressed(vs.Keys.E)) {
                    this.currentItem.use(this.game);
                }
                if(this.currentItem.size < 1) {
                    this.clearSideBox();
                }
            }
        };
        return HUDInventory;
    })(HUDItemList);
    vs.HUDInventory = HUDInventory;    
    var HUDWeapons = (function (_super) {
        __extends(HUDWeapons, _super);
        function HUDWeapons(x, y, width, height, game) {
                _super.call(this, x, y, width, height, game, false);
            this.name = "Weapons";
            this.buttonLabel = "Weapon";
            this.createButtons(game);
        }
        return HUDWeapons;
    })(HUDItemList);
    vs.HUDWeapons = HUDWeapons;    
})(vs || (vs = {}));
