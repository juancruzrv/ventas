// ======================================================================
// 1. CONFIGURACIÓN DE SUPABASE (ACTUALIZADA)
// ======================================================================

const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 
const TABLE_NAME = 'pedidos'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// 2. VARIABLES GLOBALES Y SELECTORES DOM
// ----------------------------------------------------------------------

let currentPedidoId = null;
let loggedUser = "Usuario A";
let mockData = []; 

const dashboardContent = document.getElementById('dashboard-content'); 
const pedidosList = document.getElementById('pedidos-list');
const pedidosCount = document.getElementById('pedidos-count');
const modal = document.getElementById('detail-modal');

// ----------------------------------------------------------------------
// 3. FUNCIONES DE AUTENTICACIÓN Y SESIÓN
// ----------------------------------------------------------------------

/**
 * 🔐 Verifica si hay una sesión activa. Si no la hay, redirige y detiene la carga.
 */
async function checkSession() {
    console.log("Verificando sesión...");
    
    // Oculta el contenido al inicio
    if (dashboardContent) {
        dashboardContent.style.display = 'none';
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.warn("Sesión no detectada. Redirigiendo a index.html");
        window.location.href = 'index.html'; 
        return false;
    }
    
    loggedUser = user.email || `Usuario ID: ${user.id}`; 
    console.log(`✅ Sesión activa. Usuario: ${loggedUser}`);
    
    // Muestra el dashboard solo si la sesión es válida
    if (dashboardContent) {
        dashboardContent.style.display = 'block';
    }
    
    return true;
}

/**
 * 🚪 Cierra la sesión de Supabase y redirige al login.
 */
async function handleLogout() {
    console.log("Cerrando sesión de Supabase...");
    
    const { error } = await supabase.auth.signOut(); 

    if (error) {
        console.error("Error al cerrar sesión:", error.message);
    }

    window.location.href = 'index.html'; 
}

// ----------------------------------------------------------------------
// 4. LÓGICA DE CARGA DE DATOS (API FETCH)
// ----------------------------------------------------------------------

async function fetchPedidos() {
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
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        mockData = data; 
        filterPedidos(); 

    } catch (error) {
        console.error('❌ Error al cargar los pedidos:', error);
        pedidosList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #e74c3c; font-weight: bold;">Error: No se pudo cargar la tabla de pedidos. Revisa las claves y permisos de la tabla.</p>';
    }
}


// ----------------------------------------------------------------------
// 5. LÓGICA DE GESTIÓN (ASIGNACIÓN Y ACTUALIZACIÓN)
// ----------------------------------------------------------------------

function handleAssignClick() {
    if (currentPedidoId !== null) {
        asignarPedido(currentPedidoId, loggedUser);
    }
}

async function asignarPedido(id, usuario) {
    const pedido = mockData.find(p => p.id === id);
    
    if (pedido.estado !== 'pendiente') {
        alert(`❌ El pedido #${id} ya está ${pedido.estado}.`);
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
        pedido.asignado_a = usuario;
        filterPedidos();
        showDetail(id);
        alert(`✅ Pedido #${id} asignado a ${usuario}.`);
    } catch (e) { 
        console.error('Error al asignar:', e); 
        alert('Error al asignar el pedido. Revisa permisos de PATCH.'); 
    }
}

async function actualizarEstado(id, nuevoEstado) {
    const pedido = mockData.find(p => p.id === id);
    
    if (pedido.asignado_a !== loggedUser && pedido.asignado_a !== "Usuario A") {
        alert(`❌ No puedes finalizar este pedido. Está asignado a ${pedido.asignado_a}.`);
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
        pedido.estado = nuevoEstado;
        filterPedidos();
        closeModal();
        alert(`🎉 Pedido #${id} marcado como ${nuevoEstado}.`);
    } catch (e) { 
        console.error('Error al actualizar estado:', e); 
        alert('Error al actualizar estado. Revisa permisos de PATCH.'); 
    }
}

// ----------------------------------------------------------------------
// 6. LÓGICA DE FILTRADO Y RENDERIZADO
// ----------------------------------------------------------------------

function getEstadoColor(estado) {
    const normalized = estado ? estado.toLowerCase() : '';
    if (normalized.includes('pendiente')) return '#f39c12';
    if (normalized.includes('completada')) return '#2ecc71';
    if (normalized.includes('cancelada')) return '#e74c3c';
    return '#e0e0e0';
}

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
        item.setAttribute('onclick', `showDetail(${p.id})`);

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

function filterPedidos() {
    const checkboxes = document.querySelectorAll('.filter-checkbox');
    const activeFilters = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value); 
    
    let filteredData;

    if (activeFilters.length === 0) {
        filteredData = []; 
    } else {
        filteredData = mockData.filter(p => {
            if (!p.estado) return false; 
            const normalizedState = p.estado.toLowerCase().replace(/á/g, 'a');
            return activeFilters.includes(normalizedState);
        });
    }
    
    renderPedidos(filteredData);
}

// ----------------------------------------------------------------------
// 7. FUNCIONALIDAD DEL MODAL
// ----------------------------------------------------------------------

function showDetail(pedidoId) {
    const pedido = mockData.find(p => p.id === pedidoId);
    if (!pedido) return; 

    currentPedidoId = pedidoId; 
    
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
    
    const assignBtn = document.getElementById('assign-btn');
    const completeBtn = document.getElementById('complete-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    assignBtn.textContent = `Asignarme (${loggedUser})`;

    if (pedido.estado === 'pendiente') {
        
        if (pedido.asignado_a === 'N/A' || !pedido.asignado_a) {
            assignBtn.classList.remove('hidden');
            assignBtn.disabled = false;
            completeBtn.classList.add('hidden'); 
            cancelBtn.classList.add('hidden'); 
        } else if (pedido.asignado_a === loggedUser) {
            assignBtn.classList.add('hidden');
            completeBtn.classList.remove('hidden');
            cancelBtn.classList.remove('hidden');
            completeBtn.disabled = false;
            cancelBtn.disabled = false;
        } else {
            assignBtn.classList.add('hidden'); 
            completeBtn.classList.remove('hidden'); 
            cancelBtn.classList.remove('hidden'); 
            completeBtn.disabled = true; 
            cancelBtn.disabled = true;
        }
    } else {
        assignBtn.classList.add('hidden');
        completeBtn.classList.add('hidden');
        cancelBtn.classList.add('hidden');
    }

    const logContainer = document.getElementById('detail-conversation-log');
    logContainer.innerHTML = '';
    
    const logs = pedido.logs || []; 
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
    
    modal.classList.add('visible');
}

function closeModal() {
    modal.classList.remove('visible');
}


// ----------------------------------------------------------------------
// 8. INICIALIZACIÓN Y VINCULACIÓN DE EVENTOS
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Verificar sesión 
    const sessionValid = await checkSession();
    // Detiene la ejecución si checkSession redirigió al login
    if (!sessionValid) return; 
    
    // 2. Vincular botón de logout
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // 3. Cargar datos
    fetchPedidos();
    
    // 4. Vincular filtros
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', filterPedidos);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    });
});
