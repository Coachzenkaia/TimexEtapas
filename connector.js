// connector.js (CÓDIGO CORREGIDO Y FINAL)

// Creamos una función para la capacidad, así es más limpio.
const showCardBackSection = function(t) {
    // 't' aquí es un objeto Trello completamente inicializado.
    return t.popup({
        title: 'Tiempo por Etapa',
        url: './time-history.html', // Usamos una URL relativa
        height: 230
    });
};

// Inicializamos el Power-Up de la forma correcta
window.TrelloPowerUp.initialize({
    'card-back-section': function(t, options) {
        // Esta función SÓLO devuelve la descripción de la sección.
        // NO realiza operaciones complejas como signUrl.
        return {
            title: 'Tiempo por Etapa',
            icon: t.signUrl(t.root, './icon.svg'), // Forma correcta de firmar un icono
            content: {
                type: 'iframe',
                // La URL del iframe se carga aparte y no necesita firmarse aquí.
                url: './time-history.html', 
                height: 230
            }
        };
    }
}, {
    // Opciones de la aplicación
    // Forzamos el uso de la API v1 para evitar problemas de compatibilidad
    appKey: 'd52c114526278a278148386c1341c52d',
    appName: 'TimexEtapas Power-Up'
});