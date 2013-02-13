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
            settings.size = settings.size || [32, 32];

            //texture
            settings.texture = settings.texture || gf.resources.player_sprite.data;

            //acceleration
            settings.accel = settings.accel || [300, 300];

            //maximum health of this entity
            settings.maxHealth = 5;

            //current health of this entity
            settings.health = 5;

            //call base constructor
            this._super(pos, settings);

            //bind the keyboard
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

            this.shootWait = 85;
            this.shootReady = true;

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
        },
        takeDamage: function(dmg, attacker) {
            var nh = this.health - dmg < 0 ? 0 : this.health - dmg;
            gf.HUD.setItemValue('health', nh / this.maxHealth);
            this._super(dmg, attacker);
        },
        onKill: function(victim) {
            this.score += victim.points;
            gf.HUD.setItemValue('score', this.score);
        },
        //cast spell based on components
        onFire: function(action, down) {
            if(!down) return;

            if(!this.shootReady) return;

            setTimeout(this._shootCooldown.bind(this), this.shootWait);
            this.shootReady = false;

            var p = new gf.entityPool.create('bullet', {
                scale: 1,
                position: this._mesh.position.clone(),
                owner: this
            });

            gf.game.addObject(p);
            p.shoot();
        },
        _shootCooldown: function() {
            this.shootReady = true;
        },
        onBomb: function() {
            console.log('Havent got there yet!');
        }
    }));

    return Player;
});