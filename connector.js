// connector.js - VERSIÓN FINAL

window.TrelloPowerUp.initialize({
    // Capacidad: Sección en la parte trasera de la tarjeta
    'card-back-section': function (t, options) {
        return {
            title: 'Tiempo por Etapas',
            icon: './timexetapas.png',
            content: {
                type: 'iframe',
                url: t.signUrl('./card-back-section.html'),
                height: 250
            }
        };
    },

    // Capacidad: Estado de autorización
    'authorization-status': function(t, options){
        return t.get('member', 'private', 'token')
            .then(function(token){
                return { authorized: !!token };
            });
    },

    // Capacidad: Mostrar la ventana de autorización
    // Le dice a Trello QUÉ HACER cuando nuestro código llama a t.showAuthorization()
    'show-authorization': function(t, options){
        return t.popup({
            title: 'Autorizar TimexEtapas',
            url: './auth.html', // Le decimos que abra auth.html en un popup
            height: 140,
        });
    }
});