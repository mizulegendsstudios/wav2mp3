const { createFFmpeg, fetchFile } = FFmpeg;

// Configuramos FFmpeg con las rutas correctas para evitar errores de carga
const ffmpeg = createFFmpeg({ 
    log: true,
    corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js"
});

const uploader = document.getElementById('uploader');
const convertBtn = document.getElementById('convertBtn');
const statusContainer = document.getElementById('statusContainer');
const statusText = document.getElementById('statusText');
const progressBar = document.getElementById('progressBar');
const percentText = document.getElementById('percentText');
const fileNameDisplay = document.getElementById('fileName');

uploader.addEventListener('change', (e) => {
    if (e.target.files[0]) fileNameDisplay.innerText = e.target.files[0].name;
});

convertBtn.addEventListener('click', async () => {
    const file = uploader.files[0];
    if (!file) return alert("Sube un archivo primero.");

    convertBtn.disabled = true;
    statusContainer.classList.remove('hidden');
    
    try {
        if (!ffmpeg.isLoaded()) {
            statusText.innerText = "Estado: Cargando Core...";
            await ffmpeg.load();
        }

        statusText.innerText = "Estado: Procesando...";
        ffmpeg.FS('writeFile', 'input.wav', await fetchFile(file));

        // Listener de progreso real
        ffmpeg.setProgress(({ ratio }) => {
            const p = Math.floor(ratio * 100);
            progressBar.style.width = `${p}%`;
            percentText.innerText = `${p}%`;
        });

        // Ejecución del comando FFmpeg
        await ffmpeg.run('-i', 'input.wav', 'output.mp3');

        statusText.innerText = "Estado: Completado";
        const data = ffmpeg.FS('readFile', 'output.mp3');

        const url = URL.createObjectURL(new Blob([data.buffer], { type: 'audio/mp3' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace('.wav', '.mp3');
        a.click();

        setTimeout(() => {
            statusContainer.classList.add('hidden');
            convertBtn.disabled = false;
        }, 5000);

    } catch (err) {
        console.error(err);
        statusText.innerText = "Error en la conversión.";
        convertBtn.disabled = false;
    }
});
