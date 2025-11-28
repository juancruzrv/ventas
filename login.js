// ** CONFIGURACIÓN DE SUPABASE **
const SUPABASE_URL = 'https://lmvwcciiubdduyxcpefo.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdndjY2lpdWJkZHV5eGNwZWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTE0NTgsImV4cCI6MjA3OTg2NzQ1OH0.XHXevyhS0YdVswA4bIsVgFBupTenqsBEHYpezZL5RGs'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Obtener elementos del DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');


// Función para manejar el inicio de sesión
async function handleLogin(event) {
    event.preventDefault(); 

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const loginButton = loginForm.querySelector('button[type="submit"]');

    errorMessage.textContent = ''; 
    
    if (!email || !password) {
        errorMessage.textContent = 'Por favor, introduce tu correo electrónico y contraseña.';
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Accediendo...';

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            // 🌟 CAMBIO CLAVE: Usa el mensaje de error de Supabase si existe 🌟
            // Esto nos dice si es 'Invalid login credentials' o un error de red/servidor.
            const errorMsg = error.message || 'Error de autenticación desconocido.';
            
            // Si el error es una credencial inválida (lo más común):
            if (errorMsg.includes('Invalid login credentials')) {
                 errorMessage.textContent = 'Usuario o contraseña incorrectos. Verifica tu cuenta.';
            } else {
                 // Si es otro error (como usuario no confirmado o error de red)
                 errorMessage.textContent = `Error: ${errorMsg}. Verifica tu configuración.`;
            }

            loginButton.disabled = false;
            loginButton.textContent = 'ACCEDER';
            return;
        }

        // Éxito
        window.location.href = 'dashboard.html'; 

    } catch (err) {
        // Error de red o error inesperado del JS
        errorMessage.textContent = 'Error: No se pudo conectar con el servidor. Revisa tu conexión a internet o la URL de Supabase.';
        
        loginButton.disabled = false;
        loginButton.textContent = 'ACCEDER';
    }
}

// Escuchar el evento de envío del formulario
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}


// Función para evitar que usuarios ya logueados vean la página de login
async function checkSession() {
    // Si la clave es incorrecta, esta función fallará y no hará nada.
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        window.location.href = 'dashboard.html';
    }
}

checkSession();
