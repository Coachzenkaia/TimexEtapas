TrelloPowerUp.initialize({
    'card-badges': function(t, opts) {
        return t.card('dateLastActivity')
            .then(function(card) {
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
                        text: text,
                        color: color
                    }];
                }
                
                return [];
            });
    },
    
    'card-buttons': function(t, opts) {
        return [{
            text: 'TimexEtapas',
            callback: function(t) {
                alert('¡TimexEtapas funciona! Los badges muestran tiempo desde última actividad.');
            }
        }];
    }
});