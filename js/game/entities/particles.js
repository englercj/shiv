define([
    'game/data/types',
    'game/utils',
    'game/entities/bases'
], function(types, utils, bases) {
    var Bullet = gf.entityPool.add('bullet', bases.Projectile.extend({
        init: function(pos, settings) {
            settings = settings || {};

            //overwrite base defaults
            settings.damage = settings.damage || 1;
            settings.texture = settings.texture || gf.resources.bullet_sprite.data;
            settings.size = settings.size || [4, 16];
            //settings.hitSize = settings.hitSize || [40, 20];

            //call base constructor
            this._super(pos, settings);
        }
    })),

    Laser = gf.entityPool.add('laser', bases.Beam.extend({
        init: function(post, settings) {
            settings = settings || {};

            settings.damage = settings.damage || 2;
            //settings.texture = settings.texture || gf.resources.bullet_sprite.data;
            settings.size = settings.size || [16, 500];
            //settings.hitSize = settings.hitSize || [40, 20];
        }
    }))

    return {
        Bullet: Bullet,
        Laser: Laser
    };
});