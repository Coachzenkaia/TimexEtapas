// connector.js (Versión con Autorización)

const TRELLO_API_KEY = '96e6f5f73e3878e9f40bd3d241f8b732';

window.TrelloPowerUp.initialize({
  'authorization-status': function(t, options) {
    // Esta función comprueba si ya tenemos un token de autorización.
    return t.get('member', 'private', 'token')
      .then(function(token) {
        if (token) {
          return { authorized: true }; // Ya estamos autorizados
        }
        return { authorized: false }; // No estamos autorizados
      });
  },
  'show-authorization': function(t, options) {
    // Esta función abre el popup de autorización de Trello.
    return t.popup({
      title: 'Autorizar TimexEtapas',
      url: './auth.html', // Un nuevo archivo que crearemos
      height: 140,
    });
  },
  'card-back-section': function(t, options) {
    return {
      title: 'Tiempo por Etapa',
      icon: './icon.svg',
      content: {
        type: 'iframe',
        url: './time-history.html',
        height: 230
      }
    };
  }
}, {
    // Necesitamos especificar que nuestra app usará la API
    appKey: TRELLO_API_KEY,
    appName: 'TimexEtapas Power-Up'
});