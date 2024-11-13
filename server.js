//Importar modulos express, path, mysql, bcrypt, body-parser
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path'); 
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
require('dotenv').config();

//Servidor Express
const app = express();
const port = 3000;

// Configuración de Multer para manejar la subida de imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');  // Carpeta donde se guardarán las imágenes
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));  // Renombrar el archivo con la fecha actual
    }
  });
  
  const upload = multer({ storage: storage });

//Configuracion Middlewares
app.use(express.json()); //Maneja JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.use(session({
    secret: '1234567890',  // Usa un valor secreto para proteger la sesión
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // Si usas HTTPS, cambia a true
}));

//Configuracion de rutas de archivos estaticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'))
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

//Servir archivos estaticos
app.use(express.static('ludo'));

//DB Name - 'lms'
//Conexion a Base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//Conexion a base de datos
db.connect(err => {
    if (err) throw err;
    console.log('Conexion exitosa a la base de datos MySQL')
});

//Ruta de registro (sign up)
app.post('/signup', (req, res) => {
    const { first_name, last_name, email, password } = req.body;

    // Encriptar la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;

        // Insertar usuario en la base de datos
        const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
        db.query(query, [first_name, last_name, email, hashedPassword], (err, result) => {
            if (err) throw err;
            res.send('Usuario registrado con éxito');
        });
    });
});

// Ruta de inicio de sesión (login)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Buscar al usuario por correo registrado
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            const user = result[0];

            // Comparación de contraseñas
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;

                if (isMatch) {
                    req.session.userRole = user.role;
                    req.session.userId = user.id;

                    // Respuesta de acuerdo al rol del usuario
                    if (user.role === 'admin') {
                        res.json({ status: 'success', role: 'admin', redirectUrl: '/dashboards/admin.html' });
                    } else if (user.role === 'teacher') {
                        res.json({ status: 'success', role: 'teacher', redirectUrl: '/dashboards/tutor.html' });
                    } else if (user.role === 'student') {
                        res.json({ status: 'success', role: 'student', redirectUrl: '/dashboards/student.html' });
                    } else {
                        res.json({ status: 'error', message: 'Rol no reconocido' });
                    }
                } else {
                    res.json({ status: 'error', message: 'Contraseña incorrecta' });
                }
            });
        } else {
            res.json({ status: 'error', message: 'Usuario no encontrado' });
        }
    });
});

// Ruta para verificar la sesión y el rol del usuario
app.get('/check-session', (req, res) => {
    // Verificar si la sesión tiene un rol
    if (req.session.userRole) {
        res.json({ status: 'success', role: req.session.userRole });
    } else {
        res.json({ status: 'error', message: 'No hay sesión activa' });
    }
});

// Ruta para obtener los datos de los usuarios
app.get('/admin/users', (req, res) => {
    if (req.session.userRole === 'admin') {
        const query = 'SELECT id, first_name, last_name, email, role FROM users';

        db.query(query, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al obtener los datos de los usuarios' });
            }

            res.json(results);
        });
    } else {
        res.status(403).json({ message: 'Acceso denegado' });
    }
});

// Ruta para crear un nuevo profesor
app.post('/admin/add-tutor', (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    
    // Encriptar la contraseña
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;

        // Insertar tutor con rol 'teacher' en la base de datos
        const query = 'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, "teacher")';
        db.query(query, [first_name, last_name, email, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error al crear el tutor' });
            }
            res.json({ message: 'Tutor creado con éxito' });
        });
    });
});

// Ruta para eliminar un usuario por ID
app.delete('/admin/remove-user/:id', (req, res) => {
    const userId = req.params.id;

    // Verificar si el usuario tiene el rol de administrador antes de eliminar
    if (req.session.userRole !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado' });
    }

    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al eliminar el usuario' });
        }

        res.json({ message: 'Usuario eliminado con éxito' });
    });
});

// Ruta para obtener un usuario por ID (para mostrar en el formulario de edición)
app.get('/admin/users/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'SELECT id, first_name, last_name, email, role FROM users WHERE id = ?';
    
    

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener el usuario' });
        }
        if (result.length > 0) {
            res.json(result[0]);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    });
});

// Ruta para actualizar un usuario
app.put('/admin/update-user/:id', (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, role } = req.body;

    const query = 'UPDATE users SET first_name = ?, last_name = ?, email = ?, role = ? WHERE id = ?';
    db.query(query, [first_name, last_name, email, role, userId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al actualizar el usuario' });
        }
        res.json({ message: 'Usuario actualizado con éxito' });
    });
});

// Ruta para agregar un curso (con imagen)
app.post('/admin/add-course', upload.single('course-image'), (req, res) => {
    const { name, description } = req.body;
    const created_by = req.session.userId; // El ID del usuario que crea el curso
    const imageUrl = req.file ? `uploads/${req.file.filename}` : null;

    // Insertar el curso en la base de datos
    const query = 'INSERT INTO courses (name, description, created_by, image_url) VALUES (?, ?, ?, ?)';
    db.query(query, [name, description, created_by, imageUrl], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al crear el curso' });
        }
        res.json({ message: 'Curso creado con éxito' });
    });
});

// Ruta para obtener los cursos
app.get('/courses', (req, res) => {
    const query = 'SELECT * FROM courses';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al obtener los cursos' });
        }
        res.json(results);
    });
});

// Ruta para eliminar un curso
app.delete('/delete-course/:id', (req, res) => {
    const courseId = req.params.id;
    
    const query = 'DELETE FROM courses WHERE id = ?';
    db.query(query, [courseId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error al eliminar el curso' });
        }
        res.json({ success: true, message: 'Curso eliminado con éxito' });
    });
});

// Ruta de deslogueo (logout)
app.post('/logout', (req, res) => {
    console.log('Cerrando sesión...');
    req.session.destroy(err => {
        if (err) {
            console.error('Error al cerrar sesión:', err);  // Log de error
            return res.status(500).json({ message: 'Error al cerrar sesión' });
        }
        console.log('Sesión cerrada con éxito');
        res.json({ message: 'Sesión cerrada con éxito' });
    });
});

//Middleware Error 404
app.use((req, res) => {
    res.status(404).send('Pagina no encontrada :(')
});

//Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchado en el puerto http://localhost:${port}`)
});