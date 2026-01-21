class CinematicExperience {
    constructor() {
        this.viewport = document.getElementById('viewport');
        this.sunLayer = document.getElementById('sun-layer');
        this.moonLayer = document.getElementById('moon-layer');
        this.starsLayer = document.getElementById('stars-layer');
        this.atmosphereLayer = document.getElementById('atmosphere-layer');
        
        this.sunImg = this.sunLayer.querySelector('img');
        this.moonImg = this.moonLayer.querySelector('img');
        
        this.textGroups = document.querySelectorAll('.text-group');
        this.triggers = document.querySelectorAll('.scroll-trigger');
        
        // Configuration
        this.totalHeight = document.body.scrollHeight - window.innerHeight;
        
        // State
        this.progress = 0;
        this.currentScene = 0;
        
        this.init();
    }

    init() {
        this.createSunRays();
        window.addEventListener('scroll', () => this.onScroll());
        window.addEventListener('resize', () => {
            this.totalHeight = document.body.scrollHeight - window.innerHeight;
        });
        
        // Initial render
        this.render(0);
    }

    createSunRays() {
        const container = this.sunLayer.querySelector('.sun-rays-container');
        if (!container) return;

        // "Reasons / Feelings"
        const raysData = [
            "Huzur", "Mutluluk", "Güven", 
            "Işık", "Neşe", "Sıcaklık", 
            "Umut", "Sevgi"
        ];

        const count = raysData.length;
        const radius = 40; // vh, matches roughly half of sun size (80vh)
        
        raysData.forEach((text, i) => {
            const angle = (360 / count) * i;
            const ray = document.createElement('div');
            ray.className = 'sun-ray';
            
            // Determine length
            const length = 30 + Math.random() * 20; // 30-50vh length
            
            ray.style.width = `${length}vh`;
            ray.style.transform = `rotate(${angle}deg) translateX(${radius}vh)`;
            
            const textSpan = document.createElement('span');
            textSpan.className = 'ray-text';
            textSpan.textContent = text;
            // Rotate text back so it's readable? Or keep it aligned with ray?
            // Keeping aligned with ray but maybe flipping if on left side?
            // For simplicity, just append.
            
            ray.appendChild(textSpan);
            container.appendChild(ray);
        });
    }

    onScroll() {
        const scrollTop = window.scrollY;
        // Global progress 0 to 1
        this.progress = Math.max(0, Math.min(1, scrollTop / this.totalHeight));
        
        this.render(this.progress);
    }

    // Helper: Linear Interpolation
    lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    // Helper: Map range
    map(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    render(p) {
        // SCENE LOGIC
        // We divide the total scrollable area into scenes.
        // Scene 0: 0.0 - 0.25 (Sun Focus)
        // Scene 1: 0.25 - 0.5 (Sunset)
        // Scene 2: 0.5 - 0.75 (Moon Rise)
        // Scene 3: 0.75 - 1.0 (Deep Space)

        // TEXT VISIBILITY MANAGER
        // We determine active text based on roughly centered scene progress
        let activeIndex = -1;
        if (p < 0.20) activeIndex = 0;
        else if (p > 0.25 && p < 0.45) activeIndex = 1;
        else if (p > 0.55 && p < 0.70) activeIndex = 2;
        else if (p > 0.80) activeIndex = 3;

        this.textGroups.forEach((group, index) => {
            if (index === activeIndex) {
                group.classList.add('active');
            } else {
                group.classList.remove('active');
            }
        });

        // ANIMATION: SUN
        // Scene 0 -> 1: Sun scales down slightly and rotates
        // Scene 1 -> 2: Sun moves down (sets)
        
        let sunY = 0;
        let sunScale = 1;
        let sunRotate = p * 120; // Rotate continuously

        if (p < 0.25) {
            // Scene 0: Sun is central
            sunScale = this.map(p, 0, 0.25, 1.2, 1.0);
        } else if (p < 0.6) {
            // Scene 1: Sun sets
            // 0.25 -> 0.6
            const localP = (p - 0.25) / 0.35;
            sunY = this.lerp(0, 150, localP); // Move down 150vh? CSS uses translate
            sunScale = this.lerp(1.0, 0.8, localP);
        } else {
            // Gone
            sunY = 150; 
        }

        this.sunLayer.style.transform = `translateY(${sunY}vh) scale(${sunScale}) rotate(${sunRotate}deg)`;

        // ANIMATION: MOON
        // Scene 2 -> 3: Moon rises
        // Starts at translateY(50vh) (CSS default)
        
        let moonY = 50; 
        if (p > 0.5) {
            // 0.5 -> 0.8
            const localP = Math.min(1, (p - 0.5) / 0.3);
            moonY = this.lerp(50, 0, localP); // Rises to center
        }
        
        // Scene 3: Moon floats slightly up/down or scales up?
        // Let's just keep it centered or slight float
        if (p > 0.8) {
            const localP = (p - 0.8) / 0.2;
            moonY = this.lerp(0, -10, localP); // Slight float up
        }

        this.moonLayer.style.transform = `translateY(${moonY}vh)`;
        this.moonLayer.style.opacity = p > 0.45 ? 1 : 0; // Fade in as sun sets

        // ANIMATION: ATMOSPHERE / BACKGROUND
        // Scene 0: Space Black
        // Scene 1: Sunset Blue/Orange (Atmosphere opacity)
        // Scene 2: Deep Blue/Purple
        // Scene 3: Space Black
        
        let atmoOpacity = 0;
        if (p > 0.2 && p < 0.5) {
            // Fade in sunset colors
            if (p < 0.35) atmoOpacity = this.map(p, 0.2, 0.35, 0, 0.8);
            else atmoOpacity = this.map(p, 0.35, 0.5, 0.8, 0);
        }
        this.atmosphereLayer.style.opacity = atmoOpacity;

        // ANIMATION: STARS
        // Scene 0: Dim (0.2)
        // Scene 1: Fades out completely during bright sunset? Or stays?
        // Scene 3: Full brightness (1.0) and Zoom
        
        let starOpacity = 0.2;
        let starScale = 1.1;

        if (p > 0.5) {
            starOpacity = this.map(p, 0.5, 1.0, 0.2, 1.0);
            starScale = this.map(p, 0.5, 1.0, 1.1, 1.5); // Zoom into space
        }
        
        this.starsLayer.style.opacity = starOpacity;
        this.starsLayer.style.transform = `scale(${starScale})`;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new CinematicExperience();
});
