// card-back-section.js

const t = window.TrelloPowerUp.iframe();
// ***** API KEY ACTUALIZADA *****
const API_KEY = '96e6f5f73e3878e9f40bd3d241f8b732';
const contentDiv = document.getElementById('content');

/**
 * Muestra un botón para que el usuario autorice el Power-Up.
 */
function mostrarBotonAutorizar() {
    contentDiv.innerHTML = `
        <p>Para ver el historial, primero debes autorizar el Power-Up.</p>
        <button id="authorize-btn" class="mod-primary">Autorizar</button>
    `;
    document.getElementById('authorize-btn').addEventListener('click', function() {
        // Esto le pide a Trello que muestre la ventana de autorización
        // que definimos en 'show-authorization' en connector.js
        t.showAuthorization();
    });
}

/**
 * Procesa y muestra el historial de movimientos de la tarjeta.
 * @param {Array} actions - El array de acciones de la API de Trello.
 */
function renderHistorial(actions) {
    // Filtramos solo las acciones que indican un cambio de lista
    const historialLista = actions.filter(a => a.type === 'updateCard' && a.data.listBefore && a.data.listAfter);

    if (historialLista.length > 0) {
        let html = '<h4>Historial de Movimientos:</h4><ul>';
        historialLista.forEach(accion => {
            const fecha = new Date(accion.date).toLocaleString();
            html += `<li>De <b>${accion.data.listBefore.name}</b> a <b>${accion.data.listAfter.name}</b> <br><small>(${fecha})</small></li>`;
        });
        html += '</ul>';
        contentDiv.innerHTML = html;
    } else {
        contentDiv.innerHTML = '<p>Esta tarjeta aún no ha sido movida entre listas.</p>';
    }
}

/**
 * Carga el historial de la tarjeta usando la API de Trello.
 * @param {string} token - El token de autorización del usuario.
 */
function cargarHistorial(token) {
    contentDiv.innerHTML = '<p>Cargando historial...</p>';
    
    // Obtenemos el ID de la tarjeta actual
    const cardId = t.getContext().card;
    const url = `https://api.trello.com/1/cards/${cardId}/actions?key=${API_KEY}&token=${token}&filter=updateCard:idList`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                // Si la respuesta no es exitosa (ej. token inválido), lanzamos un error
                throw new Error('Respuesta de red no fue exitosa.');
            }
            return response.json();
        })
        .then(actions => {
            renderHistorial(actions);
        })
        .catch(error => {
            console.error('Error al cargar historial:', error);
            // Si la API falla, es posible que el token haya sido revocado.
            // Le pedimos al usuario que re-autorice.
            contentDiv.innerHTML = '<p>Hubo un error al cargar el historial. Por favor, intenta autorizar de nuevo.</p>';
            mostrarBotonAutorizar();
        });
}


// --- PUNTO DE ENTRADA PRINCIPAL ---
// Esto se ejecuta cada vez que la sección trasera de la tarjeta se renderiza.
t.render(function() {
    // 1. Intentamos obtener el token que guardamos previamente.
    return t.get('member', 'private', 'token')
        .then(function(token) {
            if (token) {
                // 2. SI TENEMOS TOKEN: Llamamos a la función para cargar el historial.
                cargarHistorial(token);
            } else {
                // 3. SI NO TENEMOS TOKEN: Mostramos el botón para autorizar.
                mostrarBotonAutorizar();
            }
        })
        .catch(function(error){
            console.error("Error obteniendo el token:", error);
            contentDiv.innerHTML = '<p>Ocurrió un error inesperado.</p>';
        });
});