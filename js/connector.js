// TimexEtapas - Power-Up para medir tiempo en listas
var Promise = TrelloPowerUp.Promise;

// Función para inicializar historial de una tarjeta
function initializeCardHistory(t, card) {
    return t.get(card.id, 'shared', 'listHistory', [])
        .then(function(history) {
            if (history.length === 0) {
                // Primera vez - crear entrada inicial
                var initialHistory = [{
                    listId: card.idList,
                    startDate: new Date().toISOString(),
                    endDate: null
                }];
                return t.set(card.id, 'shared', 'listHistory', initialHistory)
                    .then(function() {
                        return initialHistory;
                    });
            }
            
            // Verificar si la tarjeta cambió de lista
            var currentEntry = history.find(function(entry) {
                return entry.listId === card.idList && !entry.endDate;
            });
            
            if (!currentEntry) {
                // La tarjeta se movió, cerrar entrada anterior y crear nueva
                var now = new Date().toISOString();
                
                // Cerrar última entrada abierta
                history.forEach(function(entry) {
                    if (!entry.endDate) {
                        entry.endDate = now;
                    }
                });
                
                // Agregar nueva entrada
                history.push({
                    listId: card.idList,
                    startDate: now,
                    endDate: null
                });
                
                return t.set(card.id, 'shared', 'listHistory', history)
                    .then(function() {
                        return history;
                    });
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
                var days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                var hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                return {
                    days: days,
                    hours: hours,
                    minutes: minutes,
                    totalHours: Math.floor(diffMs / (1000 * 60 * 60)),
                    totalMinutes: Math.floor(diffMs / (1000 * 60))
                };
            }
            
            return { days: 0, hours: 0, minutes: 0, totalHours: 0, totalMinutes: 0 };
        });
}

// Función para determinar color según tiempo
function getColorByTime(totalMinutes) {
    if (totalMinutes < 60) return 'green';      // menos de 1 hora
    if (totalMinutes < 1440) return 'yellow';   // menos de 1 día
    if (totalMinutes < 4320) return 'orange';   // menos de 3 días
    return 'red';                               // más de 3 días
}

// Inicializar Power-Up
TrelloPowerUp.initialize({
    'card-badges': function(t, opts) {
        return t.card('all')
            .then(function(card) {
                return calculateTimeInCurrentList(t, card)
                    .then(function(timeData) {
                        if (timeData.totalMinutes >= 5) { // Solo mostrar si ha pasado al menos 5 minutos
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
                    })
                    .catch(function(error) {
                        console.error('Error calculando tiempo:', error);
                        return [];
                    });
            });
    },
    
    'card-buttons': function(t, opts) {
        return [{
            icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
            text: 'TimexEtapas',
            callback: function(t) {
                return t.popup({
                    title: 'Historial de Tiempo',
                    url: './popup.html',
                    height: 400
                });
            }
        }];
    }
}, {
    appKey: 'timexetapas',
    appName: 'TimexEtapas'
});