// ** CONFIGURACIÓN DE SUPABASE (Tus Credenciales) **
// Mantenemos las claves, aunque las ignoraremos temporalmente en la función handleLogin
const SUPABASE_URL = 'https://lmvwcciiubdduyxcpefo.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtdndjY2lpdWJkZHV5eGNwZWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTE0NTgsImV4cCI6MjA3OTg2NzQ1OH0.XHXevyhS0YdVswA4bIsVgFBupTenqsBEHYpezZL5RGs'; 

// Inicializa el cliente de Supabase (Se usa en checkSession, que SÍ mantenemos)
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Obtener elementos del DOM
const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');


// 1. Función para manejar el inicio de sesión
async function handleLogin(event) {
    event.preventDefault(); // Evita que el formulario se envíe de forma tradicional
    
    errorMessage.textContent = 'Verificando funcionalidad...'; 
    
    // Deshabilitar el botón temporalmente
    const loginButton = loginForm.querySelector('button[type="submit"]');
    loginButton.disabled = true;
    loginButton.textContent = 'Redirigiendo...';

    // ======================================================================
    // |  MODO DE PRUEBA: REDIRECCIÓN INMEDIATA (BYPASS DE AUTENTICACIÓN)   |
    // |  SI ESTO FUNCIONA, LA LÓGICA DEL FORMULARIO Y JS ES CORRECTA        |
    // ======================================================================
    
    // Simula un pequeño retraso para ver el cambio de texto del botón
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    // ** ESTA LÍNEA ES LA CLAVE DEL BYPASS **
    window.location.href = 'dashboard.html'; 
    
    // ======================================================================
    // |  FIN DEL MODO DE PRUEBA                                            |
    // ======================================================================
    
    /*
    // ----------------------------------------------------------------------
    // CÓDIGO DE SUPABASE ORIGINAL (DESCOMENTAR CUANDO LA REDIRECCIÓN FUNCIONE)
    // ----------------------------------------------------------------------
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!email || !password) {
        errorMessage.textContent = 'Por favor, introduce tu correo electrónico y contraseña.';
        loginButton.disabled = false;
        loginButton.textContent = 'ACCEDER';
        return;
    }

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            errorMessage.textContent = 'Error de acceso. Comprueba tus credenciales.';
            console.error('Login Error:', error.message);
            
            loginButton.disabled = false;
            loginButton.textContent = 'ACCEDER';
            return;
        }

        window.location.href = 'dashboard.html'; 

    } catch (err) {
        errorMessage.textContent = 'Ocurrió un error inesperado. Intenta de nuevo.';
        console.error('Unexpected Error:', err);
        
        loginButton.disabled = false;
        loginButton.textContent = 'ACCEDER';
    }
    */
}

// 2. Escuchar el evento de envío del formulario
loginForm.addEventListener('submit', handleLogin);


// 3. Comprobar sesión activa al cargar la página (se mantiene la lógica de Supabase)
async function checkSession() {
    // Si el usuario ya está autenticado (de una prueba anterior con datos reales),
    // lo enviamos directo al dashboard.
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        window.location.href = 'dashboard.html';
    }
}

checkSession();
