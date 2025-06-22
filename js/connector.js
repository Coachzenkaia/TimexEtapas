TrelloPowerUp.initialize({
    // Detectar cuando se carga una tarjeta y trackear su posición
    'card-badges': function(t, opts) {
        return t.card('all')
            .then(function(card) {
                // Primero asegurar que se trackee la tarjeta
                return initializeCardTracking(t, card)
                    .then(function() {
                        // Luego calcular y mostrar tiempo en lista actual
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
        return [{
            icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
            text: 'Historial TimexEtapas',
            callback: function(t) {
                return t.popup({
                    title: 'Historial por Lista',
                    url: './popup.html',
                    height: 500,
                    width: 400
                });
            }
        }];
    }
});

// Función para inicializar tracking de una tarjeta
function initializeCardTracking(t, card) {
    return t.get(card.id, 'shared', 'timexetapas_history', [])
        .then(function(history) {
            var now = new Date().toISOString();
            var needsUpdate = false;
            
            if (history.length === 0) {
                // Primera vez que vemos esta tarjeta - crear entrada inicial
                history = [{
                    listId: card.idList,
                    listName: '', // Se actualizará después
                    startDate: now,
                    endDate: null
                }];
                needsUpdate = true;
            } else {
                // Verificar si la tarjeta cambió de lista
                var currentEntry = history.find(function(entry) {
                    return entry.listId === card.idList && !entry.endDate;
                });
                
                if (!currentEntry) {
                    // La tarjeta se movió a una nueva lista
                    // Cerrar todas las entradas abiertas
                    history.forEach(function(entry) {
                        if (!entry.endDate) {
                            entry.endDate = now;
                        }
                    });
                    
                    // Agregar nueva entrada para la lista actual
                    history.push({
                        listId: card.idList,
                        listName: '', // Se actualizará después
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
        });
}

// Función para calcular tiempo en lista actual
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
                    totalMinutes: totalMinutes,
                    startDate: currentEntry.startDate
                };
            }
            
            return { days: 0, hours: 0, minutes: 0, totalMinutes: 0 };
        });
}

// Función para formatear tiempo
function formatTime(timeData) {
    if (timeData.days > 0) {
        return timeData.days + 'd ' + timeData.hours + 'h';
    } else if (timeData.hours > 0) {
        return timeData.hours + 'h ' + timeData.minutes + 'm';
    } else {
        return timeData.minutes + 'm';
    }
}

// Función para determinar color según tiempo
function getColorByTime(totalMinutes) {
    if (totalMinutes < 60) return 'green';      // menos de 1 hora
    if (totalMinutes < 1440) return 'yellow';   // menos de 1 día (24h)
    if (totalMinutes < 4320) return 'orange';   // menos de 3 días (72h)
    return 'red';                               // más de 3 días
}
TrelloPowerUp.initialize({
    // ... todo tu código existente se mantiene igual ...
    
    'card-badges': function(t, opts) {
        // ... tu código actual de badges ...
    },
    
    'card-buttons': function(t, opts) {
        // ... tu código actual de buttons ...
    },
    
    // NUEVA FUNCIONALIDAD: Sección del reverso de la tarjeta
    'card-back-section': function(t, opts) {
        return {
            title: 'TimexEtapas - Tiempo por Lista',
            icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/clock.svg',
            content: {
                type: 'iframe',
                url: t.signUrl('./card-back.html'),
                height: 300
            }
        };
    }
});
