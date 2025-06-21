// connector.js

const TRELLO_API_KEY = '96e6f5f73e3878e9f40bd3d241f8b732';

window.TrelloPowerUp.initialize({
  'authorization-status': function(t, options) {
    return t.get('member', 'private', 'token')
      .then(function(token) {
        if (token) {
          return { authorized: true };
        }
        return { authorized: false };
      });
  },
  'show-authorization': function(t, options) {
    return t.popup({
      title: 'Autorizar TimexEtapas',
      url: './auth.html',
      height: 140,
    });
  },
  'card-back-section': function(t, options) {
    return {
      title: 'Tiempo por Etapa',
      icon: '', // Si no tenés icon.svg, dejalo vacío
      content: {
        type: 'iframe',
        url: './card-back-section.html',
        height: 230
      }
    };
  }
}, {
  appKey: TRELLO_API_KEY,
  appName: 'TimexEtapas Power-Up'
});
