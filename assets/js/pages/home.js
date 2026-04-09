// Homepage-specific interactions extracted from index.html



        // Force page to start from top on every load/refresh
        window.scrollTo(0, 0);
        if (history.scrollRestoration) history.scrollRestoration = 'manual';

        /* ═══════════════════════════════════════════════════════
        📸 PHOTOS CONFIG — ഇവിടെ photos മാറ്റാം
        Replace the URL with your photo path or URL.
        Example: 'images/myPhoto.jpg'  OR  'https://yoursite.com/photo.jpg'
        ═══════════════════════════════════════════════════════ */
        const PHOTOS = {

          /* ── HERO BACKGROUND SLIDES (4 slides) ── */
          HERO_SLIDE_1: 'assets/images/mkz.jpeg',
          HERO_SLIDE_2: 'assets/images/mkz3.jpeg',
          HERO_SLIDE_3: 'assets/images/mkz2.jpeg',
          HERO_SLIDE_4: 'assets/images/hero-3.jpg',

          /* ── OUR TEAM MEMBER PHOTOS ── */
          TEAM_1_CHAIRMAN: 'https://randomuser.me/api/portraits/men/32.jpg',
          TEAM_2_VICECHAIR: 'https://randomuser.me/api/portraits/women/44.jpg',
          TEAM_3_SECRETARY: 'https://randomuser.me/api/portraits/men/56.jpg',
          TEAM_4_TREASURER: 'https://randomuser.me/api/portraits/women/68.jpg',
          TEAM_5_JNTSECY: 'https://randomuser.me/api/portraits/men/77.jpg',
          TEAM_6_COORDINATOR: 'https://randomuser.me/api/portraits/women/12.jpg',
          TEAM_7_MEMBER: 'https://randomuser.me/api/portraits/men/23.jpg',
          TEAM_8_ADVISOR: 'https://randomuser.me/api/portraits/women/90.jpg',

          /* ── FACILITIES SECTION PHOTOS ── */
          FAC_ACADEMIC: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=900&q=80',
          FAC_DIGITAL: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=900&q=80',
          FAC_LIBRARY: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80',
          FAC_SPORTS: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=900&q=80',
          FAC_HOSTEL: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=80',
        };

        /* Apply hero slide photos */
        (function () {
          const slides = ['bs0', 'bs1', 'bs2', 'bs3'];
          const keys = ['HERO_SLIDE_1', 'HERO_SLIDE_2', 'HERO_SLIDE_3', 'HERO_SLIDE_4'];
          slides.forEach((id, i) => {
            const img = document.querySelector(`#${id} .bs-img`);
            if (img && PHOTOS[keys[i]]) {
              img.src = PHOTOS[keys[i]];
              img.classList.add('has-image');
            }
          });
        })();

        /* Apply team member photos */
        (function () {
          const keys = [
            'TEAM_1_CHAIRMAN', 'TEAM_2_VICECHAIR', 'TEAM_3_SECRETARY', 'TEAM_4_TREASURER',
            'TEAM_5_JNTSECY', 'TEAM_6_COORDINATOR', 'TEAM_7_MEMBER', 'TEAM_8_ADVISOR'
          ];
          document.querySelectorAll('#stage .member[data-i]').forEach(member => {
            const i = parseInt(member.dataset.i);
            const img = member.querySelector('.photo img');
            if (img && keys[i] && PHOTOS[keys[i]]) img.src = PHOTOS[keys[i]];
          });
        })();
        /* ═══════════════════════════════════════════════════════ */

        /* ── HERO STATS COUNT-UP ── */
        (function () {
          const statsWrap = document.getElementById('heroStats');
          if (!statsWrap) return;

          function smoothCount(el) {
            const target = +el.dataset.count;
            const countEl = el.querySelector('.s-count');
            if (!countEl) return;

            const dur = 2200;
            const fps = 60;
            const interval = 1000 / fps;
            let startTs = null;

            function ease(t) { return 1 - Math.pow(1 - t, 3); }

            function tick(ts) {
              if (!startTs) startTs = ts;
              const elapsed = ts - startTs;
              const progress = Math.min(elapsed / dur, 1);
              const value = Math.round(ease(progress) * target);
              countEl.textContent = value;
              if (progress < 1) {
                requestAnimationFrame(tick);
              } else {
                countEl.textContent = target;
                countEl.classList.add('pop');
                setTimeout(() => countEl.classList.remove('pop'), 450);
              }
            }

            countEl.textContent = '0';
            requestAnimationFrame(tick);

          }

          function playStats() {
            const items = statsWrap.querySelectorAll('.stat-item');
            items.forEach((item, i) => {
              item.classList.remove('si-in');
              void item.offsetHeight;
              const delay = i * 150;
              setTimeout(() => {
                item.classList.add('si-in');
                // start count slightly after slide-in
                setTimeout(() => smoothCount(item), 80);
              }, delay);
            });
          }

          // Wait for hero animation then play
          setTimeout(playStats, 1100);
        })();

        /* ── HERO SLIDES ── */
        (function () {
          const hl2 = document.getElementById('hl2');
          hl2.style.fontStyle = 'italic'; hl2.style.color = 'rgba(244, 246, 240, 0.32)';
        })();

        const HSLIDES = [
          { h1: 'Knowledge', h2: 'Faith &', h3: 'Excellence.', emoji: '🕌', d: 'Smaaraka Saudam Islamic College — a beacon of Islamic education nurturing scholars grounded in faith, discipline and academic excellence.' },
          { h1: 'Discipline', h2: 'Shapes', h3: 'Destiny.', emoji: '📚', d: 'Structured assemblies and daily routines instill lifelong discipline.Strong character is built alongside deep knowledge every single day.' },
          { h1: 'Where', h2: 'Scholars', h3: 'Are Born.', emoji: '🎓', d: 'Our iconic arched corridors have witnessed generations grow from eager learners into respected leaders of Islamic scholarship and society.' },
          { h1: 'Strong', h2: 'Mind &', h3: 'Body.', emoji: '💪', d: 'Physical discipline is core to our holistic curriculum.Healthy, grounded and spiritually strong — our graduates face every challenge.' }
        ];
        const HN = 4, HDUR = 7000;
        let hcur = 0, htmr = null;
        document.querySelectorAll('#hdots .hdot').forEach(d => d.addEventListener('click', () => hgo(+d.dataset.i)));
        function hgo(idx) {
          if (idx === hcur) return; clearTimeout(htmr);
          const slides = document.querySelectorAll('#bg .bs');
          const dots = document.querySelectorAll('#hdots .hdot');

          slides.forEach((s, i) => {
            if (i === idx) {
              s.classList.remove('no-trans', 'prev');
              s.classList.add('on');
            } else if (i === hcur) {
              s.classList.remove('no-trans', 'on');
              s.classList.add('prev');
            } else {
              s.classList.add('no-trans');
              s.classList.remove('on', 'prev');
            }
          });

          dots.forEach((d, i) => d.classList.toggle('on', i === idx));

          const f = document.getElementById('bbFill');
          if (f) {
            f.classList.remove('go'); void f.offsetHeight; f.classList.add('go');
          }

          document.querySelectorAll('.sl').forEach(e => e.classList.add('out'));
          setTimeout(() => {
            const d = HSLIDES[idx];
            const h2 = document.getElementById('hl2');
            if (d) {
              document.getElementById('hl1').innerHTML = d.h1;
              if (h2) {
                h2.innerHTML = d.h2; h2.style.fontStyle = 'italic'; h2.style.color = 'rgba(244, 246, 240, 0.32)';
              }
              document.getElementById('hl3').innerHTML = d.h3;
              document.getElementById('hDesc').textContent = d.d;
            }
            document.querySelectorAll('.sl').forEach(e => e.classList.remove('out'));
          }, 410);
          hcur = idx; htmr = setTimeout(() => hgo((hcur + 1) % HN), HDUR);
        }
        htmr = setTimeout(() => hgo(1), HDUR);

        /* ── PARTICLES (committee bg) ── */
        (() => {
          const c = document.getElementById('particles'), ctx = c.getContext('2d');
          let W, H, pts = [];
          const rs = () => {
            const par = c.parentElement;
            W = c.width = par.offsetWidth;
            H = c.height = par.offsetHeight;
          };
          rs(); window.addEventListener('resize', rs);
          for (let i = 0; i < 55; i++) pts.push({ x: Math.random() * 2000, y: Math.random() * 1000, vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18, r: Math.random() * 1.3 + .3, a: Math.random() * .35 + .1 });
          (function lp() {
            ctx.clearRect(0, 0, W, H);
            pts.forEach(p => {
              p.x += p.vx; p.y += p.vy;
              if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
              ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(184,134,42,${p.a * .45})`; ctx.fill();
            });
            for (let i = 0; i < pts.length; i++)for (let j = i + 1; j < pts.length; j++) {
              const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
              if (d < 100) { ctx.beginPath(); ctx.strokeStyle = `rgba(184,134,42,${.06 * (1 - d / 100)})`; ctx.lineWidth = .4; ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
            }
            requestAnimationFrame(lp);
          })();
        })();

        /* ── COMMITTEE SLIDER ── */
        const viewport = document.getElementById('viewport');
        const stage = document.getElementById('stage');
        const dotsWrap = document.getElementById('dotsWrap');
        const ORIGINALS = Array.from(stage.querySelectorAll('.member'));
        const COUNT = ORIGINALS.length;
        const CARD_W = 260, STEP = 280, CLONE_N = 3;
        let allCards = [], current = 0, autoTimer = null, dragging = false, dragStartX = 0, busy = false;

        function buildClones() {
          stage.querySelectorAll('[data-clone]').forEach(el => el.remove());
          const cb = [], ca = [];
          for (let i = 0; i < CLONE_N; i++) {
            const b = ORIGINALS[COUNT - CLONE_N + i].cloneNode(true); b.setAttribute('data-clone', 'before'); b.removeAttribute('data-i'); cb.push(b);
            const a = ORIGINALS[i].cloneNode(true); a.setAttribute('data-clone', 'after'); a.removeAttribute('data-i'); ca.push(a);
          }
          cb.forEach(el => stage.insertBefore(el, ORIGINALS[0]));
          ca.forEach(el => stage.appendChild(el));
          allCards = Array.from(stage.querySelectorAll('.member'));
          current = CLONE_N;
        }
        function buildDots() {
          dotsWrap.innerHTML = '';
          ORIGINALS.forEach((_, i) => {
            const d = document.createElement('div');
            d.className = 'dot2' + (i === 0 ? ' active' : '');
            d.addEventListener('click', () => goToReal(i));
            dotsWrap.appendChild(d);
          });
        }
        function layout(animate) {
          const stageW = stage.getBoundingClientRect().width || stage.offsetWidth || window.innerWidth;
          const centre = stageW / 2;

          allCards.forEach((m, i) => {
            const offset = (i - current) * STEP;
            const isActive = i === current;
            const isAdj = Math.abs(i - current) === 1;
            const scale = isActive ? 1 : isAdj ? 0.91 : 0.84;
            const opacity = isActive ? 1 : isAdj ? 0.72 : 0.42;

            m.style.transition = animate
              ? 'transform .6s cubic-bezier(.77,0,.18,1), opacity .5s ease'
              : 'none';
            m.style.opacity = opacity;
            m.style.left = '0px';
            m.style.transform = `translateX(calc(${centre}px + ${offset}px - 50%)) scale(${scale})`;

            m.classList.remove('active', 'adj');
            if (isActive) { m.classList.add('active'); m.style.zIndex = 3; }
            else if (isAdj) { m.classList.add('adj'); m.style.zIndex = 2; }
            else { m.style.zIndex = 1; }

          });

          const realIdx = current - CLONE_N;
          const dotReal = ((realIdx % COUNT) + COUNT) % COUNT;
          document.querySelectorAll('.dot2').forEach((d, i) => d.classList.toggle('active', i === dotReal));
        }
        function afterTransition() {
          const total = allCards.length;
          if (current < CLONE_N) { current = current + COUNT; layout(false); }
          else if (current >= COUNT + CLONE_N) { current = current - COUNT; layout(false); }
          busy = false;
        }
        function goTo(idx, animate = true) {
          if (busy) return; busy = true; current = idx; layout(animate);
          if (!animate) { busy = false; return; }
          setTimeout(afterTransition, 650);
        }
        function slNext() { goTo(current + 1); }
        function slPrev() { goTo(current - 1); }
        function goToReal(ri) { goTo(ri + CLONE_N); }
        document.getElementById('next')?.addEventListener('click', () => { stopAuto(); slNext(); startAuto(); });
        document.getElementById('prev')?.addEventListener('click', () => { stopAuto(); slPrev(); startAuto(); });
        const startAuto = () => { stopAuto(); autoTimer = setInterval(() => { if (!busy) slNext(); }, 3000); };
        const stopAuto = () => { clearInterval(autoTimer); };
        startAuto();
        viewport.addEventListener('mouseenter', stopAuto);
        viewport.addEventListener('mouseleave', startAuto);
        viewport.addEventListener('mousedown', e => { dragging = true; dragStartX = e.clientX; stopAuto(); });
        document.addEventListener('mousemove', e => {
          if (!dragging) return;
          const dx = e.clientX - dragStartX;
          const stageW = stage.getBoundingClientRect().width || stage.offsetWidth || window.innerWidth;
          const centre = stageW / 2;
          allCards.forEach((m, i) => {
            const offset = (i - current) * STEP + dx;
            m.style.transition = 'none';
            m.style.left = '0px';
            m.style.transform = `translateX(calc(${centre}px + ${offset}px-50%))`;
          });
        });
        document.addEventListener('mouseup', e => {
          if (!dragging) return; dragging = false;
          const dx = e.clientX - dragStartX;
          if (dx < -50) slNext(); else if (dx > 50) slPrev(); else goTo(current);
          startAuto();
        });
        viewport.addEventListener('touchstart', e => { dragStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
        viewport.addEventListener('touchmove', e => {
          const dx = e.touches[0].clientX - dragStartX;
          const stageW = stage.getBoundingClientRect().width || stage.offsetWidth || window.innerWidth;
          const centre = stageW / 2;
          allCards.forEach((m, i) => {
            const offset = (i - current) * STEP + dx;
            m.style.transition = 'none';
            m.style.left = '0px';
            m.style.transform = `translateX(calc(${centre}px + ${offset}px-50%))`;
          });
        }, { passive: true });
        viewport.addEventListener('touchend', e => {
          const dx = e.changedTouches[0].clientX - dragStartX;
          if (dx < -50) slNext(); else if (dx > 50) slPrev(); else goTo(current);
          startAuto();
        });
        buildClones(); buildDots(); layout(false);
        window.addEventListener('resize', () => layout(false));
        window.addEventListener('load', () => {
          layout(false);
          setTimeout(() => layout(false), 300);
        });

        /* ── FACILITIES SINGLE CARD ── */

        /* ── NOTIFICATIONS & ADMISSION observer ── */
        (function () {
          const notifSec = document.getElementById('sec-notif');
          if (!notifSec) return;

          const titleWrap = notifSec.querySelector('.notif-title-wrap');
          const notifAll = notifSec.querySelector('.notif-all');
          const cards = notifSec.querySelectorAll('.notif-card');
          const admEls = notifSec.querySelectorAll('.adm-tag,.adm-title,.adm-desc,.adm-btn');

          function play() {
            // notif header
            titleWrap?.classList.add('ni-in');
            notifAll?.classList.add('ni-in');
            // notif cards stagger
            cards.forEach((c, i) => {
              c.classList.remove('nc-in');
              void c.offsetHeight;
              c.style.transitionDelay = (.25 + i * .1) + 's';
              c.classList.add('nc-in');
            });
            // admission elements
            admEls.forEach(el => {
              el.classList.remove('adm-in');
              void el.offsetHeight;
              el.classList.add('adm-in');
            });
          }
          function reset() {
            titleWrap?.classList.remove('ni-in');
            notifAll?.classList.remove('ni-in');
            cards.forEach(c => { c.classList.remove('nc-in'); c.style.transitionDelay = '0s'; });
            admEls.forEach(el => el.classList.remove('adm-in'));
          }

          // notif strip observer
          new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) play(); else reset(); });
          }, { threshold: .08 }).observe(notifSec);
        })();

        /* ── EVENTS section observer ── */
        (function () {
          const evSec = document.getElementById('sec-events');
          if (!evSec) return;
          const cards = evSec.querySelectorAll('.ev-card');

          function playEv() {
            evSec.classList.add('ev-visible');
            cards.forEach((card, i) => {
              card.classList.remove('ev-in');
              void card.offsetHeight;
              card.style.transitionDelay = `${.15 + i * .1}s`;
              card.classList.add('ev-in');
            });
          }
          function resetEv() {
            evSec.classList.remove('ev-visible');
            cards.forEach(card => {
              card.classList.remove('ev-in');
              card.style.transitionDelay = '0s';
            });
          }

          new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) playEv();
              else resetEv();
            });
          }, { threshold: .1 }).observe(evSec);
        })();

        /* ── About (Know Us) scroll-triggered animation ── */
        (function () {
          const inner = document.getElementById('knowusInner');
          if (!inner) return;
          // reset animations so they re-fire on scroll-in
          function resetKu() {
            inner.querySelectorAll('.knowus-tag,.ku-line1,.ku-line2,.knowus-divider,.knowus-desc,.knowus-btn-wrap,.knowus-rule').forEach(el => {
              el.style.animation = 'none';
              el.style.opacity = '0';
              void el.offsetHeight;
            });
          }
          function playKu() {
            const map = [
              { sel: '.knowus-tag', anim: 'kuFadeUp .7s .10s cubic-bezier(.16, 1, .3, 1) forwards' },
              { sel: '.ku-line1', anim: 'kuSlideUp 1s .15s cubic-bezier(.16, 1, .3, 1) forwards' },
              { sel: '.ku-line2', anim: 'kuSlideUp 1s .30s cubic-bezier(.16, 1, .3, 1) forwards' },
              { sel: '.knowus-divider', anim: 'kuFadeUp .6s .55s cubic-bezier(.16, 1, .3, 1) forwards' },
              { sel: '.knowus-desc', anim: 'kuFadeUp .8s .60s cubic-bezier(.16, 1, .3, 1) forwards' },
              { sel: '.knowus-btn-wrap', anim: 'kuFadeUp .7s .85s cubic-bezier(.16, 1, .3, 1) forwards' },
              { sel: '.knowus-rule', anim: 'kuFadeUp .6s 1.0s cubic-bezier(.16, 1, .3, 1) forwards' },
            ];
            map.forEach(({ sel, anim }) => {
              const el = inner.querySelector(sel);
              if (!el) return;
              el.style.animation = anim;
            });
          }
          const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) { playKu(); }
              else { resetKu(); }
            });
          }, { threshold: .25 });
          obs.observe(document.getElementById('sec-knowus'));
        })();


        /* ══ MOTION EFFECTS ══ */

        /* 1. Scroll progress bar */
        window.addEventListener('scroll', () => {
          const el = document.getElementById('scrollProgress');
          if (!el) return;
          const pct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          el.style.width = pct + '%';
        }, { passive: true });

        /* 2. Universal reveal observer - Enhanced */
        const revealObs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              e.target.classList.add('revealed');
            }
          });
        }, { threshold: .1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal, .reveal-on-scroll, .reveal-stagger, #sec-committee, #sec-subcommittee').forEach(el => revealObs.observe(el));

        /* 3. Committee section — header + dots/arrows + slider reset to 1st */
        const commSec = document.querySelector('#sec-committee');
        if (commSec) {
          let commAnimDone = false;
          new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                if (!commAnimDone) {
                  commSec.classList.add('comm-visible'); // header animate — ഒരു തവണ മാത്രം
                  commAnimDone = true;
                }
                // slider reset — every time (slider behaviour is ok to repeat)
                stopAuto(); busy = false; goToReal(0);
                setTimeout(() => startAuto(), 400);
              }
            });
          }, { threshold: .2 }).observe(commSec);
        }

        /* 4. Wave divider ornament */
        const wdEl = document.querySelector('.wave-divider');
        if (wdEl) {
          new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) wdEl.classList.add('wd-vis'); });
          }, { threshold: .3 }).observe(wdEl);
        }

        /* 5. Footer stagger */
        const footerEl = document.querySelector('footer');
        if (footerEl) {
          new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) footerEl.classList.add('ft-vis'); });
          }, { threshold: .1 }).observe(footerEl);
        }

        /* ── SCROLL TO TOP ── */
        (function () {
          const btn = document.getElementById('scrollTop');
          if (!btn) return;

          function checkScroll() {
            btn.classList.toggle('visible', window.scrollY > 200);
          }
          window.addEventListener('scroll', checkScroll, { passive: true });
          checkScroll();

          btn.addEventListener('click', () => {
            const start = window.scrollY;
            const dur = 700;
            let startTime = null;

            function easeInOutCubic(t) {
              return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function step(ts) {
              if (!startTime) startTime = ts;
              const elapsed = ts - startTime;
              const progress = Math.min(elapsed / dur, 1);
              const ease = easeInOutCubic(progress);
              window.scrollTo(0, start * (1 - ease));
              if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);

          });
        })();

        /* ══ EVENTS SECTION ANIMATION ══ */
        (function () {
          const evSec = document.getElementById('sec-events');
          const evCards = document.querySelectorAll('.ev-card');
          if (!evSec) return;

          function playEvents() {
            evSec.classList.add('ev-ready');
            evCards.forEach((card, i) => {
              card.style.setProperty('--ev-delay', (i * 0.11) + 's');
              card.classList.add('ev-animate');
            });
          }

          const evObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                playEvents();
                evObs.disconnect(); // ഒരു തവണ മാത്രം — പിന്നെ observe ചെയ്യില്ല
              }
            });
          }, { threshold: .12 });
          evObs.observe(evSec);
        })();

        /* ══ NOTIFICATIONS SECTION ANIMATION ══ */
        (function () {
          const strip = document.querySelector('.notif-strip');
          const notifCards = document.querySelectorAll('.notif-card');
          const admBanner = document.querySelector('.adm-banner');
          if (!strip) return;

          // Inject live pulse dots into each notif-date
          notifCards.forEach(card => {
            const dateEl = card.querySelector('.notif-date');
            if (dateEl && !dateEl.querySelector('.notif-pulse-dot')) {
              const dot = document.createElement('span');
              dot.className = 'notif-pulse-dot';
              dateEl.appendChild(dot);
            }
          });

          function playNotif() {
            strip.classList.add('notif-ready');
            notifCards.forEach((card, i) => {
              card.style.setProperty('--notif-delay', (i * 0.12) + 's');
              card.classList.add('notif-animate');
            });
          }

          const notifObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
              if (e.isIntersecting) {
                playNotif();
                notifObs.disconnect(); // ഒരു തവണ മാത്രം
              }
            });
          }, { threshold: .1 });
          notifObs.observe(strip);

          // Admission CTA Banner — reveal on scroll into view
          if (admBanner) {
            function playAdm() { admBanner.classList.add('adm-ready'); }
            const admObs = new IntersectionObserver((entries) => {
              entries.forEach(e => {
                if (e.isIntersecting) {
                  playAdm();
                  admObs.disconnect(); // ഒരു തവണ മാത്രം
                }
              });
            }, { threshold: .15 });
            admObs.observe(admBanner);
          }
        })();

        /* ══════════════════════════════════════
           CAMPUS LIVE — SLIDESHOW + UPLOAD
        ══════════════════════════════════════ */
        (function () {
          var PASS = '4411';
          var KEY = 'cl_v2';
          var dur = 5000;
          var cur = 0, raf = null, t0 = null, autotimer = null;
          var list = [];
          try { list = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { }

          var wrap = document.getElementById('clSlidesWrap');
          var dotsWrap = document.getElementById('clDots');
          var progFill = document.getElementById('clProgFill');
          var countEl = document.getElementById('clCount');
          var pendFiles = [];

          /* ────── SLIDESHOW ────── */
          function allSlides() { return wrap.querySelectorAll('.cl-slide'); }

          function goTo(n) {
            var ss = allSlides();
            if (!ss.length) return;
            var prevVid = ss[cur] && ss[cur].querySelector('video');
            if (prevVid) { prevVid.pause(); prevVid.currentTime = 0; }
            ss[cur].classList.remove('cl-active');
            dotsWrap.querySelectorAll('.cl-dot')[cur] && dotsWrap.querySelectorAll('.cl-dot')[cur].classList.remove('cl-dot-on');

            cur = ((n % ss.length) + ss.length) % ss.length;
            ss[cur].classList.add('cl-active');
            dotsWrap.querySelectorAll('.cl-dot')[cur] && dotsWrap.querySelectorAll('.cl-dot')[cur].classList.add('cl-dot-on');
            if (countEl) countEl.textContent = (cur + 1) + ' / ' + ss.length;

            var vid = ss[cur].querySelector('video');
            if (vid) {
              vid.muted = true;
              vid.currentTime = 0;
              var playPromise = vid.play();
              if (playPromise !== undefined) {
                playPromise.catch(function () {
                  // retry once after short delay
                  setTimeout(function () { vid.play().catch(function () { }); }, 300);
                });
              }
              vid.onended = function () { goTo(cur + 1); };
              startProg(true, vid);
            } else {
              startProg(false, null);
            }
          }

          function startProg(isVid, vid) {
            cancelAnimationFrame(raf); clearTimeout(autotimer); t0 = null;
            if (progFill) progFill.style.width = '0%';
            if (isVid && vid) {
              vid.addEventListener('timeupdate', function () {
                if (!vid.duration) return;
                if (progFill) progFill.style.width = (vid.currentTime / vid.duration * 100) + '%';
              });
            } else {
              raf = requestAnimationFrame(function tick(ts) {
                if (!t0) t0 = ts;
                var p = Math.min((ts - t0) / dur * 100, 100);
                if (progFill) progFill.style.width = p + '%';
                if (p < 100) { raf = requestAnimationFrame(tick); }
                else { autotimer = setTimeout(function () { goTo(cur + 1); }, 0); }
              });
            }
          }

          function rebuildDots(n) {
            dotsWrap.innerHTML = '';
            for (var i = 0; i < n; i++) {
              var d = document.createElement('span');
              d.className = 'cl-dot' + (i === 0 ? ' cl-dot-on' : '');
              d.dataset.i = i;
              (function (idx) { d.addEventListener('click', function () { goTo(idx); }); })(i);
              dotsWrap.appendChild(d);
            }
          }

          function setControls(show) {
            var prev = document.getElementById('clPrev');
            var next = document.getElementById('clNext');
            var disp = show ? '' : 'none';
            if (prev) prev.style.display = disp;
            if (next) next.style.display = disp;
            if (dotsWrap) dotsWrap.style.display = show ? 'flex' : 'none';
            if (progFill && progFill.parentElement) progFill.parentElement.style.display = disp;
            if (countEl) countEl.style.display = disp;
          }

          function buildSlides() {
            wrap.querySelectorAll('.cl-slide:not([data-default])').forEach(function (s) { s.remove(); });
            var def = wrap.querySelector('[data-default]');
            if (!list.length) {
              if (def) def.style.display = '';
              rebuildDots(0); setControls(false); cur = 0;
              /* just show the default, no animation */
              var ss = allSlides();
              if (ss.length) { ss[0].classList.add('cl-active'); }
              cancelAnimationFrame(raf); clearTimeout(autotimer);
              if (progFill) progFill.style.width = '0%';
              return;
            }
            if (def) def.style.display = 'none';
            list.forEach(function (m, i) {
              var d = document.createElement('div');
              d.className = 'cl-slide' + (i === 0 ? ' cl-active' : '');
              if (m.type === 'video') {
                d.innerHTML = '<video muted playsinline autoplay src="' + m.src + '"></video>'
                  + '<div class="cl-ov"></div>'
                  + '<div class="cl-cap"><span class="cl-cap-tag">' + (m.tag || '🎬 Video') + '</span><p class="cl-cap-text">' + (m.caption || '') + '</p></div>'
                  + '<div class="cl-vid-badge">▶ VIDEO</div>';
              } else {
                d.innerHTML = '<img src="' + m.src + '" alt="slide" />'
                  + '<div class="cl-ov"></div>'
                  + '<div class="cl-cap"><span class="cl-cap-tag">' + (m.tag || '📍 Campus') + '</span><p class="cl-cap-text">' + (m.caption || '') + '</p></div>';
              }
              wrap.appendChild(d);
            });
            var multi = list.length > 1;
            rebuildDots(multi ? list.length : 0);
            setControls(multi);
            cur = 0;
            if (multi) {
              goTo(0);
            } else {
              /* 1 photo മാത്രം — show ചെയ്യുക, auto-advance വേണ്ട */
              cancelAnimationFrame(raf); clearTimeout(autotimer);
              if (progFill) progFill.style.width = '0%';
              var ss = allSlides();
              if (ss.length) { ss[0].classList.add('cl-active'); }
            }
          }

          document.getElementById('clPrev')?.addEventListener('click', function () { goTo(cur - 1); });
          document.getElementById('clNext')?.addEventListener('click', function () { goTo(cur + 1); });

          /* swipe */
          var tx = 0;
          var sliderEl = document.getElementById('clSlider');
          sliderEl.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
          sliderEl.addEventListener('touchend', function (e) {
            var dx = e.changedTouches[0].clientX - tx;
            if (Math.abs(dx) > 40) goTo(cur + (dx < 0 ? 1 : -1));
          });

          /* ────── PASSWORD MODAL ────── */
          var pwOverlay = document.getElementById('clPwOverlay');
          var pwBox = document.getElementById('clPwBox');
          var pwInput = document.getElementById('clPwInput');
          var pwErr = document.getElementById('clPwErr');

          function openPw() {
            pwInput.value = ''; pwErr.textContent = '';
            pwBox.classList.remove('cl-err', 'cl-shake');
            pwOverlay.classList.add('cl-show');
            setTimeout(function () { pwInput.focus(); }, 150);
          }
          function closePw() {
            pwOverlay.classList.remove('cl-show');
          }
          function checkPw() {
            if (pwInput.value === PASS) {
              closePw(); openPanel();
            } else {
              pwErr.textContent = 'Wrong password. Try again.';
              pwBox.classList.add('cl-err');
              pwBox.classList.remove('cl-shake');
              void pwBox.offsetWidth;
              pwBox.classList.add('cl-shake');
              pwInput.select();
            }
          }

          document.getElementById('clAddBtn')?.addEventListener('click', openPw);
          document.getElementById('clPwOk')?.addEventListener('click', checkPw);
          document.getElementById('clPwCancel')?.addEventListener('click', closePw);
          document.getElementById('clPwEye')?.addEventListener('click', function () {
            pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
          });
          pwInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') checkPw(); });
          pwOverlay.addEventListener('click', function (e) { if (e.target === pwOverlay) closePw(); });

          /* ────── UPLOAD PANEL ────── */
          var panelOverlay = document.getElementById('clPanelOverlay');
          var dropEl = document.getElementById('clDrop');
          var fileInput = document.getElementById('clFileInput');
          var capInput = document.getElementById('clCapInput');
          var tagInput = document.getElementById('clTagInput');
          var addBtn = document.getElementById('clPanelAdd');
          var mediaList = document.getElementById('clMediaList');

          function openPanel() { panelOverlay.classList.add('cl-show'); renderList(); }
          function closePanel() {
            panelOverlay.classList.remove('cl-show');
            pendFiles = []; capInput.value = ''; tagInput.value = '';
            addBtn.disabled = true; addBtn.textContent = 'Add to Slideshow';
            dropEl.querySelector('.cl-drop-txt').innerHTML = 'Drag &amp; drop here<br/><span style="color:#000066;font-weight:600;text-decoration:underline">or click to browse</span>';
            fileInput.value = '';
          }

          document.getElementById('clPanelClose')?.addEventListener('click', closePanel);
          panelOverlay.addEventListener('click', function (e) { if (e.target === panelOverlay) closePanel(); });

          dropEl.addEventListener('click', function () { fileInput.click(); });
          dropEl.addEventListener('dragover', function (e) { e.preventDefault(); dropEl.classList.add('cl-over'); });
          dropEl.addEventListener('dragleave', function () { dropEl.classList.remove('cl-over'); });
          dropEl.addEventListener('drop', function (e) {
            e.preventDefault(); dropEl.classList.remove('cl-over');
            setFiles(e.dataTransfer.files);
          });
          fileInput.addEventListener('change', function () { setFiles(fileInput.files); });

          function setFiles(files) {
            pendFiles = Array.from(files);
            if (pendFiles.length) {
              addBtn.disabled = false;
              addBtn.textContent = 'Add ' + pendFiles.length + ' file' + (pendFiles.length > 1 ? 's' : '') + ' →';
              dropEl.querySelector('.cl-drop-txt').innerHTML = pendFiles.map(function (f) { return '<b>' + f.name + '</b>'; }).join('<br/>');
            }
          }

          addBtn.addEventListener('click', function () {
            if (!pendFiles.length) return;
            addBtn.disabled = true; addBtn.textContent = 'Adding…';
            var done = 0;
            pendFiles.forEach(function (file) {
              var r = new FileReader();
              r.onload = function (e) {
                list.push({
                  type: file.type.startsWith('video') ? 'video' : 'image',
                  src: e.target.result,
                  caption: capInput.value.trim(),
                  tag: tagInput.value.trim(),
                  name: file.name
                });
                done++;
                if (done === pendFiles.length) {
                  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (er) { }
                  buildSlides(); renderList();
                  pendFiles = []; capInput.value = ''; tagInput.value = '';
                  addBtn.disabled = true; addBtn.textContent = 'Add to Slideshow';
                  dropEl.querySelector('.cl-drop-txt').innerHTML = 'Drag &amp; drop here<br/><span style="color:#000066;font-weight:600;text-decoration:underline">or click to browse</span>';
                  fileInput.value = '';
                }
              };
              r.readAsDataURL(file);
            });
          });

          function renderList() {
            mediaList.innerHTML = '';
            list.forEach(function (m, i) {
              var item = document.createElement('div');
              item.className = 'cl-mitem';
              var thumb = m.type === 'video'
                ? '<div class="cl-mthumb-vid">🎬</div>'
                : '<img class="cl-mthumb" src="' + m.src + '" />';
              item.innerHTML = thumb
                + '<div class="cl-minfo"><div class="cl-mname">' + (m.name || 'File ' + (i + 1)) + '</div>'
                + '<div class="cl-mcap">' + (m.caption || '—') + '</div></div>'
                + '<button class="cl-mdel" data-i="' + i + '">🗑</button>';
              mediaList.appendChild(item);
            });
            mediaList.querySelectorAll('.cl-mdel').forEach(function (btn) {
              btn.addEventListener('click', function () {
                list.splice(+btn.dataset.i, 1);
                try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (er) { }
                buildSlides(); renderList();
              });
            });
          }

          /* ── init ── */
          buildSlides();

        })();

