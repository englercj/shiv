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
            settings.size = settings.size || [88, 88];

            //hitbox size
            settings.hitSize = settings.hitSize || [64, 64];

            //texture
            settings.texture = settings.texture || gf.resources.shamhead_sprite.data;

            //acceleration
            settings.accel = settings.accel || [25, 25];

            //default distance to travel before expiring
            this.distance = new gf.THREE.Vector2(0, 1200);

            //how likely this sham is to fire a weapon
            this.fireRate = 0.10;

            //distance this has traveled
            this._traveled = new gf.THREE.Vector2(0, 0);

            //call base constructor
            this._super(pos, settings);

            //add animations
            this.addAnimation('normal', [0]);
            this.addAnimation('die', {
                frames: [8, 9, 10, 11, 12, 13, 14, 15],
                duration: 350,
                loop: false
            });
            this.setActiveAnimation('normal');
        },
        update: function() {
            this.velocity.x = 0;
            this.velocity.y = -this.accel.y * gf.game._delta;

            this._traveled.sub(this.velocity);

            if(this._traveled.x >= this.distance.x && this._traveled.y >= this.distance.y)
                return this.die();

            this.fire();

            //update player movement
            this.updateMovement();

            this._super();
        },
        fire: function() {
            var rand = (Math.random() * gf.game._delta) / this.fireRate;

            if((rand * 10000) < 1) {
                var p = new gf.entityPool.create('bullet', {
                    scale: 1,
                    accel: [0, -6],
                    texture: gf.resources.bullet2_sprite.data,
                    position: this._mesh.position.clone(),
                    owner: this
                });

                gf.game.addObject(p);
                p.shoot();
            }
        },
        onCollision: function(obj) {
            if(obj.type === types.ENTITY.PLAYER) {
                obj.die(this);
            }

            this._super(obj);
        }
    }));

    return Sham;
});