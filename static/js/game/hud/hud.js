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
            blinkBar: function(clr) {
                /*this.$val.stop(true)
                        .animate({ backgroundColor: clr || 'red' }, 150)
                        .animate({ backgroundColor: this.bgColor }, 150);*/
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
                }).css({
                    /*position: 'absolute',
                    top: y,
                    left: x*/
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