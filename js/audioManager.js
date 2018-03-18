var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var snd;
(function (snd) {
    var AudioManager = (function () {
        function AudioManager() {
            this.ready = false;
            try  {
                this.context = new webkitAudioContext();
                this.ready = true;
            } catch (e) {
                alert("Web Audio API is not supported in this browser");
            }
            this.sounds = [];
            this.mainVolume = this.context.createGainNode();
            this.mainVolume.connect(this.context.destination);
            this.context.listener.setOrientation(0, 1, 0, 0, 0, 1);
        }
        AudioManager.POSITION_SCALAR = 0.2;
        AudioManager.prototype.setListener = function (x, y, z) {
            this.context.listener.setPosition(x * AudioManager.POSITION_SCALAR, y * AudioManager.POSITION_SCALAR, z);
        };
        AudioManager.prototype.loadSound = function (url, sound) {
            var _this = this;
            var context = this.context;
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            request.onload = function () {
                var audioData = request.response;
                _this.makeSoundSource(audioData, sound);
            };
            request.send();
        };
        AudioManager.prototype.createSound = function (url) {
            var snd = new Sound(this);
            this.loadSound(url, snd);
            this.sounds.push(snd);
            return snd;
        };
        AudioManager.prototype.createSound3d = function (url) {
            var snd = new Sound3d(this);
            this.loadSound(url, snd);
            this.sounds.push(snd);
            return snd;
        };
        AudioManager.prototype.makeSoundSource = function (audiodata, sound) {
            sound.load(audiodata);
        };
        AudioManager.prototype.update = function () {
            this.sounds.forEach(function (sound) {
                sound.update(1000 / 60);
            });
        };
        AudioManager.prototype.restart = function () {
            this.stopAll();
        };
        AudioManager.prototype.stopAll = function () {
            this.sounds.forEach(function (sound) {
                sound.stop();
            });
        };
        AudioManager.prototype.onready = function () {
        };
        AudioManager.prototype.setMainVolume = function (v, fadeTime) {
            if (typeof fadeTime === "undefined") { fadeTime = 0.5; }
            var endTime = this.context.currentTime + fadeTime;
            this.mainVolume.gain.linearRampToValueAtTime(v, endTime);
        };
        return AudioManager;
    })();
    snd.AudioManager = AudioManager;    
    var Sound = (function () {
        function Sound(manager) {
            this.manager = manager;
            this.context = manager.context;
            this.gainNode = this.context.createGainNode();
            this.gainNode.connect(this.manager.mainVolume);
            this.onload = function () {
            };
        }
        Sound.prototype.free = function () {
            this.source.noteOff(0);
            this.source.disconnect();
            this.gainNode = null;
            this.source = null;
            this.buffer = null;
        };
        Sound.prototype.update = function (delta) {
        };
        Sound.prototype.load = function (audiodata) {
            this.source = this.context.createBufferSource();
            this.buffer = this.context.createBuffer(audiodata, false);
            this.source.buffer = this.buffer;
            this.source.connect(this.gainNode);
            this.onload();
        };
        Sound.prototype.play = function (when, offset, duration) {
            if (typeof when === "undefined") { when = 0; }
            if (typeof offset === "undefined") { offset = 0; }
            this.source.noteOff(0);
            this.rebuildSource();
            this._play(when, offset, duration);
        };
        Sound.prototype.loop = function (when, offset, duration) {
            if (typeof when === "undefined") { when = 0; }
            if (typeof offset === "undefined") { offset = 0; }
            this.source.noteOff(0);
            this.rebuildSource();
            this.source.loop = true;
            this._play(when, offset, duration);
        };
        Sound.prototype.rebuildSource = function () {
            this.source = this.context.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(this.gainNode);
        };
        Sound.prototype.playOver = function (when, offset, duration) {
            if (typeof when === "undefined") { when = 0; }
            if (typeof offset === "undefined") { offset = 0; }
            this.rebuildSource();
            this._play(when, offset, duration);
        };
        Sound.prototype._play = function (when, offset, duration) {
            if (typeof when === "undefined") { when = 0; }
            if (typeof offset === "undefined") { offset = 0; }
            when = this.context.currentTime + when;
            duration = duration || this.buffer.duration;
            this.source.noteOn(when, offset, duration);
        };
        Sound.prototype.stop = function (when) {
            if (typeof when === "undefined") { when = 0; }
            this.source.loop = false;
            this.source.noteOff(when);
        };
        Sound.prototype.setGain = function (v, fadeDuration) {
            if (typeof fadeDuration === "undefined") { fadeDuration = 0.5; }
            var endTime = this.context.currentTime + fadeDuration;
            this.gainNode.gain.linearRampToValueAtTime(v, endTime);
        };
        Object.defineProperty(Sound.prototype, "volume", {
            get: function () {
                return this.gainNode.gain.value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Sound.prototype, "ready", {
            get: function () {
                if(this.source && this.buffer) {
                    return true;
                }
            },
            enumerable: true,
            configurable: true
        });
        Sound.prototype.lerp = function (a, b, blend) {
            return a + (b - a) * blend;
        };
        Sound.prototype.copy = function () {
            var sound = new Sound(this.manager);
            sound.buffer = this.buffer;
            sound.rebuildSource();
            return sound;
        };
        return Sound;
    })();
    snd.Sound = Sound;    
    var Sound3d = (function (_super) {
        __extends(Sound3d, _super);
        function Sound3d(manager) {
                _super.call(this, manager);
            this.panner = this.context.createPanner();
            this.panner.connect(this.gainNode);
        }
        Sound3d.prototype.free = function () {
            _super.prototype.free.call(this);
            this.panner = null;
        };
        Sound3d.prototype.load = function (audiodata) {
            this.source = this.context.createBufferSource();
            this.buffer = this.context.createBuffer(audiodata, true);
            this.source.buffer = this.buffer;
            this.source.connect(this.panner);
            this.onload();
        };
        Sound3d.prototype.setPos = function (x, y, z) {
            this.panner.setPosition(x * AudioManager.POSITION_SCALAR, y * AudioManager.POSITION_SCALAR, z);
        };
        Sound3d.prototype.rebuildSource = function () {
            this.source = this.context.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(this.panner);
        };
        Sound3d.prototype.copy = function () {
            var sound = new Sound3d(this.manager);
            sound.buffer = this.buffer;
            sound.rebuildSource();
            return sound;
        };
        return Sound3d;
    })(Sound);
    snd.Sound3d = Sound3d;    
})(snd || (snd = {}));
