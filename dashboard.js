// dashboard.js

// ----------------------------------------------------------------------
// 1. CONFIGURACIÓN E INICIALIZACIÓN DEL CLIENTE SUPABASE
// ----------------------------------------------------------------------
// TUS CREDENCIALES
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// 2. REFERENCIAS Y MANEJO DEL DOM
// ----------------------------------------------------------------------

const dashboardContent = document.getElementById('dashboard-content');
const logoutBtn = document.getElementById('logout-btn');
const pedidosList = document.getElementById('pedidos-list');
const pedidosCount = document.getElementById('pedidos-count');
const conversacionList = document.getElementById('conversacion-list');
const messageElement = document.getElementById('message');

// ----------------------------------------------------------------------
// 3. VERIFICACIÓN DE AUTENTICACIÓN (Seguridad)
// ----------------------------------------------------------------------

/**
 * Verifica la sesión del usuario. Si no hay sesión, redirige al login.
 */
async function checkSession() {
    messageElement.textContent = 'Verificando sesión...';
    
    // Obtener el usuario autenticado
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        // Redirige al login si no hay usuario
        window.location.href = 'index.html';
    } else {
        // Muestra el contenido SÓLO si el usuario está autenticado
        dashboardContent.style.display = 'block'; 
        
        // Usuario autenticado, cargar los datos
        loadDashboardData();
    }
}

// ----------------------------------------------------------------------
// 4. CARGA DE DATOS DEL DASHBOARD
// ----------------------------------------------------------------------

async function loadDashboardData() {
    messageElement.textContent = 'Cargando datos...';
    messageElement.style.color = '#00a896'; 

    // A. Cargar los últimos pedidos
    const { data: pedidos, error: pedidosError } = await supabaseClient
        .from('pedidos')
        .select(`
            producto_servicio, 
            monto, 
            estado,
            fecha_pedido,
            clientes (nombre, numero_whatsapp)
        `)
        .order('fecha_pedido', { ascending: false })
        .limit(10); 

    if (pedidosError) {
        // Manejo de error (ej. RLS incorrecto)
        console.error('Error al cargar pedidos:', pedidosError);
        messageElement.textContent = 'Error al cargar los pedidos. (Revise RLS)';
        pedidosList.innerHTML = '<li>Error de conexión o permisos.</li>';
    } else {
        pedidosCount.textContent = pedidos.length; 
        pedidosList.innerHTML = ''; 
        
        pedidos.forEach(p => {
            const listItem = document.createElement('li');
            const clientName = p.clientes.nombre || `+${p.clientes.numero_whatsapp}`;
            const date = new Date(p.fecha_pedido).toLocaleDateString('es-ES');
            
            listItem.innerHTML = `
                <span style="font-weight: bold;">[${p.estado}]</span> ${p.producto_servicio} (${p.monto}€)<br>
                <small>Cliente: ${clientName} - ${date}</small>
            `;
            pedidosList.appendChild(listItem);
        });
        
        messageElement.textContent = 'Datos de pedidos cargados.';
    }

    // B. Cargar la actividad reciente de conversaciones (logs)
    const { data: logs, error: logsError } = await supabaseClient
        .from('conversaciones')
        .select(`
            es_entrada, 
            contenido, 
            chatbot_accion
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (!logsError) {
        conversacionList.innerHTML = '';
        logs.forEach(log => {
            const direction = log.es_entrada ? 'Cliente' : 'Bot';
            const style = log.es_entrada ? 'font-weight: bold; color: #3498db;' : 'color: #f39c12;';

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span style="${style}">${direction}</span>: ${log.contenido.substring(0, 70)}...<br>
                <small>(${log.chatbot_accion || 'Mensaje'})</small>
            `;
            conversacionList.appendChild(listItem);
        });
    }
    
    // Mensaje final
    messageElement.textContent = 'Dashboard actualizado.';
    messageElement.style.color = '#28a745';
}

// ----------------------------------------------------------------------
// 5. CIERRE DE SESIÓN
// ----------------------------------------------------------------------

async function handleLogout() {
    messageElement.textContent = 'Cerrando sesión...';
    messageElement.style.color = '#e74c3c';
    
    await supabaseClient.auth.signOut();
    
    // Redirigir al login
    window.location.href = 'index.html';
}

// ----------------------------------------------------------------------
// 6. LISTENERS E INICIALIZACIÓN
// ----------------------------------------------------------------------

logoutBtn.addEventListener('click', handleLogout);
checkSession();
