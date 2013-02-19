define([
    'game/data/types',
    'game/utils',
    'game/entities/bases'
], function(types, utils, bases) {
    var Player = gf.entityPool.add('player', bases.Ship.extend({
        init: function(pos, settings) {
            settings = settings || {};

            //player type
            settings.type = settings.type || gf.types.ENTITY.PLAYER;

            //set name of Bando
            settings.name = settings.name || 'PAT';

            //sprite size
            settings.size = settings.size || [48, 48];

            //sprite size
            settings.hitSize = settings.hitSize || [42, 42];

            //texture
            settings.texture = settings.texture || gf.resources.player_sprite.data;

            //acceleration
            settings.accel = settings.accel || [300, 300];

            //maximum health of this entity
            settings.maxHealth = 2;

            //current health of this entity
            settings.health = 2;

            //call base constructor
            this._super(pos, settings);

            //bind the keyboard
            this.bindKeys();

            this.addAnimation('normal', { frames: [0, 1], duration: 200, loop: true });
            this.addAnimation('move_left', { frames: [8, 9], duration: 200, loop: true });
            this.addAnimation('move_right', { frames: [16, 17], duration: 200, loop: true });
            this.addAnimation('die', { frames: [24, 25, 26, 27, 28, 29, 30, 31], duration: 800, loop: false });

            this.setActiveAnimation('normal');

            this.shootWait = 85;
            this.shootReady = true;
            this.stats = {
                shots: 0,
                hits: 0,
                kills: 0,
                accuracy: 0
            };

            //make the camera track this entity
            //gf.game.cameraTrack(this);
        },
        update: function() {
            //check if the player is moving, and update the velocity
            this.checkMovement();
     
            //update player movement
            this.updateMovement();

            this._super();
        },
        checkMovement: function() {
            if(gf.controls.isActionActive('move_left')) {
                this.velocity.x = -this.accel.x * gf.game._delta;
            }
            else if(gf.controls.isActionActive('move_right')) {
                this.velocity.x = this.accel.x * gf.game._delta;
            }
            else {
                this.velocity.x = 0;
            }

            if(gf.controls.isActionActive('move_down')) {
                this.velocity.y = -this.accel.y * gf.game._delta;
            }
            else if(gf.controls.isActionActive('move_up')) {
                this.velocity.y = this.accel.y * gf.game._delta;
            }
            else {
                this.velocity.y = 0;
            }

            //ensure we stay in the box
            var nx = this._mesh.position.x + this.velocity.x,
                ny = this._mesh.position.y + this.velocity.y;

            if(nx < -495 || nx > 495)
                this.velocity.x = 0;

            if(ny < -330 || ny > 355)
                this.velocity.y = 0;

            //update animation
            if(this.dead) return;

            if(gf.controls.isActionActive('move_left')) {
                if(!this.isActiveAnimation('move_left'))
                    this.setActiveAnimation('move_left');
            } else if(gf.controls.isActionActive('move_right')) {
                if(!this.isActiveAnimation('move_right'))
                    this.setActiveAnimation('move_right');
            } else {
                if(!this.isActiveAnimation('normal'))
                    this.setActiveAnimation('normal');
            }
        },
        takeDamage: function(dmg, attacker) {
            var nh = this.health - dmg < 0 ? 0 : this.health - dmg;
            gf.HUD.setItemValue('health', nh / this.maxHealth);
            this._super(dmg, attacker);
        },
        die: function(killer) {
            if(this.dead) return;

            if(!gf.HUD.getItemValue('mute'))
                gf.audio.play('explosion_sound');
            this.velocity.set(0, 0);
            this.accel.set(0, 0);
            this.isCollidable = false;
            this.dead = true;

            if(killer) killer.onKill(this);

            if(this.anim.die) {
                var self = this;
                self.setActiveAnimation('die', function(forced) {
                    //gf.game.removeObject(self);
                    gf.event.publish('entity.die', self);
                });
            } else {
                //gf.game.removeObject(this);
            }
        },
        onKill: function(victim) {
            if(!gf.HUD.getItemValue('mute'))
                gf.audio.play('shamhead_sound');
            this.stats.kills++;
            this.score += victim.points;
            gf.HUD.setItemValue('score', this.score);
        },
        onDoDamage: function(victim) {
            this.stats.hits++;
            this.stats.accuracy = this.stats.hits / this.stats.shots;
            gf.HUD.setItemValue('accuracy', (this.stats.accuracy * 100).toFixed(2) + '%');
        },
        //cast spell based on components
        onFire: function(action, down) {
            if(!down) return;

            if(!this.shootReady) return;

            if(!gf.HUD.getItemValue('mute'))
                gf.audio.play('shoot_sound');
            setTimeout(this._shootCooldown.bind(this), this.shootWait);
            this.shootReady = false;
            this.stats.shots++;
            this.stats.accuracy = this.stats.hits / this.stats.shots;
            gf.HUD.setItemValue('accuracy', (this.stats.accuracy * 100).toFixed(2) + '%');

            var p = new gf.entityPool.create('bullet', {
                scale: 1,
                position: this._mesh.position.clone(),
                owner: this
            });

            gf.game.addObject(p);
            p.shoot();
        },
        onBomb: function(action, down) {
            if(!down) return;

            console.log('Havent got there yet!');
        },
        bindKeys: function() {
            gf.controls.bindKey(gf.types.KEY.W, 'move_up');
            gf.controls.bindKey(gf.types.KEY.A, 'move_left');
            gf.controls.bindKey(gf.types.KEY.S, 'move_down');
            gf.controls.bindKey(gf.types.KEY.D, 'move_right');

            gf.controls.bindKey(gf.types.KEY.UP, 'move_up');
            gf.controls.bindKey(gf.types.KEY.LEFT, 'move_left');
            gf.controls.bindKey(gf.types.KEY.DOWN, 'move_down');
            gf.controls.bindKey(gf.types.KEY.RIGHT, 'move_right');

            gf.controls.bindKey(gf.types.KEY.NUMPAD0, 'fire', this.onFire.bind(this));
            gf.controls.bindKey(gf.types.KEY.DELETE, 'fire', this.onFire.bind(this));
            gf.controls.bindKey(gf.types.KEY.NUMPAD_DOT, 'bomb', this.onBomb.bind(this));
            gf.controls.bindKey(gf.types.KEY.B, 'bomb', this.onBomb.bind(this));
        },
        unbindKeys: function() {
            gf.controls.unbindKey(gf.types.KEY.W, 'move_up');
            gf.controls.unbindKey(gf.types.KEY.A, 'move_left');
            gf.controls.unbindKey(gf.types.KEY.S, 'move_down');
            gf.controls.unbindKey(gf.types.KEY.D, 'move_right');

            gf.controls.unbindKey(gf.types.KEY.UP, 'move_up');
            gf.controls.unbindKey(gf.types.KEY.LEFT, 'move_left');
            gf.controls.unbindKey(gf.types.KEY.DOWN, 'move_down');
            gf.controls.unbindKey(gf.types.KEY.RIGHT, 'move_right');

            gf.controls.unbindKey(gf.types.KEY.NUMPAD0, 'fire');
            gf.controls.unbindKey(gf.types.KEY.DELETE, 'fire');
            gf.controls.unbindKey(gf.types.KEY.NUMPAD_DOT, 'bomb');
            gf.controls.unbindKey(gf.types.KEY.B, 'bomb');
        },
        _shootCooldown: function() {
            this.shootReady = true;
        }
    }));

    return Player;
});