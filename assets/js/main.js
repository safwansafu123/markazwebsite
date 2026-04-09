/* ========================================================================= */
/* SECTION: CORE FUNCTIONALITY (CURSOR, MENU, OBSERVERS)                     */
/* ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Custom Cursor
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (!cursorDot && !cursorOutline) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const outline = document.createElement('div');
    outline.className = 'cursor-outline';
    document.body.appendChild(dot);
    document.body.appendChild(outline);

    window.addEventListener('mousemove', (e) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;

      // Add slight delay to outline
      setTimeout(() => {
        outline.style.left = `${e.clientX}px`;
        outline.style.top = `${e.clientY}px`;
      }, 50);
    });

    // Hover effect for links and buttons
    document.querySelectorAll('a, button, input, textarea, .accordion-header').forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  // Mobile Menu Toggle (Premium Overlay)
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinksWrapper = document.querySelector('.nav-links-wrapper');
  const body = document.body;

  if (mobileToggle && navLinksWrapper) {
    const toggleMenu = (forceState) => {
      const isOpen = typeof forceState === 'boolean' ? forceState : !navLinksWrapper.classList.contains('active');
      mobileToggle.classList.toggle('active', isOpen);
      navLinksWrapper.classList.toggle('active', isOpen);
      body.classList.toggle('nav-open', isOpen);
      body.style.overflow = isOpen ? 'hidden' : '';
    };

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking outside (on overlay)
    document.addEventListener('click', (e) => {
      if (body.classList.contains('nav-open') && !navLinksWrapper.contains(e.target) && !mobileToggle.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Close menu when clicking a link
    const navLinks = navLinksWrapper.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });
  }

  // Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Advanced Fade Up Intersection Observer
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll('.fade-up');
  fadeElements.forEach(el => observer.observe(el));

  /* ========================================================================= */
  /* SECTION: FAQ ACCORDION                                                    */
  /* ========================================================================= */
  // FAQ Accordion
  const accordions = document.querySelectorAll('.accordion-header');
  accordions.forEach(acc => {
    acc.addEventListener('click', function () {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        content.style.paddingTop = null;
      } else {
        content.style.maxHeight = content.scrollHeight + 50 + "px";
        content.style.paddingTop = "1rem";
      }
    });
  });

  /* ========================================================================= */
  /* SECTION: MAGNETIC BUTTONS                                                 */
  /* ========================================================================= */
  // Magnetic Buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', function (e) {
      const position = btn.getBoundingClientRect();
      const x = e.pageX - position.left - position.width / 2;
      const y = e.pageY - position.top - position.height / 2;
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    btn.addEventListener('mouseout', function (e) {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  /* ========================================================================= */
  /* SECTION: ANIMATED COUNTERS                                                */
  /* ========================================================================= */
  // Animated Number Counters
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // Total animation time
        const increment = target / (duration / 16); // 60fps

        let current = 1;
        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.innerText = Math.ceil(current) + (target > 50 ? '+' : (target === 20 ? '+' : ''));
            requestAnimationFrame(updateCounter);
          } else {
            // Final format based on specific goals
            counter.innerText = target + (target === 18 ? ' Years' : '+');
          }
        };
        updateCounter();
        observer.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    counterObserver.observe(counter);
  });
});

