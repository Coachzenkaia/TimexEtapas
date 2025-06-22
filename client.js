/**
 * TimexEtapas - Trello Power-Up para seguimiento de tiempo
 * Desarrollado para Coach Lisandro Castaneda
 * 
 * Funcionalidades:
 * - Tiempo total en tablero desde creación
 * - Tiempo en lista actual
 * - Historial de tiempo en listas anteriores
 * - Colores dinámicos según duración
 * - Configuración de horarios laborales
 * - Nombres reales de listas
 */

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Formatea milisegundos a formato legible (días, horas, minutos)
 */
function formatTime(milliseconds) {
    // Validar entrada para evitar NaN
    if (typeof milliseconds !== 'number' || isNaN(milliseconds) || milliseconds < 0) {
        console.warn('⚠️ formatTime: Valor inválido recibido:', milliseconds);
        return '0m';
    }
    
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    
    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

/**
 * Determina el color del badge según los días transcurridos
 */
function getColorByTime(days) {
    if (days >= 8) return 'red';      // 8+ días = rojo (crítico)
    if (days >= 4) return 'yellow';   // 4-7 días = amarillo (atención)
    return 'green';                   // 0-3 días = verde (normal)
}

/**
 * Obtiene o inicializa los datos de seguimiento de tiempo para una tarjeta
 */
function getOrInitializeTimeData(t, currentListId = null, currentListName = null) {
    return t.get('card', 'shared', 'timexEtapas')
        .then(function(timeData) {
            const now = Date.now();
            
            if (!timeData) {
                // Primera vez: inicializar datos
                const initialData = {
                    createdAt: now,
                    currentListId: currentListId,
                    currentListName: currentListName,
                    movedToCurrentListAt: now,
                    listHistory: {},
                    version: '1.0'
                };
                
                return t.set('card', 'shared', 'timexEtapas', initialData)
                    .then(() => {
                        console.log('✅ TimexEtapas: Datos inicializados para nueva tarjeta');
                        return initialData;
                    });
            }
            
            return timeData;
        })
        .catch(function(error) {
            console.error('❌ TimexEtapas: Error al obtener datos:', error);
            throw error;
        });
}

/**
 * Actualiza el historial cuando una tarjeta se mueve entre listas
 */
function updateListHistory(t, timeData, currentListId, currentListName) {
    const now = Date.now();
    let updatedData = { ...timeData };
    
    // Si la tarjeta cambió de lista
    if (timeData.currentListId && timeData.currentListId !== currentListId) {
        console.log('📋 TimexEtapas: Detectado movimiento de lista');
        
        // Calcular tiempo en la lista anterior
        const timeInPreviousList = now - timeData.movedToCurrentListAt;
        const previousListId = timeData.currentListId;
        const previousListName = timeData.currentListName || 'Lista anterior';
        
        // Validar que el tiempo sea positivo
        if (timeInPreviousList > 0) {
            // Inicializar historial si no existe
            if (!updatedData.listHistory) {
                updatedData.listHistory = {};
            }
            
            // Actualizar historial con formato nuevo
            if (!updatedData.listHistory[previousListId]) {
                updatedData.listHistory[previousListId] = {
                    time: 0,
                    name: previousListName
                };
            }
            
            // Si ya existe pero es formato antiguo, convertir
            if (typeof updatedData.listHistory[previousListId] === 'number') {
                const oldTime = updatedData.listHistory[previousListId];
                updatedData.listHistory[previousListId] = {
                    time: oldTime,
                    name: previousListName
                };
            }
            
            updatedData.listHistory[previousListId].time += timeInPreviousList;
            updatedData.listHistory[previousListId].name = previousListName;
        }
        
        // Actualizar datos para la nueva lista
        updatedData.currentListId = currentListId;
        updatedData.currentListName = currentListName || 'Lista actual';
        updatedData.movedToCurrentListAt = now;
        
        // Guardar cambios
        return t.set('card', 'shared', 'timexEtapas', updatedData)
            .then(() => {
                console.log(`📊 TimexEtapas: Historial actualizado. Tiempo en "${previousListName}": ${formatTime(timeInPreviousList)}`);
                return updatedData;
            });
    } else if (!timeData.currentListId && currentListId) {
        // Primera vez que se rastrea la lista
        updatedData.currentListId = currentListId;
        updatedData.currentListName = currentListName || 'Lista inicial';
        updatedData.movedToCurrentListAt = now;
        
        return t.set('card', 'shared', 'timexEtapas', updatedData)
            .then(() => {
                console.log(`📋 TimexEtapas: Lista inicial registrada: "${currentListName}"`);
                return updatedData;
            });
    }
    
    return Promise.resolve(updatedData);
}

// ==================== INICIALIZACIÓN DEL POWER-UP ====================

TrelloPowerUp.initialize({
    
    // ==================== BADGE PRINCIPAL (CARA DE LA TARJETA) ====================
    'card-badges': function(t, options) {
        console.log('🔍 TimexEtapas: Calculando badge principal...');
        
        return getOrInitializeTimeData(t)
            .then(function(timeData) {
                const now = Date.now();
                
                // Calcular tiempo total en tablero
                const totalTime = now - timeData.createdAt;
                const totalDays = Math.floor(totalTime / (1000 * 60 * 60 * 24));
                const formattedTime = formatTime(totalTime);
                const badgeColor = getColorByTime(totalDays);
                
                console.log(`⏱️ TimexEtapas: ${formattedTime} en tablero (${badgeColor})`);
                
                return [{
                    text: formattedTime,
                    color: badgeColor,
                    refresh: 300, // Actualizar cada 5 minutos
                    title: `Tiempo total en tablero: ${formattedTime}`
                }];
            })
            .catch(function(error) {
                console.error('❌ TimexEtapas: Error en card-badges:', error);
                return [{
                    text: 'Error',
                    color: 'red',
                    title: 'Error al calcular tiempo'
                }];
            });
    },
    
    // ==================== BADGES DETALLADOS (REVERSO DE LA TARJETA) ====================
    'card-detail-badges': function(t, options) {
        console.log('🔍 TimexEtapas: Calculando badges detallados...');
        
        return Promise.all([
            t.card('idList'),
            t.lists('id', 'name'),
            getOrInitializeTimeData(t)
        ]).then(function([cardInfo, allLists, timeData]) {
            const currentListId = cardInfo.idList;
            
            // Encontrar el nombre de la lista actual
            const currentList = allLists.find(list => list.id === currentListId);
            const currentListName = currentList ? currentList.name : 'Lista actual';
            
            console.log(`📋 Lista actual: "${currentListName}" (${currentListId})`);
            
            // Actualizar historial si es necesario
            return updateListHistory(t, timeData, currentListId, currentListName);
        }).then(function(updatedTimeData) {
            const now = Date.now();
            let badges = [];
            
            // Badge 1: Tiempo total en tablero
            const totalTime = now - updatedTimeData.createdAt;
            badges.push({
                title: 'Tiempo total en tablero',
                text: formatTime(totalTime),
                color: 'blue'
            });
            
            // Badge 2: Tiempo en lista actual
            const timeInCurrentList = now - updatedTimeData.movedToCurrentListAt;
            badges.push({
                title: 'Tiempo en lista actual',
                text: formatTime(timeInCurrentList),
                color: 'green'
            });
            
            // Badge de CONFIGURACIÓN (¡NUEVO!)
            badges.push({
                title: '⚙️ Configurar TimexEtapas',
                text: 'Horarios laborales',
                color: 'orange',
                callback: function(t) {
                    console.log('⚙️ TimexEtapas: Abriendo configuración desde badge...');
                    
                    return t.popup({
                        title: 'Configuración de TimexEtapas',
                        url: './settings.html',
                        height: 650
                    });
                }
            });
            
            // Badge 3+: Historial de listas anteriores (CON NOMBRES)
            if (updatedTimeData.listHistory && Object.keys(updatedTimeData.listHistory).length > 0) {
                for (const [listId, listData] of Object.entries(updatedTimeData.listHistory)) {
                    // Manejar tanto formato nuevo como antiguo
                    let listName, accumulatedTime;
                    
                    if (typeof listData === 'object' && listData.name) {
                        // Formato nuevo: { time: number, name: string }
                        listName = listData.name;
                        accumulatedTime = listData.time;
                    } else {
                        // Formato antiguo: solo el tiempo como número
                        listName = `Lista anterior`;
                        accumulatedTime = listData;
                    }
                    
                    // Validar que accumulatedTime sea un número válido
                    if (typeof accumulatedTime === 'number' && !isNaN(accumulatedTime) && accumulatedTime > 0) {
                        badges.push({
                            title: listName,
                            text: formatTime(accumulatedTime),
                            color: 'light-gray'
                        });
                    }
                }
            }
            
            console.log(`📊 TimexEtapas: Mostrando ${badges.length} badges detallados`);
            return badges;
        })
        .catch(function(error) {
            console.error('❌ TimexEtapas: Error en card-detail-badges:', error);
            return [{
                title: 'Error de TimexEtapas',
                text: 'No se pudo calcular el tiempo',
                color: 'red'
            }];
        });
    }
});

// ==================== CONFIRMACIÓN DE CARGA ====================
console.log('🚀 TimexEtapas Power-Up inicializado correctamente');
console.log('📋 Funcionalidades: Tiempo en tablero, tiempo en lista, historial, configuración');
console.log('🎨 Colores: Verde (0-3d), Amarillo (4-7d), Rojo (8+d)');
console.log('🔄 Actualización automática cada 5 minutos');
console.log('⚙️ Configuración disponible en reverso de tarjetas');