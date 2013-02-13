define([
    'game/entities/bases',
    'game/entities/player',
    'game/entities/shams',
    'game/entities/particles'
], function(bases, player, particles) {
    return {
        bases: bases,
        player: player,
        particles: particles
    };
});