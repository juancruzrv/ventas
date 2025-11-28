// dashboard.js

// ----------------------------------------------------------------------
// 1. CONFIGURACIÓN E INICIALIZACIÓN DEL CLIENTE SUPABASE
// ----------------------------------------------------------------------

// *** TUS CREDENCIALES DE SUPABASE ***
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// 2. REFERENCIAS Y MANEJO DEL DOM
// ----------------------------------------------------------------------

const logoutBtn = document.getElementById('logout-btn');
const pedidosList = document.getElementById('pedidos-list');
const pedidosCount = document.getElementById('pedidos-count');
const conversacionList = document.getElementById('conversacion-list');
const messageElement = document.getElementById('message');

// ----------------------------------------------------------------------
// 3. VERIFICACIÓN DE AUTENTICACIÓN
// ----------------------------------------------------------------------

/**
 * Verifica la sesión del usuario. Si no hay sesión, redirige al login.
 */
async function checkSession() {
    messageElement.textContent = 'Verificando sesión...';
    messageElement.style.color = '#333';
    
    // Obtener el usuario autenticado
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
        // Si no hay usuario, redirigir al login
        window.location.href = 'index.html';
    } else {
        // Usuario autenticado, cargar los datos del Dashboard
        loadDashboardData();
    }
}

// ----------------------------------------------------------------------
// 4. CARGA DE DATOS DEL DASHBOARD
// ----------------------------------------------------------------------

/**
 * Carga los datos de las tablas 'pedidos' y 'conversaciones'.
 */
async function loadDashboardData() {
    messageElement.textContent = 'Cargando datos...';
    messageElement.style.color = '#00a896'; // Color de carga

    // A. Cargar los últimos pedidos (con JOINS implícitos a la tabla 'clientes')
    const { data: pedidos, error: pedidosError } = await supabaseClient
        .from('pedidos')
        .select(`
            id, 
            producto_servicio, 
            monto, 
            estado,
            fecha_pedido,
            clientes (nombre, numero_whatsapp) // Traemos info del cliente relacionado
        `)
        .order('fecha_pedido', { ascending: false })
        .limit(10); 

    if (pedidosError) {
        console.error('Error al cargar pedidos:', pedidosError);
        messageElement.textContent = 'Error al cargar los pedidos. Revisa las políticas RLS.';
        messageElement.style.color = '#e74c3c';
        pedidosList.innerHTML = '<li>Error de conexión o permisos.</li>';
    } else {
        // Mostrar conteo y lista
        pedidosCount.textContent = pedidos.length; 
        pedidosList.innerHTML = ''; // Limpiar la lista
        
        pedidos.forEach(p => {
            const listItem = document.createElement('li');
            const clientName = p.clientes.nombre || `+${p.clientes.numero_whatsapp}`;
            const date = new Date(p.fecha_pedido).toLocaleDateString('es-ES');
            
            listItem.innerHTML = `
                **[${p.estado}]** ${p.producto_servicio} (${p.monto}€)<br>
                <small>Cliente: ${clientName} - ${date}</small>
            `;
            pedidosList.appendChild(listItem);
        });
        
        messageElement.textContent = 'Datos de pedidos cargados.';
        messageElement.style.color = '#333';
    }


    // B. Cargar la actividad reciente de conversaciones (logs)
    const { data: logs, error: logsError } = await supabaseClient
        .from('conversaciones')
        .select(`
            es_entrada, 
            contenido, 
            chatbot_accion,
            created_at,
            clientes (numero_whatsapp)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (logsError) {
        console.error('Error al cargar logs:', logsError);
        conversacionList.innerHTML = '<li>Error al cargar los logs.</li>';
    } else {
        conversacionList.innerHTML = '';
        logs.forEach(log => {
            const direction = log.es_entrada ? 'Cliente -> Bot' : 'Bot -> Cliente';
            const style = log.es_entrada ? 'font-weight: bold; color: #3498db;' : 'color: #f39c12;';

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span style="${style}">${direction}</span>: ${log.contenido.substring(0, 70)}...<br>
                <small>(${log.chatbot_accion || 'Mensaje'})</small>
            `;
            conversacionList.appendChild(listItem);
        });
    }
    
    // Mensaje final de éxito
    messageElement.textContent = 'Dashboard actualizado con éxito.';
    messageElement.style.color = '#28a745';
}

// ----------------------------------------------------------------------
// 5. CIERRE DE SESIÓN
// ----------------------------------------------------------------------

/**
 * Maneja el cierre de sesión y redirige al login.
 */
async function handleLogout() {
    messageElement.textContent = 'Cerrando sesión...';
    messageElement.style.color = '#e74c3c';
    
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error('Error al cerrar sesión:', error.message);
        messageElement.textContent = `Error al cerrar sesión: ${error.message}`;
    } else {
        // Redirigir al login
        window.location.href = 'index.html';
    }
}

// ----------------------------------------------------------------------
// 6. LISTENERS E INICIALIZACIÓN
// ----------------------------------------------------------------------

// Listener para el botón de cerrar sesión
logoutBtn.addEventListener('click', handleLogout);

// Iniciar la verificación de sesión al cargar la página
checkSession();
