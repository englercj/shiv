define([
    'game/data/types',
    'game/utils'
], function(types, utils) {
    var bases = {};

    //Some base classes
    bases.Projectile = gf.Sprite.extend({
        init: function(pos, settings) {
            settings = settings || {};

            //overwrite base default
            settings.accel = settings.accel || [0, 9];

            //override type
            settings.type = settings.type || types.ENTITY.PROJECTILE;

            //default distance to travel before expiring
            this.distance = new THREE.Vector2(0, 1000);

            //who owns the projectile
            this.owner = null;

            //what spell is the projectile
            this.spell = null;

            //damage of this projectile
            this.damage = 0;

            //call base constructor
            this._super(pos, settings);

            //set the index of characters
            this.zIndex = types.ZINDEX.PARTICLE;

            //distance this has traveled
            this._traveled = new THREE.Vector2(0, 0);
            this._expired = false;
        },
        update: function() {
            //update projectile movement
            this.updateMovement();

            this._traveled.addSelf(this.velocity);

            if(this._traveled.x >= this.distance.x && this._traveled.y >= this.distance.y && !this._expired)
                this.expire();

            this._super();
        },
        shoot: function() {
            //sprites are rotated by specifying the rotation (they are 2D)
            //this._mesh.rotation = rads;
            //the hitbox is a plane, so we need to say to rotate around the z axis
            //this._hitboxMesh.rotation.z = rads;

            this.velocity.copy(this.accel);
            //console.log(this.velocity);
        },
        expire: function() {
            var self = this;

            this._expired = true;
            this.velocity.set(0, 0);
            this.isCollidable = false;
            gf.game.removeObject(self);
        },
        onCollision: function(obj) {
            this._super();

            if(this.owner.id !== obj.id) {
                this.expire();
            }
        },
    });

    bases.Beam = gf.Sprite.extend({
        init: function(pos, settings) {
            settings = settings || {};

            //override type
            settings.type = settings.type || types.ENTITY.BEAM;

            //who owns the beam
            this.owner = null;

            //what spell is the beam
            this.spell = null;

            //damage/sec of this beam
            this.damage = 0;

            //max length of the beam
            this.maxLength = gf.game._renderer.domElement.width + 10;

            //call base constructor
            this._super(pos, settings);

            //set the index of particles
            this.zIndex = types.ZINDEX.PARTICLE;
        },
        onCollision: function(obj) {
        }
    });

    bases.Ship = gf.Sprite.extend({
        init: function(pos, settings) {
            //is this entity attacking?
            this.attacking = false;

            //maximum health of this entity
            this.maxHealth = 1;

            //current health of this entity
            this.health = 1;

            //current inventory of the entity
            this.inventory = {};

            //loot of the entity that is dropped when it dies
            this.loot = [];

            this.points = 0;
            this.score = 0;

            //call base constructor
            this._super(pos, settings);

            //set the index of characters
            this.zIndex = types.ZINDEX.CHARACTER;
        },
        update: function() {
            //check for collisions with other entities
            var objs = gf.game.checkCollisions(this);

            for(var i = 0, il = objs.length; i < il; ++i) {
                var ent = objs[i].entity;
                if(ent.owner && ent.owner.id !== this.id && ent.damage) {
                    switch(ent.type) {
                        case types.ENTITY.PROJECTILE:
                            this.takeDamage(ent.damage, ent.owner);
                            break;

                        case types.ENTITY.BEAM:
                            this.takeDamage(ent.damage * gf.game._delta, ent.owner);
                            break;
                    }
                }
            }

            this._super();
        },
        takeDamage: function(dmg, attacker) {
            this.health -= dmg;

            this.setActiveAnimation('damage');

            if(this.health <= 0)
                this.die(attacker);
        },
        die: function(killer) {
            this.velocity.set(0, 0);
            this.isCollidable = false;
            if(killer) killer.onKill(this);
            gf.event.publish('entity.die', this.id);
            //this.setActiveAnimation('die', function(forced) {
                if(killer) console.log(this.name + ' (' + this.id + ') has been killed by ' + killer.name + ' (' + killer.id + ')');
                gf.game.removeObject(this);
            //});
        },
        onKill: function() {}
    });

    bases.Enemy = bases.Ship.extend({
        init: function(pos, settings) {
            settings = settings || {};

            //player type
            settings.type = settings.type || types.ENTITY.ENEMY;

            settings.accel = settings.accel || [125, 125];

            settings.points = 5;

            //call base constructor
            this._super(pos, settings);
        }
    });

    bases.Boss = bases.Ship.extend({
        init: function(pos, settings) {
            settings = settings || {};

            //player type
            settings.type = settings.type || types.ENTITY.BOSS;

            settings.accel = settings.accel || [100, 100];

            //maximum health of this entity
            settings.maxHealth = 10;

            //current health of this entity
            settings.health = 10;

            settings.points = 1000;

            //call base constructor
            this._super(pos, settings);
        }
    });

    return bases;
});