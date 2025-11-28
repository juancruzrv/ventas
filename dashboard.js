// ======================================================================
// 1. CONFIGURACIÓN DE SUPABASE
// ======================================================================

// TUS CLAVES
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 
const TABLE_NAME = 'pedidos'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// ✅ FUNCIÓN DE CIERRE DE SESIÓN (SIN CAMBIOS)
// ----------------------------------------------------------------------
async function handleLogout() {
    console.log("Cerrando sesión de Supabase (por EventListener)...");
    
    const { error } = await supabase.auth.signOut(); 

    if (error) {
        console.error("Error al cerrar sesión:", error.message);
    }

    window.location.href = 'index.html'; 
}
// ----------------------------------------------------------------------

let currentPedidoId = null;
let loggedUser = "Usuario A"; 
let mockData = []; 

const pedidosList = document.getElementById('pedidos-list');
const pedidosCount = document.getElementById('pedidos-count');
const modal = document.getElementById('detail-modal');

// ... (Todas las funciones de fetchPedidos, asignarPedido, actualizarEstado, renderPedidos, etc. van aquí, tal como las tenías) ...
// Las dejo omitidas por espacio, pero deben estar COMPLETAS en tu archivo.

// ----------------------------------------------------------------------
// 6. INICIALIZACIÓN Y LISTENERS (CARGA DE LA PÁGINA)
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    
    // ⭐⭐ NUEVO: VINCULACIÓN DEL BOTÓN POR ID ⭐⭐
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        // Vincula la función handleLogout al evento 'click' del botón
        logoutButton.addEventListener('click', handleLogout);
        console.log("Botón de cerrar sesión vinculado correctamente.");
    } else {
        console.error("Error: Botón con ID 'logout-btn' no encontrado.");
    }
    // ⭐⭐ FIN NUEVO CÓDIGO ⭐⭐
    
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
