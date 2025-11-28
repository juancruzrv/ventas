// =================================================================
// test-data.js - LÓGICA DE GENERACIÓN Y ELIMINACIÓN DE DATOS DE PRUEBA
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Este script depende de que dashboard.js haya inicializado window.supabase
    if (typeof window.supabase === 'undefined') {
        const msg = 'Error: Supabase no está inicializado. Verifica las credenciales en dashboard.js.';
        const insertMsg = document.getElementById('insert-message');
        const deleteMsg = document.getElementById('delete-message');
        if (insertMsg) insertMsg.textContent = msg;
        if (deleteMsg) deleteMsg.textContent = msg;
        return;
    }

    const insertForm = document.getElementById('insert-form');
    const insertButton = document.getElementById('insert-button');
    const insertMessage = document.getElementById('insert-message');
    const deleteAllButton = document.getElementById('delete-all-button');
    const deleteMessage = document.getElementById('delete-message');

    // 1. Manejar la inserción de una nueva interacción
    if (insertForm) {
        insertForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            insertButton.disabled = true;
            insertMessage.textContent = 'Insertando...';
            insertMessage.style.color = '#ffd700';

            const phone = document.getElementById('phone').value;
            const type = document.getElementById('type').value;
            const summaryTemplate = document.getElementById('summary').value;
            const message = document.getElementById('message').value;
            const response = document.getElementById('response').value;
            
            const summary = summaryTemplate.replace('[TIPO]', type);

            const chatHistory = [
                { role: 'client', message: message, timestamp: new Date().toISOString() },
                { role: 'bot', message: response, timestamp: new Date().toISOString() }
            ];

            const newInteraction = {
                client_phone: phone,
                interaction_type: type,
                summary: summary,
                chat_history: chatHistory, 
                timestamp: new Date().toISOString()
            };

            const { error } = await window.supabase
                .from('interacciones')
                .insert([newInteraction]);

            if (error) {
                insertMessage.textContent = 'Error al insertar: ' + error.message;
                insertMessage.style.color = '#d62828';
            } else {
                insertMessage.textContent = `✅ Interacción de tipo "${type.toUpperCase()}" insertada con éxito.`;
                insertMessage.style.color = '#39ff14';
            }
            insertButton.disabled = false;
        });
    }

    // 2. Manejar la eliminación de TODAS las interacciones
    if (deleteAllButton) {
        deleteAllButton.addEventListener('click', async () => {
            if (!confirm("ADVERTENCIA: ¿Estás seguro de que quieres eliminar TODAS las interacciones de prueba? Esta acción es irreversible.")) {
                return;
            }

            deleteAllButton.disabled = true;
            deleteMessage.textContent = 'Eliminando todos los datos...';
            deleteMessage.style.color = '#ffd700';

            const { error } = await window.supabase
                .from('interacciones')
                .delete()
                .neq('id', 0);

            if (error) {
                deleteMessage.textContent = 'Error al eliminar: ' + error.message;
                deleteMessage.style.color = '#d62828';
            } else {
                deleteMessage.textContent = '🗑️ ¡Todos los datos de prueba han sido eliminados con éxito!';
                deleteMessage.style.color = '#39ff14';
            }
            deleteAllButton.disabled = false;
        });
    }
});
