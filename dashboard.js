// ======================================================================
// 1. CONFIGURACIÓN DE SUPABASE
// ======================================================================

// URL de la API de Supabase
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
// Anon Key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 
// Nombre de la tabla de pedidos (AJUSTA si es diferente)
const TABLE_NAME = 'pedidos'; 

// Inicialización del cliente de Supabase (CRÍTICO para Auth)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// 🚨 FUNCIÓN DE CIERRE DE SESIÓN AISLADA (GARANTÍA DE EJECUCIÓN)
// ----------------------------------------------------------------------
async function handleLogout() {
    console.log("Cerrando sesión de Supabase (Ejecutando SignOut)...");
    
    const { error } = await supabase.auth.signOut(); 

    if (error) {
        console.error("Error al cerrar sesión:", error.message);
    }

    window.location.href = 'index.html'; 
}
// ----------------------------------------------------------------------

let currentPedidoId = null;
// VALOR FIJO: EL USUARIO REGISTRADO ES FIJO YA QUE EL SELECTOR FUE ELIMINADO
let loggedUser = "Usuario A"; 
let mockData = []; 

const pedidosList = document.getElementById('pedidos-list');
const pedidosCount = document.getElementById('pedidos-count');
const modal = document.getElementById('detail-modal');

// ... (Resto de funciones: fetchPedidos, asignarPedido, actualizarEstado, etc.) ...
// Mantén todas tus otras funciones intactas.

// ----------------------------------------------------------------------
// 7. INICIALIZACIÓN Y LISTENERS (VERIFICACIÓN DE SESIÓN EN CARGA)
// ----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', async () => {
    
    // VERIFICACIÓN CRÍTICA: Si no hay usuario logueado, redirigir al login.
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.log("Sesión no detectada. Redirigiendo a index.html");
        window.location.href = 'index.html';
        return; 
    }
    
    // Si la sesión es válida, continuamos con la carga del Dashboard
    // ❌ Lógica de selector de usuario ELIMINADA aquí.
    
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
