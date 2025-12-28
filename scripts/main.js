/* ============================================
   PORTFOLIO WEBSITE - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCustomCursor();
  initScrollAnimations();
  initStaggerAnimations();
  initTextReveal();
  initSmoothScroll();
  initTiltEffect();
});

/* ============================================
   CUSTOM CURSOR
   ============================================ */

function initCustomCursor() {
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (!cursorDot || !cursorOutline) return;

  // Only enable on desktop
  if (window.innerWidth < 768) return;

  let mouseX = 0, mouseY = 0;
  let outlineX = 0, outlineY = 0;

  // Show cursors
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursorDot.style.opacity = '1';
    cursorOutline.style.opacity = '1';

    // Dot follows immediately
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top = mouseY + 'px';
  });

  // Smooth outline follow
  function animateOutline() {
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;

    cursorOutline.style.left = outlineX + 'px';
    cursorOutline.style.top = outlineY + 'px';

    requestAnimationFrame(animateOutline);
  }
  animateOutline();

  // Expand on hover
  const hoverElements = document.querySelectorAll('a, button, .portfolio-item, .card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('expand'));
  });

  // Hide on leave
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorOutline.style.opacity = '0';
  });
}

/* ============================================
   SCROLL ANIMATIONS (Intersection Observer)
   ============================================ */

function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeElements.forEach(el => observer.observe(el));
}

/* ============================================
   STAGGER ANIMATIONS
   ============================================ */

function initStaggerAnimations() {
  const staggerContainers = document.querySelectorAll('.stagger-container');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll('.stagger-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('visible');
          }, index * 100);
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  staggerContainers.forEach(container => observer.observe(container));
}

/* ============================================
   TEXT REVEAL ANIMATION
   ============================================ */

function initTextReveal() {
  const textElements = document.querySelectorAll('.text-reveal');

  textElements.forEach(el => {
    const text = el.textContent;
    el.innerHTML = '';

    text.split('').forEach((char, index) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.animationDelay = `${index * 0.03}s`;
      el.appendChild(span);
    });
  });
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const maxScroll = document.body.scrollHeight - window.innerHeight;

      if (targetId === '#contact') {
        window.scrollTo({ top: maxScroll, behavior: 'smooth' });
      } else if (targetId === '#hero' || targetId === '#hero-room') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const target = document.querySelector(targetId + '-room') || document.querySelector(targetId);
        const rooms = Array.from(document.querySelectorAll('.room-section'));
        const index = rooms.indexOf(target);

        if (index !== -1) {
          const scrollPos = (index / (rooms.length - 1)) * maxScroll;
          window.scrollTo({ top: scrollPos, behavior: 'smooth' });
        }
      }
    });
  });
}

/* ============================================
   3D TILT EFFECT (Improved)
   ============================================ */

function initTiltEffect() {
  // Only on desktop
  if (window.innerWidth < 768) return;

  const tiltElements = document.querySelectorAll('.portfolio-item');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;

      el.style.transform = `translateY(-12px) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translateY(0) perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

/* ============================================
   LIGHTBOX GALLERY
   ============================================ */

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  if (!lightbox) return;

  const portfolioItems = document.querySelectorAll('.portfolio-item');
  let currentIndex = 0;

  // Get image data
  function getItemData(item) {
    const img = item.querySelector('img');
    const title = item.querySelector('h3');
    const desc = item.querySelector('p');
    return {
      src: img ? img.src : '',
      title: title ? title.textContent : '',
      desc: desc ? desc.textContent : ''
    };
  }

  // Open lightbox
  function openLightbox(index) {
    currentIndex = index;
    const data = getItemData(portfolioItems[index]);

    lightboxImg.src = data.src;
    lightboxTitle.textContent = data.title;
    lightboxDesc.textContent = data.desc;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Navigate
  function navigate(direction) {
    currentIndex += direction;

    if (currentIndex >= portfolioItems.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = portfolioItems.length - 1;

    const data = getItemData(portfolioItems[currentIndex]);

    // Animate transition
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.9)';

    setTimeout(() => {
      lightboxImg.src = data.src;
      lightboxTitle.textContent = data.title;
      lightboxDesc.textContent = data.desc;

      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 200);
  }

  // Event listeners
  portfolioItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigate(-1));
  lightboxNext.addEventListener('click', () => navigate(1));

  // Click outside to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Add transition style to lightbox image
  lightboxImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
}

/* ============================================
   COUNTER ANIMATION
   ============================================ */

function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);

  const updateCounter = () => {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };

  updateCounter();
}

// Init counters when visible
function initCounters() {
  const counters = document.querySelectorAll('.counter');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target);
        animateCounter(entry.target, target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// Custom Context Menu Logic
function initContextMenu() {
  const menu = document.getElementById('custom-context-menu');
  if (!menu) return;

  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    // Position menu at cursor
    let x = e.clientX;
    let y = e.clientY;

    // Check if menu goes off screen
    const menuWidth = 220;
    const menuHeight = 180;
    const padding = 10;

    if (x + menuWidth > window.innerWidth) x -= menuWidth;
    if (y + menuHeight > window.innerHeight) y -= menuHeight;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';
  });

  // Hide menu on click elsewhere
  window.addEventListener('click', () => {
    menu.style.display = 'none';
  });

  // Hide on scroll
  window.addEventListener('scroll', () => {
    menu.style.display = 'none';
  }, { passive: true });

  // Handle Close button inside menu
  const closeBtn = menu.querySelector('.close-menu');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.style.display = 'none';
    });
  }
}

/* ============================================
   INITIALIZE LIGHTBOX ON DOM LOAD
   ============================================ */

// ============================================
// SECURITY SHIELD - Protection Logic
// ============================================
function initSecurityShield() {
  // 2. Disable Common Inspection Shortcuts
  document.addEventListener('keydown', (e) => {
    // Disable F12
    if (e.keyCode === 123) e.preventDefault();
    // Disable Ctrl+Shift+I (Inspect)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 73) e.preventDefault();
    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 74) e.preventDefault();
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) e.preventDefault();
    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && e.keyCode === 83) e.preventDefault();
  });

  // 3. Asset Protection: Disable Image Dragging
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // 4. Console Warning for Hackers
  const warningTitle = "%c⚠️ SECURITY ALERT!";
  const warningMsg = "color: red; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 0px black;";
  const subMsg = "color: white; font-size: 14px;";

  console.log(warningTitle, warningMsg);
  console.log("%cThis area is for developers only. Please do not paste any scripts here to avoid compromising your security.", subMsg);

  // Clear console periodically to discourage debugging
  setInterval(() => {
    // console.clear(); // Re-enable this if you want absolute console silence
  }, 5000);
}

// ============================================
// CARD LIQUID LIGHTING (iOS 26 Style)
// ============================================
function initCardLiquidEffect() {
  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initCounters();
  initContextMenu();
  initSecurityShield();
  initCardLiquidEffect();
});

