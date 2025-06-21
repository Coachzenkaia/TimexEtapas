// card-back-section.js (CÓDIGO CORREGIDO)

// Función de ayuda para formatear el tiempo
function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  if (parts.length === 0 && seconds > 0) parts.push(`${seconds}s`);
  if (parts.length === 0) return 'un momento';

  return parts.join(' ');
}

// LA SOLUCIÓN ESTÁ AQUÍ:
// Pasamos una función como segundo argumento a .iframe().
// Esta función solo se ejecutará DESPUÉS de que 't' esté
// completamente inicializado y listo para usarse.
window.TrelloPowerUp.iframe(null, {
    // 't' es el objeto de Trello ya inicializado
    // 'options' contiene información del contexto
    render: function(t, options) {
        const contentEl = document.getElementById('content');

        return t.get('card', 'private', 'actions')
            .then(function(actions) {
                const cardMovements = [];
                const creationAction = actions.find(a => a.type === 'createCard');

                if (!creationAction) {
                    contentEl.innerHTML = '<p>No se pudo determinar la fecha de creación.</p>';
                    return t.sizeTo(contentEl);
                }

                let lastMoveDate = new Date(creationAction.date);
                let lastListName = creationAction.data.list.name;

                const moveActions = actions
                    .filter(a => a.type === 'updateCard' && a.data.listAfter && a.data.listBefore)
                    .sort((a, b) => new Date(a.date) - new Date(b.date));

                moveActions.forEach(action => {
                    const moveDate = new Date(action.date);
                    const duration = moveDate - lastMoveDate;
                    cardMovements.push({
                        listName: lastListName,
                        duration: formatDuration(duration)
                    });
                    lastMoveDate = moveDate;
                    lastListName = action.data.listAfter.name;
                });

                const timeInCurrentList = new Date() - lastMoveDate;
                cardMovements.push({
                    listName: `<strong>${lastListName} (Actual)</strong>`,
                    duration: formatDuration(timeInCurrentList)
                });

                const historyHtml = cardMovements.reverse().map(move =>
                    `<li>${move.listName}: <span>${move.duration}</span></li>`
                ).join('');

                contentEl.innerHTML = `<ul>${historyHtml}</ul>`;

                return t.sizeTo(contentEl);
            });
    }
});