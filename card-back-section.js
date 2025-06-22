// card-back-section.js

const t = window.TrelloPowerUp.iframe();
const API_KEY = '96e6f5f73e3878e9f40bd3d241f8b732'; // Tu API Key
const contentDiv = document.getElementById('content');

// Función que se llama cuando el usuario necesita autorizar.
function mostrarBotonAutorizar() {
    contentDiv.innerHTML = `
        <p>Para ver el historial, primero debes autorizar el Power-Up.</p>
        <button id="authorize-btn" class="mod-primary">Autorizar</button>
    `;
    document.getElementById('authorize-btn').addEventListener('click', function() {
        // Le pedimos a Trello que muestre la autorización.
        // Trello usará la capacidad 'show-authorization' que definimos en el conector.
        t.showAuthorization();
    });
}

// Función que muestra el historial de movimientos.
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

// Función que hace la llamada a la API de Trello para obtener el historial.
function cargarHistorial(token) {
    contentDiv.innerHTML = '<p>Cargando historial...</p>';
    const cardId = t.getContext().card;
    const url = `https://api.trello.com/1/cards/${cardId}/actions?key=${API_KEY}&token=${token}&filter=updateCard:idList`;

    fetch(url)
        .then(response => {
            // Si el token es inválido (error 401), lo borramos para que el usuario pueda autorizar de nuevo.
            if (response.status === 401) {
                t.remove('member', 'private', 'token');
            }
            if (!response.ok) { throw new Error('Respuesta de red no fue exitosa.'); }
            return response.json();
        })
        .then(actions => renderHistorial(actions))
        .catch(error => {
            console.error('Error al cargar historial:', error);
            mostrarBotonAutorizar();
        });
}

// Punto de entrada principal: se ejecuta cada vez que se carga la sección.
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