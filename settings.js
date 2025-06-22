/**
 * TimexEtapas - Configuración de horarios laborales
 * Maneja la interfaz de configuración y persistencia de datos
 */

// Configuración por defecto
const DEFAULT_SETTINGS = {
    calculationMode: '24x7', // '24x7' o 'businessHours'
    startTime: '09:00',
    endTime: '18:00',
    workDays: [1, 2, 3, 4, 5], // Lunes a Viernes (0=Domingo, 6=Sábado)
    timezone: 'America/Guatemala'
};

// Variable global para la instancia de Trello Power-Up
let t;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 TimexEtapas Settings: Inicializando configuración...');
    
    // Inicializar Trello Power-Up para iframe
    t = TrelloPowerUp.iframe();
    
    // Cargar configuración existente
    loadCurrentSettings();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar visibilidad inicial
    toggleBusinessHoursConfig();
    
    console.log('✅ TimexEtapas Settings: Configuración lista');
});

/**
 * Carga la configuración actual del usuario
 */
function loadCurrentSettings() {
    console.log('📖 Cargando configuración existente...');
    
    return t.get('member', 'private', 'timexEtapasSettings')
        .then(function(settings) {
            const config = settings || DEFAULT_SETTINGS;
            
            // Aplicar configuración al formulario
            document.getElementById('mode24x7').checked = config.calculationMode === '24x7';
            document.getElementById('modeBusinessHours').checked = config.calculationMode === 'businessHours';
            
            document.getElementById('startTime').value = config.startTime;
            document.getElementById('endTime').value = config.endTime;
            document.getElementById('timezone').value = config.timezone;
            
            // Configurar días laborales
            const workDaysCheckboxes = document.querySelectorAll('input[type="checkbox"]');
            workDaysCheckboxes.forEach(checkbox => {
                checkbox.checked = config.workDays.includes(parseInt(checkbox.value));
            });
            
            console.log('✅ Configuración cargada:', config);
            toggleBusinessHoursConfig();
        })
        .catch(function(error) {
            console.error('❌ Error cargando configuración:', error);
            showStatusMessage('Error al cargar configuración existente', 'error');
        });
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Cambio en modo de cálculo
    document.querySelectorAll('input[name="calculationMode"]').forEach(radio => {
        radio.addEventListener('change', toggleBusinessHoursConfig);
    });
    
    // Envío del formulario
    document.getElementById('settingsForm').addEventListener('submit', handleSaveSettings);
    
    // Botón cancelar
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);
    
    // Validación de horarios
    document.getElementById('startTime').addEventListener('change', validateTimeRange);
    document.getElementById('endTime').addEventListener('change', validateTimeRange);
}

/**
 * Muestra/oculta configuración de horario laboral según el modo
 */
function toggleBusinessHoursConfig() {
    const isBusinessHours = document.getElementById('modeBusinessHours').checked;
    const businessConfig = document.getElementById('businessHoursConfig');
    const workDaysConfig = document.getElementById('workDaysConfig');
    const timezoneConfig = document.getElementById('timezoneConfig');
    
    if (isBusinessHours) {
        businessConfig.style.display = 'block';
        workDaysConfig.style.display = 'block';
        timezoneConfig.style.display = 'block';
    } else {
        businessConfig.style.display = 'none';
        workDaysConfig.style.display = 'none';
        timezoneConfig.style.display = 'none';
    }
    
    // Redimensionar popup
    t.sizeTo('#settingsForm');
}

/**
 * Valida que la hora de inicio sea menor que la de fin
 */
function validateTimeRange() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (startTime && endTime && startTime >= endTime) {
        showStatusMessage('La hora de inicio debe ser menor que la hora de fin', 'error');
        return false;
    }
    
    hideStatusMessage();
    return true;
}

/**
 * Maneja el guardado de configuración
 */
function handleSaveSettings(event) {
    event.preventDefault();
    
    console.log('💾 Guardando configuración...');
    
    // Validar formulario
    if (!validateForm()) {
        return;
    }
    
    // Recopilar datos del formulario
    const settings = {
        calculationMode: document.querySelector('input[name="calculationMode"]:checked').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        workDays: Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                      .map(cb => parseInt(cb.value)),
        timezone: document.getElementById('timezone').value,
        lastUpdated: Date.now()
    };
    
    // Guardar en Trello
    t.set('member', 'private', 'timexEtapasSettings', settings)
        .then(function() {
            console.log('✅ Configuración guardada exitosamente:', settings);
            showStatusMessage('¡Configuración guardada exitosamente!', 'success');
            
            // Cerrar popup después de 1.5 segundos
            setTimeout(() => {
                t.closePopup();
            }, 1500);
        })
        .catch(function(error) {
            console.error('❌ Error guardando configuración:', error);
            showStatusMessage('Error al guardar la configuración. Inténtalo de nuevo.', 'error');
        });
}

/**
 * Valida el formulario completo
 */
function validateForm() {
    const calculationMode = document.querySelector('input[name="calculationMode"]:checked');
    
    if (!calculationMode) {
        showStatusMessage('Selecciona un modo de cálculo', 'error');
        return false;
    }
    
    if (calculationMode.value === 'businessHours') {
        // Validar horarios
        if (!validateTimeRange()) {
            return false;
        }
        
        // Validar que al menos un día esté seleccionado
        const selectedDays = document.querySelectorAll('input[type="checkbox"]:checked');
        if (selectedDays.length === 0) {
            showStatusMessage('Selecciona al menos un día laboral', 'error');
            return false;
        }
    }
    
    return true;
}

/**
 * Maneja la cancelación
 */
function handleCancel() {
    console.log('🚫 Configuración cancelada');
    t.closePopup();
}

/**
 * Muestra mensaje de estado
 */
function showStatusMessage(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message status-${type}`;
    statusDiv.classList.remove('hidden');
    
    // Auto-ocultar mensajes de éxito después de 3 segundos
    if (type === 'success') {
        setTimeout(hideStatusMessage, 3000);
    }
}

/**
 * Oculta mensaje de estado
 */
function hideStatusMessage() {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.classList.add('hidden');
}

// Manejo de errores globales
window.addEventListener('error', function(event) {
    console.error('❌ TimexEtapas Settings Error:', event.error);
    showStatusMessage('Ha ocurrido un error inesperado', 'error');
});

console.log('📋 TimexEtapas Settings: Script cargado correctamente');