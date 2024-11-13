document.getElementById('signup').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevenir el envío del formulario

    // Obtener los valores de los inputs
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Enviar los datos al servidor
    if (first_name && last_name && email && password) {
        // Solo continúa si todos los elementos fueron encontrados
        fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: password
            })
        })
            .then(response => response.text())
            .then(data => {
                alert(data);
                if (data === 'Usuario registrado con éxito') {
                    window.location.href = 'login.html';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Hubo un error en el registro :(');
            });
    } else {
        console.error('Algunos campos no se encontraron en el formulario')
    }
});