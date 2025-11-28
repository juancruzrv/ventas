// ======================================================================
// 1. CONFIGURACIÓN DE SUPABASE (CRÍTICA)
// ======================================================================
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 
const TABLE_NAME = 'pedidos'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// 2. FUNCIÓN DE CIERRE DE SESIÓN
// ----------------------------------------------------------------------
async function handleLogout() {
    console.log("Cerrando sesión de Supabase...");
    
    // Aquí es donde puede fallar si la clave anon es incorrecta o expiró.
    const { error } = await supabase.auth.signOut(); 

    if (error) {
        alert("Error al cerrar sesión. Revisa las claves de Supabase.");
        console.error("Error al cerrar sesión:", error.message);
    }

    // Siempre intenta redirigir, incluso con error.
    window.location.href = 'index.html'; 
}

// ----------------------------------------------------------------------
// 3. INICIALIZACIÓN Y VINCULACIÓN (CRÍTICA)
// ----------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
    
    // **VINCULA EL BOTÓN**
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    
    // Resto del código...
    let loggedUser = "Usuario A"; 
    // fetchPedidos(); // Descomenta esto para cargar los datos
    
    // ... (El resto de tu lógica de filtros, etc. debe ir aquí) ...
});
// ... (Todas las demás funciones: fetchPedidos, asignarPedido, renderPedidos, etc.) ...
