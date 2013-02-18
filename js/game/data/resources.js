define([], function() {
    return [
        {
            name: 'player_sprite',
            type: gf.types.RESOURCE.TEXTURE,
            src: '/assets/sprites/player.png'
        },
        {
            name: 'bullet_sprite',
            type: gf.types.RESOURCE.TEXTURE,
            src: '/assets/sprites/bullet.png'
        },
        {
            name: 'bullet2_sprite',
            type: gf.types.RESOURCE.TEXTURE,
            src: '/assets/sprites/bullet2.png'
        },
        {
            name: 'shamhead_sprite',
            type: gf.types.RESOURCE.TEXTURE,
            src: '/assets/sprites/shamheads.png'
        },
        {
            name: 'explosion_sound',
            type: gf.types.RESOURCE.AUDIO,
            src: '/assets/audio/explosion.wav'
        },
        {
            name: 'shamhead_sound',
            type: gf.types.RESOURCE.AUDIO,
            src: '/assets/audio/sham.wav'
        },
        {
            name: 'shoot_sound',
            type: gf.types.RESOURCE.AUDIO,
            src: '/assets/audio/shoot.wav'
        }
    ];
});