var onHistorialClick = function(t, opts) {
    return t.popup({
        title: 'TimexEtapas - Historial',
        url: './popup.html',
        height: 400
    });
};

TrelloPowerUp.initialize({
    'card-badges': function(t, opts) {
        return t.card('all')
            .then(function(card) {
                return initializeCardTracking(t, card)
                    .then(function() {
                        return calculateTimeInCurrentList(t, card);
                    })
                    .then(function(timeData) {
                        if (timeData.totalMinutes >= 1) {
                            var text = formatTime(timeData);
                            var color = getColorByTime(timeData.totalMinutes);
                            
                            return [{
                                icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/clock.svg',
                                text: text,
                                color: color
                            }];
                        }
                        return [];
                    })
                    .catch(function(error) {
                        return [];
                    });
            });
    },
    
'card-buttons': function(t, opts) {
    console.log('card-buttons ejecutándose');
    return [{
        icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/star.svg',
        text: 'TEST',
        callback: function(t) {
            alert('¡Funciona!');
        }
    }];
}
});

function initializeCardTracking(t, card) {
    return t.get(card.id, 'shared', 'timexetapas_history', [])
        .then(function(history) {
            var now = new Date().toISOString();
            var needsUpdate = false;
            
            if (history.length === 0) {
                history = [{
                    listId: card.idList,
                    startDate: now,
                    endDate: null
                }];
                needsUpdate = true;
            } else {
                var currentEntry = history.find(function(entry) {
                    return entry.listId === card.idList && !entry.endDate;
                });
                
                if (!currentEntry) {
                    history.forEach(function(entry) {
                        if (!entry.endDate) {
                            entry.endDate = now;
                        }
                    });
                    
                    history.push({
                        listId: card.idList,
                        startDate: now,
                        endDate: null
                    });
                    needsUpdate = true;
                }
            }
            
            if (needsUpdate) {
                return t.set(card.id, 'shared', 'timexetapas_history', history);
            }
            
            return Promise.resolve();
        })
        .catch(function(error) {
            return Promise.resolve();
        });
}

function calculateTimeInCurrentList(t, card) {
    return t.get(card.id, 'shared', 'timexetapas_history', [])
        .then(function(history) {
            var now = new Date();
            var currentEntry = history.find(function(entry) {
                return entry.listId === card.idList && !entry.endDate;
            });
            
            if (currentEntry) {
                var startDate = new Date(currentEntry.startDate);
                var diffMs = now - startDate;
                var totalMinutes = Math.floor(diffMs / (1000 * 60));
                var hours = Math.floor(totalMinutes / 60);
                var minutes = totalMinutes % 60;
                var days = Math.floor(hours / 24);
                var remainingHours = hours % 24;
                
                return {
                    days: days,
                    hours: remainingHours,
                    minutes: minutes,
                    totalMinutes: totalMinutes
                };
            }
            
            return { days: 0, hours: 0, minutes: 0, totalMinutes: 0 };
        })
        .catch(function(error) {
            return { days: 0, hours: 0, minutes: 0, totalMinutes: 0 };
        });
}

function formatTime(timeData) {
    if (timeData.days > 0) {
        return timeData.days + 'd ' + timeData.hours + 'h';
    } else if (timeData.hours > 0) {
        return timeData.hours + 'h ' + timeData.minutes + 'm';
    } else {
        return timeData.minutes + 'm';
    }
}

function getColorByTime(totalMinutes) {
    if (totalMinutes < 60) return 'green';
    if (totalMinutes < 1440) return 'yellow';
    if (totalMinutes < 4320) return 'orange';
    return 'red';
}