/// <reference path="game.ts" />

module vs {

    // This class is just for quickly getting keycodes and to make your code more human readable
    export class Keys {
        static UP: number = 38;
        static DOWN: number = 40;
        static LEFT: number = 37;
        static RIGHT: number = 39;

        static W: number = 87;
        static A: number = 65;
        static S: number = 83;
        static D: number = 68;

        static R: number = 82;
        static Q: number = 81;

        static E: number = 69;

        static M: number = 77;

        static Z: number = 90;
        static X: number = 88;
        static C: number = 67;
        static V: number = 86;
        static B: number = 66;
        static N: number = 78;
        static F: number = 70;
        static G: number = 71;
        static H: number = 72;
        static J: number = 74;
        static K: number = 75;
        static L: number = 76;
        static T: number = 84;
        static Y: number = 89;
        static U: number = 85;
        static I: number = 73;
        static O: number = 79;
        static P: number = 80;

        static PLUS: number = 187;
        static MINUS: number = 189;

        static _1: number = 49;
        static _2: number = 50;
        static _3: number = 51;
        static _4: number = 52;
        static _5: number = 53;
        static _6: number = 54;
        static _7: number = 55;
        static _8: number = 56;
        static _9: number = 57;
        static _0: number = 48;

        static SPACE: number = 32;
        static ALT: number = 18;
        static CTRL: number = 17;
        static SHIFT: number = 16;
        static ENTER: number = 13;
        static ESC: number = 27;
        static TAB: number = 9;
        static TILDE: number = 192;
        static BRACKETLEFT: number = 219;
        static BRACKETRIGHT: number = 221;
        static SEMICOLON: number = 186;
        static QUOTES: number = 222;
        static QUESTION: number = 191;
        static GREATERTHAN: number = 190;
        static LESSTHAN: number = 188;
        static DELETE: number = 46;
        static PAUSEBREAK: number = 19;

    }


    // This is a static wrapper for the KeyboardHandler class to provide easy access.
    export class Keyboard {
        private static keyboardHandler: KeyboardHandler;

        static init() {
            Keyboard.keyboardHandler = new KeyboardHandler();
        }

        static check(keyCode:any): bool {
            return Keyboard.keyboardHandler.check(keyCode);
        }

        static checkKeyUp(keyCode: any) : bool {
            return Keyboard.keyboardHandler.checkKeyUp(keyCode);
        }
        static justPressed(keyCode: any) : bool {
            return Keyboard.keyboardHandler.justPressed(keyCode);
        }
    }

    // This is the internal class for handling the Keyboard
    export class KeyboardHandler {
        private keycode: any[];
        private keyspressed: any[];
        private lastKeydown: number = -1;
        private curKeyDown: number = -1;
        private lastkeyup: number = -1;


        constructor () {
            this.keycode = [];
            this.keyspressed = [];
            window.addEventListener("keydown", event => this.keydown(event), false);
            window.addEventListener("keyup", event => this.keyup(event), false);
        }

        justPressed(keyCode: any) : bool {
            if (this.keycode[keyCode] && !this.keyspressed[keyCode]) {
                this.keyspressed[keyCode] = true;
                return true;
            }
            else if(!this.keycode[keyCode]){
                this.keyspressed[keyCode] = false;
                return false;
            }
            return false;
        }

        keydown(event:Event) {
            var k = event["keyCode"];
            this.keycode[k] = true;

            this.lastKeydown = this.curKeyDown;
            this.curKeyDown = k;
            
            if(D.outputKeycode)
                console.log("keyCode: " + k);

            if(k == Keys.TAB)
                event.preventDefault();
        }

        keyup(event:Event) {
            var k = event["keyCode"];
            this.keycode[k] = false;
            this.lastkeyup = k;
            event.preventDefault();
        }

        check(keyCode: any) {
            return this.keycode[keyCode];
        }

        //checkKeyJustPressed(keyCode: any) {
        //    if (keyCode == this.curKeyDown) {
        //        if (this.curKeyDown !== this.lastKeydown) {
        //            this.lastKeydown = this.curKeyDown;
        //            return true;
        //        }
        //    }
        //    return false;
        //}

        checkKeyUp(keyCode: any) {
            if (keyCode == this.lastkeyup) {
                this.lastkeyup = -1;
                return true;
            }
            this.lastkeyup = -1;
            return false;
        }
    }

    export class Mouse {
        private static gameCanvas: HTMLCanvasElement;
        private static gameHandler: MouseHandler;
        private static _position: Point;

