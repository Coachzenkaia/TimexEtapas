// connector.js

// Tu API Key de Trello
const API_KEY = '96e6f5f73e3878e9f40bd3d241f8b732';
// El ícono de tu Power-Up
const ICONO = './timexetapas.png';

window.TrelloPowerUp.initialize({
    // Capacidad: Sección en la parte trasera de la tarjeta
    'card-back-section': function (t, options) {
        return {
            title: 'Tiempo por Etapas',
            icon: ICONO,
            content: {
                type: 'iframe',
                url: t.signUrl('./card-back-section.html'), // Apunta al HTML de la sección
                height: 250 // Altura de la sección en píxeles
            }
        };
    },

    // Capacidad: Estado de autorización
    // Trello usa esto para saber si el usuario ya autorizó el Power-Up
    'authorization-status': function(t, options){
        return t.get('member', 'private', 'token')
            .then(function(token){
                if(token){
                    return { authorized: true }; // Si hay token, está autorizado
                }
                return { authorized: false }; // Si no, no está autorizado
            });
    },

    // Capacidad: Mostrar la autorización
    // Se activa cuando llamamos a t.showAuthorization() desde nuestro código
    'show-authorization': function(t, options){
        return t.popup({
            title: 'Autorizar TimexEtapas',
            url: './auth.html', // Abre la ventana de autenticación
            height: 140,
        });
    }
});