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
                url: t.signUrl('./card-back-section.html'),
                height: 250
            }
        };
    },

    // Capacidad: Estado de autorización
    // La dejamos porque es útil para que Trello sepa si mostrar o no
    // ciertas opciones que requieran autorización.
    'authorization-status': function(t, options){
        return t.get('member', 'private', 'token')
            .then(function(token){
                return { authorized: !!token }; // Forma corta de retornar true/false
            });
    }

    // HEMOS ELIMINADO la capacidad 'show-authorization' porque ya no se necesita.
});