        static init(gameCanvas:HTMLCanvasElement) {
            Mouse.gameCanvas = gameCanvas;
            Mouse.gameHandler = new MouseHandler(gameCanvas);
            Mouse._position = new Point(0, 0);
        }
        //static mouseDownWindow() {
        //    return Mouse.windowHandler.leftMouse();
        //}
        static down() {
            return Mouse.gameHandler.leftMouse();
        }
        static over() {
            return (Mouse.gameHandler.mouseout() == true);
        }
        static justClicked() {
            return Mouse.gameHandler.justClicked();
        }

        static mouseWheel(): number {
            return Mouse.gameHandler.getMouseWheel();
        }

        //static mouseOverWindowCanvas() {
        //    return (Mouse.windowHandler.mouseout() == true);
        //}
        //static get windowX() {
        //    var rect = Mouse.windowCanvas.getBoundingClientRect();
        //    return  Math.floor(Math.max((Math.min(Mouse.windowHandler.getX() - rect.left - Mouse.windowCanvas.scrollTop, Mouse.windowCanvas.width)), 0));
        //}
        //static get windowY() {
        //    var rect = Mouse.windowCanvas.getBoundingClientRect();
        //    return Math.floor(Math.max((Math.min((Mouse.windowHandler.getY() - rect.top - Mouse.windowCanvas.scrollLeft), Mouse.windowCanvas.height)), 0));
        //}
        static get x() {
            var rect = Mouse.gameCanvas.getBoundingClientRect();
            return  Math.floor(Math.max((Math.min(Mouse.gameHandler.getX() - rect.left - Mouse.gameCanvas.scrollTop, Mouse.gameCanvas.width)), 0));
        }
        static get y() {
            var rect = Mouse.gameCanvas.getBoundingClientRect();
            return Math.floor(Math.max((Math.min((Mouse.gameHandler.getY() - rect.top - Mouse.gameCanvas.scrollLeft), Mouse.gameCanvas.height)), 0));
        }

        static get position() : Point {
            Mouse._position.x = Mouse.x;
            Mouse._position.y = Mouse.y;
            return Mouse._position;
        }

        //static getLocalX() {
        //    return Mouse.getX() - Game.game.world.camera.x;
        //}
        
        //static getLocalY() {
        //    return Mouse.getY() - Game.game.world.camera.y;
        //}
    }

    export class MouseHandler {
        private mouseX: number = 0;
        private mouseY: number = 0;
        private _mousedown: bool;
        private canvas: HTMLCanvasElement;
        private _mouseout: bool;
        private _justClicked: bool;
        private wheelDelta: number;

        constructor (canvas:HTMLCanvasElement) {
            this.canvas = canvas;
            canvas.addEventListener("mousemove", event => this.mousemove(event), false);
            canvas.addEventListener("mousedown", event => this.mousedown(event), false);
            canvas.addEventListener("mouseup", event => this.mouseup(event), false);
            canvas.addEventListener("mouseout", event => this.onmouseout(event), false);
            canvas.addEventListener("mouseover", event => this.onmouseover(event), false);
            canvas.addEventListener("mousewheel", event => this.onmousewheel(event), false);
        }

        mousemove(event:Event) {
            //var rect = this.canvas.getBoundingClientRect();
            //var root = this.canvas;

            var e = <MouseEvent>event;
            //this.mouseX = e.clientX - rect.left - root.scrollTop;
            //this.mouseY = e.clientY - rect.top - root.scrollTop;

            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            if (this.mouseX == NaN) this.mouseX = 0;
            if (this.mouseY == NaN) this.mouseY = 0;

            // console.log("Mouse: " + this.mouseX + " : " + this.mouseY);
        }

        mousedown(event: Event) {
            var e = <MouseEvent>event;
            this._mousedown = true;
        }

        mouseup(event: Event) {
            this._mousedown = false;
        }

        onmousewheel(event: Event) {
            event.preventDefault();
            var e = <MouseWheelEvent>event;

            this.wheelDelta = e.wheelDelta;
            return false;
        }

        onmouseout(event: Event) {
            this._mouseout = true;
        }

        onmouseover(event: Event) {
            this._mouseout = false;
        }

        mouseout() {
            return this._mouseout;
        }

        getMouseWheel() {
            var val = this.wheelDelta;
            this.wheelDelta = 0;
            return val;
        }

        leftMouse() {
            return this._mousedown;
        }

        rightMouse() {
            return false;
        }
        justClicked() {
            if (this._mousedown && !this._justClicked) {
                this._justClicked = true;
                return true;
            }
            if (!this._mousedown) {
                this._justClicked = false;
                return false;
            }
        }

        // Returns the location of the mouse relative to the window
        getX() {
            //var scalar = Game.game.canvas.width / Game.game.gameWidth;
            return this.mouseX;
        }

        getY() {
            //var scalar = Game.game.canvas.width / Game.game.gameWidth;
            return this.mouseY;
        }

        
    
    }
}