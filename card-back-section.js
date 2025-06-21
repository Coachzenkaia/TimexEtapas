// card-back-section.js

const t = window.TrelloPowerUp.iframe();
const contentEl = document.getElementById('content');

/**
 * Una función de ayuda para formatear milisegundos en un formato legible
 * como "3d 4h 15m".
 */
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
  
  // Si es menos de un minuto, mostramos los segundos
  if (parts.length === 0 && seconds > 0) parts.push(`${seconds}s`);
  if (parts.length === 0) return 'un momento';

  return parts.join(' ');
}

t.render(function() {
  // ¡ESTA ES LA LÍNEA MÁS IMPORTANTE!
  // Pedimos a Trello que nos dé el historial de acciones de la tarjeta.
  // Necesitamos el permiso 'private' para acceder a esta información.
  return t.get('card', 'private', 'actions')
    .then(function(actions) {
      
      const cardMovements = [];
      
      // 1. Encontramos la acción de creación de la tarjeta
      const creationAction = actions.find(a => a.type === 'createCard');
      if (!creationAction) {
        contentEl.innerHTML = '<p>No se pudo determinar la fecha de creación de la tarjeta.</p>';
        return;
      }

      // La primera "entrada" es la fecha de creación en su lista inicial.
      let lastMoveDate = new Date(creationAction.date);
      let lastListName = creationAction.data.list.name;
      
      // 2. Filtramos solo las acciones que son un movimiento de lista
      const moveActions = actions
        .filter(a => a.type === 'updateCard' && a.data.listAfter && a.data.listBefore)
        .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordenamos por fecha

      // 3. Procesamos cada movimiento para calcular la duración en la lista anterior
      moveActions.forEach(action => {
        const moveDate = new Date(action.date);
        const duration = moveDate - lastMoveDate;
        cardMovements.push({
          listName: lastListName,
          duration: formatDuration(duration)
        });
        // Actualizamos los datos para el siguiente cálculo
        lastMoveDate = moveDate;
        lastListName = action.data.listAfter.name;
      });
      
      // 4. Calculamos el tiempo en la lista actual
      const timeInCurrentList = new Date() - lastMoveDate;
      cardMovements.push({
        listName: `<strong>${lastListName} (Actual)</strong>`,
        duration: formatDuration(timeInCurrentList)
      });
      
      // 5. Generamos el HTML y lo mostramos
      const historyHtml = cardMovements.reverse().map(move => 
        `<li>${move.listName}: <span>${move.duration}</span></li>`
      ).join('');
      
      contentEl.innerHTML = `<ul>${historyHtml}</ul>`;
      
    })
    .then(function() {
      // Finalmente, ajustamos el tamaño del iframe al contenido
      return t.sizeTo('#content');
    });
});