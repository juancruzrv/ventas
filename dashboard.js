// =================================================================
// dashboard.js - LÓGICA CENTRAL Y DE DASHBOARD (CLAVES INSERTADAS)
// =================================================================

// 🔑 CLAVES DE SUPABASE INSERTADAS:
const SUPABASE_URL = 'https://hppmetemxodplpsidmlv.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcG1ldGVteG9kcGxwc2lkbWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMDI5NzgsImV4cCI6MjA3OTg3ODk3OH0.ZpyI1ANOY39EHpAjdHZjv6WHwLcb7tvB1Ss5njxMHqM';

/**
 * Inicializa el cliente de Supabase y lo hace accesible globalmente.
 */
function initializeSupabase() {
    // No necesita verificación aquí, ya que las claves se insertaron
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return window.supabase;
}

// Llama a la inicialización de Supabase
const supabaseClient = initializeSupabase();
// -------------------------------------------------------------------


// =================================================================
// LÓGICA ESPECÍFICA DEL DASHBOARD (solo si estamos en dashboard.html)
// =================================================================

// Solo ejecuta la lógica del dashboard si los elementos existen (para evitar errores en test-data.html)
if (document.getElementById('chat-data')) { 
    
    // Función principal para cargar y renderizar las interacciones
    async function loadInteractions() {
        if (!supabaseClient) {
            document.getElementById('chat-data').innerHTML = '<li>Error: Supabase no está configurado.</li>';
            return;
        }

        const { data: interacciones, error } = await supabaseClient
            .from('interacciones')
            .select('*')
            .order('timestamp', { ascending: false }); 

        const interactionList = document.getElementById('chat-data');
        interactionList.innerHTML = '';
        
        // Asumiendo que tienes un elemento con id 'interactions-summary' en dashboard.html
        const summaryElement = document.getElementById('interactions-summary') || document.createElement('div');
        
        if (error) {
            summaryElement.innerHTML = 'Error al cargar datos: ' + error.message;
            return;
        }

        if (interacciones.length === 0) {
            summaryElement.innerHTML = '<p>No hay interacciones registradas. ¡Usa la página de prueba para insertar algunas!</p>';
        }

        // 1. Renderizar la lista
        interacciones.forEach(interaccion => {
            const listItem = document.createElement('li');
            const date = new Date(interaccion.timestamp).toLocaleString('es-AR');
            const typeClass = `interaction-${interaccion.interaction_type}`;
            
            listItem.innerHTML = `
                <div>
                    <strong class="${typeClass}">${interaccion.interaction_type.toUpperCase()}</strong>
                    - Cliente: ${interaccion.client_phone} (${date})
                    <br>
                    <span style="color: var(--text-muted);">${interaccion.summary || 'Sin resumen'}</span>
                </div>
                <button onclick="viewChat('${interaccion.id}')">Ver Chat</button>
            `;
            interactionList.appendChild(listItem);
        });

        // 2. Renderizar el resumen (Conteo de ejemplo)
        const counts = interacciones.reduce((acc, curr) => {
            acc[curr.interaction_type] = (acc[curr.interaction_type] || 0) + 1;
            return acc;
        }, {});
        
        // Si tu dashboard.html tiene IDs específicos para los contadores (orders-count, sales-count, recom-count):
        if (document.getElementById('orders-count')) {
            document.getElementById('orders-count').textContent = counts['pedido'] || 0;
            document.getElementById('sales-count').textContent = counts['venta'] || 0;
            document.getElementById('recom-count').textContent = counts['pregunta'] || 0;
        }
    }


    // Función para mostrar el modal de chat
    window.viewChat = async (interactionId) => {
        if (!supabaseClient) return;

        const { data: interaccion, error } = await supabaseClient
            .from('interacciones')
            .select('chat_history, client_phone')
            .eq('id', interactionId)
            .single();

        if (error || !interaccion) {
            console.error('Error al cargar chat:', error);
            document.getElementById('modal-client-phone').textContent = 'Error de Carga';
            return;
        }

        const chatHistoryElement = document.getElementById('chat-history');
        chatHistoryElement.innerHTML = '';
        document.getElementById('modal-client-phone').textContent = interaccion.client_phone;
        
        // Renderizar burbujas de chat
        interaccion.chat_history.forEach(chat => {
            const bubble = document.createElement('div');
            const isClient = chat.role === 'client';
            const time = new Date(chat.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

            bubble.className = `message-bubble ${isClient ? 'client-message' : 'bot-message'}`;
            bubble.innerHTML = `
                ${chat.message}
                <span class="message-time">${time}</span>
            `;
            chatHistoryElement.appendChild(bubble);
        });
        
        document.getElementById('chat-modal').style.display = 'flex';
        chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight; 
    };

    // Lógica para cerrar el modal
    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('chat-modal').style.display = 'none';
    });

    // Cargar los datos al iniciar
    document.addEventListener('DOMContentLoaded', loadInteractions);
    
    // Función de Logout (simulada)
    window.logoutUser = () => {
        window.location.href = 'index.html';
    };
}
