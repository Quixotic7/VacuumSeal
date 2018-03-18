var vs;
(function (vs) {
    var EffectType = (function () {
        function EffectType() { }
        EffectType.DEFAULT = 0;
        EffectType.PLAYER = 1;
        EffectType.NPC = 2;
        EffectType.ITEM = 3;
        EffectType.WALL = 4;
        EffectType.BULLET = 5;
        EffectType.AMMO = 6;
        EffectType.HEALTH = 7;
        EffectType.WEAPON = 8;
        return EffectType;
    })();
    vs.EffectType = EffectType;    
})(vs || (vs = {}));
var TileType = (function () {
    function TileType() { }
    TileType.UNUSED = 0;
    TileType.DIRTWALL = 1;
    TileType.DIRTFLOOR = 2;
    TileType.STONEWALL = 3;
    TileType.CORRIDOR = 4;
    TileType.DOOR = 5;
    TileType.UPSTAIRS = 6;
    TileType.DOWNSTAIRS = 7;
    TileType.CHEST = 8;
    TileType.NPC = 9;
    TileType.ROOM = 10;
    return TileType;
})();
