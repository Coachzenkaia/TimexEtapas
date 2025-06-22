const t = TrelloPowerUp.iframe();

const msToTime = ms => {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${minutes}m`;
};

const loadListTimes = async () => {
  try {
    const card = await t.card('id', 'name', 'idList');
    const board = await t.board('id');
    const token = await t.get('member', 'private', 'token');

    const res = await fetch(`https://api.trello.com/1/cards/${card.id}/actions?filter=updateCard:idList&key=96e6f5f73e3878e9f40bd3d241f8b732&token=${token}`);
    const actions = await res.json();

    // Ordenamos cronológicamente
    const sorted = actions.reverse();

    const durations = [];
    let lastTimestamp = new Date(card.dateLastActivity).getTime();

    for (const action of sorted) {
      const fromList = action.data.listBefore.name;
      const toList = action.data.listAfter.name;
      const timeInToList = lastTimestamp - new Date(action.date).getTime();

      durations.push({ list: toList, duration: timeInToList });
      lastTimestamp = new Date(action.date).getTime();
    }

    // Tiempo en la lista original
    const createdAt = new Date(1000 * parseInt(card.id.substring(0, 8), 16)).getTime();
    durations.push({ list: sorted[0]?.data?.listBefore?.name || 'Lista de origen', duration: lastTimestamp - createdAt });

    // Agrupar por lista
    const aggregate = {};
    durations.forEach(({ list, duration }) => {
      aggregate[list] = (aggregate[list] || 0) + duration;
    });

    const content = document.getElementById('content');
    content.innerHTML = '<h3>Tiempo por Lista</h3><ul>' +
      Object.entries(aggregate)
        .map(([list, duration]) => `<li><strong>${list}:</strong> ${msToTime(duration)}</li>`)
        .join('') +
      '</ul>';

  } catch (e) {
    console.error('Error cargando historial:', e);
    document.getElementById('content').innerHTML = '<p>Error cargando historial.</p>';
  }
};

loadListTimes();
