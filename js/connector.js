console.log('TimexEtapas cargando...');

// Verificar que TrelloPowerUp esté disponible
if (typeof TrelloPowerUp === 'undefined') {
    console.error('TrelloPowerUp no está disponible');
} else {
    console.log('TrelloPowerUp disponible, inicializando...');
}

TrelloPowerUp.initialize({
    'card-badges': function(t, opts) {
        console.log('Ejecutando card-badges');
        return [{
            icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/clock.svg',
            text: 'TEST',
            color: 'green'
        }];
    },
    
    'card-buttons': function(t, opts) {
        console.log('Ejecutando card-buttons');
        return [{
            icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
            text: 'TimexEtapas',
            callback: function(t) {
                return t.popup({
                    title: '¡Funciona!',
                    url: './popup.html',
                    height: 200
                });
            }
        }];
    }
});

console.log('TimexEtapas inicializado correctamente');