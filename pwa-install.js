let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.classList.remove('hidden'); // Mostra o botão no index.html
});

function dispararInstalacao() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
    }
}
