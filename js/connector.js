// TimexEtapas - Power-Up para medir tiempo en listas
var Promise = TrelloPowerUp.Promise;

// Función para calcular tiempo en lista actual
function calculateTimeInCurrentList(t, card) {
    return t.get(card.id, 'shared', 'listHistory', [])
        .then(function(history) {
            var now = new Date();
            var currentEntry = history.find(function(entry) {
                return entry.listId === card.idList && !entry.endDate;
            });
            
            if (currentEntry) {
                var startDate = new Date(currentEntry.startDate);
                var diffMs = now - startDate;
                var days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                var hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                
                return {
                    days: days,
                    hours: hours,
                    totalHours: Math.floor(diffMs / (1000 * 60 * 60))
                };
            }
            
            return { days: 0, hours: 0, totalHours: 0 };
        });
}

// Función para determinar color según tiempo
function getColorByTime(hours) {
    if (hours < 24) return 'green';
    if (hours < 72) return 'yellow';
    if (hours < 168) return 'orange';
    return 'red';
}

// Inicializar Power-Up
TrelloPowerUp.initialize({
    'card-badges': function(t, opts) {
        return t.card('all')
            .then(function(card) {
                return calculateTimeInCurrentList(t, card)
                    .then(function(timeData) {
                        if (timeData.totalHours > 0) {
                            var text = timeData.days > 0 ? 
                                timeData.days + 'd ' + timeData.hours + 'h' : 
                                timeData.hours + 'h';
                            
                            return [{
                                icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/clock.svg',
                                text: text,
                                color: getColorByTime(timeData.totalHours)
                            }];
                        }
                        return [];
                    });
            });
    },
    
    'card-buttons': function(t, opts) {
        return [{
            icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
            text: 'Ver Historial',
            callback: function(t) {
                return t.popup({
                    title: 'TimexEtapas - Historial',
                    url: './popup.html',
                    height: 400
                });
            }
        }];
    }
});