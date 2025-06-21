// card-back-section.js

// 't' es nuestro objeto de comunicación con Trello
const t = window.TrelloPowerUp.iframe();

// El elemento div donde mostraremos el contenido
const contentEl = document.getElementById('content');

// t.render() se ejecuta cuando la sección se carga
t.render(function() {
  // Pedimos a Trello los datos de la tarjeta actual
  // 'card' nos da acceso a id, name, desc, etc.
  return t.card('name')
    .then(function(card) {
      // 'card' ahora es un objeto que contiene el nombre.
      // Por ejemplo: { name: 'Mi increíble tarjeta' }
      
      // Actualizamos el contenido de nuestro div
      contentEl.innerHTML = `
        <h3>Datos de la Tarjeta</h3>
        <p>Estás viendo la tarjeta: <strong>${card.name}</strong></p>
      `;
    })
    .then(function() {
      // Finalmente, ajustamos el tamaño del iframe al contenido
      return t.sizeTo('#content');
    });
});