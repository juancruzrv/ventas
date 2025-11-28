// ** CONFIGURACIÓN DE SUPABASE **
// Credenciales proporcionadas por el usuario
const SUPABASE_URL = 'https://lmvwcciiubdduyxcpefo.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdndjY2lpdWJkZHV5eGNwZWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTE0NTgsImV4cCI6MjA3OTg2NzQ1OH0.XHXevyhS0YdVswA4bIsVgFBupTenqsBEHYpezZL5RGs'; 

// Inicializa el cliente de Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Obtener elementos del DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');


// Función para manejar el inicio de sesión
async function handleLogin(event) {
    // 🌟 CLAVE: Detiene el envío del formulario por defecto (evita el '?' en la URL)
    event.preventDefault(); 

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const loginButton = loginForm.querySelector('button[type="submit"]');

    errorMessage.textContent = ''; // Limpiar mensajes
    
    if (!email || !password) {
        errorMessage.textContent = 'Por favor, introduce tu correo electrónico y contraseña.';
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = 'Accediendo...';

    try {
        // Lógica de inicio de sesión con Supabase
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            // Se ejecuta si hay un error de CORS o credenciales incorrectas
            errorMessage.textContent = 'Error de acceso. Comprueba tus credenciales.';
            console.error('Login Error:', error.message);
            
            loginButton.disabled = false;
            loginButton.textContent = 'ACCEDER';
            return;
        }

        // Si el inicio de sesión es exitoso, redirecciona
        window.location.href = 'dashboard.html'; 

    } catch (err) {
        // Error de red o error inesperado
        errorMessage.textContent = 'Ocurrió un error inesperado. Intenta de nuevo.';
        
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
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        window.location.href = 'dashboard.html';
    }
}

checkSession();
