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

            //call base constructor
            this._super(pos, settings);

            //distance this has traveled
            this._traveled = new gf.THREE.Vector2(0, 0);

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

            if(this._traveled.x >= this.distance.x && this._traveled.y >= this.distance.y) {
                this.die();
            } else {
                this.fire();

                //update movement
                this.updateMovement();
            }

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

    var Shamboss = gf.entityPool.add('shamboss', bases.Boss.extend({
        init: function(pos, settings) {
            settings = settings || {};

            var $c = $(gf.game._cont);
            pos[1] -= $c.height() / 4.75;

            settings.name = settings.name || 'Shamboss';

            //sprite size
            settings.size = settings.size || [88, 88];

            //hitbox size
            settings.hitSize = settings.hitSize || [64, 64];

            //texture
            settings.texture = settings.texture || gf.resources.shamhead_sprite.data;

            //acceleration
            settings.accel = settings.accel || [50, 10];

            //scale up
            settings.scale = settings.scale || 2.5;

            //how likely this sham is to fire a weapon
            this.fireRate = 0.10;

            //call base constructor
            this._super(pos, settings);

                        //top, right, bottom, left
            this.max = [
                $c.height() / 3.5,    //top
                $c.width() / 2.5,     //right
                $c.height() / 6.5,   //bottom
                $c.width() / -2.5     //left
            ];

            //add animations
            this.addAnimation('normal', [0]);
            this.addAnimation('die', {
                frames: [8, 9, 10, 11, 12, 13, 14, 15],
                duration: 1000,
                loop: false
            });
            this.setActiveAnimation('normal');

            gf.HUD.setItemValue('bossbar', 1);
        },
        update: function() {
            this.velocity.x = -this.accel.x * gf.game._delta;
            this.velocity.y = -this.accel.y * gf.game._delta;

            var nx = this._mesh.position.x + this.velocity.x,
                ny = this._mesh.position.y + this.velocity.y;

            if(nx > this.max[1] || nx < this.max[3]) this.accel.x = -this.accel.x;
            if(ny > this.max[0] || ny < this.max[2]) this.accel.y = -this.accel.y;

            this.fire();

            //update movement
            this.updateMovement();

            this._super();
        },
        fire: function() {
            var rand = (Math.random() * gf.game._delta) / this.fireRate;

            if((rand * 10000) < 1) {
                var p = new gf.entityPool.create('bullet', {
                    scale: 1,
                    accel: [0, -7],
                    texture: gf.resources.bullet2_sprite.data,
                    position: this._mesh.position.clone(),
                    owner: this
                });

                gf.game.addObject(p);
                p.shoot();
            }
        },
        takeDamage: function(dmg, attacker) {
            var nh = this.health - dmg < 0 ? 0 : this.health - dmg;
            gf.HUD.setItemValue('bossbar', nh / this.maxHealth);
            this._super(dmg, attacker);
        },
        onCollision: function(obj) {
            if(obj.type === types.ENTITY.PLAYER) {
                obj.die(this);
            }

            this._super(obj);
        }
    }));

    return {
        Sham: Sham,
        Shamboss: Shamboss
    };
});