var vs;
(function (vs) {
    var D = (function () {
        function D() { }
        D.debug = false;
        D.drawBoundsRect = false;
        D.drawBoundsBox = false;
        D.drawCenter = false;
        D.renderLights = true;
        D.drawPlayerBoundingRect = false;
        D.outputKeycode = false;
        D.drawLaser = false;
        D.assert = function assert(b, message) {
            if(b == false) {
                console.log(message);
            }
        }
        return D;
    })();
    vs.D = D;    
    var HashKey = (function () {
        function HashKey() { }
        HashKey._counter = 0;
        HashKey.next = function next() {
            return HashKey._counter++;
        }
        return HashKey;
    })();
    vs.HashKey = HashKey;    
})(vs || (vs = {}));
