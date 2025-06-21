// card-back-section.js

// 't' es nuestro objeto de comunicación con Trello
const t = window.TrelloPowerUp.iframe();

// El elemento div donde mostraremos el contenido
const contentEl = document.getElementById('content');

// t.render() se ejecuta cuando la sección se carga
t.render(function() {
  // Pedimos a Trello los datos de la tarjeta actual.
  // El parámetro 'name' le dice que solo nos interesa el nombre.
  return t.card('name')
    .then(function(card) {
      // 'card' es un objeto que contiene el nombre, ej: { name: 'Mi tarjeta' }
      
      // Actualizamos el contenido de nuestro div con el nombre de la tarjeta
      contentEl.innerHTML = `
        <p>Estás viendo la tarjeta: <strong>${card.name}</strong></p>
      `;
    })
    .then(function() {
      // Finalmente, ajustamos el tamaño del iframe al contenido
      return t.sizeTo('#content');
    });
});