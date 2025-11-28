// app.js

// ----------------------------------------------------------------------
// 1. CONFIGURACIÓN E INICIALIZACIÓN DEL CLIENTE SUPABASE
// ----------------------------------------------------------------------
const SUPABASE_URL = 'https://qkxefpovtejifoophhya.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFreGVmcG92dGVqaWZvb3BoaHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyOTM4NTgsImV4cCI6MjA3OTg2OTg1OH0.hnzWQjicUJtUyfZLpTHipQLVcWCnIQYv1d3u9bNsMvQ'; 

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ----------------------------------------------------------------------
// 2. REFERENCIAS Y MANEJO DEL DOM
// ----------------------------------------------------------------------

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageElement = document.getElementById('message');
const loginContainer = document.querySelector('.login-container'); // Referencia al contenedor del login

/**
 * Función que maneja el inicio de sesión.
 */
async function handleLogin(e) {
    e.preventDefault(); 

    // Añadir la clase para activar la animación de neón
    loginContainer.classList.add('active-neon');

    messageElement.textContent = 'Verificando credenciales...';
    messageElement.style.color = '#007bff'; 

    const email = emailInput.value;
    const password = passwordInput.value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        messageElement.textContent = `Error: ${error.message}`;
        messageElement.style.color = '#ff6666'; 
        // Quitar la animación si hay error después de un breve tiempo
        setTimeout(() => loginContainer.classList.remove('active-neon'), 800);
    } else {
        messageElement.textContent = '¡Acceso concedido! Redirigiendo al Dashboard...';
        messageElement.style.color = '#28a745'; 
        
        // Mantener la animación por un momento antes de redirigir
        setTimeout(() => {
            window.location.href = 'dashboard.html'; 
        }, 800); // Dar tiempo para que la animación se vea
    }
}

/**
 * Verifica si el usuario ya tiene una sesión activa para evitar volver a loguearse.
 */
async function checkAuthStatus() {
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (user) {
        console.log('Sesión activa encontrada. Redirigiendo...');
        window.location.href = 'dashboard.html';
    }
}

// ----------------------------------------------------------------------
// 3. LISTENERS E INICIALIZACIÓN
// ----------------------------------------------------------------------

loginForm.addEventListener('submit', handleLogin);
checkAuthStatus();
