// ======================================================================
// 1. CONFIGURACIÓN DE SUPABASE
// ======================================================================

// Credenciales de Supabase proporcionadas.
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 
const TABLE_NAME = 'pedidos'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// 2. VARIABLES GLOBALES Y SELECTORES DOM
// ----------------------------------------------------------------------

let currentPedidoId = null;
let loggedUser = "Usuario A"; // Placeholder, se actualiza al iniciar sesión
let allPedidosData = []; // Almacenará todos los datos cargados desde Supabase

// Selectores cruciales basados en dashboard.html
const dashboardContent = document.getElementById('dashboard-content'); 
const pedidosList = document.getElementById('pedidos-list');
const pedidosCount = document.getElementById('pedidos-count');
const modalOverlay = document.getElementById('detail-modal');

// ----------------------------------------------------------------------
// 3. AUTENTICACIÓN Y SEGURIDAD (CRÍTICO)
// ----------------------------------------------------------------------

/**
 * 🔐 Verifica la sesión de Supabase. Si no es válida, redirige.
 * Muestra el contenido solo si el usuario está autenticado.
 */
async function checkSession() {
    console.log("Verificando sesión...");
    
    // Oculta el contenido al inicio, basándose en el ID del HTML.
    if (dashboardContent) {
        dashboardContent.style.display = 'none';
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.warn("Sesión no detectada. Redirigiendo a index.html");
        window.location.href = 'index.html'; 
        return false;
    }
    
    // Si la sesión es válida:
    loggedUser = user.email || `Usuario ID: ${user.id}`; 
    console.log(`✅ Sesión activa. Usuario: ${loggedUser}`);
    
    // Muestra el dashboard
    if (dashboardContent) {
        dashboardContent.style.display = 'block';
    }
    
    return true;
}

/**
 * 🚪 Cierra la sesión y redirige al login.
 */
async function handleLogout() {
    console.log("Cerrando sesión...");
    await supabase.auth.signOut(); 
    window.location.href = 'index.html'; 
}

// ----------------------------------------------------------------------
// 4. CARGA Y SINCRONIZACIÓN DE DATOS (API FETCH)
// ----------------------------------------------------------------------

async function fetchPedidos() {
    console.log("Cargando pedidos...");
    const fetchUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*`;

    try {
        const response = await fetch(fetchUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}. Verifica las reglas de RLS.`);
        }

        const data = await response.json();
        
        allPedidosData = data; 
        filterAndRenderPedidos(); 

    } catch (error) {
        console.error('❌ Error al cargar los pedidos:', error);
        pedidosList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #e74c3c; font-weight: bold;">Error: No se pudo cargar los datos. Revisa la consola.</p>';
    }
}

// ----------------------------------------------------------------------
// 5. RENDERIZADO Y FILTRADO
// ----------------------------------------------------------------------

/**
 * Determina el color del estado para el renderizado.
 */
function getEstadoColor(estado) {
    const normalized = estado ? estado.toLowerCase() : '';
    if (normalized.includes('pendiente')) return '#f39c12';
    if (normalized.includes('completada')) return '#2ecc71';
    if (normalized.includes('cancelada')) return '#e74c3c';
    return '#e0e0e0';
}

/**
 * Filtra los datos según los checkboxes activos y llama a renderizar.
 */
function filterAndRenderPedidos() {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const activeFilters = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value); 
    
    let filteredData = allPedidosData.filter(p => {
        if (!p.estado) return false; 
        const normalizedState = p.estado.toLowerCase().replace(/á/g, 'a');
        return activeFilters.includes(normalizedState);
    });
    
    renderPedidos(filteredData);
}


/**
 * Renderiza la lista de pedidos en el DOM.
 */
