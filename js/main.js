const counterElement = document.getElementById('counter');
const bubble = document.getElementById('bubble');
let currentValue = 0;
const maxValue = 1340;
let speed = 100; // Velocidad inicial

// Función para incrementar el contador
function increaseCounter() {
  if (currentValue < maxValue) {
    currentValue++;
    counterElement.textContent = currentValue;
    adjustSpeed();
    setTimeout(increaseCounter, speed);
  }
}

// Ajusta la velocidad del contador en función del progreso
function adjustSpeed() {
  if (currentValue < 300) {
    speed = 100; // Lento al inicio
  } else if (currentValue < 900) {
    speed = 50; // Aumenta la velocidad
  } else {
    speed = 20; // Máxima velocidad
  }
}

// Configura IntersectionObserver para detectar la visibilidad de la burbuja
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting && currentValue === 0) {
      bubble.classList.add('visible'); // Mostrar la burbuja con animación
      increaseCounter(); // Iniciar contador
    }
  });
});

// Observa la burbuja
observer.observe(bubble);




