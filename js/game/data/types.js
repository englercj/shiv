define({
    /////////////////////////////////////////////////////////
    // Entity Types
    ///////////////////
    //Extend the base types defined by GrapeFruit with a few more, but still maintain
    // compatability with the GF ones.
    /////////////////////////////////////////////////////////
    ENTITY: {
        PLAYER: 'player',
        ENEMY: 'enemy',
        BOSS: 'boss',
        FRIENDLY: 'friendly',
        NEUTRAL: 'neutral',
        COLLECTABLE: 'collectable',
        BEAM: 'beam',
        PROJECTILE: 'projectile'
    },

    /////////////////////////////////////////////////////////
    // Z Indexes
    ///////////////////
    //These are the components used to create different spells
    /////////////////////////////////////////////////////////
    ZINDEX: {
        BACKGROUND: 0,
        CHARACTER: 10,
        PARTICLE: 20
    }
});