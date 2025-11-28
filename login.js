// ** CONFIGURACIÓN DE SUPABASE (Tus Credenciales) **
// NO ES NECESARIO REEMPLAZAR, YA ESTÁN INCLUIDAS
const SUPABASE_URL = 'https://lmvwcciiubdduyxcpefo.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdndjY2lpdWJkZHV5eGNwZWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTE0NTgsImV4cCI6MjA3OTg2NzQ1OH0.XHXevyhS0YdVswA4bIsVgFBupTenqsBEHYpezZL5RGs'; 

// Inicializa el cliente de Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Obtener elementos del DOM
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');


// 1. Función para manejar el inicio de sesión
async function handleLogin(event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma tradicional

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    errorMessage.textContent = ''; // Limpiar mensajes anteriores
    
    // Deshabilitar el botón temporalmente para evitar múltiples envíos
    const loginButton = loginForm.querySelector('button[type="submit"]');
    loginButton.disabled = true;
    loginButton.textContent = 'Accediendo...';


    if (!email || !password) {
        errorMessage.textContent = 'Por favor, introduce tu correo electrónico y contraseña.';
        loginButton.disabled = false;
        loginButton.textContent = 'ACCEDER';
        return;
    }

    try {
        // Llama al método de inicio de sesión de Supabase
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            // Error en la autenticación (ej. credenciales inválidas)
            errorMessage.textContent = 'Error de acceso. Comprueba tus credenciales.';
            console.error('Login Error:', error.message);
            
            loginButton.disabled = false;
            loginButton.textContent = 'ACCEDER';
            return;
        }

        // Si el inicio de sesión es exitoso, redirecciona al dashboard
        window.location.href = 'dashboard.html'; 

    } catch (err) {
        errorMessage.textContent = 'Ocurrió un error inesperado. Intenta de nuevo.';
        console.error('Unexpected Error:', err);
        
        loginButton.disabled = false;
        loginButton.textContent = 'ACCEDER';
    }
}

// 2. Escuchar el evento de envío del formulario
loginForm.addEventListener('submit', handleLogin);


// 3. Comprobar sesión activa al cargar la página (para proteger el login)
async function checkSession() {
    // Esto previene que un usuario autenticado vea la página de login
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        // Redirige si ya está autenticado
        window.location.href = 'dashboard.html';
    }
}

checkSession();
