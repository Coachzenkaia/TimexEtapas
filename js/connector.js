TrelloPowerUp.initialize({
    'card-badges': function(t, opts) {
        // Obtener datos básicos de la tarjeta
        return t.card('id', 'idList', 'dateLastActivity')
            .then(function(card) {
                // Calcular tiempo básico desde última actividad
                var lastActivity = new Date(card.dateLastActivity);
                var now = new Date();
                var diffMs = now - lastActivity;
                var totalMinutes = Math.floor(diffMs / (1000 * 60));
                
                if (totalMinutes >= 1) {
                    var text;
                    var color = 'green';
                    
                    if (totalMinutes < 60) {
                        text = totalMinutes + 'm';
                    } else {
                        var hours = Math.floor(totalMinutes / 60);
                        var minutes = totalMinutes % 60;
                        text = hours + 'h ' + minutes + 'm';
                        
                        if (hours > 24) color = 'yellow';
                        if (hours > 72) color = 'orange';
                        if (hours > 168) color = 'red';
                    }
                    
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
    },
    
    'card-buttons': function(t, opts) {
        return [{
            icon: 'https://cdn.jsdelivr.net/npm/feather-icons/dist/icons/activity.svg',
            text: 'Historial',
            callback: function(t) {
                return t.popup({
                    title: 'TimexEtapas',
                    url: './popup.html',
                    height: 200
                });
            }
        }];
    }
});