function renderPedidos(data) {
    pedidosList.innerHTML = ''; 
    pedidosCount.textContent = data.length;

    if (data.length === 0) {
         pedidosList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #999;">No hay pedidos para el filtro actual.</p>';
         return;
    }

    data.forEach(p => {
        const item = document.createElement('div');
        item.className = 'pedido-item';
        
        const estado = p.estado || 'N/A';
        const estadoClass = `estado-${estado.toLowerCase().replace(/á/g, 'a')}`; 
        item.classList.add(estadoClass);
        // Usa una función de flecha para capturar el ID correctamente
        item.addEventListener('click', () => showDetail(p.id)); 

        const assignedUser = p.asignado_a && p.asignado_a !== 'N/A' ? 
            `<br><small style="color: #00fff2; font-weight: bold;">Asignado: ${p.asignado_a}</small>` : 
            `<br><small style="color: #f39c12;">Sin Asignar</small>`;
        
        const clientName = (p.clientes && p.clientes.nombre) || 'Cliente Desconocido';
        const date = p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleDateString('es-ES') : 'N/A';
        
        item.innerHTML = `
            <p style="font-size: 1.1em; margin: 0 0 5px 0; color: #c501e2;">${p.producto_nombre || 'Producto N/A'}</p>
            <p style="margin: 0 0 5px 0;">Estado: <strong style="color: ${getEstadoColor(estado)};">${estado}</strong></p>
            <p style="margin: 0;"><small>Cliente: ${clientName}</small>${assignedUser}</p>
            <small style="color: #999;">Pedido #${p.id} | ${date}</small>
        `;
        pedidosList.appendChild(item);
    });
}

// ----------------------------------------------------------------------
// 6. GESTIÓN DE ACCIONES (ASIGNACIÓN Y ESTADO)
// ----------------------------------------------------------------------

/**
 * Envía la solicitud PATCH a Supabase para asignar un pedido al usuario actual.
 */
async function asignarPedido(id, usuario) {
    const pedido = allPedidosData.find(p => p.id === id);
    if (pedido.estado !== 'pendiente') {
        console.error(`Error: Pedido #${id} ya está ${pedido.estado}.`);
        return;
    }

    const updateUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`;
    const updateData = {
        asignado_a: usuario,
        fecha_ultima_accion: new Date().toISOString()
    };
    try {
        await fetch(updateUrl, { 
            method: 'PATCH', 
            headers: {'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'return=minimal'}, 
            body: JSON.stringify(updateData)
        });
        // Actualizar el estado local y refrescar la vista
        pedido.asignado_a = usuario;
        filterAndRenderPedidos();
        showDetail(id); // Refresca el modal para mostrar los nuevos botones
        console.log(`✅ Pedido #${id} asignado a ${usuario}.`);
    } catch (e) { 
        console.error('Error al asignar:', e); 
    }
}

/**
 * Envía la solicitud PATCH a Supabase para actualizar el estado del pedido.
 */
async function actualizarEstado(id, nuevoEstado) {
    const pedido = allPedidosData.find(p => p.id === id);
    
    // Control de permisos: solo puede finalizar el asignado o si no está asignado.
    if (pedido.asignado_a !== loggedUser && pedido.asignado_a !== "Usuario A") {
        console.error(`Error: No puedes finalizar este pedido. Está asignado a ${pedido.asignado_a}.`);
        return;
    }

    const updateUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`;
    const updateData = {
        estado: nuevoEstado.toLowerCase(),
        fecha_ultima_accion: new Date().toISOString()
    };

    try {
        await fetch(updateUrl, { 
            method: 'PATCH', 
            headers: {'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'return=minimal'}, 
            body: JSON.stringify(updateData)
        });
        
        // Actualizar el estado local y refrescar la vista
        pedido.estado = nuevoEstado.toLowerCase();
        filterAndRenderPedidos();
        closeModal();
        console.log(`🎉 Pedido #${id} marcado como ${nuevoEstado}.`);
    } catch (e) { 
        console.error('Error al actualizar estado:', e); 
    }
}

// ----------------------------------------------------------------------
// 7. GESTIÓN DEL MODAL DE DETALLES
// ----------------------------------------------------------------------

