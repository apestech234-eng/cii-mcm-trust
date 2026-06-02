// Initialize Lucide Icons
if (window.lucide) {
    lucide.createIcons();
}

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

// ===== CONSTELLATION HOVER INTERACTIONS =====
const heroGraphic = document.getElementById('heroGraphic');
if (heroGraphic) {
    const nodes = heroGraphic.querySelectorAll('.orbit-node');
    const lines = heroGraphic.querySelectorAll('.conn-line');

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

// ===== 3D WAVE MESH ANIMATION =====
function initMesh(canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    // Handle resize
    const handleResize = () => {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Read custom color from data-mesh-color
    const colorAttr = canvas.getAttribute('data-mesh-color') || 'rgba(147, 197, 253, 0.16)';
    let baseColor = 'rgba(147, 197, 253, ';
    let baseOpacityScale = 0.16;

    const rgbaMatch = colorAttr.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
    if (rgbaMatch) {
        baseColor = `rgba(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]}, `;
        baseOpacityScale = parseFloat(rgbaMatch[4]);
    } else {
        const rgbMatch = colorAttr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
        if (rgbMatch) {
            baseColor = `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, `;
            baseOpacityScale = 1.0;
        }
    }

    const cols = 28;
    const rows = 18;
    const spacingX = 40;
    const spacingZ = 25;
    const perspective = 250;
    const tiltOffset = 0.9;
    
    let time = 0;
    
    function animate() {
        if (!document.body.contains(canvas)) {
            // Cleanup listeners if element was removed
            window.removeEventListener('resize', handleResize);
            return;
        }
        ctx.clearRect(0, 0, width, height);
        time += 0.015; // Slow, elegant motion
        
        const centerX = width / 2;
        const centerY = height * 0.3; // Perspective vanishing point at 30% height
        
        const points = [];
        
        // Calculate points with 3D projection & Hexagonal layout
        for (let r = 0; r < rows; r++) {
            points[r] = [];
            const z_scale = (rows - 1 - r) * spacingZ;
            const scale = perspective / (perspective + z_scale);
            
            // Fade out grid in the distance (depth opacity)
            const depthOpacity = Math.pow(scale, 1.8);
            
            for (let c = 0; c < cols; c++) {
                // Stagger alternate rows by half spacingX for hexagonal layout
                const stagger = (r % 2 === 0) ? 0 : spacingX / 2;
                const x3d = (c - cols / 2) * spacingX + stagger;
                
                // Waving motion based on sine/cosine combinations
                const wave1 = Math.sin(c * 0.2 + time) * 15;
                const wave2 = Math.cos(r * 0.25 - time * 0.6) * 10;
                const wave3 = Math.sin((c + r) * 0.12 + time * 0.4) * 6;
                const y3d = wave1 + wave2 + wave3;
                
                const screenX = centerX + x3d * scale;
                const screenY = centerY + (r * spacingZ * tiltOffset + y3d) * scale;
                
                // Fade out edges
                const edgeDist = Math.abs(c - cols / 2) / (cols / 2);
                const edgeOpacity = 1.0 - Math.pow(edgeDist, 2.2);
                
                const opacity = Math.max(0, Math.min(1, depthOpacity * edgeOpacity));
                
                points[r][c] = { x: screenX, y: screenY, opacity: opacity };
            }
        }
        
        // Draw connection grid lines
        ctx.lineWidth = 1.0;
        
        // 1. Draw horizontal connections (only for alternate columns on each row to form hexagons)
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols - 1; c++) {
                if (c % 2 === 0) {
                    const p1 = points[r][c];
                    const p2 = points[r][c + 1];
                    
                    if (p1.y > 0 && p2.y > 0 && p1.y < height && p2.y < height) {
                        const avgOpacity = (p1.opacity + p2.opacity) / 2;
                        if (avgOpacity > 0.02) {
                            ctx.strokeStyle = `${baseColor}${avgOpacity * baseOpacityScale})`;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }
                }
            }
        }
        
        // 2. Draw diagonal connections (two downwards diagonals for each node depending on whether row is even or odd)
        for (let r = 0; r < rows - 1; r++) {
            for (let c = 0; c < cols; c++) {
                // Determine target column offsets
                let targets = [];
                if (r % 2 === 0) {
                    // Even rows: connect to c and c-1 on row below
                    targets = [c, c - 1];
                } else {
                    // Odd rows: connect to c and c+1 on row below
                    targets = [c, c + 1];
                }
                
                const p1 = points[r][c];
                
                targets.forEach(tCol => {
                    if (tCol >= 0 && tCol < cols) {
                        const p2 = points[r + 1][tCol];
                        if (p1.y > 0 && p2.y > 0 && p1.y < height && p2.y < height) {
                            const avgOpacity = (p1.opacity + p2.opacity) / 2;
                            if (avgOpacity > 0.02) {
                                ctx.strokeStyle = `${baseColor}${avgOpacity * baseOpacityScale})`;
                                ctx.beginPath();
                                ctx.moveTo(p1.x, p1.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.stroke();
                            }
                        }
                    }
                });
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Initialize all canvases with class 'hero-mesh'
const meshes = document.querySelectorAll('.hero-mesh');
meshes.forEach(canvas => {
    initMesh(canvas);
});

// Mobile Menu Toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        if (navLinks.classList.contains('active')) {
            // Change to 'x' icon
            navToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18M6 6l12 12"/></svg>';
        } else {
            // Change back to 'menu' icon
            navToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
        }
    });

    // Close menu on link clicks (except dropdown toggle)
    navLinks.querySelectorAll('a:not(.nav-dropdown-toggle)').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            navToggle.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';
        });
    });
}

// Dropdown Toggles for Mobile
document.querySelectorAll('.nav-dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
        if (window.innerWidth < 992) {
            e.preventDefault();
            const container = toggle.closest('.nav-dropdown');
            const menu = container ? container.querySelector('.nav-dropdown-menu') : null;
            if (container && menu) {
                container.classList.toggle('open');
                menu.classList.toggle('active');
            }
        }
    });
});





