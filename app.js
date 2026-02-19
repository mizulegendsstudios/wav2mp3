const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true });

const uploader = document.getElementById('uploader');
const convertBtn = document.getElementById('convertBtn');
const statusContainer = document.getElementById('statusContainer');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const fileNameDisplay = document.getElementById('fileName');

// Mostrar nombre del archivo seleccionado
uploader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) fileNameDisplay.innerText = file.name;
});

convertBtn.addEventListener('click', async () => {
    const file = uploader.files[0];
    if (!file) return alert("Por favor, selecciona un archivo WAV.");

    // Bloquear botón y mostrar status
    convertBtn.disabled = true;
    statusContainer.classList.remove('hidden');
    
    try {
        if (!ffmpeg.isLoaded()) {
            statusText.innerText = "Cargando motor WebAssembly...";
            await ffmpeg.load();
        }

        statusText.innerText = "Escribiendo archivo temporal...";
        ffmpeg.FS('writeFile', 'input.wav', await fetchFile(file));

        statusText.innerText = "Transformando a MP3...";
        
        // Listener de progreso
        ffmpeg.setProgress(({ ratio }) => {
            progressBar.style.width = `${Math.floor(ratio * 100)}%`;
        });

        // Ejecutar comando de conversión
        await ffmpeg.run('-i', 'input.wav', 'output.mp3');

        statusText.innerText = "¡Listo! Descargando...";
        const data = ffmpeg.FS('readFile', 'output.mp3');

        // Crear descarga
        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'audio/mp3' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.wav', '.mp3');
        a.click();

        // Limpiar para la próxima conversión
        setTimeout(() => {
            statusContainer.classList.add('hidden');
            convertBtn.disabled = false;
            progressBar.style.width = '0%';
        }, 3000);

    } catch (error) {
        console.error(error);
        alert("Error en la conversión. Revisa la consola.");
        convertBtn.disabled = false;
    }
});
