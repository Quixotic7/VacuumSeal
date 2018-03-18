//var audiomanager: snd.AudioManager;
//var sound: snd.Sound;

//window.onload = () =>{
//    audiomanager = new snd.AudioManager();
//    sound = audiomanager.createSound("media/singing.mp3");
    
//    this.animationFrame = () =>{
//        audiomanager.update();
//        requestAnimationFrame(this.animationFrame);
//    };
//    this.animationFrame();

//};

module snd {
    export class AudioManager {
        static POSITION_SCALAR: number = 0.2;

        ready: bool = false;
        context:webkitAudioContext;

        testSound: AudioBufferSourceNode;

        soundSource: AudioBufferSourceNode;
        soundBuffer: AudioBuffer;

        sounds: Sound[];

        mainVolume: GainNode;

        constructor () {
            try {
                this.context = new webkitAudioContext();
                this.ready = true;
                
            }
            catch (e) {
                alert("Web Audio API is not supported in this browser");
            }

            this.sounds = [];
            this.mainVolume = this.context.createGainNode();
            this.mainVolume.connect(this.context.destination);

            this.context.listener.setOrientation(0, 1, 0, 0, 0, 1);
        }

        setListener(x:number, y:number, z:number) {
            this.context.listener.setPosition(x * AudioManager.POSITION_SCALAR, y * AudioManager.POSITION_SCALAR, z);
        }

        loadSound(url:string, sound:Sound) {
            var context = this.context;
            var request = new XMLHttpRequest();
            request.open("GET", url, true);
            request.responseType = "arraybuffer";
            request.onload = () => {
                var audioData = request.response;
                this.makeSoundSource(audioData, sound);
            };
            request.send();
        }

        createSound(url:string):Sound {
            var snd = new Sound(this);
            this.loadSound(url, snd);
            this.sounds.push(snd);
            return snd;
        }

        createSound3d(url: string): Sound3d {
            var snd = new Sound3d(this);
            this.loadSound(url, snd);
            this.sounds.push(snd);
            return snd;
        }

        makeSoundSource(audiodata: AudioBuffer, sound:Sound) {
            //var source = this.context.createBufferSource();
            //var buffer = this.context.createBuffer(audiodata, false);
            //source.buffer = buffer;
            sound.load(audiodata);
        }

        update() {
            this.sounds.forEach((sound: Sound) =>{
                sound.update(1000 / 60);
            });
        }

        restart() {
            this.stopAll();
        }

        stopAll() {
            this.sounds.forEach((sound: Sound) =>{
                sound.stop();
            });
        }

        onready() {
        }

        setMainVolume(v: number, fadeTime?:number = 0.5) {
            var endTime = this.context.currentTime + fadeTime;
            this.mainVolume.gain.linearRampToValueAtTime(v, endTime);
        }
    }

    export class Sound {
        manager: AudioManager;
        context: webkitAudioContext;
        source: AudioBufferSourceNode;
        buffer: AudioBuffer;
        onload: { (): void; };

        gainNode: GainNode;

        constructor (manager:AudioManager) {
            this.manager = manager;
            this.context = manager.context;
            this.gainNode = this.context.createGainNode();
            this.gainNode.connect(this.manager.mainVolume);
            this.onload = function () { };
        }

        free() {
            this.source.noteOff(0);
            this.source.disconnect();
            this.gainNode = null;
            this.source = null;
            this.buffer = null;
        }

        update(delta: number) {
            //if (this._gain !== this.desiredGain) {
            //    this._gain = this.lerp(this._gain, this.desiredGain, 0.005);
            //    this.gainNode.gain.value = this._gain;
            //}

        }

        load(audiodata:AudioBuffer) {
            this.source = this.context.createBufferSource();
            this.buffer = this.context.createBuffer(audiodata, false);
            this.source.buffer = this.buffer;
            this.source.connect(this.gainNode);
            this.onload();
        }

        play(when?:number = 0, offset?:number = 0, duration?:number) {
            this.source.noteOff(0);
            this.rebuildSource();
            this._play(when, offset, duration);
        }

        loop(when?: number = 0, offset?: number = 0, duration?: number) {
            this.source.noteOff(0);
            this.rebuildSource();
            this.source.loop = true;
            this._play(when, offset, duration);
        }

        rebuildSource() {
            this.source = this.context.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(this.gainNode);
        }

        playOver(when?:number = 0, offset?:number = 0, duration?:number) {
            this.rebuildSource();
            this._play(when, offset, duration);
        }

        _play(when?:number = 0, offset?:number = 0, duration?:number) {
            when = this.context.currentTime + when;
            duration = duration || this.buffer.duration;
            this.source.noteOn(when, offset, duration);
        }

        stop(when?:number = 0) {
            this.source.loop = false;
            this.source.noteOff(when);
        }

        setGain(v: number, fadeDuration?: number = 0.5) {
            var endTime = this.context.currentTime + fadeDuration;
            this.gainNode.gain.linearRampToValueAtTime(v, endTime);
        }

        get volume() {
            return this.gainNode.gain.value;
        }

        get ready():bool {
            if (this.source && this.buffer) {
                return true;
            }
        }

        lerp(a: number, b: number, blend: number) {
            return a + (b - a) * blend;
        }

        copy(): Sound {
            var sound: Sound = new Sound(this.manager);
            sound.buffer = this.buffer;
            sound.rebuildSource();
            return sound;
        }
        
    }

    export class Sound3d extends Sound {
        panner: PannerNode;

        constructor (manager:AudioManager) {
            super(manager);
            this.panner = this.context.createPanner();
            this.panner.connect(this.gainNode);
        }

        free() {
            super.free();
            this.panner = null;
        }

        load(audiodata:AudioBuffer) {
            this.source = this.context.createBufferSource();
            this.buffer = this.context.createBuffer(audiodata, true);
            this.source.buffer = this.buffer;
            this.source.connect(this.panner);
            this.onload();
        }

        setPos(x: number, y: number, z: number) {
            this.panner.setPosition(x * AudioManager.POSITION_SCALAR, y * AudioManager.POSITION_SCALAR, z);
        }

        rebuildSource() {
            this.source = this.context.createBufferSource();
            this.source.buffer = this.buffer;
            this.source.connect(this.panner);
        }

        copy(): Sound3d {
            var sound: Sound3d = new Sound3d(this.manager);
            sound.buffer = this.buffer;
            sound.rebuildSource();
            return sound;
        }
    }


}