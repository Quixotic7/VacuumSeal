var vs;
(function (vs) {
    var Preloader = (function () {
        function Preloader(manifest) {
            var _this = this;
            this.itemsLoaded = 0;
            this.totalItems = 0;
            this._ready = false;
            this.percentDone = 0;
            this.manifest = manifest;
            this.totalItems = this.manifest.length;
            this.soundManager = new snd.AudioManager();
            this.images = [];
            this.sounds = [];
            this.sounds3d = [];
            for(var i = 0; i < this.totalItems; ++i) {
                var item = this.manifest[i];
                if(item.type == "image") {
                    var img = new Image();
                    img.src = this.manifest[i].src;
                    img.onload = function () {
                        _this.itemLoaded("Image Loaded");
                    };
                    this.images[item.id] = img;
                } else {
                    if(item.type == "audio") {
                        var sound = this.soundManager.createSound(item.src);
                        sound.onload = function () {
                            _this.itemLoaded("Sound Loaded");
                        };
                        this.sounds[item.id] = sound;
                    } else {
                        if(item.type == "sound3d") {
                            var sound = this.soundManager.createSound3d(item.src);
                            sound.onload = function () {
                                _this.itemLoaded("Sound3d Loaded");
                            };
                            this.sounds3d[item.id] = sound;
                        }
                    }
                }
            }
        }
        Preloader.prototype.itemLoaded = function (message) {
            this.itemsLoaded++;
            this.percentDone = Math.floor((this.itemsLoaded / this.totalItems) * 100);
            console.log(message + " Percent Done = " + this.percentDone);
            if(vs.D.debug) {
                document.getElementById("infoDIV").innerHTML = "Loading " + this.percentDone + "% Done";
            }
            this.checkIfReady();
        };
        Preloader.prototype.checkIfReady = function () {
            if(this.itemsLoaded == this.manifest.length) {
                console.log("We're ready freddy!");
                this._ready = true;
                if(this.callback) {
                    this.callback();
                }
            }
        };
        return Preloader;
    })();
    vs.Preloader = Preloader;    
})(vs || (vs = {}));
