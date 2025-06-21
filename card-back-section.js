// card-back-section.js
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

window.TrelloPowerUp.iframe(null, {
  render: function(t, options) {
    console.log("PUNTO 1: La función render se ha ejecutado.");

    const contentEl = document.getElementById('content');

    return t.get('card', 'private', 'actions')
      .then(function(actions) {
        console.log("PUNTO 2: Se obtuvieron las acciones de la tarjeta.", actions);

        const cardMovements = [];
        const creationAction = actions.find(a => a.type === 'createCard');

        if (!creationAction) {
          console.error("ERROR: No se encontró la acción de creación.");
          contentEl.innerHTML = '<p>No se pudo determinar la fecha de creación.</p>';
          return t.sizeTo(contentEl);
        }

        console.log("PUNTO 3: Acción de creación encontrada.", creationAction);

        let lastMoveDate = new Date(creationAction.date);
        let lastListName = creationAction.data.list.name;
        const moveActions = actions
          .filter(a => a.type === 'updateCard' && a.data.listAfter && a.data.listBefore)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        console.log("PUNTO 4: Movimientos encontrados.", moveActions);

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

        console.log("PUNTO 5: Cálculos completados.", cardMovements);

        const historyHtml = cardMovements.reverse().map(move =>
          `<li>${move.listName}: <span>${move.duration}</span></li>`
        ).join('');

        contentEl.innerHTML = `<ul>${historyHtml}</ul>`;
        return t.sizeTo(contentEl);
      });
  }
});
