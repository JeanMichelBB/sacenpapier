document.getElementById('toggleLanguage').addEventListener('click', function() {
    const enContent = document.getElementById('en');
    const frContent = document.getElementById('fr');
    const isEnglishVisible = !enContent.classList.contains('hidden');
    
    if (isEnglishVisible) {
        enContent.classList.add('hidden');
        frContent.classList.remove('hidden');
        this.textContent = 'EN';
    } else {
        enContent.classList.remove('hidden');
        frContent.classList.add('hidden');
        this.textContent = 'FR';
    }
});