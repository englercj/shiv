(function($, window, undefined) {
    require.config({
        urlArgs: "nocache=" +  (new Date()).getTime()
    });

    require([
        'game/data/data',
        'game/entities/entities',
        'game/hud/hud'
    ], function(data, entities, hud) {
        //turn on some debugging properties
        //gf.debug.showFps = true; //show the FPS box
        //gf.debug.showInfo = true; //show detailed debug info
        //gf.debug.showOutline = true; //show the outline of an entity (size)
        //gf.debug.showHitbox = true; //show the outline of an entity hitbox
        //gf.debug.accessTiledUniforms = true;//gf.debug.tiledUniforms with an array of shader uniforms used by the TiledMapLayer object
        //gf.debug.showGamepadInfo = true; //show the gamepad state
        //gf.debug.showMapColliders = true; //show the map colliders

        var bgCurrent, bgInv, roundTo, enemyDie, lastStats;

        $(function() {
            //initialize the renderer
            gf.game.init('game', {
                gravity: 0,
                friction: [0, 0]
            });

            //load resources
            gf.event.subscribe(gf.types.EVENT.LOADER_COMPLETE, function() {
                //play some MUSIKA
                gf.audio.play('bg_music', { loop: true, volume: 0.5 });
                gf.HUD.init();
                gf.HUD.addItem('mute', new hud.MusicMute(10, 10, { value: false }));
                
                $('#play').on('click', function() {
                    $('#menu').fadeOut(function() {
                        playGame();
                    });
                });
            });

            gf.event.subscribe(gf.types.EVENT.LOADER_ERROR, function(err, resource) { console.log(err, resource); });
            gf.loader.load(data.resources);

            $('#submitStats').on('click', submitStats);
            $('#replayGame').on('click', replayGame);


            $.ajax({
                type: 'GET',
                url: '/_store/top/5',
                cache: false,
                success: function(resp) {
                    var $board = $('#leaderboard').empty();
                    if(resp.error)
                        $board.html('<li>Unable to load leaderboard: ' + resp.error + '</li>');
                    else {
                        var html = '';
                        resp.forEach(function(stat) {
                            html += '<li><span>';
                            html += stat.name + ' - ' + stat.score + ' points';
                            html += '</span></li>';
                        });
                        $board.html(html);
                    }
                },
                error: function(resp) {
                    $('.ajaxResp.error').show();
                }
            });

            $('#initMsg').hide();
            $('#play').show();

            $(window).on('resize', onWinResize);
        });

        function submitStats() {
            var name = $('#name').val();

            $('.noname.error').hide();
            $('.ajaxResp').hide();

            if(!name) return $('.noname.error').show();

            lastStats.name = name;

            $.ajax({
                type: 'PUT',
                url: '/_store/score',
                data: lastStats,
                success: function(resp) {
                    if(resp.error)
                        $('.ajaxResp.error').show();
                    else
                        $('.ajaxResp.success').show();
                },
                error: function(resp) {
                    $('.ajaxResp.error').show();
                }
            });
        }

        function replayGame() {
            $('#finish').hide();
            $('#overlay').hide();

            gf.HUD.removeItem('bossbar');

            gf.event.unsubscribe('entity.die', enemyDie);
            gf.game.removeObject(gf.game.player);

            playGame(true);
        }

        function playGame(replay) {
            //initialize HUD
            if(!replay) initHud();

            //initialize player
            initPlayer();
            if(!replay) {
                gf.event.subscribe('entity.die', function(ent) {
                    if(ent.type == gf.types.ENTITY.PLAYER) {
                        gameOver(true);
                    }
                });
            }

            var rounds = [
                //rows, cols, moveSpeed, fireRate
                [2, 5, 'sham', 25, 0.10, 'Round 1'],
                [3, 10, 'sham', 50, 0.25, 'Round 2'],
                [4, 15, 'sham', 75, 0.40, 'Round 3'],
                [5, 20, 'sham', 100, 0.55, 'Round 4'],
                [1, 1, 'shamboss', 75, 5, 'Sham Boss!']
            ];

            doRound(0);
            function doRound(i) {
                if(i === rounds.length) {
                    return gameOver();
                }

                clearTimeout(roundTo);
                gf.HUD.setItemValue('round', i + 1);
                var args = Array.apply(null, rounds[i]);
                args.push(function() {
                    roundTo = setTimeout(doRound.bind(null, i + 1), 1000);
                });

                $('#roundText').text(args[5]).show().delay(2500).fadeOut('slow', function() {
                    playRound.apply(null, args);
                });
            }

            bgCurrent = 0;
            bgInv = setInterval(bgScroll, 50);
            function bgScroll() {
                bgCurrent += 1;
                $('#game').css('backgroundPosition', '0 ' + bgCurrent + 'px');
            }

            //start render loop
            if(!replay) gf.game.render();
        }

        function playRound(rows, cols, ent, moveSpeed, fireRate, text, cb) {
            if(ent == 'shamboss')
                gf.HUD.addItem('bossbar', new hud.Bossbar(0, 0, { value: 0 }));

            //initialize enemy
            var enemies = initEnemies.apply(null, arguments);

            enemyDie = function(ent) {
                var i = enemies.indexOf(ent.id);

                enemies.splice(i, 1);

                if(enemies.length === 0) {
                    gf.event.unsubscribe('entity.die', enemyDie);
                    if(cb) cb();
                }
            };
            gf.event.subscribe('entity.die', enemyDie);
        }

        function initHud() {
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

            gf.HUD.setItemValue('health', 1);
            gf.game.addObject(player);
            onWinResize();
        }

        function onWinResize() {
            var $c = $(gf.game._cont);
            if(gf.game.player)
                gf.game.player.max.set(($c.width() / 2) - 16, ($c.height() / 2) - 32);
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
                        accel: [moveSpeed * 5, moveSpeed],
                        fireRate: fireRate
                    });
                    ids.push(sham.id);
                    gf.game.addObject(sham);
                }
            }

            return ids;
        }

        function gameOver(lost) {
            if(!gf.game.player) return;

            gf.game.player.unbindKeys();

            var $fin = $('#finish'),
                ent = gf.game.player;

            lastStats = ent.stats;
            lastStats.score = ent.score;

            if(lost) {
                $fin.find('.title').text('You Lose!');
                $fin.find('.lose').show();
                $fin.addClass('lose');
            } else {
                $fin.find('.title').text('You Win!');
                $fin.find('.win').show();
                $fin.addClass('win');
            }

            $fin.find('.score').text(ent.score + ' points');
            $fin.find('.accuracy').text((ent.stats.accuracy * 100).toFixed(2) + '%');
            $fin.find('.kills').text(ent.stats.kills + ' destroyed');
            $fin.show();
            $('#overlay').show();

            //clear Entities
            clearTimeout(roundTo);
            clearInterval(bgInv);
            $.each(gf.game.objects, function(k, v) {
                gf.game.removeObject(v);
            });
        }
    });
})(jQuery, window);