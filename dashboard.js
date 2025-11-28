// ===============================================
// dashboard.js: Lógica de Carga de Datos y Realtime
// (Usa la variable _supabase definida en el HTML)
// ===============================================

/**
 * Función principal que se llama una vez que la sesión es válida.
 */
function initDashboard(supabase) {
    console.log("✅ Sesión activa. Iniciando carga de datos.");

    // 1. Cargar los datos iniciales
    loadInteractions(supabase);
    
    // 2. Configurar la escucha en tiempo real
    subscribeToInteractions(supabase);
}


/**
 * Carga y muestra los datos de interacciones desde la tabla 'interacciones'.
 */
async function loadInteractions(supabase) {
    // Nota: El dashboard.js depende de que la tabla 'interacciones' exista
    // y contenga una columna 'fecha_creacion'
    const { data, error } = await supabase
        .from('interacciones') 
        .select('*') 
        .order('fecha_creacion', { ascending: false }) 
        .limit(10); 

    if (error) {
        console.error("Error al cargar interacciones:", error);
        document.getElementById('chat-data').innerHTML = `<li>Error: ${error.message}. ¿La tabla 'interacciones' existe y tiene RLS desactivado o permitido?</li>`;
        return;
    }

    const chatList = document.getElementById('chat-data');
    chatList.innerHTML = ''; 
    
    if (data.length === 0) {
        chatList.innerHTML = '<li>No hay interacciones registradas.</li>';
        return;
    }

    data.forEach(item => {
        const listItem = document.createElement('li');
        const date = new Date(item.fecha_creacion).toLocaleTimeString('es-ES', { 
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' 
        });
        
        // Estilización condicional básica para el tipo de interacción
        const typeStyle = item.tipo_interaccion === 'venta' ? 'green' : (item.tipo_interaccion === 'pedido' ? 'orange' : 'blue');
        
        listItem.innerHTML = `
            <strong>Teléfono:</strong> ${item.telefono_cliente} | 
            <strong>Tipo:</strong> <span style="font-weight: bold; color: ${typeStyle}">${item.tipo_interaccion ? item.tipo_interaccion.toUpperCase() : 'N/A'}</span>
            <br>
            <em>Mensaje: "${item.mensaje_recibido ? item.mensaje_recibido.substring(0, 50) : 'Sin mensaje'}..."</em> (${date})
        `;
        chatList.appendChild(listItem);
    });

    // Actualizar el resumen
    updateSummary(data);
}

/**
 * Cuenta y actualiza las métricas del resumen.
 */
function updateSummary(data) {
    const orders = data.filter(item => item.tipo_interaccion === 'pedido').length;
    const sales = data.filter(item => item.tipo_interaccion === 'venta').length;
    const recom = data.filter(item => item.tipo_interaccion === 'recomendacion').length;

    document.getElementById('orders-count').textContent = orders;
    document.getElementById('sales-count').textContent = sales;
    document.getElementById('recom-count').textContent = recom;
}


/**
 * Escucha cambios en la tabla 'interacciones' para actualizar la vista en tiempo real.
 */
function subscribeToInteractions(supabase) {
    supabase
        .channel('dashboard_changes') 
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'interacciones' },
            () => {
                console.log('🔔 ¡Nueva Interacción detectada! Recargando datos.');
                loadInteractions(supabase); 
            }
        )
        .subscribe();
    
    console.log("👂 Suscrito a cambios en tiempo real.");
}
