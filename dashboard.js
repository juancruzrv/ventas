// ** CONFIGURACIÓN DE SUPABASE (Credenciales compartidas) **
const SUPABASE_URL = 'https://lmvwcciiubdduyxcpefo.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdndjY2lpdWJkZHV5eGNwZWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTE0NTgsImV4cCI6MjA3OTg2NzQ1OH0uXHXevyhS0YdVswA4bIsVgFBupTenqsBEHYpezZL5RGs'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos del DOM (Asegúrate de que existan en dashboard.html)
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const pedidosTableBody = document.querySelector('#pedidos-table tbody');


/**
 * 1. PROTECCIÓN DE RUTA: Verifica si hay una sesión activa.
 */
async function checkAuthAndLoadUser() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // Si no hay usuario, redirige al login
        window.location.href = 'index.html'; 
        return;
    }

    // Muestra el correo del usuario
    if (userEmailSpan) {
        userEmailSpan.textContent = user.email;
    }

    // Carga los datos de la tabla de pedidos (asumiendo que la tabla existe)
    fetchPedidos(); 
}


/**
 * 2. CARGA DE DATOS: Consulta la tabla 'pedidos'.
 */
async function fetchPedidos() {
    if (!pedidosTableBody) return;

    // Se asume que has creado la tabla 'pedidos' y su política de RLS (SELECT para authenticated)
    const { data: pedidos, error } = await supabase
        .from('pedidos')
        .select('id, telefono, mensaje, estado, created_at') 
        .order('created_at', { ascending: false }); 

    if (error) {
        console.error('Error al cargar pedidos:', error.message);
        pedidosTableBody.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error de Base de Datos: ${error.message}. (¿RLS configurada?)</td></tr>`;
        return;
    }

    renderPedidos(pedidos);
}


/**
 * 3. RENDERIZADO: Inserta los datos en la tabla HTML.
 */
function renderPedidos(pedidos) {
    if (pedidos.length === 0) {
        pedidosTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay pedidos activos.</td></tr>';
        return;
    }
    
    pedidosTableBody.innerHTML = ''; 

    pedidos.forEach(pedido => {
        const row = pedidosTableBody.insertRow();
        const date = new Date(pedido.created_at).toLocaleDateString('es-ES', { 
            hour: '2-digit', minute: '2-digit' 
        });

        row.innerHTML = `
            <td>${pedido.id.substring(0, 5)}...</td>
            <td>${pedido.telefono}</td>
            <td>${pedido.mensaje.substring(0, 50)}...</td>
            <td>${pedido.estado}</td>
            <td>${date}</td>
            <td>
                <button class="action-btn view-btn">Ver</button>
            </td>
        `;
    });
}


/**
 * 4. CERRAR SESIÓN
 */
async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
        alert('No se pudo cerrar la sesión.');
        return;
    }

    window.location.href = 'index.html';
}

// 5. ASIGNAR EVENTOS e INICIAR
if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
}

checkAuthAndLoadUser();
