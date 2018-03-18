var vs;
(function (vs) {
    var ItemManager = (function () {
        function ItemManager(game) {
            this._containers = [];
            this._weaponContainers = [];
            this._credits = 0;
            this._xp = 0;
            this.totalWeight = 0;
            this.maxWeight = 80;
            this.game = game;
        }
        ItemManager.prototype.add = function (item) {
            var snd;
            var effect = item.affector;
            if(effect.addToInventory) {
                var index = this.search(item);
                this.totalWeight += item.weight;
                if(index !== -1) {
                    this._containers[index].add(item);
                } else {
                    var container = new ItemContainer(item, this);
                    container.add(item);
                    this._containers.push(container);
                }
                this._changed = true;
                snd = this.game.assets.sounds["itemAdded"];
            }
            if(effect.xp) {
                this._xp += effect.xp;
            }
            if(effect.credit) {
                this._credits += effect.credit;
                snd = this.game.assets.sounds["moneyAdded"];
            }
            if(item.baseType == vs.ItemType.AMMO) {
                this.weaponManager.addAmmo(item.value, item.container.gun);
                snd = this.game.assets.sounds["moneyAdded"];
            }
            if(item.baseType == vs.ItemType.WEAPON) {
                var index = this.search(item);
                this.totalWeight += item.weight;
                if(index !== -1) {
                    this._weaponContainers[index].add(item);
                } else {
                    var container = new ItemContainer(item, this);
                    container.add(item);
                    this._weaponContainers.push(container);
                }
                this.changed = true;
                snd = this.game.assets.sounds["weaponAdded"];
            }
            this.alertPickedUp(item);
            if(snd) {
                snd.setGain(0.1);
                snd.play();
            }
        };
        ItemManager.prototype.remove = function (container) {
            var index;
            if(container.type !== vs.ItemType.WEAPON) {
                index = this._containers.indexOf(container);
                if(index !== -1) {
                    this._containers.splice(index, 1);
                    this._changed = true;
                }
            } else {
                index = this._weaponContainers.indexOf(container);
                if(index !== -1) {
                    this._weaponContainers.splice(index, 1);
                    this._changed = true;
                }
            }
        };
        ItemManager.prototype.restart = function () {
            this._containers = [];
            this._weaponContainers = [];
            this._credits = 0;
            this._xp = 0;
            this.totalWeight = 0;
            this.maxWeight = 100;
            this._changed = false;
        };
        ItemManager.prototype.canPickup = function (item) {
            if((this.totalWeight + item.weight) <= this.maxWeight) {
                return true;
            }
            return false;
        };
        ItemManager.prototype.search = function (item) {
            var size;
            var container;
            var i;
            if(item.baseType !== vs.ItemType.WEAPON) {
                size = this._containers.length;
                for(i = 0; i < size; i++) {
                    container = this._containers[i];
                    if(container.name === item.name && container.level === item.level) {
                        return i;
                    }
                }
            } else {
                size = this._weaponContainers.length;
                for(i = 0; i < size; i++) {
                    container = this._weaponContainers[i];
                    if(container.name === item.name && container.level === item.level) {
                        return i;
                    }
                }
            }
            return -1;
        };
        ItemManager.prototype.hasWeapon = function (name) {
            var size = this._weaponContainers.length;
            var container;
            var gun;
            for(var i = 0; i < size; i++) {
                container = this._weaponContainers[i];
                gun = container.items[0].container.gun;
                if(gun === name) {
                    return true;
                }
            }
            return false;
        };
        ItemManager.prototype.alert = function (item) {
            vs.Game.game.hud.alert("Pickup item? [E]\n\n  " + item.name + "\n    LVL  " + item.level + "\n    WG   " + item.weight + "\n    VAL  " + item.value);
        };
        ItemManager.prototype.alertPickedUp = function (item) {
            var time = 3;
            vs.Game.game.hud.queueMessage("You picked up " + item.name, time, true);
        };
        ItemManager.prototype.print = function () {
            console.log("WG: " + this.totalWeight + "/" + this.maxWeight + " Encumbered: " + this.encumbered);
            this._containers.forEach(function (container) {
                console.log("\Item: " + container.name + " lvl: " + container.level + "\n  Quantity: " + container.size + "\n  Value: " + container.value + " - Total: " + container.totalValue + "\n  WG: " + container.weight + " - Total: " + container.totalWeight + "\n  Description: " + container.description);
            });
        };
        Object.defineProperty(ItemManager.prototype, "containers", {
            get: function () {
                return this._containers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemManager.prototype, "weaponContainers", {
            get: function () {
                return this._weaponContainers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemManager.prototype, "encumbered", {
            get: function () {
                return (this.totalWeight > this.maxWeight);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemManager.prototype, "changed", {
            get: function () {
                return this._changed;
            },
            set: function (val) {
                this._changed = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemManager.prototype, "credits", {
            get: function () {
                return this._credits;
            },
            set: function (v) {
                this._credits = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemManager.prototype, "xp", {
            get: function () {
                return this._xp;
            },
            set: function (v) {
                this._xp = v;
            },
            enumerable: true,
            configurable: true
        });
        return ItemManager;
    })();
    vs.ItemManager = ItemManager;    
    var ItemContainer = (function () {
        function ItemContainer(item, manager) {
            this.items = [];
            this.manager = manager;
            this.name = item.name;
            this.value = item.value;
            this.weight = item.weight;
            this.description = item.description;
            this.level = item.level;
            this.sprite = item.sprite;
            this.type = item.baseType;
        }
        ItemContainer.prototype.add = function (item) {
            if(item.name !== this.name || item.level !== this.level) {
                console.log("Error: Cannot add item: " + item.name + " lvl: " + item.level + " to Container: " + this.name + " lvl: " + this.level);
                return;
            }
            this.items.push(item);
        };
        ItemContainer.prototype.pop = function (game) {
            if(this.size > 0) {
                var item = this.items[0];
                item.pop(game);
                this.items.splice(0, 1);
                this.manager.changed = true;
                this.manager.totalWeight -= item.weight;
                if(this.size == 0) {
                    this.manager.remove(this);
                }
                return item;
            }
            return null;
        };
        ItemContainer.prototype.use = function (game) {
            if(this.size > 0) {
                var item = this.items[0];
                if(item.use(game)) {
                    this.pop(game);
                }
            }
        };
        Object.defineProperty(ItemContainer.prototype, "size", {
            get: function () {
                return this.items.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemContainer.prototype, "totalValue", {
            get: function () {
                return this.value * this.size;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemContainer.prototype, "totalWeight", {
            get: function () {
                return this.weight * this.size;
            },
            enumerable: true,
            configurable: true
        });
        return ItemContainer;
    })();
    vs.ItemContainer = ItemContainer;    
})(vs || (vs = {}));
