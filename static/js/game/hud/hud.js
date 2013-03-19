define([
], function() {
    var items = {
        HealthBar: gf.HudItem.extend({
            init: function(x, y, settings) {
                this._super(x, y, settings);
            },
            update: function() {
                if(!this.dirty) return;

                this.$val.css('width', this.$elm.width() * this.value);

                this.dirty = false;
                return this;
            },
            _createElement: function(x, y) {
                this._super(x, y);
                this.$elm = $(this.elm);
                this.$elm.addClass('gf-hud-health');

                this.$elm.css({
                    position: 'fixed',
                    bottom: 0,
                    top: '',
                    left: ''
                });

                this.$val = $('<div/>', {
                    'class': 'gf-hud-item gf-hud-health-value ' + this.name
                }).appendTo(this.$elm);
            }
        }),
        Bossbar: gf.HudItem.extend({
            init: function(x, y, settings) {
                this._super(x, y, settings);
            },
            update: function() {
                if(!this.dirty) return;

                this.$val.css('width', this.$elm.width() * this.value);

                this.dirty = false;
                return this;
            },
            _createElement: function(x, y) {
                this._super(x, y);
                this.$elm = $(this.elm);
                this.$elm.addClass('gf-hud-bossbar');

                this.$elm.css({
                    position: 'fixed',
                    top: 0,
                    left: '50%',
                    width: 512,
                    marginLeft: -256
                });

                this.$val = $('<div/>', {
                    'class': 'gf-hud-item gf-hud-bossbar-value ' + this.name
                }).appendTo(this.$elm);
            }
        }),
        Text: gf.HudItem.extend({
            init: function(x, y, settings) {
                this.title = 'Title';

                this._super(x, y, settings);
            },
            update: function() {
                if(!this.dirty) return;

                this.$elm.text(this.title + ': ' + this.value);

                this.dirty = false;
                return this;
            },
            _createElement: function(x, y) {
                this._super(x, y);
                this.$elm = $(this.elm);
                this.$elm.addClass('gf-hud-text');
            }
        }),
        MusicMute: gf.HudItem.extend({
            init: function(x, y, settings) {
                this._super(x, y, settings);
                this.dirty = false;
            },
            onClick: function() {
                this.setValue(!this.value);
                this.update();
            },
            update: function() {
                if(!this.dirty) return;

                if(this.value === true) {
                    gf.audio.pauseAll();
                    this.$elm.addClass('paused');
                } else {
                    gf.audio.playAll();
                    this.$elm.removeClass('paused');
                }
            },
            _createElement: function(x, y) {
                this._super(x, y);
                this.$elm = $(this.elm);
                this.$elm.addClass('gf-hud-mute');
            }
        })
    };

    return items;
});