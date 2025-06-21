// connector.js

window.TrelloPowerUp.initialize({
  /* 
    Definimos la capacidad 'card-back-section'.
    Esto le dice a Trello que queremos añadir una nueva sección 
    en la parte trasera de las tarjetas.
  */
  'card-back-section': function(t, options) {
    return {
      // El título que aparecerá en la sección
      title: 'Tiempo por Etapa',
      // Un ícono para el título (puedes usar el mismo de antes)
      icon: './icon.svg', 
      // El contenido de la sección será un iframe
      content: {
        type: 'iframe',
        // Le decimos a Trello que cargue este archivo HTML dentro del iframe
        url: t.signUrl('./card-back-section.html'),
        // Altura inicial del iframe
        height: 80 
      }
    };
  }
});