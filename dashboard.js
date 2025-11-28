// ======================================================================
// 1. CONFIGURACIÓN DE SUPABASE
// ======================================================================

// URL de la API de Supabase
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
// Anon Key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 
// Nombre de la tabla de pedidos (AJUSTA si es diferente)
const TABLE_NAME = 'pedidos'; 

// Inicialización del cliente de Supabase (CRÍTICO para Auth y API)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// ✅ FUNCIÓN DE CIERRE DE SESIÓN
// ----------------------------------------------------------------------
/**
 * Destruye la sesión de Supabase y luego redirige a index.html.
 */
async function handleLogout() {
    console.log("Cerrando sesión de Supabase...");
    
    // 1. Destruir la sesión en Supabase
    const { error } = await supabase.auth.signOut(); 

    if (error) {
        console.error("Error al cerrar sesión:", error.message);
    }

    // 2. Redireccionar al index
    window.location.href = 'index.html'; 
}
// ----------------------------------------------------------------------

let currentPedidoId = null;
let loggedUser = "Usuario A"; 
let mockData = []; 

const pedidosList = document.getElementById('pedidos-list');
const pedidosCount = document.getElementById('pedidos-count');
const modal = document.getElementById('detail-modal');

// ----------------------------------------------------------------------
// 2. FUNCIÓN DE CARGA DE DATOS (API FETCH)
// ----------------------------------------------------------------------
// MANTENER LA FUNCIÓN fetchPedidos() COMPLETA AQUÍ...

async function fetchPedidos() {
    console.log("Intentando cargar pedidos desde Supabase...");
    
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
        
        console.log(`✅ ${data.length} pedidos cargados correctamente.`);
        
        filterPedidos(); 

    } catch (error) {
        console.error('❌ Error al cargar los pedidos desde Supabase:', error);
        pedidosList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #e74c3c; font-weight: bold;">Error: No se pudo conectar a Supabase o cargar la tabla.</p>';
    }
}


