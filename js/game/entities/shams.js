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

            //default distance to travel before expiring
            this.distance = new THREE.Vector2(0, 1000);

            //distance this has traveled
            this._traveled = new THREE.Vector2(0, 0);

            //call base constructor
            this._super(pos, settings);
        },
        update: function() {
            this.velocity.x = 0;
            this.velocity.y = -this.accel.y * gf.game._delta;

            this._traveled.subSelf(this.velocity);

            if(this._traveled.x >= this.distance.x && this._traveled.y >= this.distance.y)
                return this.die();


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