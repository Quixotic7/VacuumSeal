module vs {
    export interface ItemTypeContainer {
        name?: string;
        gun?: string;
        SpriteName: string;
        baseType: number;
        frame: number;
        value: number;
        weight: number;
        description?: string;
    }

    export class ItemType {
        static HEALTH: number = 1;
        static CASH: number = 2;
        static AMMO: number = 3;
        static WEAPON: number = 4;

        static WPNBlaster: ItemTypeContainer = {
            name: "Blaster 550D",
            SpriteName: "weapons",
            gun: "blaster",
            baseType: ItemType.WEAPON,
            frame: 0,
            value: 5,
            weight: 10,
            description: "This Standard issue Blaster is easy to conceal and provides an unlimited amount of ammo at the cost of a slow recharge period between shots."
        }

        static WPNMachineGun: ItemTypeContainer = {
            name: "RapidBlaster 2000",
            SpriteName: "weapons",
            gun: "machineGun",
            baseType: ItemType.WEAPON,
            frame: 1,
            value: 20,
            weight: 40,
            description: "Maul down hordes of alien scum with this high tech machinegun!"
        }

        static WPNSticky: ItemTypeContainer = {
            name: "Sticky Light-nade",
            SpriteName: "weapons",
            gun: "sticky",
            baseType: ItemType.WEAPON,
            frame: 2,
            value: 40,
            weight: 35,
            description: "Light your path and destroy your foes, what could be better?"
        }

        static HealthPackSmall: ItemTypeContainer = {
            name: "Small Survival Kit",
            SpriteName: "items",
            baseType: ItemType.HEALTH,
            frame: 24,
            value: 10,
            weight: 2
        }
        static HealthPackMed: ItemTypeContainer = {
            name: "Med Survival Kit",
            SpriteName: "items",
            baseType: ItemType.HEALTH,
            frame: 25,
            value: 20,
            weight: 4
        };
        static HealthPackLarge: ItemTypeContainer = {
            name: "Large Survival Kit",
            SpriteName: "items",
            baseType: ItemType.HEALTH,
            frame: 26,
            value: 50,
            weight: 10
        };
        static Cash1: ItemTypeContainer = {
            name: "1 Credit Chip",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 16,
            value: 1,
            weight: 0
        };
        static Cash5: ItemTypeContainer = {
            name: "5 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 17,
            value: 5,
            weight: 0
        };
        static Cash10: ItemTypeContainer = {
            name: "10 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 18,
            value: 10,
            weight: 0
        };
        static Cash20: ItemTypeContainer = {
            name: "20 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 19,
            value: 20,
            weight: 0
        };
        static Cash50: ItemTypeContainer = {
            name: "50 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 20,
            value: 50,
            weight: 0
        };
        static Cash100: ItemTypeContainer = {
            name: "100 Credit Chips",
            SpriteName: "items",
            baseType: ItemType.CASH,
            frame: 21,
            value: 100,
            weight: 0
        };
        static AmmoShotgunCarton: ItemTypeContainer = {
            name: "a Carton of shotgun shells",
            SpriteName: "items",
            gun: "shotgun",
            baseType: ItemType.AMMO,
            frame: 8,
            value: 20,
            weight: 0.1
        };
        static AmmoShotgunClip: ItemTypeContainer = {
            name: "a clip of shotgun shells",
            SpriteName: "items",
            gun: "shotgun",
            baseType: ItemType.AMMO,
            frame: 9,
            value: 10,
            weight: 0.1
        };
        static AmmoMachinegunCarton: ItemTypeContainer = {
            name: "a carton of machinegun bullets",
            SpriteName: "items",
            gun: "machineGun",
            baseType: ItemType.AMMO,
            frame: 10,
            value: 100,
            weight: 0.01
        };
        static AmmoMachinegunClip: ItemTypeContainer = {
            name: "a clip of machinegun bullets",
            SpriteName: "items",
            gun: "machineGun",
            baseType: ItemType.AMMO,
            frame: 11,
            value: 50,
            weight: 0.01
        };
        static AmmoSticky: ItemTypeContainer = {
            name: "a bundle of light-nades",
            SpriteName: "items",
            gun: "sticky",
            baseType: ItemType.AMMO,
            frame: 2,
            value: 6,
            weight: 1
        };
    }

    export class Item {
        name: string = "";
        value: number = 1;
        weight: number = 1;
        description: string = "";
        level: number = 1;
        xp: number = 1;

        baseType: number;

        sprite:HUDSprite;

        container: ItemTypeContainer;

        autoPickup: bool = false;

        constructor (container:ItemTypeContainer) {
            this.container = container;
            this.baseType = container.baseType;
        }

        // Meant to be overriden by child, have the item do what it needs
        // Returns true if it should be removed from the item manager
        use(game:Game): bool {
            return true;
        }

        // This is called when an item is removed
        pop(game: Game) {
        }

        get affector(): Effect {
            var e:Effect = {
            };
            return e;
        }
    }

    export class HealthPotion extends Item {
        constructor (container:ItemTypeContainer) {
            super(container);
            this.name = container.name;
            this.value = container.value;
            this.weight = container.weight;
            this.description = "Did you get hurt while working in the mines? No lawsuits here. This CeresCorp survial kit will restore " + this.value + " points of health";
            this.level = 1;
            this.sprite = new HUDSprite(container.SpriteName, container.frame, 64, 64);
        }

        use(game:Game): bool {
            game.player.effect(this.affector);
            return true;
        }

        get affector(): Effect {
            var value = this.value;
            console.log("Item: " + this.name + " effect value: " + value);
            var e: Effect = {
                type: EffectType.HEALTH,
                addToInventory: true,
                hp: value,
                xp: this.xp
            };
            return e;
        }

    }

    export class Money extends Item {
        constructor (container:ItemTypeContainer) {
            super(container);
            this.autoPickup = true;
            this.name = container.name;
            this.value = container.value;
            this.weight = 0;
            this.description = "Use this virtual money to buy shit";
            this.level = 0;
            this.sprite = new HUDSprite("items", 2, 64, 64);
        }

        get affector(): Effect {
            var e: Effect = {
                credit: this.value
            };
            return e;
        }
    }

    export class Ammo extends Item {
        gun: string;
        constructor (container:ItemTypeContainer) {
            super(container);
            this.autoPickup = true;
            this.gun = container.gun;
            this.name = container.name;
            this.value = container.value;
            this.weight = this.value * container.weight;
            this.description = "Use this virtual money to buy shit";
            this.level = 0;
            this.sprite = new HUDSprite("items", 2, 64, 64);
        }

        get affector(): Effect {
            var e: Effect = {
                type: EffectType.AMMO
            };
            return e;
        }
    }

    export class WPNItem extends Item {
        gun: string;
        constructor (container:ItemTypeContainer) {
            super(container);
            this.autoPickup = false;
            this.gun = container.gun;
            this.name = container.name;
            this.value = container.value;
            this.weight = container.weight;
            this.description = container.description;
            this.level = 0;
            this.sprite = new HUDSprite("weapons", 2, 64, 64);
        }

        use(game:Game): bool {
            game.player.weaponManager.switchTo(this.gun);
            return false;
        }

        pop(game: Game) {
            game.player.weaponManager.switchTo("empty");
        }

        get affector(): Effect {
            var e: Effect = {
                type: EffectType.WEAPON,
            };
            return e;
        }
    }

    export class Frostbite extends Item {
        constructor (container:ItemTypeContainer) {
            super(container);
            this.name = "Frostbite";
            this.value = 20;
            this.weight = 2;
            this.description = "Indroduce your victims to a cruel and painful death";
            this.level = 1;
            this.sprite = new HUDSprite("items", 3, 64, 64);
        }

        get affector(): Effect {
            var e: Effect = {
                addToInventory: true,
                hp: 10,
                xp: 1
            };
            return e;
        }

    }

    // This is a visual representation of an item to be added to the game world
    export class ItemSprite extends Sprite {
        itemMangager: ItemManager;
        item: Item;
        type: number;

        constructor (x: number, y: number, manager:ItemManager, itemType?:number = -1) {
            super(x,y,"items");

            this.itemMangager = manager;

            var list = [
                Random.createProportion(ItemType.CASH, 40),
                Random.createProportion(ItemType.HEALTH, 20),
                Random.createProportion(ItemType.AMMO, 30),
                Random.createProportion(ItemType.WEAPON, 10),
            ];
            var type: number;
            
            if (itemType === -1) type = Random.Choose(list);
            else type = itemType;

            switch (type) {
                case ItemType.CASH:
                    this.createMoney();
                break;
                case ItemType.HEALTH:
                    this.createHealth();
                break;
                case ItemType.AMMO:
                    this.createAmmo();
                break;
                case ItemType.WEAPON:
                    this.createWeapon();
                break;
            }

            this.zIndex = 10;
            this.regX = Random.range(28,36);
            this.regY = Random.range(28,36);
            this.rotation = Random.range(0, 360);
            this.x += this.regX;
            this.y += this.regY;
            this.boundX = -5;
            this.boundY = -5;
            this.boundWidth = 10;
            this.boundHeight = 10;
        }

        createHealth() {
            var list = [
                Random.createProportion(ItemType.HealthPackSmall, 50),
                Random.createProportion(ItemType.HealthPackMed,   30),
                Random.createProportion(ItemType.HealthPackLarge, 20)
            ];
            this.createItem(list);
        }

        createMoney() {
            var list = [
                Random.createProportion(ItemType.Cash1,     24),
                Random.createProportion(ItemType.Cash5,     22),
                Random.createProportion(ItemType.Cash10,    22),
                Random.createProportion(ItemType.Cash20,    18),
                Random.createProportion(ItemType.Cash50,    10),
                Random.createProportion(ItemType.Cash100,   4)
            ];
            this.createItem(list);
        }

        createAmmo() {
            //var list = [
            //    Random.createProportion(ItemType.AmmoMachinegunCarton,  15),
            //    Random.createProportion(ItemType.AmmoMachinegunClip,    25),
            //    Random.createProportion(ItemType.AmmoShotgunCarton,     15),
            //    Random.createProportion(ItemType.AmmoShotgunClip,       25),
            //    Random.createProportion(ItemType.AmmoSticky,            20),
            //];

            var list = [
                Random.createProportion(ItemType.AmmoMachinegunCarton,  25),
                Random.createProportion(ItemType.AmmoMachinegunClip,    40),
                Random.createProportion(ItemType.AmmoSticky,            35),
            ];


            this.createItem(list);
        }

        createWeapon() {
            // var list = [
            //    Random.createProportion(ItemType.WPNBlaster,    40),
            //    Random.createProportion(ItemType.WPNMachineGun, 40),
            //    Random.createProportion(ItemType.WPNSticky,     20),
            //];

            var list = Game.game.world.weaponRatios;
            if(list.length > 0)
                this.createItem(list);
        }


        createItem(list: ProportionValue[]) {
            var itemContainer:ItemTypeContainer = Random.Choose(list);
            switch (itemContainer.baseType) {
                case ItemType.CASH:
                    this.item = new Money(itemContainer);
                break;
                case ItemType.HEALTH:
                    this.item = new HealthPotion(itemContainer);
                break;
                case ItemType.AMMO:
                    this.item = new Ammo(itemContainer);
                break;
                case ItemType.WEAPON:
                    this.item = new WPNItem(itemContainer);
                break;
            }
            this.type = itemContainer.baseType;
            // this.frame = itemContainer.frame;
            //console.log("Item: " + itemContainer.name + " Frame: " + itemContainer.frame + " CurrentFrame: " + this.frame);
            //console.log("FrameX: " + this.Fra
            this.changeImage(itemContainer.SpriteName, itemContainer.frame, 64, 64);
        }

        collide(e: Effect, obj: GameObject) {
            if (obj instanceof Player) {
                if (this.item.autoPickup) {
                    this.pickup();
                } else {
                    this.itemMangager.alert(this.item);
                    if (Keyboard.check(Keys.E)) {
                        if (this.itemMangager.canPickup(this.item)) {
                            this.pickup();
                        }
                        else {
                            Game.game.hud.queueMessage("You can't carry that", 1, true);
                        }
                    }
                }
            }
        }

        pickup() {
            this.itemMangager.add(this.item);
            this.visible = false;
            this.exists = false;
        }
    }

    //export class WeaponSprite extends Sprite {
    //    manager: ItemManager;
    //    item: Item;
    //    type: number;

    //    constructor (x: number, y: number, manager: ItemManager) {
    //        super(x, y, "weapons");
    //        this.manager = manager;
    //        this.type = ItemType.WEAPON;
    //    }

    //    createWeapon() {
    //    }

    //    createItem(list: ProportionValue[]) {
    //        var itemContainer:ItemTypeContainer = Random.Choose(list);

    //        this.item = new WPNItem(itemContainer);
    //        this.changeImage(itemContainer.SpriteName, itemContainer.frame, 64, 64);
    //    }
        
    //}

    //export class HealthPack extends ItemSprite {
    //    constructor (x:number, y:number, type: number) {
    //        super(x, y, type);
    //    }

    //    get affector(): Effect {
    //        var e:Effect = {
    //            hp: 10
    //        };
    //        return e;
    //    }
    //}
}