// ----------------------------------------------------------------------
// 3. LÓGICA DE ASIGNACIÓN Y ACTUALIZACIÓN (CON SUPABASE PATCH)
// MANTENER LAS FUNCIONES handleAssignClick(), asignarPedido(), y actualizarEstado() COMPLETAS AQUÍ...
//
// Debido a la longitud, asumimos que estas funciones se mantienen completas como en el código anterior.
// ----------------------------------------------------------------------
function handleAssignClick() {
    if (currentPedidoId !== null) {
        asignarPedido(currentPedidoId, loggedUser);
    }
}
async function asignarPedido(id, usuario) {
    const pedido = mockData.find(p => p.id === id);
    if (!pedido || pedido.estado !== 'Pendiente') {
        alert(`❌ El pedido #${id} ya está ${pedido.estado || 'gestionado'} y no puede ser re-asignado.`);
        return;
    }
    if (pedido.asignado_a === 'N/A' || !pedido.asignado_a) {
        const updateUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`;
        const updateData = {
            asignado_a: usuario,
            fecha_ultima_accion: new Date().toISOString()
        };
        try {
            const response = await fetch(updateUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) {
                 throw new Error(`Error al actualizar estado: ${response.status}`);
            }
            pedido.asignado_a = usuario;
            pedido.fecha_ultima_accion = updateData.fecha_ultima_accion;
            filterPedidos();
            showDetail(id);
            alert(`✅ Pedido #${id} tomado y asignado a ${usuario}.`);
        } catch (error) {
             console.error('Error al intentar asignar pedido en Supabase:', error);
             alert('❌ Error de conexión al intentar asignar el pedido.');
        }
    } else if (pedido.asignado_a === usuario) {
        alert(`ℹ️ El pedido #${id} ya está asignado a ti.`);
    } else {
        alert(`❌ El pedido #${id} ya está siendo gestionado por ${pedido.asignado_a}. No puedes tomarlo.`);
    }
}
async function actualizarEstado(id, nuevoEstado) {
    const pedido = mockData.find(p => p.id === id);
    if (!pedido || pedido.estado !== 'Pendiente') {
        alert(`❌ El pedido #${id} ya está ${pedido.estado || 'gestionado'} y no puede ser modificado.`);
        return;
    }
    if (pedido.asignado_a !== loggedUser) {
        alert(`❌ No puedes finalizar el pedido #${id}, está asignado a ${pedido.asignado_a}. Solo el usuario asignado puede completarlo/cancelarlo.`);
        return;
    }
    const updateUrl = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?id=eq.${id}`;
    const updateData = {
        estado: nuevoEstado,
        fecha_ultima_accion: new Date().toISOString()
    };
    try {
        const response = await fetch(updateUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) {
             throw new Error(`Error al actualizar estado: ${response.status}`);
        }
        pedido.estado = nuevoEstado;
        pedido.fecha_ultima_accion = updateData.fecha_ultima_accion;
        filterPedidos();
        closeModal();
        alert(`🎉 Pedido #${id} marcado como ${nuevoEstado}.`);
    } catch (error) {
         console.error('Error al intentar actualizar estado en Supabase:', error);
         alert('❌ Error de conexión al intentar actualizar el estado del pedido.');
    }
}
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// 4. LÓGICA DE FILTRADO Y RENDERIZADO
// MANTENER LAS FUNCIONES renderPedidos(), filterPedidos(), y getEstadoColor() COMPLETAS AQUÍ...
//
// ----------------------------------------------------------------------
function renderPedidos(data) {
    pedidosList.innerHTML = ''; 
    pedidosCount.textContent = data.length;

    if (data.length === 0) {
         pedidosList.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #999;">No hay pedidos en este estado.</p>';
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
            <p style="font-size: 1.1em; margin: 0 0 5px 0; color: #c501e2;">
                ${p.producto_nombre || 'Producto N/A'}
            </p>
            <p style="margin: 0 0 5px 0;">
                Estado: <strong style="color: ${getEstadoColor(estado)};">${estado}</strong>
            </p>
            <p style="margin: 0;">
                <small>Cliente: ${clientName}</small>
                ${assignedUser}
            </p>
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
        filteredData = mockData; 
    } else {
        filteredData = mockData.filter(p => {
            if (!p.estado) return false; 
            const normalizedState = p.estado.toLowerCase().replace(/á/g, 'a');
            return activeFilters.includes(normalizedState);
        });
    }
    
    renderPedidos(filteredData);
}

function getEstadoColor(estado) {
    if (estado === 'Pendiente') return '#f39c12';
    if (estado === 'Completada') return '#2ecc71';
    if (estado === 'Cancelada') return '#e74c3c';
    return '#e0e0e0';
}
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// 5. FUNCIONALIDAD DEL MODAL
// MANTENER LAS FUNCIONES showDetail() y closeModal() COMPLETAS AQUÍ...
//
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

    if (pedido.estado === 'Pendiente') {
        
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

    // Llenar el Log de Conversación
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
        logItem.innerHTML = `
            <p style="margin: 0; padding: 0;">
                <span class="${directionClass}">[${directionLabel}]</span> 
                ${log.contenido || 'Sin contenido'}
            </p>
            <small style="color: #999;">Acción: ${log.chatbot_accion || 'N/A'}</small>
        `;
        logContainer.appendChild(logItem);
    });
    
    modal.classList.add('visible');
}

function closeModal() {
    modal.classList.remove('visible');
}
// ----------------------------------------------------------------------


// ----------------------------------------------------------------------
// 6. INICIALIZACIÓN Y LISTENERS (CARGA DE LA PÁGINA)
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    
    // Carga los datos de Supabase al iniciar
    fetchPedidos();
    
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', filterPedidos);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            closeModal();
        }
    });
});
