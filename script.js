import { 
    initializeApp 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
// Importar las funciones de Firebase
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-functions.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged, 
    signOut 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';


// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBGlP6JI7CnJh-MXVrzNfuZlVDUnW51jHc",
    authDomain: "ganaderia-d357d.firebaseapp.com",
    projectId: "ganaderia-d357d",
    storageBucket: "ganaderia-d357d.firebasestorage.app",
    messagingSenderId: "490392434742",
    appId: "1:490392434742:web:69d99d8ae9787abfb80097",
    measurementId: "G-Q55L8JX9WX"
};

// Inicializa Firebase y la autenticación
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app);

let isAuthChecked = false; // Variable para saber si el estado de autenticación ha sido verificado

// Evento para cargar elementos DOM
document.addEventListener("DOMContentLoaded", () => {
    let isAuthChecked = false; // Variable para saber si el estado de autenticación ha sido verificado

    // Verifica el estado de autenticación
    onAuthStateChanged(auth, async (user) => {
        isAuthChecked = true;

        const userInfo = document.querySelector(".user-info span");
        const profileIcon = document.getElementById("profile-icon");
        const loginBtn = document.getElementById("login-btn");
        const createUserBtn = document.getElementById("create-user-btn");
        const logoutBtn = document.getElementById("logout-btn");
        const adminList = document.getElementById("admin-list"); // Área de administradores
        const content = document.getElementById("content"); // Área de contenido principal

        if (user) {
            const idTokenResult = await user.getIdTokenResult();
            const isAdmin = idTokenResult.claims.admin || false;

            if (userInfo) userInfo.textContent = `Bienvenido, ${user.email}`;
            if (profileIcon) profileIcon.style.backgroundImage = "";
            loginBtn.classList.add("hidden");
            createUserBtn.classList.add("hidden");
            logoutBtn.classList.remove("hidden");

            // Si el usuario es administrador
            if (isAdmin) {
                console.log("Usuario con rol de administrador detectado.");
                const adminPanelBtn = document.getElementById("btn-panel");
                if (adminPanelBtn) adminPanelBtn.classList.remove("hidden");

                // Llamar a getUsers solo cuando el usuario es administrador
                getUsers();
            } else {
                // Si no es administrador y está en el panel de administración
                if (window.location.pathname.includes('panelAdministracion.html')) {
                    if (content) {
                        content.innerHTML = `
                            <div class="no-permission">
                                <h2>No tienes permisos para acceder a esta sección.</h2>
                                <p>Por favor, contacta a un administrador para obtener más información.</p>
                            </div>
                        `;
                    }
                    console.log("Usuario no tiene permisos para acceder al panel.");
                }
            }
        } else {
            if (userInfo) userInfo.textContent = "Iniciar sesión";
            if (profileIcon) profileIcon.style.backgroundImage = "none";
            loginBtn.classList.remove("hidden");
            createUserBtn.classList.remove("hidden");
            logoutBtn.classList.add("hidden");

            if (window.location.pathname.includes('panelAdministracion.html')) {
                window.location.href = "/index.html";
            }
        }
    });
    
    const getUsers = async () => {
        const tableBody = document.querySelector("#users-table tbody");
    
        try {
            // Obtener el token del usuario actual
            const user = auth.currentUser; // Usamos la instancia de `auth` inicializada
            if (!user) {
                throw new Error("No hay un usuario autenticado.");
            }
            const userToken = await user.getIdToken();
    
            // Cambiar el URL por el de tu Firebase Cloud Function
            const response = await fetch("https://us-central1-ganaderia-d357d.cloudfunctions.net/getUsers", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${userToken}` // Incluimos el token de autenticación
                }
            });
    
            if (!response.ok) {
                throw new Error("Error al obtener usuarios: " + response.statusText);
            }
    
            const data = await response.json();
            const users = data.users;
    
            // Limpiar y llenar la tabla con los datos de los usuarios
            tableBody.innerHTML = "";
    
            users.forEach(user => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.email}</td>
                    <td>${user.uid}</td>
                    <td>${user.provider}</td>
                    <td>${new Date(user.creationTime).toLocaleDateString()}</td>
                    <td>${new Date(user.lastSignInTime).toLocaleDateString()}</td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error al cargar los usuarios:", error);
            alert("Hubo un problema al cargar los usuarios. Revisa la consola para más detalles.");
        }
    };
    
    
    
     // Configuración de títulos de página
     const pageTitles = {
        "index.html": "Inicio",
        "inventario.html": "Gestión de Inventario",
        "reportes.html": "Reportes",
        "consulta.html": "Consulta",
        "panelAdministracion.html": "Panel de Administración",
        "perfil.html": "Perfil de Usuario"
    };

    const currentPage = window.location.pathname.split("/").pop();
    const headerTitle = document.getElementById("page-title");
    if (headerTitle && pageTitles[currentPage]) {
        headerTitle.textContent = pageTitles[currentPage];
    }
    // Manejo de modales (abrir/cerrar)
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add("active");
            document.getElementById("overlay").classList.add("active");
        }
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove("active");
            const activeModals = document.querySelectorAll(".modal.active");
            if (activeModals.length === 0) {
                const overlay = document.getElementById("overlay");
                if (overlay) overlay.classList.remove("active");
            }
        }
    };


    // Manejo del ícono de perfil
    const profileIcon = document.getElementById("profile-icon");
    const profileMenu = document.getElementById("profile-menu");
    if (profileIcon && profileMenu) {
        profileIcon.addEventListener("click", () => {
            profileMenu.classList.toggle("active");
        });
    }

    // Iniciar sesión
    const loginForm = document.getElementById("login-form-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-username").value;
            const password = document.getElementById("login-password").value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Bienvenido nuevamente!");
                closeModal("login-form");
            } catch (error) {
                alert(`Error al iniciar sesión: ${error.message}`);
            }
        });
    }

    // Crear un nuevo usuario
    const createUserForm = document.getElementById("create-user-form-form");
    if (createUserForm) {
        createUserForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("create-email").value;
            const password = document.getElementById("create-password").value;
            const confirmPassword = document.getElementById("create-confirm-password").value;

            if (password.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres.");
                return;
            }

            if (password !== confirmPassword) {
                alert("Las contraseñas no coinciden.");
                return;
            }

            try {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
                closeModal("create-user-form");
            } catch (error) {
                alert(`Error al crear usuario: ${error.message}`);
            }
        });
    }

  

    // Manejo del botón del Panel de Administración
const adminPanelBtn = document.getElementById("btn-panel");
if (adminPanelBtn) {
    adminPanelBtn.addEventListener("click", async () => {
        const currentPage = window.location.pathname.split("/").pop();
        if (isAuthChecked && auth.currentUser) {
            // Verificar si el usuario tiene el rol de administrador
            const user = auth.currentUser;
            const idTokenResult = await user.getIdTokenResult();
            const isAdmin = idTokenResult.claims.admin || false;

            if (isAdmin) {
                // Si es administrador, redirigir al panel de administración
                window.location.href = currentPage === 'index.html' ? 'screens/panelAdministracion.html' : '../screens/panelAdministracion.html';
            } else {
              
            }
        } else {
        
        }
    });
}
    // Cerrar sesión
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            alert("Has cerrado sesión.");
            window.location.href = "/index.html";
        });
    }
    
    // Manejo del menú lateral en móviles
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('show'); // Agregar o quitar la clase "show"
        });
    }

    // Función para abrir la cámara y tomar una foto
function openCamera() {
    // Crear un elemento de video para mostrar la cámara
    const videoElement = document.createElement("video");
    videoElement.setAttribute("autoplay", "true");
    videoElement.setAttribute("playsinline", "true");
    videoElement.style.width = "100%";
    videoElement.style.height = "auto";

    // Crear un contenedor modal
    const cameraModal = document.createElement("div");
    cameraModal.style.position = "fixed";
    cameraModal.style.top = "0";
    cameraModal.style.left = "0";
    cameraModal.style.width = "100vw";
    cameraModal.style.height = "100vh";
    cameraModal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    cameraModal.style.display = "flex";
    cameraModal.style.flexDirection = "column";
    cameraModal.style.justifyContent = "center";
    cameraModal.style.alignItems = "center";
    cameraModal.style.zIndex = "200";

    // Botón para tomar foto
    const captureButton = document.createElement("button");
    captureButton.textContent = "Tomar foto";
    captureButton.style.marginTop = "10px";
    captureButton.style.padding = "10px 20px";
    captureButton.style.backgroundColor = "#4CAF50";
    captureButton.style.color = "#fff";
    captureButton.style.border = "none";
    captureButton.style.cursor = "pointer";

    // Botón para cerrar la cámara
    const closeButton = document.createElement("button");
    closeButton.textContent = "Cerrar cámara";
    closeButton.style.marginTop = "10px";
    closeButton.style.padding = "10px 20px";
    closeButton.style.backgroundColor = "#f00";
    closeButton.style.color = "#fff";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";

    // Contenedor para la foto capturada
    const photoContainer = document.createElement("div");
    photoContainer.style.marginTop = "20px";

    // Evento para cerrar la cámara
    closeButton.onclick = () => {
        const stream = videoElement.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop()); // Detener la cámara
        document.body.removeChild(cameraModal); // Eliminar modal
    };

    // Evento para capturar una foto
    captureButton.onclick = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Dibujar el fotograma actual del video en el canvas
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Crear una imagen a partir del canvas
        const img = document.createElement("img");
        img.src = canvas.toDataURL("image/png"); // Convertir a formato base64
        img.style.width = "300px";
        img.style.marginTop = "10px";

        // Mostrar la foto capturada en el contenedor
        photoContainer.innerHTML = ""; // Limpiar contenedor
        photoContainer.appendChild(img);
    };

    // Agregar los elementos al modal
    cameraModal.appendChild(videoElement);
    cameraModal.appendChild(captureButton);
    cameraModal.appendChild(closeButton);
    cameraModal.appendChild(photoContainer);
    document.body.appendChild(cameraModal);

    // Solicitar acceso a la cámara
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            videoElement.srcObject = stream;
        })
        .catch(error => {
            alert("No se pudo acceder a la cámara: " + error.message);
            document.body.removeChild(cameraModal);
        });
}

// Vincular la función al botón de "Abrir cámara"
document.querySelector(".camera-btn").addEventListener("click", openCamera);
});
