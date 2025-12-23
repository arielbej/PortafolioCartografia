document.addEventListener('DOMContentLoaded', () => {
    // Scroll suave para los enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// VARIABLES DEL MODAL
const modal = document.getElementById("pdfModal");
const iframe = document.getElementById("pdfFrame");
const downloadLink = document.getElementById("downloadLink");
const closeBtn = document.getElementsByClassName("close-btn")[0];

// FUNCIÓN PARA ABRIR EL PDF
function openPDF(path) {
    modal.style.display = "block";
    iframe.src = path; // Carga el PDF en el iframe
    downloadLink.href = path; // Configura el botón de descarga
    
    // Evita que se mueva la página de fondo
    document.body.style.overflow = "hidden"; 
}

// CERRAR AL PULSAR LA X
closeBtn.onclick = function() {
    closeModal();
}

// CERRAR AL PULSAR FUERA DEL CONTENIDO (EN LO OSCURO)
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

function closeModal() {
    modal.style.display = "none";
    iframe.src = ""; // Limpia el iframe para que no siga cargando oculto
    document.body.style.overflow = "auto"; // Reactiva el scroll
}