document.addEventListener("DOMContentLoaded", () => {
    console.log("Portfolio v3.0.0");
    const openBtn = document.getElementById("open-portfolio-btn");
    const modal = document.getElementById("portfolio-modal");
    const closeBtn = document.querySelector(".portfolio-close-btn");
    const slides = document.querySelectorAll(".portfolio-slide");
    const dots = document.querySelectorAll(".portfolio-dots .dot");
    const prevBtn = document.querySelector(".prev-slide");
    const nextBtn = document.querySelector(".next-slide");
    const video = document.getElementById("portfolio-video");
    const videoWrap = document.querySelector(".video-player-wrap");
    const playPauseBtn = document.querySelector(".play-pause");
    const bigPlayBtn = document.querySelector(".video-overlay-play");
    const muteBtn = document.querySelector(".mute-unmute");
    const progressBarWrap = document.querySelector(".progress-bar-wrap");
    const progressBarFill = document.querySelector(".progress-bar-fill");
    const zoomModal = document.getElementById("gallery-zoom-modal");
    const zoomImg = document.getElementById("zoom-img");
    const zoomTitle = document.getElementById("zoom-title");
    const zoomDesc = document.getElementById("zoom-desc");
    const zoomCloseBtn = document.querySelector(".zoom-close-btn");

    let currentSlide = 0;
    let isTransitioning = false;
    let statsAnimated = false;
    let startY = 0, startX = 0;

    if (window.lucide) window.lucide.createIcons();

    // ===== SLIDE SYSTEM (flat opacity, no 3D) =====
    function showSlide(idx) {
        slides.forEach((s, i) => {
            if (i === idx) {
                s.classList.add("active");
            } else {
                s.classList.remove("active");
            }
        });
        dots.forEach((d, i) => {
            d.classList.toggle("active", i === idx);
        });
        handleSlideActions();
    }

    function goToSlide(index) {
        if (index < 0 || index >= slides.length || isTransitioning) return;
        isTransitioning = true;
        currentSlide = index;
        showSlide(index);
        setTimeout(() => { isTransitioning = false; }, 700);
    }

    function handleSlideActions() {
        if (currentSlide === 1 && !statsAnimated) {
            statsAnimated = true;
            animateStatsCounters();
        }
        if (currentSlide === 3) {
            setTimeout(() => { if (video && video.paused) playVideo(); }, 600);
        } else {
            if (video && !video.paused) pauseVideo();
        }
    }

    // Nav
    if (prevBtn) prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));
    dots.forEach(d => d.addEventListener("click", () => goToSlide(+d.getAttribute("data-slide"))));

    // Wheel — skip if inside scrollable playlist
    if (modal) {
        modal.addEventListener("wheel", (e) => {
            if (e.target.closest(".playlist-items")) return;
            e.preventDefault();
            if (isTransitioning) return;
            if (Math.abs(e.deltaY) > 10) {
                goToSlide(currentSlide + (e.deltaY > 0 ? 1 : -1));
            }
        }, { passive: false });
    }

    // Touch
    if (modal) {
        modal.addEventListener("touchstart", e => { startY = e.touches[0].clientY; startX = e.touches[0].clientX; }, { passive: true });
        modal.addEventListener("touchend", e => {
            if (isTransitioning) return;
            const dy = startY - e.changedTouches[0].clientY;
            const dx = startX - e.changedTouches[0].clientX;
            if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx)) goToSlide(currentSlide + (dy > 0 ? 1 : -1));
            else if (Math.abs(dx) > 50) goToSlide(currentSlide + (dx > 0 ? 1 : -1));
        }, { passive: true });
    }

    // Keyboard
    document.addEventListener("keydown", e => {
        if (!modal || !modal.classList.contains("is-open")) return;
        if (e.key === "ArrowDown" || e.key === "ArrowRight") goToSlide(currentSlide + 1);
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") goToSlide(currentSlide - 1);
        else if (e.key === "Escape") closePortfolio();
    });

    // Open/Close
    function openPortfolio() {
        modal.classList.add("is-open");
        document.body.style.overflow = "hidden";
        currentSlide = 0;
        statsAnimated = false;
        document.querySelectorAll(".stat-number").forEach(n => n.innerText = "0");
        showSlide(0);
        if (window.lucide) window.lucide.createIcons();
    }
    function closePortfolio() {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
        if (video && !video.paused) pauseVideo();
    }
    if (openBtn) openBtn.addEventListener("click", openPortfolio);
    if (closeBtn) closeBtn.addEventListener("click", closePortfolio);

    // ===== STATS =====
    function animateStatsCounters() {
        document.querySelectorAll(".stat-number").forEach(num => {
            const target = +num.getAttribute("data-val");
            let count = 0;
            const step = target / 50;
            const iv = setInterval(() => {
                count += step;
                if (count >= target) { clearInterval(iv); formatStat(num, target); }
                else formatStat(num, Math.ceil(count));
            }, 30);
        });
    }
    function formatStat(el, val) {
        const t = +el.getAttribute("data-val");
        if (t === 1200) el.innerText = val.toLocaleString() + "+";
        else if (t === 95 || t === 100) el.innerText = val + "%";
        else if (t === 45) el.innerText = val + "+";
        else el.innerText = val;
    }

    // ===== VIDEO =====
    function playVideo() {
        video.play();
        videoWrap.classList.add("playing");
        videoWrap.classList.remove("paused");
        if (playPauseBtn) playPauseBtn.innerHTML = '<i data-lucide="pause"></i>';
        if (window.lucide) window.lucide.createIcons();
    }
    function pauseVideo() {
        video.pause();
        videoWrap.classList.remove("playing");
        videoWrap.classList.add("paused");
        if (playPauseBtn) playPauseBtn.innerHTML = '<i data-lucide="play"></i>';
        if (window.lucide) window.lucide.createIcons();
    }
    if (playPauseBtn) playPauseBtn.addEventListener("click", () => { video.paused ? playVideo() : pauseVideo(); });
    if (bigPlayBtn) bigPlayBtn.addEventListener("click", playVideo);
    if (video) {
        video.addEventListener("click", () => { video.paused ? playVideo() : pauseVideo(); });
        video.addEventListener("timeupdate", () => {
            if (progressBarFill) progressBarFill.style.width = (video.currentTime / video.duration * 100) + "%";
        });
    }
    if (progressBarWrap) progressBarWrap.addEventListener("click", e => {
        const r = progressBarWrap.getBoundingClientRect();
        video.currentTime = ((e.clientX - r.left) / r.width) * video.duration;
    });
    if (muteBtn) muteBtn.addEventListener("click", () => {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? '<i data-lucide="volume-x"></i>' : '<i data-lucide="volume-2"></i>';
        if (window.lucide) window.lucide.createIcons();
    });

    // ===== PLAYLIST — use event delegation on the playlist container =====
    const playlistContainer = document.querySelector(".playlist-items");
    if (playlistContainer) {
        playlistContainer.addEventListener("click", (e) => {
            const item = e.target.closest(".playlist-item");
            if (!item || item.classList.contains("active")) return;
            e.stopPropagation();

            document.querySelectorAll(".playlist-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            video.src = item.getAttribute("data-src");
            video.load();

            const sc = item.closest(".slide-content");
            if (sc) {
                const h = sc.querySelector("h2");
                const p = sc.querySelector(".slide-subtitle");
                if (h) h.innerText = item.getAttribute("data-title");
                if (p) p.innerText = item.getAttribute("data-desc");
            }
            if (progressBarFill) progressBarFill.style.width = "0%";
            playVideo();
        });
    }

    // ===== GALLERY ZOOM (Slide 3) =====
    document.querySelectorAll(".gallery-item-3d").forEach(item => {
        item.addEventListener("click", () => {
            zoomImg.src = item.getAttribute("data-src");
            zoomTitle.innerText = item.querySelector("h4").innerText;
            zoomDesc.innerText = item.getAttribute("data-desc");
            zoomModal.classList.add("is-open");
        });
    });

    // ===== POLAROID CLICKS + HOVER PAUSE (Slide 5) =====
    const pSlider = document.querySelector(".polaroid-slider");
    const pTrack = document.querySelector(".polaroid-slider-track");

    if (pSlider && pTrack) {
        // Pause/resume on hover
        pSlider.addEventListener("mouseenter", () => { pTrack.style.animationPlayState = "paused"; });
        pSlider.addEventListener("mouseleave", () => { pTrack.style.animationPlayState = "running"; });

        // Click delegation
        pSlider.addEventListener("click", (e) => {
            const card = e.target.closest(".polaroid-card");
            if (!card) return;
            e.stopPropagation();
            const img = card.querySelector("img");
            if (!img) return;
            zoomImg.src = img.src;
            const cap = card.querySelector(".polaroid-caption");
            zoomTitle.innerText = cap ? cap.innerText : "Graduation Day";
            zoomDesc.innerText = card.getAttribute("data-desc") || "";
            zoomModal.classList.add("is-open");
        });
    }

    // Close zoom
    function closeZoom() { zoomModal.classList.remove("is-open"); }
    if (zoomCloseBtn) zoomCloseBtn.addEventListener("click", closeZoom);
    if (zoomModal) zoomModal.addEventListener("click", e => { if (e.target === zoomModal) closeZoom(); });
});
