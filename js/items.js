var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var vs;
(function (vs) {
    var ItemType = (function () {
        function ItemType() { }
        ItemType.HEALTH = 1;
        ItemType.CASH = 2;
        ItemType.AMMO = 3;
        ItemType.WEAPON = 4;
        ItemType.WPNBlaster = {
            name: "Blaster 550D",
            SpriteName: "weapons",
            gun: "blaster",
            baseType: ItemType.WEAPON,
            frame: 0,
            value: 5,
            weight: 10,
            description: "This Standard issue Blaster is easy to conceal and provides an unlimited amount of ammo at the cost of a slow recharge period between shots."
        };
        ItemType.WPNMachineGun = {
            name: "RapidBlaster 2000",
            SpriteName: "weapons",
            gun: "machineGun",
            baseType: ItemType.WEAPON,
            frame: 1,
            value: 20,
            weight: 40,
            description: "Maul down hordes of alien scum with this high tech machinegun!"
        };
        ItemType.WPNSticky = {
            name: "Sticky Light-nade",
            SpriteName: "weapons",
            gun: "sticky",
            baseType: ItemType.WEAPON,
            frame: 2,
            value: 40,
            weight: 35,
            description: "Light your path and destroy your foes, what could be better?"
        };
        ItemType.HealthPackSmall = {
            name: "Small Survival Kit",
            SpriteName: "items",
            baseType: ItemType.HEALTH,
            frame: 24,
            value: 10,
            weight: 2
        };
        ItemType.HealthPackMed = {
            name: "Med Survival Kit",
            SpriteName: "items",
            baseType: ItemType.HEALTH,
            frame: 25,
            value: 20,
            weight: 4
        };
        ItemType.HealthPackLarge = {
            name: "Large Survival Kit",
            SpriteName: "items",
            baseType: ItemType.HEALTH,
            frame: 26,
            value: 50,
            weight: 10
        };
        ItemType.Cash1 = {
            name: "1 Credit Chip",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 16,
            value: 1,
            weight: 0
        };
        ItemType.Cash5 = {
            name: "5 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 17,
            value: 5,
            weight: 0
        };
        ItemType.Cash10 = {
            name: "10 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 18,
            value: 10,
            weight: 0
        };
        ItemType.Cash20 = {
            name: "20 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 19,
            value: 20,
            weight: 0
        };
        ItemType.Cash50 = {
            name: "50 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 20,
            value: 50,
            weight: 0
        };
        ItemType.Cash100 = {
            name: "100 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 21,
            value: 100,
            weight: 0
        };
        ItemType.AmmoShotgunCarton = {
            name: "a Carton of shotgun shells",
            SpriteName: "items",
            gun: "shotgun",
            baseType: ItemType.AMMO,
            frame: 8,
            value: 20,
            weight: 0.1
        };
        ItemType.AmmoShotgunClip = {
            name: "a clip of shotgun shells",
            SpriteName: "items",
            gun: "shotgun",
            baseType: ItemType.AMMO,
            frame: 9,
            value: 10,
            weight: 0.1
        };
        ItemType.AmmoMachinegunCarton = {
            name: "a carton of machinegun bullets",
            SpriteName: "items",
            gun: "machineGun",
            baseType: ItemType.AMMO,
            frame: 10,
            value: 100,
            weight: 0.01
        };
        ItemType.AmmoMachinegunClip = {
            name: "a clip of machinegun bullets",
            SpriteName: "items",
            gun: "machineGun",
            baseType: ItemType.AMMO,
            frame: 11,
            value: 50,
            weight: 0.01
        };
        ItemType.AmmoSticky = {
            name: "a bundle of light-nades",
            SpriteName: "items",
            gun: "sticky",
            baseType: ItemType.AMMO,
            frame: 2,
            value: 6,
            weight: 1
        };
        return ItemType;
    })();
    vs.ItemType = ItemType;    
    var Item = (function () {
        function Item(container) {
            this.name = "";
            this.value = 1;
            this.weight = 1;
            this.description = "";
            this.level = 1;
            this.xp = 1;
            this.autoPickup = false;
            this.container = container;
            this.baseType = container.baseType;
        }
        Item.prototype.use = function (game) {
            return true;
        };
        Item.prototype.pop = function (game) {
        };
        Object.defineProperty(Item.prototype, "affector", {
            get: function () {
                var e = {
                };
                return e;
            },
            enumerable: true,
            configurable: true
        });
        return Item;
    })();
    vs.Item = Item;    
    var HealthPotion = (function (_super) {
        __extends(HealthPotion, _super);
        function HealthPotion(container) {
                _super.call(this, container);
            this.name = container.name;
            this.value = container.value;
            this.weight = container.weight;
            this.description = "Did you get hurt while working in the mines? No lawsuits here. This CeresCorp survial kit will restore " + this.value + " points of health";
            this.level = 1;
            this.sprite = new vs.HUDSprite(container.SpriteName, container.frame, 64, 64);
        }
        HealthPotion.prototype.use = function (game) {
            game.player.effect(this.affector);
            return true;
        };
        Object.defineProperty(HealthPotion.prototype, "affector", {
            get: function () {
                var value = this.value;
                console.log("Item: " + this.name + " effect value: " + value);
                var e = {
                    type: vs.EffectType.HEALTH,
                    addToInventory: true,
                    hp: value,
                    xp: this.xp
                };
                return e;
            },
            enumerable: true,
            configurable: true
        });
        return HealthPotion;
    })(Item);
    vs.HealthPotion = HealthPotion;    
    var Money = (function (_super) {
        __extends(Money, _super);
        function Money(container) {
                _super.call(this, container);
            this.autoPickup = true;
            this.name = container.name;
            this.value = container.value;
            this.weight = 0;
            this.description = "Use this virtual money to buy shit";
            this.level = 0;
            this.sprite = new vs.HUDSprite("items", 2, 64, 64);
        }
        Object.defineProperty(Money.prototype, "affector", {
            get: function () {
                var e = {
                    credit: this.value
                };
                return e;
            },
            enumerable: true,
            configurable: true
        });
        return Money;
    })(Item);
    vs.Money = Money;    
    var Ammo = (function (_super) {
        __extends(Ammo, _super);
        function Ammo(container) {
                _super.call(this, container);
            this.autoPickup = true;
            this.gun = container.gun;
            this.name = container.name;
            this.value = container.value;
            this.weight = this.value * container.weight;
            this.description = "Use this virtual money to buy shit";
            this.level = 0;
            this.sprite = new vs.HUDSprite("items", 2, 64, 64);
        }
        Object.defineProperty(Ammo.prototype, "affector", {
            get: function () {
                var e = {
                    type: vs.EffectType.AMMO
                };
                return e;
            },
            enumerable: true,
            configurable: true
        });
        return Ammo;
    })(Item);
    vs.Ammo = Ammo;    
    var WPNItem = (function (_super) {
        __extends(WPNItem, _super);
        function WPNItem(container) {
                _super.call(this, container);
            this.autoPickup = false;
            this.gun = container.gun;
            this.name = container.name;
            this.value = container.value;
            this.weight = container.weight;
            this.description = container.description;
            this.level = 0;
            this.sprite = new vs.HUDSprite("weapons", 2, 64, 64);
        }
        WPNItem.prototype.use = function (game) {
            game.player.weaponManager.switchTo(this.gun);
            return false;
        };
        WPNItem.prototype.pop = function (game) {
            game.player.weaponManager.switchTo("empty");
        };
        Object.defineProperty(WPNItem.prototype, "affector", {
            get: function () {
                var e = {
                    type: vs.EffectType.WEAPON
                };
                return e;
            },
            enumerable: true,
            configurable: true
        });
        return WPNItem;
    })(Item);
    vs.WPNItem = WPNItem;    
    var Frostbite = (function (_super) {
        __extends(Frostbite, _super);
        function Frostbite(container) {
                _super.call(this, container);
            this.name = "Frostbite";
            this.value = 20;
            this.weight = 2;
            this.description = "Indroduce your victims to a cruel and painful death";
            this.level = 1;
            this.sprite = new vs.HUDSprite("items", 3, 64, 64);
        }
        Object.defineProperty(Frostbite.prototype, "affector", {
            get: function () {
                var e = {
                    addToInventory: true,
                    hp: 10,
                    xp: 1
                };
                return e;
            },
            enumerable: true,
            configurable: true
        });
        return Frostbite;
    })(Item);
    vs.Frostbite = Frostbite;    
    var ItemSprite = (function (_super) {
        __extends(ItemSprite, _super);
        function ItemSprite(x, y, manager, itemType) {
            if (typeof itemType === "undefined") { itemType = -1; }
                _super.call(this, x, y, "items");
            this.itemMangager = manager;
            var list = [
                vs.Random.createProportion(ItemType.CASH, 40), 
                vs.Random.createProportion(ItemType.HEALTH, 20), 
                vs.Random.createProportion(ItemType.AMMO, 30), 
                vs.Random.createProportion(ItemType.WEAPON, 10), 
                
            ];
            var type;
            if(itemType === -1) {
                type = vs.Random.Choose(list);
            } else {
                type = itemType;
            }
            switch(type) {
                case ItemType.CASH: {
                    this.createMoney();
                    break;

                }
                case ItemType.HEALTH: {
                    this.createHealth();
                    break;

                }
                case ItemType.AMMO: {
                    this.createAmmo();
                    break;

                }
                case ItemType.WEAPON: {
                    this.createWeapon();
                    break;

                }
            }
            this.zIndex = 10;
            this.regX = vs.Random.range(28, 36);
            this.regY = vs.Random.range(28, 36);
            this.rotation = vs.Random.range(0, 360);
            this.x += this.regX;
            this.y += this.regY;
            this.boundX = -5;
            this.boundY = -5;
            this.boundWidth = 10;
            this.boundHeight = 10;
        }
        ItemSprite.prototype.createHealth = function () {
            var list = [
                vs.Random.createProportion(ItemType.HealthPackSmall, 50), 
                vs.Random.createProportion(ItemType.HealthPackMed, 30), 
                vs.Random.createProportion(ItemType.HealthPackLarge, 20)
            ];
            this.createItem(list);
        };
        ItemSprite.prototype.createMoney = function () {
            var list = [
                vs.Random.createProportion(ItemType.Cash1, 24), 
                vs.Random.createProportion(ItemType.Cash5, 22), 
                vs.Random.createProportion(ItemType.Cash10, 22), 
                vs.Random.createProportion(ItemType.Cash20, 18), 
                vs.Random.createProportion(ItemType.Cash50, 10), 
                vs.Random.createProportion(ItemType.Cash100, 4)
            ];
            this.createItem(list);
        };
        ItemSprite.prototype.createAmmo = function () {
            var list = [
                vs.Random.createProportion(ItemType.AmmoMachinegunCarton, 25), 
                vs.Random.createProportion(ItemType.AmmoMachinegunClip, 40), 
                vs.Random.createProportion(ItemType.AmmoSticky, 35), 
                
            ];
            this.createItem(list);
        };
        ItemSprite.prototype.createWeapon = function () {
            var list = vs.Game.game.world.weaponRatios;
            if(list.length > 0) {
                this.createItem(list);
            }
        };
        ItemSprite.prototype.createItem = function (list) {
            var itemContainer = vs.Random.Choose(list);
            switch(itemContainer.baseType) {
                case ItemType.CASH: {
                    this.item = new Money(itemContainer);
                    break;

                }
                case ItemType.HEALTH: {
                    this.item = new HealthPotion(itemContainer);
                    break;

                }
                case ItemType.AMMO: {
                    this.item = new Ammo(itemContainer);
                    break;

                }
                case ItemType.WEAPON: {
                    this.item = new WPNItem(itemContainer);
                    break;

                }
            }
            this.type = itemContainer.baseType;
            this.changeImage(itemContainer.SpriteName, itemContainer.frame, 64, 64);
        };
        ItemSprite.prototype.collide = function (e, obj) {
            if(obj instanceof vs.Player) {
                if(this.item.autoPickup) {
                    this.pickup();
                } else {
                    this.itemMangager.alert(this.item);
                    if(vs.Keyboard.check(vs.Keys.E)) {
                        if(this.itemMangager.canPickup(this.item)) {
                            this.pickup();
                        } else {
                            vs.Game.game.hud.queueMessage("You can't carry that", 1, true);
                        }
                    }
                }
            }
        };
        ItemSprite.prototype.pickup = function () {
            this.itemMangager.add(this.item);
            this.visible = false;
            this.exists = false;
        };
        return ItemSprite;
    })(vs.Sprite);
    vs.ItemSprite = ItemSprite;    
})(vs || (vs = {}));
