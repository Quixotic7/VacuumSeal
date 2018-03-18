var vs;
(function (vs) {
    var Keys = (function () {
        function Keys() { }
        Keys.UP = 38;
        Keys.DOWN = 40;
        Keys.LEFT = 37;
        Keys.RIGHT = 39;
        Keys.W = 87;
        Keys.A = 65;
        Keys.S = 83;
        Keys.D = 68;
        Keys.R = 82;
        Keys.Q = 81;
        Keys.E = 69;
        Keys.M = 77;
        Keys.Z = 90;
        Keys.X = 88;
        Keys.C = 67;
        Keys.V = 86;
        Keys.B = 66;
        Keys.N = 78;
        Keys.F = 70;
        Keys.G = 71;
        Keys.H = 72;
        Keys.J = 74;
        Keys.K = 75;
        Keys.L = 76;
        Keys.T = 84;
        Keys.Y = 89;
        Keys.U = 85;
        Keys.I = 73;
        Keys.O = 79;
        Keys.P = 80;
        Keys.PLUS = 187;
        Keys.MINUS = 189;
        Keys._1 = 49;
        Keys._2 = 50;
        Keys._3 = 51;
        Keys._4 = 52;
        Keys._5 = 53;
        Keys._6 = 54;
        Keys._7 = 55;
        Keys._8 = 56;
        Keys._9 = 57;
        Keys._0 = 48;
        Keys.SPACE = 32;
        Keys.ALT = 18;
        Keys.CTRL = 17;
        Keys.SHIFT = 16;
        Keys.ENTER = 13;
        Keys.ESC = 27;
        Keys.TAB = 9;
        Keys.TILDE = 192;
        Keys.BRACKETLEFT = 219;
        Keys.BRACKETRIGHT = 221;
        Keys.SEMICOLON = 186;
        Keys.QUOTES = 222;
        Keys.QUESTION = 191;
        Keys.GREATERTHAN = 190;
        Keys.LESSTHAN = 188;
        Keys.DELETE = 46;
        Keys.PAUSEBREAK = 19;
        return Keys;
    })();
    vs.Keys = Keys;    
    var Keyboard = (function () {
        function Keyboard() { }
        Keyboard.keyboardHandler = null;
        Keyboard.init = function init() {
            Keyboard.keyboardHandler = new KeyboardHandler();
        }
        Keyboard.check = function check(keyCode) {
            return Keyboard.keyboardHandler.check(keyCode);
        }
        Keyboard.checkKeyUp = function checkKeyUp(keyCode) {
            return Keyboard.keyboardHandler.checkKeyUp(keyCode);
        }
        Keyboard.justPressed = function justPressed(keyCode) {
            return Keyboard.keyboardHandler.justPressed(keyCode);
        }
        return Keyboard;
    })();
    vs.Keyboard = Keyboard;    
    var KeyboardHandler = (function () {
        function KeyboardHandler() {
            var _this = this;
            this.lastKeydown = -1;
            this.curKeyDown = -1;
            this.lastkeyup = -1;
            this.keycode = [];
            this.keyspressed = [];
            window.addEventListener("keydown", function (event) {
                return _this.keydown(event);
            }, false);
            window.addEventListener("keyup", function (event) {
                return _this.keyup(event);
            }, false);
        }
        KeyboardHandler.prototype.justPressed = function (keyCode) {
            if(this.keycode[keyCode] && !this.keyspressed[keyCode]) {
                this.keyspressed[keyCode] = true;
                return true;
            } else {
                if(!this.keycode[keyCode]) {
                    this.keyspressed[keyCode] = false;
                    return false;
                }
            }
            return false;
        };
        KeyboardHandler.prototype.keydown = function (event) {
            var k = event["keyCode"];
            this.keycode[k] = true;
            this.lastKeydown = this.curKeyDown;
            this.curKeyDown = k;
            if(vs.D.outputKeycode) {
                console.log("keyCode: " + k);
            }
            if(k == Keys.TAB) {
                event.preventDefault();
            }
        };
        KeyboardHandler.prototype.keyup = function (event) {
            var k = event["keyCode"];
            this.keycode[k] = false;
            this.lastkeyup = k;
            event.preventDefault();
        };
        KeyboardHandler.prototype.check = function (keyCode) {
            return this.keycode[keyCode];
        };
        KeyboardHandler.prototype.checkKeyUp = function (keyCode) {
            if(keyCode == this.lastkeyup) {
                this.lastkeyup = -1;
                return true;
            }
            this.lastkeyup = -1;
            return false;
        };
        return KeyboardHandler;
    })();
    vs.KeyboardHandler = KeyboardHandler;    
    var Mouse = (function () {
        function Mouse() { }
        Mouse.gameCanvas = null;
        Mouse.gameHandler = null;
        Mouse._position = null;
        Mouse.init = function init(gameCanvas) {
            Mouse.gameCanvas = gameCanvas;
            Mouse.gameHandler = new MouseHandler(gameCanvas);
            Mouse._position = new vs.Point(0, 0);
        }
        Mouse.down = function down() {
            return Mouse.gameHandler.leftMouse();
        }
        Mouse.over = function over() {
            return (Mouse.gameHandler.mouseout() == true);
        }
        Mouse.justClicked = function justClicked() {
            return Mouse.gameHandler.justClicked();
        }
        Mouse.mouseWheel = function mouseWheel() {
            return Mouse.gameHandler.getMouseWheel();
        }
        Object.defineProperty(Mouse, "x", {
            get: function () {
                var rect = Mouse.gameCanvas.getBoundingClientRect();
                return Math.floor(Math.max((Math.min(Mouse.gameHandler.getX() - rect.left - Mouse.gameCanvas.scrollTop, Mouse.gameCanvas.width)), 0));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Mouse, "y", {
            get: function () {
                var rect = Mouse.gameCanvas.getBoundingClientRect();
                return Math.floor(Math.max((Math.min((Mouse.gameHandler.getY() - rect.top - Mouse.gameCanvas.scrollLeft), Mouse.gameCanvas.height)), 0));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Mouse, "position", {
            get: function () {
                Mouse._position.x = Mouse.x;
                Mouse._position.y = Mouse.y;
                return Mouse._position;
            },
            enumerable: true,
            configurable: true
        });
        return Mouse;
    })();
    vs.Mouse = Mouse;    
    var MouseHandler = (function () {
        function MouseHandler(canvas) {
            var _this = this;
            this.mouseX = 0;
            this.mouseY = 0;
            this.canvas = canvas;
            canvas.addEventListener("mousemove", function (event) {
                return _this.mousemove(event);
            }, false);
            canvas.addEventListener("mousedown", function (event) {
                return _this.mousedown(event);
            }, false);
            canvas.addEventListener("mouseup", function (event) {
                return _this.mouseup(event);
            }, false);
            canvas.addEventListener("mouseout", function (event) {
                return _this.onmouseout(event);
            }, false);
            canvas.addEventListener("mouseover", function (event) {
                return _this.onmouseover(event);
            }, false);
            canvas.addEventListener("mousewheel", function (event) {
                return _this.onmousewheel(event);
            }, false);
        }
        MouseHandler.prototype.mousemove = function (event) {
            var e = event;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            if(this.mouseX == NaN) {
                this.mouseX = 0;
            }
            if(this.mouseY == NaN) {
                this.mouseY = 0;
            }
        };
        MouseHandler.prototype.mousedown = function (event) {
            var e = event;
            this._mousedown = true;
        };
        MouseHandler.prototype.mouseup = function (event) {
            this._mousedown = false;
        };
        MouseHandler.prototype.onmousewheel = function (event) {
            event.preventDefault();
            var e = event;
            this.wheelDelta = e.wheelDelta;
            return false;
        };
        MouseHandler.prototype.onmouseout = function (event) {
            this._mouseout = true;
        };
        MouseHandler.prototype.onmouseover = function (event) {
            this._mouseout = false;
        };
        MouseHandler.prototype.mouseout = function () {
            return this._mouseout;
        };
        MouseHandler.prototype.getMouseWheel = function () {
            var val = this.wheelDelta;
            this.wheelDelta = 0;
            return val;
        };
        MouseHandler.prototype.leftMouse = function () {
            return this._mousedown;
        };
        MouseHandler.prototype.rightMouse = function () {
            return false;
        };
        MouseHandler.prototype.justClicked = function () {
            if(this._mousedown && !this._justClicked) {
                this._justClicked = true;
                return true;
            }
            if(!this._mousedown) {
                this._justClicked = false;
                return false;
            }
        };
        MouseHandler.prototype.getX = function () {
            return this.mouseX;
        };
        MouseHandler.prototype.getY = function () {
            return this.mouseY;
        };
        return MouseHandler;
    })();
    vs.MouseHandler = MouseHandler;    
})(vs || (vs = {}));
