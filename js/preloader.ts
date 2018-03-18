
module vs {

    // This defines an item for the manifest
    // id: this should be some sort of name which will be used to get the item
    // src: this should be the path to the item
    // type: this should be the type, valid options, "image", "audio"
    // TODO: right now this only handles images, will need to implement methods for handle other types
    // also need to have a function for error checking to assist debugging, for now I recommend
    // testing each time you add a new asset to make sure it works before doing other things.
    export interface manifestItem {
        type: string;
        id: string;
        src: string;
    }

    // This loads the items in a given manifest.
    // the Callback function should be set as it will be called once everything is finished loading
    // TODO: add a progress callback or method that sends a variable relating to how much has been loaded
    // this could be done by comparing itemsLoaded to totalItems
    export class Preloader {
        private manifest: manifestItem[];
        private itemsLoaded: number = 0;
        private totalItems: number = 0;
        private _ready: bool = false;


        percentDone: number = 0;
        images: HTMLImageElement[];
        sounds: snd.Sound[];
        sounds3d: snd.Sound3d[];
        callback: () => void;

        soundManager: snd.AudioManager;

        constructor (manifest: manifestItem[]) {
            this.manifest = manifest;
            this.totalItems = this.manifest.length;
            this.soundManager = new snd.AudioManager;
            this.images = [];
            this.sounds = [];
            this.sounds3d = [];

            

            for (var i = 0; i < this.totalItems; ++i) {
                var item = this.manifest[i];
                if (item.type == "image") {
                    var img = new Image();
                    img.src = this.manifest[i].src;
                    img.onload = () => {
                        this.itemLoaded("Image Loaded");
                    };
                    this.images[item.id] = img;
                }
                else if (item.type == "audio") {
                    var sound: snd.Sound = this.soundManager.createSound(item.src);
                    sound.onload = () => {
                        this.itemLoaded("Sound Loaded");
                    };
                    this.sounds[item.id] = sound;
                } else if (item.type == "sound3d") {
                    var sound: snd.Sound3d = this.soundManager.createSound3d(item.src);
                    sound.onload = () => {
                        this.itemLoaded("Sound3d Loaded");
                    };
                    this.sounds3d[item.id] = sound;
                }

            }


        }

        itemLoaded(message: String) {
            this.itemsLoaded++;
            this.percentDone = Math.floor((this.itemsLoaded / this.totalItems) * 100);
            console.log(message + " Percent Done = " + this.percentDone);
            if(D.debug) document.getElementById("infoDIV").innerHTML = "Loading " + this.percentDone + "% Done";
            this.checkIfReady();
        }

        checkIfReady() {
            if (this.itemsLoaded == this.manifest.length) {
                console.log("We're ready freddy!");
                this._ready = true;
                if (this.callback) this.callback();
            }
        }
    }
}