// Visualizar Options
document.addEventListener("DOMContentLoaded", function () {
    // Seleccionar todos los enlaces del panel de opciones
    const links = document.querySelectorAll(".panel_options a");

    // Mapeo de enlaces a secciones de contenido, incluye tanto para admin como para tutor
    const contentMap = {
        "Home": document.getElementById("home"),
        "View Students": document.querySelector(".view_users"),
        "Add Professors": document.querySelector(".add_tutors"),
        "Edit Course": document.querySelector(".add_course"),
        "Edit & Remove User": document.querySelector(".remove_users"),
        "My Students": document.querySelector(".my_students"),
        "My Courses": document.querySelector(".my_courses"),
        "Progress": document.querySelector(".progress"),
        "Messages": document.querySelector(".messages")
    };

    // Función para ocultar todas las secciones de contenido
    function hideAllSections() {
        Object.values(contentMap).forEach(section => {
            if (section) section.style.display = "none";
        });
    }

    // Función para actualizar la miga de pan
    function updateBreadcrumb(currentSection) {
        const breadcrumb = document.getElementById("current_page");
        if (breadcrumb) {
            breadcrumb.textContent = currentSection; // Actualiza el texto de la miga
        }
    }

    // Asignar evento de clic a cada enlace
    links.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // Evita el comportamiento por defecto del enlace

            // Ocultar todas las secciones primero
            hideAllSections();

            // Mostrar la sección correspondiente
            const sectionTitle = link.getAttribute("title");
            const sectionToShow = contentMap[sectionTitle];
            if (sectionToShow) {
                sectionToShow.style.display = "block";
            }

            // Remover la clase 'active' de todos los enlaces
            links.forEach(l => l.classList.remove("active"));

            // Agregar la clase 'active' al enlace seleccionado
            link.classList.add("active");

            //Actualizar miga de pan con título de sección
            updateBreadcrumb(sectionTitle);
        });
    });

    // Inicialmente, mostrar solo la sección "Home" y actualizar la miga
    hideAllSections();
    if (contentMap["Home"]) contentMap["Home"].style.display = "block";
    updateBreadcrumb("Home"); // Esto inicializa la miga con "Home"
});

//Verificacion de rol de usuario
document.addEventListener('DOMContentLoaded', () => {

    // Hacer una solicitud al backend para obtener el rol de usuario actual
    fetch('/check-session', {
        method: 'GET',
        credentials: 'same-origin'  // Esto incluye la cookie en la solicitud
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Si el usuario es admin, ejecuta la carga de los usuarios
            if (data.role === 'admin') {
                loadUserData();  // Solo carga los usuarios si es admin
            } else {
                console.log('El usuario no tiene acceso a esta sección');
            }
        } else {
            console.error('Error al verificar la sesión');
        }
    })
    .catch(error => console.error('Error:', error));
});

// Función para deslogeo
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();

        console.log('Logout clickeado');  // Verifica si el click se está registrando

        // Hacer la solicitud de logout al backend
        fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin'  // Esto asegura que la cookie de sesión se envíe
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Sesión cerrada con éxito') {
                    window.alert("Sesión cerrada con éxito");
                    sessionStorage.removeItem('userRole');
                    window.location.href = '/index.html';  // Página de inicio

                } else {
                    console.error('Error al cerrar sesión:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});