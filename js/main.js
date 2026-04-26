/**
 * Web Audio API SoundManager
 */
class SoundManager {
    constructor() {
        this.enabled = false;
        this.ctx = null;
    }
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
    }
    toggle() {
        this.enabled = !this.enabled;
        if (this.enabled) this.init();
        return this.enabled;
    }
    playClick() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.05);
    }
    playHover() {
        if (!this.enabled || !this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.01);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.03);
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.start(); osc.stop(this.ctx.currentTime + 0.03);
    }
    playSuccess() {
        if (!this.enabled || !this.ctx) return;
        const freqs = [523.25, 659.25, 783.99]; // C Major
        freqs.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = this.ctx.currentTime + (i * 0.1);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
            osc.connect(gain); gain.connect(this.ctx.destination);
            osc.start(startTime); osc.stop(startTime + 0.5);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    
    // SoundManager
    const soundManager = new SoundManager();
    const soundToggle = document.getElementById('sound-toggle');
    
    soundToggle.addEventListener('click', () => {
        const isEnabled = soundManager.toggle();
        const icon = soundToggle.querySelector('i');
        if (isEnabled) {
            icon.className = 'fas fa-volume-up';
            soundToggle.classList.add('sound-on');
            soundManager.playClick();
        } else {
            icon.className = 'fas fa-volume-mute';
            soundToggle.classList.remove('sound-on');
        }
    });

    // Attach sounds
    document.querySelectorAll('.interactive-btn, .interactive-link, .interactive-select, .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => soundManager.playClick());
    });
    document.querySelectorAll('.glass-card, .interactive-tag, .filter-btn').forEach(el => {
        el.addEventListener('mouseenter', () => soundManager.playHover());
    });

    // Language Switcher
    const languageSwitcher = document.getElementById('language-switcher');
    const savedLang = localStorage.getItem('lang') || 'en';
    languageSwitcher.value = savedLang;
    setLanguage(savedLang);

    languageSwitcher.addEventListener('change', (e) => {
        setLanguage(e.target.value);
        localStorage.setItem('lang', e.target.value);
    });

    function setLanguage(lang) {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.documentElement.setAttribute('lang', 'ar');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.documentElement.setAttribute('lang', lang);
        }
    }

    // Projects Filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectItems = document.querySelectorAll('.text-project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterValue = btn.getAttribute('data-filter');

            projectItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('d-none');
                    setTimeout(() => item.style.opacity = '1', 50);
                } else {
                    item.style.opacity = '0';
                    setTimeout(() => item.classList.add('d-none'), 400); 
                }
            });
        });
    });

    // IntersectionObserver for Scroll Animations & Progress Bars
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Animate progress bars when section is visible
                const bars = entry.target.querySelectorAll('.progress-bar-fill');
                bars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-width');
                    if (targetWidth) {
                        bar.style.width = targetWidth;
                    }
                });
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));

    // Formspree Handling
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.fa-spinner');
        
        btnText.classList.add('d-none');
        spinner.classList.remove('d-none');
        submitBtn.disabled = true;

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });
            if (response.ok) {
                contactForm.reset();
                formSuccess.classList.remove('d-none');
                soundManager.playSuccess();
                setTimeout(() => formSuccess.classList.add('d-none'), 5000);
            }
        } catch (error) {
            alert("Oops! There was a problem submitting your form.");
        } finally {
            btnText.classList.remove('d-none');
            spinner.classList.add('d-none');
            submitBtn.disabled = false;
        }
    });
});
