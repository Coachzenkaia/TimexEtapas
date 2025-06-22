// card-back-section.js

const t = window.TrelloPowerUp.iframe();
const API_KEY = '96e6f5f73e3878e9f40bd3d241f8b732';
const contentDiv = document.getElementById('content');

/**
 * Muestra un botón para que el usuario autorice el Power-Up.
 * ¡AQUÍ ESTÁ EL CAMBIO CLAVE!
 */
function mostrarBotonAutorizar() {
    contentDiv.innerHTML = `
        <p>Para ver el historial, primero debes autorizar el Power-Up.</p>
        <button id="authorize-btn" class="mod-primary">Autorizar</button>
    `;
    document.getElementById('authorize-btn').addEventListener('click', function() {
        // Obtenemos la URL de nuestra página de auth.html para que Trello sepa a dónde redirigir.
        // t.signUrl se asegura de que la URL sea válida dentro de Trello.
        const authUrl = t.signUrl('./auth.html');
        
        // Construimos la URL de autorización que Trello espera.
        const trelloAuthUrl = `https://trello.com/1/authorize?return_url=${encodeURIComponent(authUrl)}&expiration=never&name=TimexEtapas&scope=read&response_type=token&key=${API_KEY}`;
        
        // Ya no usamos t.showAuthorization(), llamamos directamente a t.authorize().
        // Esto es mucho más directo y robusto.
        t.authorize(trelloAuthUrl)
            .catch(function(authError) {
                console.error('Fallo en la autorización:', authError);
                alert('No se pudo completar el proceso de autorización.');
            });
    });
}

// ... Las funciones renderHistorial() y cargarHistorial() se quedan exactamente igual ...

/**
 * Procesa y muestra el historial de movimientos de la tarjeta.
 * @param {Array} actions - El array de acciones de la API de Trello.
 */
function renderHistorial(actions) {
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
    const cardId = t.getContext().card;
    const url = `https://api.trello.com/1/cards/${cardId}/actions?key=${API_KEY}&token=${token}&filter=updateCard:idList`;

    fetch(url)
        .then(response => {
            if (!response.ok) { throw new Error('Respuesta de red no fue exitosa.'); }
            return response.json();
        })
        .then(actions => renderHistorial(actions))
        .catch(error => {
            console.error('Error al cargar historial:', error);
            contentDiv.innerHTML = '<p>Hubo un error al cargar el historial. Por favor, intenta autorizar de nuevo.</p>';
            mostrarBotonAutorizar();
        });
}


// --- PUNTO DE ENTRADA PRINCIPAL (SIN CAMBIOS) ---
t.render(function() {
    return t.get('member', 'private', 'token')
        .then(function(token) {
            if (token) {
                cargarHistorial(token);
            } else {
                mostrarBotonAutorizar();
            }
        });
});