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

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
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

  // FAQ Accordion
  const accordions = document.querySelectorAll('.accordion-header');
  accordions.forEach(acc => {
    acc.addEventListener('click', function() {
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

  // Magnetic Buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const position = btn.getBoundingClientRect();
      const x = e.pageX - position.left - position.width / 2;
      const y = e.pageY - position.top - position.height / 2;
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    btn.addEventListener('mouseout', function(e) {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

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

// Facilities Slider Logic
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.facilities-track');
    const slides = Array.from(document.querySelectorAll('.slide'));
    const nextBtn = document.querySelector('.facilities-slider-wrap .next-btn');
    const prevBtn = document.querySelector('.facilities-slider-wrap .prev-btn');
    
    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    let autoSlideInterval;

    const updateSliderPosition = () => {
        // Calculate slide width dynamically
        const slideWidth = slides[0].getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    };

    const moveToNextSlide = () => {
        const visibleSlides = window.innerWidth >= 1024 ? 2 : window.innerWidth >= 768 ? 2 : 1;
        const maxIndex = slides.length - visibleSlides;
        
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0; // Loop back to start
        }
        updateSliderPosition();
    };

    const moveToPrevSlide = () => {
        const visibleSlides = window.innerWidth >= 1024 ? 2 : window.innerWidth >= 768 ? 2 : 1;
        const maxIndex = slides.length - visibleSlides;

        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = maxIndex; // Loop to end
        }
        updateSliderPosition();
    };

    // Event Listeners for Buttons
    if(nextBtn) nextBtn.addEventListener('click', () => {
        moveToNextSlide();
        resetAutoSlide();
    });

    if(prevBtn) prevBtn.addEventListener('click', () => {
        moveToPrevSlide();
        resetAutoSlide();
    });

    // Touch Swipe Support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    const handleSwipe = () => {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) {
            moveToNextSlide(); // Swipe left
            resetAutoSlide();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            moveToPrevSlide(); // Swipe right
            resetAutoSlide();
        }
    };

    // Handle Window Resize
    window.addEventListener('resize', () => {
        // Ensure index is valid on resize
        const visibleSlides = window.innerWidth >= 1024 ? 2 : window.innerWidth >= 768 ? 2 : 1;
        const maxIndex = Math.max(0, slides.length - visibleSlides);
        if(currentIndex > maxIndex) currentIndex = maxIndex;
        updateSliderPosition();
    });

    // Auto Slide functionality
    const startAutoSlide = () => {
        autoSlideInterval = setInterval(moveToNextSlide, 4000); // 4 seconds
    };

    const resetAutoSlide = () => {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    };

    // Start auto slider
    startAutoSlide();
    
    // Pause on hover
    const wrap = document.querySelector('.facilities-slider-wrap');
    if (wrap) {
        wrap.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        wrap.addEventListener('mouseleave', startAutoSlide);
    }
});
