// app.js

// ----------------------------------------------------------------------
// 1. CONFIGURACIÓN E INICIALIZACIÓN DEL CLIENTE SUPABASE
// ----------------------------------------------------------------------

// *** TUS CREDENCIALES DE SUPABASE ***
// Obtenidas de tu proyecto 'qkxefpovtejifoophhya'
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 

// Creación de la instancia del cliente Supabase
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// 2. REFERENCIAS Y MANEJO DEL DOM
// ----------------------------------------------------------------------

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageElement = document.getElementById('message');

/**
 * Función que maneja el inicio de sesión cuando se envía el formulario.
 * @param {Event} e - El evento de envío del formulario.
 */
async function handleLogin(e) {
    e.preventDefault(); // Previene que la página se recargue

    messageElement.textContent = 'Verificando credenciales...';
    messageElement.style.color = '#007bff'; // Azul para estado de carga

    const email = emailInput.value;
    const password = passwordInput.value;

    // Llama al método de inicio de sesión de Supabase
    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        // Manejo de errores de autenticación (ej. credenciales incorrectas)
        messageElement.textContent = `Error: ${error.message}`;
        messageElement.style.color = '#d9534f'; // Rojo para errores
        console.error('Error de autenticación:', error);
    } else {
        // Inicio de sesión exitoso
        messageElement.textContent = '¡Acceso concedido! Redirigiendo al Dashboard...';
        messageElement.style.color = '#28a745'; // Verde para éxito
        
        // Redirigir al dashboard
        window.location.href = 'dashboard.html'; 
    }
}

/**
 * Verifica si el usuario ya tiene una sesión activa (ej. si cerró el navegador y regresó).
 */
async function checkAuthStatus() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
        // Si hay un usuario, redirigir inmediatamente al dashboard
        console.log('Sesión activa encontrada. Redirigiendo...');
        window.location.href = 'dashboard.html';
    }
    // Si no hay usuario, simplemente se queda en el formulario de login.
}

// ----------------------------------------------------------------------
// 3. LISTENERS E INICIALIZACIÓN
// ----------------------------------------------------------------------

// 1. Agregar el listener para el envío del formulario
loginForm.addEventListener('submit', handleLogin);

// 2. Ejecutar la verificación de estado al cargar la página
checkAuthStatus();
