// Ver usuarios con rol 'student' registrados en la plataforma 
async function loadUserData() {
    try {
        const response = await fetch('/admin/users');
        if (!response.ok) {
            throw new Error('Error al obtener los datos de los usuarios');
        }

        const users = await response.json();
        console.log('Usuarios obtenidos:', users);

        const viewUsersDiv = document.querySelector('.view_users');

        const estudiantes = users.filter(user => user.role === 'student');
        console.log('Usuarios con rol "estudiante":', estudiantes);

        if (estudiantes.length === 0) {
            viewUsersDiv.innerHTML = '<p>No hay usuarios con rol de estudiante.</p>';
            return;
        }

        const table = document.createElement('table');
        table.classList.add('user-table');

        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>ID</th>
            <th>Name</th>
            <th>Last name</th>
            <th>Email</th>
        `;
        table.appendChild(headerRow);

        estudiantes.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="text-align:center; font-weight:bold;">${user.id}</td>
                <td>${user.first_name}</td>
                <td>${user.last_name}</td>
                <td>${user.email}</td>
            `;
            table.appendChild(row);
        });

        viewUsersDiv.appendChild(table);
    } catch (error) {
        console.error(error);
        alert('Hubo un problema al cargar los datos de los usuarios');
    }
}

// Envio de datos de nuevo tutor al Backend
document.getElementById('addTutorForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    fetch('/admin/add-tutor', {
        method: 'POST',
        body: JSON.stringify({
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email'),
            password: formData.get('password')
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadTutors();
            event.target.reset();
        })
        .catch(error => console.error('Error:', error));
});

// Función para cargar los tutores y mostrarlos en una tabla
function loadTutors() {
    fetch('/admin/users')
        .then(response => response.json())
        .then(data => {
            const tutorTable = document.querySelector('.new_tutor_table');
            tutorTable.innerHTML = '';

            const teachers = data.filter(user => user.role === 'teacher');

            if (teachers.length === 0) {
                tutorTable.innerHTML = '<p>No tutors available</p>';
            } else {
                const table = document.createElement('table');
                table.classList.add('tutor-table');

                const headerRow = document.createElement('tr');
                headerRow.innerHTML = `
                    <th style="text-align:center; font-weight:bold;">ID</th>
                    <th>Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                `;
                table.appendChild(headerRow);

                teachers.forEach(tutor => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${tutor.id}</td>
                        <td>${tutor.first_name}</td>
                        <td>${tutor.last_name}</td>
                        <td>${tutor.email}</td>
                    `;
                    table.appendChild(row);
                });

                tutorTable.appendChild(table);
            }
        })
        .catch(error => {
            console.error('Error al cargar los tutores:', error);
        });
}

document.addEventListener('DOMContentLoaded', loadTutors);

// Función para cargar y mostrar usuarios con rol 'teacher' y 'student'
function loadUsers() {
    fetch('/admin/users')
        .then(response => response.json())
        .then(data => {
            console.log("Datos de usuarios recibidos:", data); // Para verificar que se recibe la información correcta

            const usersTable = document.getElementById('remove_users_table');
            usersTable.innerHTML = '';

            const filteredUsers = data.filter(user => user.role === 'teacher' || user.role === 'student');

            if (filteredUsers.length === 0) {
                usersTable.innerHTML = '<p>No users available</p>';
            } else {
                const table = document.createElement('table');
                table.classList.add('style_users_table');

                const headerRow = document.createElement('tr');
                headerRow.innerHTML = `
                    <th>ID</th>
                    <th>Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                `;
                table.appendChild(headerRow);

                filteredUsers.forEach(user => {
                    console.log("Usuario procesado:", user); // Para verificar cada usuario individual
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="ID">${user.id}</td>
                        <td>${user.first_name}</td>
                        <td>${user.last_name}</td>
                        <td>${user.email}</td>
                        <td class="role">${user.role}</td>
                        <td>
                            <button onclick="editUser(${user.id})" class="edit-button" title="Edit User">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325"/>
</svg>
                            </button>
                            <button onclick="removeUser(${user.id})" title="Remove Member">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                            </button>
                        </td>
                    `;
                    table.appendChild(row);
                });

                usersTable.appendChild(table);
            }
        })
        .catch(error => {
            console.error('Error al cargar los usuarios:', error);
        });
}

