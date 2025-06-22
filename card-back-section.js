// card-back-section.js - VERSIÓN FINAL

const t = window.TrelloPowerUp.iframe();
const API_KEY = '96e6f5f73e3878e9f40bd3d241f8b732';
const contentDiv = document.getElementById('content');

function mostrarBotonAutorizar() {
    contentDiv.innerHTML = `
        <p>Para ver el historial, debes autorizar el Power-Up.</p>
        <button id="authorize-btn" class="mod-primary">Autorizar</button>
    `;
    document.getElementById('authorize-btn').addEventListener('click', function() {
        // Le pedimos a Trello que se encargue de mostrar la autorización.
        // Trello buscará la capacidad 'show-authorization' en nuestro connector.js
        t.showAuthorization(); 
    });
}

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

function cargarHistorial(token) {
    contentDiv.innerHTML = '<p>Cargando historial...</p>';
    const cardId = t.getContext().card;
    const url = `https://api.trello.com/1/cards/${cardId}/actions?key=${API_KEY}&token=${token}&filter=updateCard:idList`;

    fetch(url)
        .then(response => {
            if (response.status === 401) { // Específicamente si el token es inválido/revocado
                t.remove('member', 'private', 'token'); // Limpiamos el token viejo
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