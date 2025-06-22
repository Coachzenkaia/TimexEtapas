// connector.js

window.TrelloPowerUp.initialize({
    // Capacidad #1: Añadir una sección en la parte trasera de la tarjeta.
    'card-back-section': function (t, options) {
        return {
            title: 'Tiempo por Etapas',
            icon: './timexetapas.png', // Asegúrate que este ícono exista
            content: {
                type: 'iframe',
                url: t.signUrl('./card-back-section.html'),
                height: 250
            }
        };
    },

    // Capacidad #2: Informar a Trello si el usuario ya está autorizado.
    'authorization-status': function(t, options){
        return t.get('member', 'private', 'token')
            .then(function(token){
                // Si existe un token, devolvemos { authorized: true }. Si no, false.
                return { authorized: !!token }; 
            });
    },

    // Capacidad #3: Definir CÓMO se debe mostrar la autorización.
    // Esto se ejecuta cuando nuestro código llama a t.showAuthorization().
    'show-authorization': function(t, options){
        // Le decimos a Trello que abra nuestro archivo auth.html en un popup.
        return t.popup({
            title: 'Autorizar TimexEtapas',
            url: './auth.html',
            height: 140,
        });
    }
});