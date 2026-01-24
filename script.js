
// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const startScreen = document.getElementById('start-screen');
    const startBtn = document.getElementById('start-btn');
    const bgMusic = document.getElementById('bg-music');
    
    // Sky Layers
    const skyNight = document.querySelector('.sky-night');
    const skyDawn = document.querySelector('.sky-dawn');
    const skySunrise = document.querySelector('.sky-sunrise');
    const skyDay = document.querySelector('.sky-day');
    const skySunset = document.querySelector('.sky-sunset');
    
    const sunContainer = document.querySelector('.sun-container');
    const moonContainer = document.querySelector('.moon-container');
    const starsContainer = document.querySelector('.stars-container');
    const msgText = document.getElementById('msg-text');
    const landscape = document.querySelector('.landscape');

    // --- Audio Setup ---
    // Try to lower volume for background
    bgMusic.volume = 0.5;

    // --- Star Generation ---
    // Create stars dynamically
    const starCount = 200;
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 70; // Keep stars mostly in top 70%
        // Random size
        const size = Math.random() * 2 + 1;
        // Random delay
        const delay = Math.random() * 2;
        
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDelay = `${delay}s`;
        
        starsContainer.appendChild(star);
    }

    // --- Main Timeline ---
    // We use a master timeline to control everything
    const tl = gsap.timeline({ paused: true });

    // Helper to add text to timeline
    // We will crossfade text: fade in -> hold -> fade out
    function addTextToTl(text, duration = 3, hold = 2) {
        // Create a temporary timeline for the text sequence
        const textTl = gsap.timeline();
        textTl.to(msgText, {
            opacity: 0, 
            duration: 1, 
            onComplete: () => { msgText.innerText = text; }
        })
        .to(msgText, { opacity: 1, duration: 1.5, ease: "power2.out" })
        .to(msgText, { opacity: 1, duration: hold }) // hold
        .to(msgText, { opacity: 0, duration: 1, ease: "power2.in" });
        
        return textTl;
    }

    // --- Build Animation Sequence ---

    // Initial State
    gsap.set(sunContainer, { y: 300, rotation: -30 }); // Below horizon
    gsap.set(moonContainer, { y: 300, rotation: -30 }); // Below horizon
    gsap.set([skyNight, skyDawn, skySunrise, skyDay, skySunset], { opacity: 0 });
    gsap.set(skyNight, { opacity: 1 }); // Start with Night
    gsap.set(starsContainer, { opacity: 1 });
    gsap.set(landscape, { filter: 'brightness(0.1)' });

    // 1. NIGHT TO DAWN
    tl.to(skyDawn, { opacity: 1, duration: 5 }, "dawn");
    // Fade out night slightly to let dawn take over (or keep it as base)
    tl.to(skyNight, { opacity: 0, duration: 5 }, "dawn");
    
    tl.to(starsContainer, { opacity: 0.5, duration: 5 }, "dawn");

    // 2. SUNRISE (Sun comes up)
    tl.to(sunContainer, { 
        y: -window.innerHeight * 0.7, /* Move up high */
        x: window.innerWidth * 0.2, /* Arc slightly right */
        rotation: 0,
        duration: 10,
        ease: "power2.out"
    }, "sunrise");

    // Sky transitions: Dawn -> Sunrise -> Day
    tl.to(skySunrise, { opacity: 1, duration: 5 }, "sunrise-=2");
    tl.to(skyDawn, { opacity: 0, duration: 5 }, "sunrise-=2");
    
    tl.to(skyDay, { opacity: 1, duration: 5 }, "sunrise+=3");
    tl.to(skySunrise, { opacity: 0, duration: 5 }, "sunrise+=3");

    // Stars disappear
    tl.to(starsContainer, { opacity: 0, duration: 3 }, "sunrise");
    
    // Landscape brightens
    tl.to(landscape, { filter: 'brightness(0.8)', duration: 6 }, "sunrise");

    // Sunrise Texts
    // "Bugün senin günün aşkım."
    tl.add(addTextToTl("Bugün senin günün aşkım.", 2, 3), "sunrise+=1");
    // "Doğum günün kutlu olsun Dünyammm."
    tl.add(addTextToTl("Doğum günün kutlu olsun Dünyammm.", 2, 3), ">-0.5");
    // "Yeni yaşının uğurlu olma dileğiyle aşk kadınım benim"
    tl.add(addTextToTl("Yeni yaşının uğurlu olma dileğiyle aşk kadınım benim.", 2, 4), ">-0.5");


    // 3. DAY TO SUNSET
    // Sun moves across and down
    tl.to(sunContainer, { 
        y: 150, /* Go down towards horizon */
        x: window.innerWidth * 0.5, 
        rotation: 30,
        duration: 12,
        ease: "power1.inOut"
    }, "sunset");

    // Sky transitions: Day -> Sunset
    tl.to(skySunset, { opacity: 1, duration: 8 }, "sunset+=2");
    tl.to(skyDay, { opacity: 0, duration: 8 }, "sunset+=2");

    tl.to(landscape, { filter: 'brightness(0.3)', duration: 8 }, "sunset+=2");

    // Sunset Texts
    // "Bunu yaparken aklımdan tek bir şey geçti:"
    tl.add(addTextToTl("Bunu yaparken aklımdan tek bir şey geçti:", 2, 3), "sunset+=3");
    // "Sen güldüğünde her şey daha güzel oluyor."
    tl.add(addTextToTl("Sen güldüğünde her şey daha güzel oluyor.", 2, 4), ">-0.5");


    // 4. SUNSET TO NIGHT (Moonrise)
    // Sun fully sets
    tl.to(sunContainer, { y: 500, duration: 5 }, "nightfall");
    
    // Sky transitions: Sunset -> Night
    tl.to(skyNight, { opacity: 1, duration: 8 }, "nightfall");
    tl.to(skySunset, { opacity: 0, duration: 8 }, "nightfall");

    tl.to(starsContainer, { opacity: 1, duration: 5 }, "nightfall+=3");

    // Moon Rises
    tl.to(moonContainer, { 
        y: -window.innerHeight * 0.6,
        x: -window.innerWidth * 0.1,
        rotation: 0,
        duration: 10,
        ease: "power2.out"
    }, "moonrise");

    tl.to(landscape, { filter: 'brightness(0.15)', duration: 6 }, "moonrise");

    // Moonrise Texts
    // "İyi ki varsın, iyi ki benimlesin."
    tl.add(addTextToTl("İyi ki varsın, iyi ki benimlesin.", 2, 3), "moonrise+=3");
    // "İyi ki hayatımdasın."
    tl.add(addTextToTl("İyi ki hayatımdasın.", 2, 3), ">-0.5");

    // 5. FINALE
    // Final text persists
    tl.addLabel("finale");
    
    // Special handling for final text to support line breaks and staying on screen
    tl.to(msgText, { 
        opacity: 0, 
        duration: 1, 
        onComplete: () => { 
            msgText.innerHTML = "Bunu sen gül diye yaptım.<br><br>İyi ki varsın."; 
        }
    }, "finale");
    
    tl.to(msgText, { opacity: 1, duration: 3, ease: "power2.out" }, "finale+=1.5");

    // --- Start Interaction ---
    startBtn.addEventListener('click', () => {
        // Hide start screen
        gsap.to(startScreen, { opacity: 0, duration: 1, onComplete: () => startScreen.style.display = 'none' });
        
        // Play Audio
        bgMusic.play().catch(e => console.log("Audio play failed:", e));

        // Start Animation
        tl.play();
    });
});
