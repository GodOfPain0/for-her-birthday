document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Fade-in animations
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        threshold: 0.3 // Trigger when 30% of the section is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Optional: remove class to replay animation on scroll up? 
                // Let's keep it visible once shown for a smoother experience, 
                // or remove it for "replay" value. "Digital sunrise" implies a forward progression.
                // But scrolling back to night might be cool. Let's keep it simple first.
                entry.target.classList.remove('visible'); 
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // 2. Scroll-based Background Transition
    const bgLayers = {
        night: document.querySelector('.id-night'),
        sunrise: document.querySelector('.id-sunrise'),
        day: document.querySelector('.id-day'),
        sunset: document.querySelector('.id-sunset')
    };

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercent = Math.min(Math.max(scrollTop / docHeight, 0), 1);

        // We blend layers based on scroll percentage ranges.
        // 0.0 - 0.33: Night fades out, Sunrise fades in
        // 0.33 - 0.66: Sunrise fades out, Day fades in
        // 0.66 - 1.0: Day fades out, Sunset fades in

        // Reset all first
        bgLayers.night.style.opacity = 0;
        bgLayers.sunrise.style.opacity = 0;
        bgLayers.day.style.opacity = 0;
        bgLayers.sunset.style.opacity = 0;

        if (scrollPercent <= 0.33) {
            // Night -> Sunrise
            const progress = scrollPercent / 0.33; 
            bgLayers.night.style.opacity = 1 - progress;
            bgLayers.sunrise.style.opacity = progress;
        } else if (scrollPercent <= 0.66) {
            // Sunrise -> Day
            const progress = (scrollPercent - 0.33) / 0.33;
            bgLayers.sunrise.style.opacity = 1 - progress;
            bgLayers.day.style.opacity = progress;
        } else {
            // Day -> Sunset
            const progress = (scrollPercent - 0.66) / 0.34;
            bgLayers.day.style.opacity = 1 - progress;
            bgLayers.sunset.style.opacity = progress;
        }
    });

    // 3. Ray Interaction
    const rays = document.querySelectorAll('.ray-item');
    const rayMessage = document.getElementById('ray-message');

    rays.forEach(ray => {
        ray.addEventListener('mouseenter', () => {
            rayMessage.textContent = ray.getAttribute('data-text');
            rayMessage.style.opacity = '1';
        });

        ray.addEventListener('mouseleave', () => {
            rayMessage.style.opacity = '0';
        });
        
        // For mobile tap
        ray.addEventListener('click', () => {
             rayMessage.textContent = ray.getAttribute('data-text');
             rayMessage.style.opacity = '1';
        });
    });
});
