console.log('TimexEtapas cargando...');

// Función para inicializar historial de una tarjeta
function initializeCardHistory(t, card) {
    return t.get(card.id, 'shared', 'listHistory', [])
        .then(function(history) {
            var now = new Date().toISOString();
            
            if (history.length === 0) {
                // Primera vez - crear entrada inicial
                var initialHistory = [{
                    listId: card.idList,
                    startDate: now,
                    endDate: null
                }];
                return t.set(card.id, 'shared', 'listHistory', initialHistory)
                    .then(function() { return initialHistory; });
            }
            
            // Verificar si cambió de lista
            var currentEntry = history.find(function(entry) {
                return entry.listId === card.idList && !entry.endDate;
            });
            
            if (!currentEntry) {
                // Se movió - cerrar entrada anterior y crear nueva
                history.forEach(function(entry) {
                    if (!entry.endDate) entry.endDate = now;
                });
                
                history.push({
                    listId: card.idList,
                    startDate: now,
                    endDate: null
                });
                
                return t.set(card.id, 'shared', 'listHistory', history)
                    .then(function() { return history; });
            }
            
            return history;
        });
}

// Función para calcular tiempo en lista actual
function calculateTimeInCurrentList(t, card) {
    return initializeCardHistory(t, card)
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
        });
}

// Función para determinar color según tiempo
function getColorByTime(totalMinutes) {
    if (totalMinutes < 60) return 'green';      // menos de 1 hora
    if (totalMinutes < 1440) return 'yellow';   // menos de 1 día  
    if (totalMinutes < 4320) return 'orange';   // menos de 3 días
    return 'red';                               // más de 3 días
}

TrelloPowerUp.initialize({
    'card-badges': function(t, opts) {
        return t.card('all')
            .then(function(card) {
                return calculateTimeInCurrentList(t, card)
                    .then(function(timeData) {
                        if (timeData.totalMinutes >= 1) { // Mostrar desde 1 minuto
                            var text;
                            if (timeData.days > 0) {
                                text = timeData.days + 'd ' + timeData.hours + 'h';
                            } else if (timeData.hours > 0) {
                                text = timeData.hours + 'h ' + timeData.minutes + 'm';
                            } else {
                                text = timeData.minutes + 'm';
                            }
                            
                            return [{
                                icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/clock.svg',
                                text: text,
                                color: getColorByTime(timeData.totalMinutes)
                            }];
                        }
                        return [];
                    });
            });
    },
    
    'card-buttons': function(t, opts) {
        return [{
            icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
            text: 'Historial',
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

console.log('TimexEtapas inicializado correctamente');