function showDetail(pedidoId) {
    const pedido = allPedidosData.find(p => p.id === pedidoId);
    if (!pedido) return; 

    currentPedidoId = pedidoId; 
    
    // 1. Rellenar detalles del pedido y cliente
    const clientName = (pedido.clientes && pedido.clientes.nombre) || 'N/A';
    const clientId = (pedido.clientes && pedido.clientes.numero_whatsapp) || 'N/A';
    
    document.getElementById('modal-title').textContent = `Detalle del Pedido #${pedido.id}`;
    document.getElementById('detail-product').textContent = pedido.producto_nombre || 'N/A';
    document.getElementById('detail-price').textContent = `${(pedido.monto || 0).toFixed(2)}€`;
    document.getElementById('detail-status').textContent = pedido.estado || 'N/A';
    document.getElementById('detail-client-name').textContent = clientName;
    document.getElementById('detail-client-id').textContent = clientId;
    
    const lastActionDate = pedido.fecha_ultima_accion ? new Date(pedido.fecha_ultima_accion).toLocaleString('es-ES') : 'N/A';
    document.getElementById('detail-assigned-user').textContent = pedido.asignado_a || 'N/A';
    document.getElementById('detail-last-action-date').textContent = lastActionDate;
    
    // 2. Configurar botones de acción
    const assignBtn = document.getElementById('assign-btn');
    const completeBtn = document.getElementById('complete-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    // Se asigna el listener aquí para evitar problemas con la carga dinámica de HTML
    assignBtn.onclick = () => asignarPedido(currentPedidoId, loggedUser);
    completeBtn.onclick = () => actualizarEstado(currentPedidoId, 'Completada');
    cancelBtn.onclick = () => actualizarEstado(currentPedidoId, 'Cancelada');

    assignBtn.textContent = `Asignarme (${loggedUser.split('@')[0]})`;

    // Lógica para mostrar/ocultar botones
    const isPending = pedido.estado.toLowerCase() === 'pendiente';
    const isAssignedToMe = pedido.asignado_a === loggedUser;
    const isUnassigned = !pedido.asignado_a || pedido.asignado_a === 'N/A';
    
    if (isPending) {
        if (isUnassigned) {
            assignBtn.classList.remove('hidden');
            completeBtn.classList.add('hidden'); 
            cancelBtn.classList.add('hidden'); 
        } else if (isAssignedToMe) {
            assignBtn.classList.add('hidden');
            completeBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
            completeBtn.disabled = false;
            cancelBtn.disabled = false;
        } else {
            // Asignado a otro usuario
            assignBtn.classList.add('hidden');
            completeBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
            completeBtn.disabled = true; 
            cancelBtn.disabled = true;
        }
    } else {
        // No pendiente: ocultar todos los botones de gestión
        assignBtn.classList.add('hidden');
        completeBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
    }

    // 3. Rellenar el historial de conversación (logs)
    const logContainer = document.getElementById('detail-conversation-log');
    logContainer.innerHTML = '';
    
    const logs = pedido.logs || []; 
    // Muestra los logs en orden cronológico inverso (el más reciente arriba)
    const sortedLogs = [...logs].reverse(); 

    sortedLogs.forEach(log => {
        const isClient = log.es_entrada;
        const directionClass = isClient ? 'log-cliente' : 'log-bot';
        const directionLabel = isClient ? 'Cliente' : 'Bot';

        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.innerHTML = `<p style="margin: 0; padding: 0;"><span class="${directionClass}">[${directionLabel}]</span> ${log.contenido || 'Sin contenido'}</p><small style="color: #999;">Acción: ${log.chatbot_accion || 'N/A'}</small>`;
        logContainer.appendChild(logItem);
    });
    
    // 4. Mostrar el modal
    modalOverlay.classList.add('visible');
}

function closeModal() {
    modalOverlay.classList.remove('visible');
    currentPedidoId = null;
}


// ----------------------------------------------------------------------
// 8. INICIALIZACIÓN (Al cargar la página)
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificar la sesión (Maneja la visibilidad y la redirección)
    const sessionValid = await checkSession();
    if (!sessionValid) return; // Detiene si la sesión no es válida.
    
    // 2. Vincular botón de logout
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // 3. Cargar datos
    await fetchPedidos();
    
    // 4. Vincular filtros para re-filtrar al hacer click
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', filterAndRenderPedidos);
    });

    // 5. Cerrar modal con la tecla Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    });
});
