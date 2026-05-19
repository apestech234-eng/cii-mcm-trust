// Initialize Lucide Icons
lucide.createIcons();

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const navbar = document.querySelector('.navbar');
            const navHeight = navbar.offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Counter Animation Logic
const counters = document.querySelectorAll('.counter');
const speed = 200; // The lower the slower

const animateCounters = () => {
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace(/,/g, '');
            
            // Lower inc to slow and higher to fast
            const inc = target / speed;
            
            // Check if target is reached
            if (count < target) {
                // Add inc to count and output in counter
                counter.innerText = Math.ceil(count + inc).toLocaleString('en-US');
                // Call function every ms
                setTimeout(updateCount, 10);
            } else {
                counter.innerText = target.toLocaleString('en-US');
            }
        };
        updateCount();
    });
};

// Intersection Observer to trigger animation when stats section is in view
const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, { threshold: 0.5 }); // Trigger when 50% of the section is visible
    
    observer.observe(statsSection);
}

// ===== 3D SCROLL REVEAL LOGIC =====
const revealElements = document.querySelectorAll('.reveal');
if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Unobserve if you only want the animation to happen once
                // revealObserver.unobserve(entry.target);
            } else {
                // Remove the class when scrolled out of view to re-trigger on scroll back up
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
}

// ===== HERO CAROUSEL LOGIC =====
document.querySelectorAll('.hero-carousel').forEach(carousel => {
    const slides = carousel.querySelectorAll('.carousel-slide');
    if (slides.length > 1) {
        let currentIndex = 0;
        setInterval(() => {
            slides[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
        }, 3000); // Change image every 3 seconds
    }
});

// ===== CONSTELLATION MOUSE PARALLAX =====
const heroGraphic = document.getElementById('heroGraphic');
if (heroGraphic) {
    const nodes = heroGraphic.querySelectorAll('.orbit-node');
    const hub   = heroGraphic.querySelector('.hub');
    const lines = heroGraphic.querySelectorAll('.conn-line');
    const depths = [0.03, 0.05, 0.04, 0.035, 0.055, 0.045];

    heroGraphic.addEventListener('mousemove', (e) => {
        const rect = heroGraphic.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
        const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;

        // Move each node at its own depth
        nodes.forEach((node, i) => {
            const d = depths[i] || 0.04;
            const mx = x * d * 80;
            const my = y * d * 80;
            node.style.transform += ''; // read
            node.style.setProperty('--px', `${mx}px`);
            node.style.setProperty('--py', `${my}px`);
            node.style.transform = `translate(${mx}px, ${my}px)`;
        });

        // Gently shift the hub in the opposite direction for depth
        if (hub) {
            hub.style.transform = `translate(calc(-50% + ${-x * 6}px), calc(-50% + ${-y * 6}px))`;
        }
    });

    heroGraphic.addEventListener('mouseleave', () => {
        nodes.forEach(n => { n.style.transform = ''; });
        if (hub) hub.style.transform = 'translate(-50%, -50%)';
    });

    // Glow the connection line when hovering its node
    nodes.forEach((node, i) => {
        node.addEventListener('mouseenter', () => {
            if (lines[i]) {
                lines[i].style.stroke = 'rgba(59, 130, 246, 0.7)';
                lines[i].style.strokeWidth = '2.5';
                lines[i].style.filter = 'drop-shadow(0 0 6px rgba(59,130,246,0.5))';
            }
        });
        node.addEventListener('mouseleave', () => {
            if (lines[i]) {
                lines[i].style.stroke = '';
                lines[i].style.strokeWidth = '';
                lines[i].style.filter = '';
            }
        });
    });
}
