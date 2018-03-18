module vs {
    // This class is used for toggling the debug mode for printing out useful error messages
    export class D {
        static debug: bool = false;
        static drawBoundsRect: bool = false;
        static drawBoundsBox: bool = false;
        static drawCenter: bool = false;
        static renderLights: bool = true;
        static drawPlayerBoundingRect: bool = false;
        static outputKeycode: bool = false;
        static drawLaser: bool = false;

        static assert(b:bool, message:string) {
            if (b == false) {
                console.log(message);
            }
        }

    }

    // Generates unique, unsigned integer keys.
    export class HashKey {
        static private _counter: number = 0;
        
        static next() {
            return HashKey._counter++;
        }
    }
}