/* ========================================================================= */
/* SECTION: DYNAMIC CMS CONTENT                                              */
/* ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const apiEndpoint = '/api/content';
  const streamEndpoint = '/api/content/stream';
  let latestUpdatedAt = '';

  const textTargets = {
    heroLine1: document.getElementById('hl1'),
    heroLine2: document.getElementById('hl2'),
    heroLine3: document.getElementById('hl3'),
    heroDescription: document.getElementById('hDesc'),
    knowusTag: document.getElementById('knowusTag'),
    knowusTitleLine1: document.getElementById('knowusTitleLine1'),
    knowusTitleLine2: document.getElementById('knowusTitleLine2'),
    knowusDescription: document.getElementById('knowusDesc'),
    campusLiveCaption: document.getElementById('campusLiveCaption'),
    notificationDate: document.getElementById('notificationDate'),
    notificationTitle: document.getElementById('notificationTitle'),
    admissionTag: document.getElementById('admissionTag'),
    admissionDescription: document.getElementById('admissionDescription'),
    admissionButtonText: document.getElementById('admissionButtonText')
  };

  const imageTargets = {
    heroSlide1: document.getElementById('heroSlide1Image'),
    heroSlide2: document.getElementById('heroSlide2Image'),
    heroSlide3: document.getElementById('heroSlide3Image'),
    heroSlide4: document.getElementById('heroSlide4Image'),
    campusLiveImage: document.getElementById('campusLiveImage')
  };

  function setTextContent(target, value) {
    if (!target || !value) return;
    target.textContent = value;
  }

  function setDecoratedText(target, value, decorator) {
    if (!target || !value) return;
    target.textContent = decorator ? decorator(value) : value;
  }

  function setMultilineContent(target, value) {
    if (!target || !value) return;
    target.innerHTML = '';

    const lines = String(value).split(/\r?\n/);
    lines.forEach((line, index) => {
      if (index > 0) {
        target.appendChild(document.createElement('br'));
      }
      target.appendChild(document.createTextNode(line));
    });
  }

  function setHeadingWithEmphasis(target, value) {
    if (!target || !value) return;
    const parts = String(value).trim().split(/\s+/);
    if (parts.length < 2) {
      target.textContent = value;
      return;
    }

    const lastWord = parts.pop();
    target.innerHTML = `${parts.join(' ')} <em>${lastWord}</em>`;
  }

  function updateImage(target, url) {
    if (!target || !url) return;
    target.src = url;
  }

  function updateLogoImages(url) {
    if (!url) return;
    document.querySelectorAll('.logo img, .knowus-logo, .ft-logo-circle img').forEach((img) => {
      img.src = url;
    });
  }

  function getCurrentPageKey() {
    const pathname = window.location.pathname;
    const lastSegment = pathname.split('/').filter(Boolean).pop();
    return lastSegment || 'index.html';
  }

  function hasRenderableSectionContent(markup) {
    if (typeof markup !== 'string') return false;

    const trimmed = markup.trim();
    if (!trimmed) return false;

    const parser = new DOMParser();
    const doc = parser.parseFromString(`<section>${trimmed}</section>`, 'text/html');
    const section = doc.querySelector('section');
    if (!section) return false;

    const text = (section.textContent || '').replace(/\s+/g, ' ').trim();
    const media = section.querySelector('img, video, iframe, svg, canvas, form');
    return Boolean(text || media);
  }

  function applySectionOverrides(data) {
    const pageKey = getCurrentPageKey();
    const pageSections = data.sections?.[pageKey];
    if (!pageSections) return;

    document.querySelectorAll('[data-cms-section]').forEach((section) => {
      const sectionKey = section.getAttribute('data-cms-section');
      if (sectionKey && hasRenderableSectionContent(pageSections[sectionKey])) {
        section.innerHTML = pageSections[sectionKey];
      }
    });
  }

  function applyContent(data) {
    if (!data) return;

    latestUpdatedAt = data.updatedAt || latestUpdatedAt;

    setTextContent(textTargets.heroLine1, data.text?.heroLine1);
    setTextContent(textTargets.heroLine2, data.text?.heroLine2);
    setTextContent(textTargets.heroLine3, data.text?.heroLine3);
    setTextContent(textTargets.heroDescription, data.text?.heroDescription);
    setDecoratedText(textTargets.knowusTag, data.text?.knowusTag, (value) => `✦ ${value} ✦`);
    setTextContent(textTargets.knowusTitleLine1, data.text?.knowusTitleLine1);
    setTextContent(textTargets.knowusTitleLine2, data.text?.knowusTitleLine2);
    setTextContent(textTargets.knowusDescription, data.text?.knowusDescription);
    setTextContent(textTargets.campusLiveCaption, data.text?.campusLiveCaption);
    setHeadingWithEmphasis(document.getElementById('campusLiveTitle'), data.text?.campusLiveTitle);
    setHeadingWithEmphasis(document.getElementById('notificationHeading'), data.text?.notificationHeading);

    if (textTargets.notificationDate && data.text?.notificationDate) {
      textTargets.notificationDate.innerHTML = `<span class="notif-date-ico">📅</span> ${data.text.notificationDate}`;
    }

    setTextContent(textTargets.notificationTitle, data.text?.notificationTitle);
    setDecoratedText(textTargets.admissionTag, data.text?.admissionTag, (value) => `✦ ${value} ✦`);
    setMultilineContent(document.getElementById('admissionTitle'), data.text?.admissionTitle);
    setTextContent(textTargets.admissionDescription, data.text?.admissionDescription);
    setTextContent(textTargets.admissionButtonText, data.text?.admissionButtonText);

    const admissionButton = document.getElementById('admissionButton');
    if (admissionButton && data.text?.admissionButtonUrl) {
      admissionButton.href = data.text.admissionButtonUrl;
    }

    updateLogoImages(data.images?.siteLogo);
    updateImage(imageTargets.heroSlide1, data.images?.heroSlide1);
    updateImage(imageTargets.heroSlide2, data.images?.heroSlide2);
    updateImage(imageTargets.heroSlide3, data.images?.heroSlide3);
    updateImage(imageTargets.heroSlide4, data.images?.heroSlide4);
    updateImage(imageTargets.campusLiveImage, data.images?.campusLiveImage);
  }

  async function loadContent() {
    try {
      const response = await fetch(apiEndpoint, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      applyContent(data);
    } catch (_error) {
      // Keep static fallback content when the API is unavailable.
    }
  }

  function bindRealtimeUpdates() {
    if (typeof EventSource === 'undefined') return;

    try {
      const source = new EventSource(streamEndpoint);
      source.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.updatedAt && payload.updatedAt !== latestUpdatedAt) {
            loadContent();
          }
        } catch (_error) {
          // Ignore malformed stream payloads.
        }
      };
    } catch (_error) {
      // Ignore stream setup failure and keep one-time content loading.
    }
  }

  loadContent();
  bindRealtimeUpdates();
});

/* ========================================================================= */
/* SECTION: FACILITIES SLIDER GALLERY                                        */
/* ========================================================================= */
// NEW Facilities Slider Logic (Infinite Loop)
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('facilities-slider-track');
  let originalCards = Array.from(document.querySelectorAll('.facility-card-new'));
  const nextBtn = document.querySelector('.fc-next');
  const prevBtn = document.querySelector('.fc-prev');
  const dotsContainer = document.querySelector('.fc-dots');

  if (!track || originalCards.length === 0) return;

  // 1. Clone cards for infinite loop
  const cloneCount = 3; // Number of clones on each side to ensure smooth centering

  // Append clones to the end
  for (let i = 0; i < cloneCount; i++) {
    const clone = originalCards[i].cloneNode(true);
    clone.classList.add('clone'); // Mark as clone for debugging if needed
    track.appendChild(clone);
  }

  // Prepend clones to the start
  for (let i = originalCards.length - 1; i >= originalCards.length - cloneCount; i--) {
    const clone = originalCards[i].cloneNode(true);
    clone.classList.add('clone');
    track.insertBefore(clone, track.firstChild);
  }

  // Update the cards array to include clones
  let cards = Array.from(document.querySelectorAll('.facility-card-new'));
  let currentIndex = cloneCount + 2; // Start at the same "middle" card (index 2 + clones)
  let autoSlideInterval;
  let isTransitioning = false;

  // Dots (map to original cards count)
  const dots = Array.from(document.querySelectorAll('.fc-dot'));

  const updateSliderPosition = (instant = false) => {
    const viewportWidth = window.innerWidth;
    let cardWidth = 270;
    let margin = 12;

    if (viewportWidth <= 480) {
      cardWidth = 230;
      margin = 15;
    } else if (viewportWidth <= 768) {
      cardWidth = 250;
      margin = 10;
    }

    const TOTAL_STEP = cardWidth + (margin * 2);
    const HALF_CARD = cardWidth / 2;

    if (instant) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.8s cubic-bezier(0.77, 0, 0.175, 1)';
    }

    let translateX = (viewportWidth / 2) - (currentIndex * TOTAL_STEP) - HALF_CARD;
    track.style.transform = `translateX(${translateX}px)`;

    // Update classes
    cards.forEach((card, i) => {
      if (i === currentIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
        card.style.transform = ''; // Reset tilt
      }
    });

    // Update Dots based on virtual index
    const virtualIndex = (currentIndex - cloneCount + originalCards.length) % originalCards.length;
    dots.forEach((dot, index) => {
      if (index === virtualIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  };

  const moveToSlide = (index) => {
    if (isTransitioning) return;

    currentIndex = index;
    isTransitioning = true;
    updateSliderPosition();
    resetAutoSlide();
  };

  // Handle seamless jump at transition end
  track.addEventListener('transitionend', () => {
    isTransitioning = false;

    // If we land on a clone, jump to the real card instantly
    if (currentIndex < cloneCount) {
      currentIndex = originalCards.length + currentIndex;
      updateSliderPosition(true);
    } else if (currentIndex >= originalCards.length + cloneCount) {
      currentIndex = currentIndex - originalCards.length;
      updateSliderPosition(true);
    }
  });

  // Event Listeners for Buttons & Dots
  if (nextBtn) nextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
  if (prevBtn) prevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      moveToSlide(index + cloneCount);
    });
  });

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      if (index !== currentIndex) {
        moveToSlide(index);
      }
    });
  });

  // Handle Window Resize
  window.addEventListener('resize', () => {
    updateSliderPosition(true);
  });

  // Auto Slide functionality
  const startAutoSlide = () => {
    autoSlideInterval = setInterval(() => {
      moveToSlide(currentIndex + 1);
    }, 3500);
  };

  const stopAutoSlide = () => clearInterval(autoSlideInterval);
  const resetAutoSlide = () => {
    stopAutoSlide();
    startAutoSlide();
  };

  startAutoSlide();

  // Pause on hover
  const wrap = document.querySelector('.facilities-slider-container');
  if (wrap) {
    wrap.addEventListener('mouseenter', stopAutoSlide);
    wrap.addEventListener('mouseleave', startAutoSlide);
  }

  // 3D Tilt Effect on mousemove
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (card.classList.contains('active')) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      let rotateX = ((y - centerY) / centerY) * -8;
      let rotateY = ((x - centerX) / centerX) * 10;
      card.style.transform = `perspective(1000px) scale(1.02) translateY(-4px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      if (!card.classList.contains('active')) {
        card.style.transform = `perspective(1000px) scale(1.02) translateY(-4px) rotateX(0deg) rotateY(0deg)`;
        setTimeout(() => { if (!card.classList.contains('active')) card.style.transform = ''; }, 400);
      }
    });
  });

  // Touch Swipe Support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoSlide();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    let touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 40;
    if (touchStartX - touchEndX > swipeThreshold) {
      moveToSlide(currentIndex + 1);
    } else if (touchEndX - touchStartX > swipeThreshold) {
      moveToSlide(currentIndex - 1);
    } else {
      resetAutoSlide();
    }
  }, { passive: true });

  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    const rect = track.getBoundingClientRect();
    if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
      if (e.key === 'ArrowLeft') moveToSlide(currentIndex - 1);
      else if (e.key === 'ArrowRight') moveToSlide(currentIndex + 1);
    }
  });

  // Initial position
  updateSliderPosition(true);
});


/* ========================================================================= */
/* SECTION: COLLEGE COMMITTEE SLIDER & PARTICLES                            */
/* ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
  /* ── Particles ── */
  (() => {
    const c = document.getElementById('particles');
    if (!c) return;
    const ctx = c.getContext('2d');
    let W, H, pts = [];
    const rs = () => {
      const section = document.getElementById('committee');
      if (!section) return;
      W = c.width = section.offsetWidth;
      H = c.height = section.offsetHeight;
    };
    rs();
    window.addEventListener('resize', rs);
    for (let i = 0; i < 55; i++) pts.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - .5) * .18,
      vy: (Math.random() - .5) * .18,
      r: Math.random() * 1.3 + .3,
      a: Math.random() * .35 + .1
    });
    (function lp() {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184,134,42,${p.a * .45})`;
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x,
            dy = pts[i].y - pts[j].y,
            d = Math.hypot(dx, dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(184,134,42,${.06 * (1 - d / 100)})`;
            ctx.lineWidth = .4;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      requestAnimationFrame(lp);
    })();
  })();

  /* ── Slider ── */
  const viewport = document.getElementById('viewport');
  const stage = document.getElementById('stage');
  const dotsWrap = document.getElementById('dots');
  const nextButton = document.getElementById('next');
  const prevButton = document.getElementById('prev');
  if (!viewport || !stage || !dotsWrap || !nextButton || !prevButton) return;

  const members = Array.from(stage.querySelectorAll('.member'));
  const COUNT = members.length;
  const CARD_W = 260; // must match CSS width
  const STEP = 280; // spacing between card centres (CARD_W + gap)

  let current = 0;
  let autoTimer = null;
  let dragging = false;
  let dragStartX = 0;

  /* Build dots */
  members.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
  });

  function layout(animate) {
    const vw = viewport.offsetWidth;
    const centre = vw / 2 - CARD_W / 2;

    members.forEach((m, i) => {
      const leftPx = centre + (i - current) * STEP;
      if (!animate) {
        // instant: disable transition temporarily
        m.style.transition = 'opacity .5s ease, transform .5s cubic-bezier(.34,1.3,.64,1)';
        m.style.left = leftPx + 'px';
      } else {
        m.style.transition =
          'left .6s cubic-bezier(.77,0,.18,1), opacity .5s ease, transform .5s cubic-bezier(.34,1.3,.64,1)';
        m.style.left = leftPx + 'px';
      }

      m.classList.remove('active', 'adj');
      if (i === current) m.classList.add('active');
      else if (Math.abs(i - current) === 1) m.classList.add('adj');
    });

    dotsWrap.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(idx) {
    current = ((idx % COUNT) + COUNT) % COUNT;
    layout(true);
  }

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  nextButton.addEventListener('click', next);
  prevButton.addEventListener('click', prev);
  members.forEach((m, i) => m.addEventListener('click', () => goTo(i)));

  /* Auto-play */
  const startAuto = () => {
    stopAuto();
    autoTimer = setInterval(next, 3000);
  };
  const stopAuto = () => {
    clearInterval(autoTimer);
  };
  startAuto();
  viewport.addEventListener('mouseenter', stopAuto);
  viewport.addEventListener('mouseleave', startAuto);

  /* Drag support */
  viewport.addEventListener('mousedown', e => {
    dragging = true;
    dragStartX = e.clientX;
    stopAuto();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    // live shift all cards while dragging
    const dx = e.clientX - dragStartX;
    const vw = viewport.offsetWidth;
    const centre = vw / 2 - CARD_W / 2;
    members.forEach((m, i) => {
      m.style.transition = 'none';
      m.style.left = (centre + (i - current) * STEP + dx) + 'px';
    });
  });
  document.addEventListener('mouseup', e => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - dragStartX;
    if (dx < -50) next();
    else if (dx > 50) prev();
    else layout(true);
    startAuto();
  });

  /* Touch */
  viewport.addEventListener('touchstart', e => {
    dragStartX = e.touches[0].clientX;
    stopAuto();
  }, {
    passive: true
  });
  viewport.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - dragStartX;
    const vw = viewport.offsetWidth,
      centre = vw / 2 - CARD_W / 2;
    members.forEach((m, i) => {
      m.style.transition = 'none';
      m.style.left = (centre + (i - current) * STEP + dx) + 'px';
    });
  }, {
    passive: true
  });
  viewport.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - dragStartX;
    if (dx < -50) next();
    else if (dx > 50) prev();
    else layout(true);
    startAuto();
  });

  /* Init: no animation on first paint */
  layout(false);
  /* Re-layout on resize */
  window.addEventListener('resize', () => layout(false));
  /* Re-layout after full load to handle any reflow */
  window.addEventListener('load', () => layout(false));
});
