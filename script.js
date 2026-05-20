// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => observer.observe(el));

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let images = [];
let currentIndex = 0;

// ===== Photo Wall =====
const photoWall = document.getElementById('photoWall');
if (photoWall) {
  const allPwImages = [];

  photoWall.querySelectorAll('.pw-track').forEach(track => {
    const origImgs = Array.from(track.querySelectorAll('img'));
    allPwImages.push(...origImgs);
    // Duplicate images for seamless infinite loop
    origImgs.forEach(img => track.appendChild(img.cloneNode(true)));
  });

  // Click any image → open lightbox
  photoWall.addEventListener('click', e => {
    const img = e.target.closest('img');
    if (!img) return;
    const idx = allPwImages.findIndex(i => i.src === img.src);
    if (idx === -1) return;
    images = allPwImages;
    currentIndex = idx;
    showLightbox(currentIndex);
  });
}

function showLightbox(index) {
  lightboxImg.src = images[index].src;
  lightboxImg.alt = images[index].alt;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  showLightbox(currentIndex);
});

lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % images.length;
  showLightbox(currentIndex);
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + images.length) % images.length; showLightbox(currentIndex); }
  if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % images.length; showLightbox(currentIndex); }
});

// ===== Parallax cho tất cả sections có .section-bg =====
const parallaxTargets = [
  { section: document.getElementById('about'),   bg: document.querySelector('#about   .section-bg') },
  { section: document.getElementById('video'),   bg: document.querySelector('#video   .section-bg') },
  { section: document.getElementById('contact'), bg: document.querySelector('#contact .section-bg') },
].filter(t => t.section && t.bg);

let rafPending = false;

function updateParallax() {
  const winH = window.innerHeight;
  parallaxTargets.forEach(({ section, bg }) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > winH) return;
    const progress = (winH - rect.top) / (winH + rect.height);
    const offset   = (0.5 - progress) * 120;          // bg trượt ±60px
    bg.style.transform = `translateY(${offset.toFixed(2)}px)`;
  });
}

window.addEventListener('scroll', () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => { updateParallax(); rafPending = false; });
  }
}, { passive: true });

updateParallax();

// Hero video audio control
const heroVideo = document.querySelector('.hero-video');
const heroMuteBtn = document.getElementById('heroMuteBtn');

function syncMuteBtn(muted) {
  if (!heroMuteBtn) return;
  heroMuteBtn.querySelector('.icon-muted').style.display = muted ? '' : 'none';
  heroMuteBtn.querySelector('.icon-sound').style.display = muted ? 'none' : '';
  heroMuteBtn.setAttribute('aria-label', muted ? 'Bật âm thanh' : 'Tắt âm thanh');
}

function setMuted(muted) {
  if (!heroVideo) return;
  heroVideo.muted = muted;
  syncMuteBtn(muted);
}

if (heroVideo) {
  // Unmute once video starts playing (browser allows unmuting an already-playing video)
  heroVideo.addEventListener('playing', () => {
    setMuted(false);
  }, { once: true });

  // Mute when about section scrolls into view
  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setMuted(true);
    }, { threshold: 0.25 }).observe(aboutSection);
  }

  // Manual toggle button
  if (heroMuteBtn) {
    heroMuteBtn.addEventListener('click', () => setMuted(!heroVideo.muted));
  }
}

// Touch swipe for lightbox
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    if (dx < 0) { currentIndex = (currentIndex + 1) % images.length; }
    else { currentIndex = (currentIndex - 1 + images.length) % images.length; }
    showLightbox(currentIndex);
  }
});
