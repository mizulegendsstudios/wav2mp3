document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('wavFile');
    const selectFileBtn = document.getElementById('selectFile');
    const bitrateSelect = document.getElementById('bitrate');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progressText');
    const result = document.getElementById('result');
    const downloadLink = document.getElementById('downloadLink');
    
    let ffmpeg;

    // Inicializar FFmpeg
    async function initFFmpeg() {
        if (!ffmpeg) {
            ffmpeg = new FFmpeg();
            await ffmpeg.load();
        }
    }

    // Manejar clic en el área de carga
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Manejar selección de archivo
    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // Manejar cambio de archivo
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'audio/wav') {
            await convertFile(file);
        } else {
            alert('Por favor, selecciona un archivo WAV válido');
        }
    });

    // Manejar arrastrar y soltar
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f8f9ff';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = 'transparent';
    });

    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = 'transparent';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'audio/wav') {
            await convertFile(file);
        } else {
            alert('Por favor, arrastra un archivo WAV válido');
        }
    });

    async function convertFile(file) {
        try {
            await initFFmpeg();
            
            // Mostrar progreso
            progressContainer.style.display = 'block';
            result.style.display = 'none';
            progressBar.style.width = '0%';
            progressText.textContent = 'Cargando archivo...';
            
            // Escribir archivo en el sistema de archivos de FFmpeg
            await ffmpeg.FS('writeFile', 'input.wav', await fetchFile(file));
            
            progressText.textContent = 'Convirtiendo a MP3...';
            
            // Obtener bitrate seleccionado
            const bitrate = bitrateSelect.value;
            
            // Ejecutar conversión
            await ffmpeg.run('-i', 'input.wav', '-b:a', `${bitrate}k`, 'output.mp3');
            
            // Leer archivo resultante
            const data = ffmpeg.FS('readFile', 'output.mp3');
            const blob = new Blob([data.buffer], { type: 'audio/mp3' });
            
            // Crear enlace de descarga
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download = file.name.replace('.wav', '.mp3');
            
            // Mostrar resultado
            progressContainer.style.display = 'none';
            result.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            alert('Ocurrió un error durante la conversión. Por favor, intenta de nuevo.');
            progressContainer.style.display = 'none';
        }
    }

    // Función auxiliar para cargar archivo
    function fetchFile(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(new Uint8Array(e.target.result));
            reader.readAsArrayBuffer(file);
        });
    }
});
