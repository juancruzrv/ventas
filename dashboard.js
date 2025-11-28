// ===============================================
// dashboard.js: Lógica de Carga de Datos y Realtime
// (Ahora usando las clases CSS de style.css)
// ===============================================

function initDashboard(supabase) {
    console.log("✅ Sesión activa. Iniciando carga de datos.");
    loadInteractions(supabase);
    subscribeToInteractions(supabase);
}

/**
 * Carga y muestra los datos de interacciones desde la tabla 'interacciones'.
 */
async function loadInteractions(supabase) {
    const { data, error } = await supabase
        .from('interacciones') 
        .select('*') 
        .order('fecha_creacion', { ascending: false }) 
        .limit(10); 

    if (error) {
        console.error("Error al cargar interacciones:", error);
        document.getElementById('chat-data').innerHTML = `<li>Error: ${error.message}.</li>`;
        return;
    }

    const chatList = document.getElementById('chat-data');
    chatList.innerHTML = data.length === 0 ? '<li>No hay interacciones registradas.</li>' : ''; 

    data.forEach(item => {
        const listItem = document.createElement('li');
        const date = new Date(item.fecha_creacion).toLocaleTimeString('es-ES', { 
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' 
        });
        
        // Mapeo a la clase CSS
        const typeClass = `interaction-${item.tipo_interaccion || 'pregunta'}`;
        
        listItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>Teléfono:</strong> ${item.telefono_cliente} | 
                    <strong>Tipo:</strong> <span class="${typeClass}">${(item.tipo_interaccion || 'N/A').toUpperCase()}</span>
                    <br>
                    <em>Mensaje: "${item.mensaje_recibido ? item.mensaje_recibido.substring(0, 50) : 'Sin mensaje'}..."</em> (${date})
                </div>
                <button onclick="loadChatHistory('${item.telefono_cliente}')" style="background-color: #075E54; color: white;">
                    Ver Chat
                </button>
            </div>
        `;
        chatList.appendChild(listItem);
    });

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

// ===============================================
// Funciones de Modal y Historial de Chat
// ===============================================

/**
 * 📞 Carga el historial completo de mensajes para un teléfono específico.
 */
async function loadChatHistory(phone) {
    document.getElementById('modal-client-phone').textContent = phone;
    
    // Idealmente, en el futuro harás un JOIN con la tabla de clientes aquí.
    const { data, error } = await _supabase
        .from('interacciones') 
        // Asumimos que los mensajes de respuesta del bot estarán en una columna futura 'respuesta_bot'
        .select('mensaje_recibido, respuesta_bot, fecha_creacion') 
        .eq('telefono_cliente', phone) 
        .order('fecha_creacion', { ascending: true }); 

    const chatHistoryDiv = document.getElementById('chat-history');
    chatHistoryDiv.innerHTML = '';
    
    if (error) {
        chatHistoryDiv.innerHTML = `<p style="color:red; text-align: center;">Error al cargar historial: ${error.message}</p>`;
        openChatModal(); 
        return;
    }

    if (data.length === 0) {
        chatHistoryDiv.innerHTML = '<p style="text-align: center;">No hay historial registrado para este cliente.</p>';
    } else {
        data.forEach(item => {
            // Mostramos el mensaje del cliente (asumimos que todo mensaje_recibido es del cliente)
            if (item.mensaje_recibido) {
                appendMessage(chatHistoryDiv, item.mensaje_recibido, item.fecha_creacion, true); // true = cliente
            }
            // FUTURO: Si tu tabla tuviera una columna 'respuesta_bot', la mostrarías aquí
            if (item.respuesta_bot) {
                appendMessage(chatHistoryDiv, item.respuesta_bot, item.fecha_creacion, false); // false = bot
            }
        });
        chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight; 
    }

    openChatModal();
}

/**
 * Función auxiliar para crear y añadir la burbuja de chat.
 */
function appendMessage(container, message, date, isClient) {
    const messageBubble = document.createElement('div');
    messageBubble.classList.add('message-bubble', isClient ? 'client-message' : 'bot-message');
    
    const time = new Date(date).toLocaleTimeString('es-ES', { 
        hour: '2-digit', minute: '2-digit'
    });
    
    messageBubble.innerHTML = `
        ${message}
        <span class="message-time">${time}</span>
    `;
    container.appendChild(messageBubble);
}


/**
 * Abre el modal del chat.
 */
function openChatModal() {
    document.getElementById('chat-modal').style.display = 'block';
}

/**
 * Cierra el modal del chat.
 */
function closeChatModal() {
    document.getElementById('chat-modal').style.display = 'none';
}

// Inicialización: Añadir el listener para cerrar el modal
document.addEventListener('DOMContentLoaded', () => {
    // Escucha el formulario de login (solo en index.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof _supabase !== 'undefined') { 
                loginUser(_supabase);
            }
        });
    }

    const modal = document.getElementById('chat-modal');
    const closeBtn = document.getElementById('close-modal');

    if (closeBtn) {
        closeBtn.onclick = function() {
            closeChatModal();
        }
    }
    
    // Cerrar al hacer click fuera del modal
    if (modal) {
        window.onclick = function(event) {
            if (event.target == modal) {
                closeChatModal();
            }
        }
    }
});
