class Dungeon {
    xsize: number;
    ysize: number;

    constructor ();
    init(x: number, y: number, features: number, item_density: number, npc_density: number, room_density: number, corridor_density: number): string;
    getCell(x: number, y: number): number;
    setCell(x: number, y: number, cellType: number): void;
}