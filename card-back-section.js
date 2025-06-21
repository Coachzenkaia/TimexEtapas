function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

window.TrelloPowerUp.iframe(null, {
  render: function(t, options) {
    const contentEl = document.getElementById('content');
    return t.get('card', 'private', 'actions')
      .then(function(actions) {
        const cardMovements = [];
        const creation = actions.find(a => a.type === 'createCard');
        if (!creation) {
          contentEl.innerHTML = '<p>No se encontró la fecha de creación.</p>';
          return;
        }

        let lastMove = new Date(creation.date);
        let lastList = creation.data.list.name;
        const moves = actions
          .filter(a => a.type === 'updateCard' && a.data.listAfter && a.data.listBefore)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        moves.forEach(m => {
          const moveDate = new Date(m.date);
          cardMovements.push({
            list: lastList,
            duration: formatDuration(moveDate - lastMove)
          });
          lastMove = moveDate;
          lastList = m.data.listAfter.name;
        });

        cardMovements.push({
          list: `${lastList} (actual)`,
          duration: formatDuration(new Date() - lastMove)
        });

        const html = cardMovements.map(m =>
          `<li><strong>${m.list}:</strong> ${m.duration}</li>`
        ).join('');
        contentEl.innerHTML = `<ul>${html}</ul>`;
        return t.sizeTo(contentEl);
      });
  }
});
