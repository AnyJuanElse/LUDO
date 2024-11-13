document.addEventListener('DOMContentLoaded', () => {
    const login = document.querySelector('#login');
    const logout = document.querySelector('#logout');

    login.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir el comportamiento predeterminado

        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'same-origin',  // Asegura que las cookies de sesión se envíen
            });
    
            const result = await response.json(); // Parsear como JSON
    
            if (result.status === 'success') {
                // Guardar el rol en sessionStorage o cookies
                sessionStorage.setItem('userRole', result.role);
            
                // Redirigir según el rol del usuario
                if (result.role === 'admin') {
                    window.location.href = '/dashboards/admin.html';
                } else if (result.role === 'teacher') {
                    window.location.href = '/dashboards/tutor.html';
                } else if (result.role === 'student') {
                    window.location.href = '/dashboards/student.html';
                }
            } else {
                alert(result.message); // Mostrar mensaje de error si la autenticación falla
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        }
    });
});
