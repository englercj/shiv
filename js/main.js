(function($, window, undefined) {
    require([
        'game/data/data',
        'game/entities/entities',
        'game/hud/hud'
    ], function(data, entities, hud) {
        //turn on some debugging properties
        gf.debug.showFps = true; //show the FPS box
        gf.debug.showInfo = true; //show detailed debug info
        //gf.debug.showOutline = true; //show the outline of an entity (size)
        gf.debug.showHitbox = true; //show the outline of an entity hitbox
        //gf.debug.accessTiledUniforms = true;//gf.debug.tiledUniforms with an array of shader uniforms used by the TiledMapLayer object
        //gf.debug.showGamepadInfo = true; //show the gamepad state
        //gf.debug.showMapColliders = true; //show the map colliders

        $(function() {
            //initialize the renderer
            gf.game.init('game', {
                gravity: 0,
                friction: [0, 0],
                clearColor: 0x111111
            });

            //load resources
            gf.event.subscribe(gf.types.EVENT.LOADER_COMPLETE, function() {
                //initialize map and add to game
                //gf.game.loadWorld('darkworld_world');
                //play some MUSIKA
                //gf.audio.play('darkworld_music', { loop: true });

                //initialize HUD
                initHud();

                //initialize player
                initPlayer();
                //initialize enemy
                initEnemies();

                //start render loop
                gf.game.render();
            });

            gf.event.subscribe(gf.types.EVENT.LOADER_ERROR, function(err, resource) { console.log(err, resource); });
            gf.loader.load(data.resources);
        });

        function initHud() {
            gf.HUD.init();

            gf.HUD.addItem('mute', new hud.MusicMute(0, 0, { value: false }));
            gf.HUD.addItem('score', new hud.Score(10, 0, { value: 0 }));
            gf.HUD.addItem('health', new hud.HealthBar(0, 735, { value: 1 }));

            var s = gf.HUD.items.score;
            s.$elm.css('right', s.$elm.css('left'));
            s.$elm.css('left', '');
        }

        function initPlayer() {
            //initialize the player and add to game
            var player = window.player = gf.entityPool.create('player', {
                position: [0, 0]
            });

            gf.game.addObject(player);
        }

        function initEnemies() {
            //initialize the enemy and add to game
            /*var enemy = gf.entityPool.create('darknight', {
                position: [400, 0]
            });*/

            //gf.game.addObject(enemy);
        }
    });
})(jQuery, window);