interface CanvasRenderingContext2D {
    blendOnto(destContext: CanvasRenderingContext2D, blendMode: string, offsetOptions?: Object): void;
}

module vs {
    export interface GameObject {
        update(delta?: number): void;
        position: Point;
        boundingBox: Box;
        boundingRect: Rect;
        visible: bool;
        active: bool;
        exists: bool;
        zIndex: number;

        affector: Effect;
        collide(effect: Effect, obj: GameObject): void;
        effect(effect: Effect): void;
    }

    export interface Box {
        min: Point;
        max: Point;
    }

    export interface Iterator {
        hasNext(): bool;
        next(): any;
        remove(): void;
        reset(): Iterator;
    }

    export class EffectType {
        static DEFAULT: number = 0;
        static PLAYER: number = 1;
        static NPC: number = 2;
        static ITEM: number = 3;
        static WALL: number = 4;
        static BULLET: number = 5;
        static AMMO: number = 6;
        static HEALTH: number = 7;
        static WEAPON: number = 8;
    }

    export interface Effect {
        // Represents the type of object, like mob 
        type?: number;

        // Is the object solid? Walls are solid.
        solid?: bool;

        // The owner of the object, useful for things like bullets
        owner?: GameObject;

        // Health Points
        hp?: number;

        // Cash Money. 
        credit?: number;

        // Experience
        xp?: number;

        // Item will be added to inventory if true
        addToInventory?: bool;


    }

    export interface Level {
        level: number;
        mapFeatures: number;
        itemDensity: number;
        itemType: number;
        npcDensity: number;
        roomDensity: number;
        corridorDensity: number;
        weaponRatios: ProportionValue[];
        mobSpawnChance: number;
        mobRatios: ProportionValue[];
    }
}

class TileType {
    static UNUSED: number = 0;
    static DIRTWALL: number = 1;
    static DIRTFLOOR: number = 2;
    static STONEWALL: number = 3;
    static CORRIDOR: number = 4;
    static DOOR: number = 5;
    static UPSTAIRS: number = 6;
    static DOWNSTAIRS: number = 7;
    static CHEST: number = 8;
    static NPC: number = 9;
    static ROOM: number = 10;
}