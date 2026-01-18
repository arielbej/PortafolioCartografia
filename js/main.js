

document.addEventListener('DOMContentLoaded', () => {
    // Scroll suave para los enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            
            // Verifica que no sea solo "#"
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
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

// FUNCIÓN PARA ABRIR IMÁGENES O GRÁFICOS
function openImage(path) {
    modal.style.display = "block";
    iframe.src = path; // El navegador renderiza la imagen dentro del iframe
    downloadLink.href = path; // Mantiene la opción de descargar el gráfico
    
    // Cambiamos el título si fuera necesario o simplemente bloqueamos scroll
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


// VARIABLES DEL MODAL WEBMAP
const webmapModal = document.getElementById("webmapModal");
const webmapFrame = document.getElementById("webmapFrame");
const webmapTitle = document.getElementById("webmapTitle");
const webmapFullscreen = document.getElementById("webmapFullscreen");
const closeWebmapBtn = document.getElementsByClassName("close-webmap")[0];

// FUNCIÓN PARA ABRIR WEBMAP
function openWebMap(path, title) {
    webmapModal.style.display = "block";
    webmapFrame.src = path;
    webmapTitle.textContent = title || "Visualizador de Mapa";
    webmapFullscreen.href = path;
    
    // Evita que se mueva la página de fondo
    document.body.style.overflow = "hidden";
}

// FUNCIÓN PARA CERRAR WEBMAP MODAL
function closeWebMapModal() {
    webmapModal.style.display = "none";
    webmapFrame.src = ""; // Limpia el iframe
    document.body.style.overflow = "auto";
}

// CERRAR AL PULSAR LA X
if (closeWebmapBtn) {
    closeWebmapBtn.onclick = function() {
        closeWebMapModal();
    }
}

// CERRAR AL PULSAR FUERA DEL CONTENIDO
window.addEventListener('click', function(event) {
    if (event.target == webmapModal) {
        closeWebMapModal();
    }
});

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        if (webmapModal.style.display === "block") {
            closeWebMapModal();
        }
        if (modal.style.display === "block") {
            closeModal();
        }
    }
});