document.addEventListener('DOMContentLoaded', loadUsers);

// Función para eliminar un usuario
function removeUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        fetch(`/admin/remove-user/${userId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                loadUsers();
            })
            .catch(error => {
                console.error('Error al eliminar el usuario:', error);
                alert('Hubo un error al eliminar al usuario');
            });
    }
}

// Función para editar un usuario
function editUser(userId) {
    fetch(`/admin/users/${userId}`)
        .then(response => response.json())
        .then(user => {

            document.getElementById('edit_first_name').value = user.first_name;
            document.getElementById('edit_last_name').value = user.last_name;
            document.getElementById('edit_email').value = user.email;
            document.getElementById('edit_role').value = user.role;

            //Mostrar el formulario de edicion
            const editForm = document.getElementById('edit_user_form');
            editForm.style.display = 'block';

            // Desplazamiento suave hacia el formulario de edición
            editForm.scrollIntoView({ behavior: 'smooth', block: 'start' });

            document.getElementById('edit_form').onsubmit = function (e) {
                e.preventDefault();
                saveUserChanges(userId);
            };
        })
        .catch(error => console.error('Error loading user for edit:', error));
}

// Función para guardar los cambios del usuario
function saveUserChanges(userId) {
    const updatedUser = {
        first_name: document.getElementById('edit_first_name').value,
        last_name: document.getElementById('edit_last_name').value,
        email: document.getElementById('edit_email').value,
        role: document.getElementById('edit_role').value
    };

    fetch(`/admin/update-user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadUsers();
            cancelEdit();
        })
        .catch(error => console.error('Error saving user changes:', error));
}

// Función para cancelar la edición y cerrar el formulario
function cancelEdit() {
    document.getElementById('edit_user_form').style.display = 'none';
}

// Función para cargar y mostrar los cursos
function loadCourses() {
    fetch('/courses')
        .then(response => response.json())
        .then(courses => {
            console.log(courses);  // Para depurar si la respuesta es correcta
            const courseContainer = document.querySelector('.course_container');

            // Selecciona solo los cursos (excluyendo el título predefinido)
            const courseElements = courseContainer.querySelectorAll('.course-item');

            // Elimina solo los cursos previos, pero mantiene el título y el h4
            courseElements.forEach(courseElement => {
                courseElement.remove();
            });

            courses.forEach(course => {
                const courseElement = document.createElement('div');
                courseElement.classList.add('course-item');
                courseElement.innerHTML = `
                    <div class="course-title">${course.name}</div>
                    <div class="course-description">${course.description}</div>
                    
                    
                    <button onclick="deleteCourse(${course.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                    </button>
                `;
                courseContainer.appendChild(courseElement);
            });
        })
        .catch(error => console.error('Error loading courses:', error));
}

// Función para agregar un nuevo curso
document.getElementById('add-course-form').onsubmit = function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append('course-image', document.getElementById('course-image').files[0]);
    formData.append('name', document.getElementById('course-name').value);
    formData.append('description', document.getElementById('course-description').value);
    formData.append('created_by', 'admin'); // Puedes cambiar esto según el rol actual

    fetch('/admin/add-course', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadCourses(); // Recargar los cursos después de agregar uno nuevo
            document.getElementById('add-course-form').reset();
        })
        .catch(error => console.error('Error adding course:', error));
};

// Función para eliminar un curso
function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    fetch(`/delete-course/${courseId}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadCourses(); // Recargar la lista de cursos después de eliminar uno
        })
        .catch(error => console.error('Error deleting course:', error));
}

// Cargar los cursos al cargar la página
document.addEventListener('DOMContentLoaded', loadCourses);
