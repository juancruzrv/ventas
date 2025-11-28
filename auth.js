// ===============================================
// auth.js: Lógica de Autenticación de Supabase
// (Usa la variable _supabase definida en el HTML)
// ===============================================

/**
 * 🔑 Inicia sesión de un usuario con email y contraseña.
 */
async function loginUser(supabase) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDisplay = document.getElementById('error-message');
    const loginButton = document.getElementById('login-button');
    
    loginButton.disabled = true;
    loginButton.textContent = 'Cargando...';
    errorDisplay.textContent = '';

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            errorDisplay.textContent = 'Error: ' + error.message;
        } else {
            window.location.href = 'dashboard.html';
        }
    } catch (err) {
        errorDisplay.textContent = 'Ocurrió un error inesperado.';
        console.error("Error en login:", err);
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = 'Acceder';
    }
}

/**
 * 🚪 Cierra la sesión del usuario.
 */
async function logoutUser(supabase) {
    await supabase.auth.signOut();
    window.location.href = 'index.html';
}

/**
 * 🔍 Verifica si existe una sesión de usuario y redirige.
 */
async function checkUserSession(supabase, pageType = 'login') {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (pageType === 'login' && session) {
        window.location.href = 'dashboard.html';
    } else if (pageType === 'dashboard' && !session) {
        window.location.href = 'index.html';
    } else if (pageType === 'dashboard' && session) {
        // Muestra el correo del usuario en el dashboard
        document.getElementById('user-info').textContent = `Usuario: ${session.user.email}`;
        
        // Inicia la carga de datos del dashboard
        if (typeof initDashboard === 'function') {
            initDashboard(supabase);
        }
    }
}

// Escucha el formulario de login al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // La variable _supabase se define en index.html
            if (typeof _supabase !== 'undefined') { 
                loginUser(_supabase);
            }
        });
    }
});
