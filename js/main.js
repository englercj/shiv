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
        //gf.debug.showHitbox = true; //show the outline of an entity hitbox
        //gf.debug.accessTiledUniforms = true;//gf.debug.tiledUniforms with an array of shader uniforms used by the TiledMapLayer object
        //gf.debug.showGamepadInfo = true; //show the gamepad state
        //gf.debug.showMapColliders = true; //show the map colliders

        $(function() {
            //initialize the renderer
            gf.game.init('game', {
                gravity: 0,
                friction: [0, 0]
            });

            //load resources
            gf.event.subscribe(gf.types.EVENT.LOADER_COMPLETE, function() {
                //initialize map and add to game
                //gf.game.loadWorld('darkworld_world');
                
                $('#play').on('click', function() {
                    playGame();
                });
            });

            gf.event.subscribe(gf.types.EVENT.LOADER_ERROR, function(err, resource) { console.log(err, resource); });
            gf.loader.load(data.resources);
            
            $.couch.urlPrefix = 'http://englercj.iriscouch.com:5984';
            $.couch.login({
                name: 'englercj',
                password: '43pjde8d',
                success: function(resp) {
                    $('#submitStats').on('click', function() {
                        var stats = gf.game.player.stats,
                            name = $('#name').val();

                        $('.noname.error').hide();
                        $('.ajaxResp').hide();

                        if(!name) return $('.noname.error').show();

                        stats.score = gf.game.player.score;
                        stats.name = name;

                        $.couch.db('shiv_patlive_scores').saveDoc(stats, {
                            success: function(resp) {
                                $('.ajaxResp.success').show();
                            },
                            error: function(resp) {
                                $('.ajaxResp.error').show();
                            }
                        });
                    });
                },
                error: function(status, err, reason) {
                    alert('Database not reachable, you will not be able to save your score!\nIf this is unacceptable please refresh and try again.');
                }
            });
        });

        function playGame() {
            //play some MUSIKA
            //gf.audio.play('darkworld_music', { loop: true });

            //initialize HUD
            initHud();

            //initialize player
            initPlayer();

            gf.event.subscribe('entity.die', function(ent) {
                if(ent.type == gf.types.ENTITY.PLAYER) {
                    gf.game.player = ent;
                    ent.unbindKeys();
                    gameOver(true);
                }
            });

            var rounds = [
                //rows, cols, moveSpeed, fireRate
                [2, 5, 'sham', 25, 0.10],
                [3, 10, 'sham', 50, 0.25],
                [4, 15, 'sham', 75, 0.40],
                [5, 20, 'sham', 100, 0.55],
                [1, 1, 'shamboss', 10, 1]
            ];

            doRound(0);
            function doRound(i) {
                gf.HUD.setItemValue('round', i + 1);
                var args = Array.apply(null, rounds[i]);
                args.push(function() {
                    setTimeout(doRound.bind(null, i + 1), 1000);
                });

                playRound.apply(null, args);
            }

            var current = 0,
                inv = setInterval(bgScroll, 50);
            function bgScroll() {
                current += 1;
                $('#game').css('backgroundPosition', '0 ' + current + 'px');
            }

            //start render loop
            gf.game.render();
        }

        function playRound(rows, cols, ent, moveSpeed, fireRate, cb) {
            //initialize enemy
            var enemies = initEnemies.apply(null, arguments);

            var die = function(ent) {
                var i = enemies.indexOf(ent.id);

                enemies.splice(i, 1);

                if(enemies.length === 0) {
                    gf.event.unsubscribe('entity.die', die);
                    cb();
                }
            }

            gf.event.subscribe('entity.die', die);
        }

        function initHud() {
            gf.HUD.init();

            gf.HUD.addItem('mute', new hud.MusicMute(0, 0, { value: false }));
            gf.HUD.addItem('round', new hud.Text(10, 0, { title: 'Round', value: 0 }));
            gf.HUD.addItem('score', new hud.Text(10, 25, { title: 'Score', value: 0 }));
            gf.HUD.addItem('accuracy', new hud.Text(10, 50, { title: 'Accuracy', value: 0 }));
            gf.HUD.addItem('health', new hud.HealthBar(0, 735, { value: 1 }));

            var its = ['round', 'score', 'accuracy'];
            for(var i = 0; i < its.length; ++i) {
                var s = gf.HUD.items[its[i]];
                s.$elm.css('right', s.$elm.css('left'));
                s.$elm.css('left', '');
            }
        }

        function initPlayer() {
            //initialize the player and add to game
            var player = window.player = gf.entityPool.create('player', {
                position: [0, 0]
            });

            gf.game.addObject(player);
        }

        function initEnemies(rows, cols, ent, moveSpeed, fireRate) {
            var ids = [],
                size = [64, 70];

            for(var x = 0; x < cols; ++x) {
                for(var y = 0; y < rows; ++y) {
                    var sham = gf.entityPool.create(ent, {
                        position: [
                            (x * size[0]) - (cols * (size[0] / 2.2)),
                            (y * size[1]) + 400
                        ],
                        accel: [moveSpeed, moveSpeed],
                        fireRate: fireRate
                    });
                    ids.push(sham.id);
                    gf.game.addObject(sham);
                }
            }

            return ids;
        }

        function gameOver(lost) {
            var $fin = $('#finish'),
                ent = gf.game.player;

            if(lost) {
                $fin.find('.title').text('You Lose!');
                $fin.find('.lose').show();
                $fin.addClass('lose');
            } else {
                $fin.find('.title').text('You Win!');
                $fin.find('.win').show();
                $fin.addClass('win');
            }

            $fin.find('.score').text(ent.score);
            $fin.find('.accuracy').text((ent.stats.accuracy * 100).toFixed(2) + '%');
            $fin.find('.kills').text(ent.stats.kills);
            $fin.show();
            $('#overlay').show();
        }
    });
})(jQuery, window);