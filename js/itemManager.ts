module vs {
    export class ItemManager {
        game: Game;

        weaponManager: WeaponManager;

        private _containers: ItemContainer[] = [];

        private _weaponContainers: ItemContainer[] = [];

        private _changed: bool;

        private _credits: number = 0;

        private _xp: number = 0;

        // How much weight you're carrying
        totalWeight: number = 0;

        // Total amount of weight you can carry
        maxWeight: number = 80;

        constructor (game:Game) {
            this.game = game;
        }

        add(item:Item) {
            var snd: snd.Sound;
            var effect = item.affector;
            if (effect.addToInventory) {
                var index = this.search(item);
                this.totalWeight += item.weight;
                if (index !== -1) {
                    this._containers[index].add(item);
                }
                else {
                    var container = new ItemContainer(item, this);
                    container.add(item);
                    this._containers.push(container);
                }
                this._changed = true;
                snd = this.game.assets.sounds["itemAdded"];
                
            }
            if (effect.xp) {
                this._xp += effect.xp;
            }
            if (effect.credit) {
                this._credits += effect.credit;
                snd = this.game.assets.sounds["moneyAdded"];
            }
            if (item.baseType == ItemType.AMMO) {
                this.weaponManager.addAmmo(item.value, item.container.gun);
                snd = this.game.assets.sounds["moneyAdded"];
            }
            if (item.baseType == ItemType.WEAPON) {
                var index = this.search(item);
                this.totalWeight += item.weight;
                if (index !== -1) {
                    this._weaponContainers[index].add(item);
                }
                else {
                    var container = new ItemContainer(item, this);
                    container.add(item);
                    this._weaponContainers.push(container);
                }
                this.changed = true;
                snd = this.game.assets.sounds["weaponAdded"];
            }
            this.alertPickedUp(item);

            if (snd) {
                snd.setGain(0.1);
                snd.play();
            }
        }

        remove(container: ItemContainer) {
            var index: number;
            if (container.type !== ItemType.WEAPON) {
                index = this._containers.indexOf(container);
                if (index !== -1) {
                    this._containers.splice(index, 1);
                    this._changed = true;
                }
            }
            else {
                index = this._weaponContainers.indexOf(container);
                if (index !== -1) {
                    this._weaponContainers.splice(index, 1);
                    this._changed = true;
                }
            }
        }

        restart() {
            this._containers = [];
            this._weaponContainers = [];
            this._credits = 0;
            this._xp = 0;
            this.totalWeight = 0;
            this.maxWeight = 100;
            this._changed = false;
        }
        
        // Returns true if there is enough weight to pick item up
        canPickup(item: Item): bool {
            if ((this.totalWeight + item.weight) <= this.maxWeight) return true;
            return false;
        }

        //remove(item: Item) {
        //    var index = this.items.indexOf(item);

        //    if (index !== -1) {
        //        this.items.splice(index, 1);
        //    }
        //}

        // Searches the containers to see if there is a matching container for the item.
        // If there is function will return the index of the container
        // If not the function will return -1
        search(item: Item) : number {
            var size: number;
            var container: ItemContainer;
            var i: number;
            if (item.baseType !== ItemType.WEAPON) {
                size = this._containers.length;
                for (i = 0; i < size; i++) {
                    container = this._containers[i];
                    if (container.name === item.name && container.level === item.level) {
                        return i;
                    }
                }
            }
            else {
                size = this._weaponContainers.length;
                for (i = 0; i < size; i++) {
                    container = this._weaponContainers[i];
                    if (container.name === item.name && container.level === item.level) {
                        return i;
                    }
                }
            }
            return -1;
        }

        // This checks to see if the current weapon exists
        hasWeapon(name: string) {
            var size = this._weaponContainers.length;
            var container: ItemContainer;
            var gun: string;
            for (var i = 0; i < size; i++) {
                container = this._weaponContainers[i];
                gun = container.items[0].container.gun;
                if (gun === name) {
                    return true;
                }
            }
            return false;
        }

        alert(item:Item) {
            Game.game.hud.alert("Pickup item? [E]\n\n  " + item.name + "\n    LVL  " + item.level + "\n    WG   " + item.weight + "\n    VAL  " + item.value);
        }

        alertPickedUp(item:Item) {
            var time = 3;
            Game.game.hud.queueMessage("You picked up " + item.name, time, true);
            //if (item instanceof Money) {
            //    Game.game.hud.queueMessage("+" + item.value + " Credits", time);
            //} else {
            //    Game.game.hud.queueMessage("You recieved " + item.name + " added to inventory", time);
            //}
        }

        print() {
            console.log("WG: " + this.totalWeight + "/" + this.maxWeight + " Encumbered: " + this.encumbered);
            this._containers.forEach((container: ItemContainer) =>{
                console.log("\Item: " + container.name + " lvl: " + container.level + "\n  Quantity: " + container.size + "\n  Value: " + container.value + " - Total: " + container.totalValue + "\n  WG: " + container.weight + " - Total: " + container.totalWeight + "\n  Description: " + container.description);

            });
        }

        get containers(): ItemContainer[] {
            return this._containers;
        }

        get weaponContainers(): ItemContainer[] {
            return this._weaponContainers;
        }

        get encumbered() : bool {
            return (this.totalWeight > this.maxWeight);
        }

        get changed(): bool {
            return this._changed;
        }
        set changed(val: bool) {
            this._changed = val;
        }
        get credits(): number {
            return this._credits;
        }
        set credits(v:number) {
            this._credits = v;
        }
        get xp(): number {
            return this._xp;
        }
        set xp(v: number) {
            this._xp = v;
        }
    }

    // This is a container that holds all of a certain type of item
    export class ItemContainer {
        manager: ItemManager;
        name: string;
        value: number;
        weight: number;
        description: string;
        level: number;
        type: number;

        items: Item[] = [];

        sprite: HUDSprite;

        constructor (item:Item, manager:ItemManager) {
            this.manager = manager;
            this.name = item.name;
            this.value = item.value;
            this.weight = item.weight;
            this.description = item.description;
            this.level = item.level;
            this.sprite = item.sprite;
            this.type = item.baseType;
        }

        add(item: Item) {
            if (item.name !== this.name || item.level !== this.level) {
                console.log("Error: Cannot add item: " + item.name + " lvl: " + item.level + " to Container: " + this.name + " lvl: " + this.level);
                return;
            }
            this.items.push(item);
        }

        pop(game:Game) : Item {
            if (this.size > 0) {
                var item = this.items[0];
                item.pop(game);
                this.items.splice(0, 1);
                this.manager.changed = true;
                this.manager.totalWeight -= item.weight;
                if (this.size == 0) {
                    this.manager.remove(this);
                }
                return item;
            }
            return null;
        }

        use(game:Game) {
            if (this.size > 0) {
                var item = this.items[0];
                if (item.use(game)) this.pop(game);
            }
        }


        
        

        //getProperties() {
        //    return 
        //}

        get size() : number {
            return this.items.length;
        }

        get totalValue(): number {
            return this.value * this.size;
        }

        get totalWeight(): number {
            return this.weight * this.size;
        }
    }
}