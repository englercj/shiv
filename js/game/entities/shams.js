define([
    'game/data/types',
    'game/utils',
    'game/entities/bases'
], function(types, utils, bases) {
    var Sham = gf.entityPool.add('sham', bases.Enemy.extend({
        init: function(pos, settings) {
            settings = settings || {};

            settings.name = settings.name || 'Sham';

            //sprite size
            settings.size = settings.size || [32, 32];

            //texture
            settings.texture = settings.texture || gf.resources.player_sprite.data;

            //acceleration
            settings.accel = settings.accel || [25, 25];

            //call base constructor
            this._super(pos, settings);
        },
        update: function() {
            this.velocity.x = 0;
            this.velocity.y = -this.accel.y * gf.game._delta;
     
            //update player movement
            this.updateMovement();

            this._super();
        },
        onCollision: function(obj) {
            if(obj.type === types.ENTITY.PLAYER) {
                console.log('DIED!');
                obj.die(this);
            }

            this._super(obj);
        }
    }));

    return Sham;
});