window.TrelloPowerUp.initialize({
  'card-badges': function(t) {
    return t.get('card', 'private', 'actions')
      .then(function(actions) {
        const creation = actions.find(a => a.type === 'createCard');
        if (!creation) return [];

        let lastMoveDate = new Date(creation.date);
        const moves = actions
          .filter(a => a.type === 'updateCard' && a.data.listAfter && a.data.listBefore)
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        if (moves.length > 0) {
          lastMoveDate = new Date(moves[moves.length - 1].date);
        }

        const now = new Date();
        const durationMs = now - lastMoveDate;
        const minutes = Math.floor(durationMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const label = days > 0 ? `${days}d` : (hours > 0 ? `${hours}h` : `${minutes}m`);
        const color = days >= 3 ? 'red' : (days >= 1 ? 'orange' : 'green');

        return [{
          text: label,
          color: color
        }];
      });
  },

  'card-back-section': function(t) {
    return {
      title: 'Tiempo por Lista',
      icon: '',
      content: {
        type: 'iframe',
        url: './card-back-section.html',
        height: 250
      }
    };
  }
});
