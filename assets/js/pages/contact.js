// Contact page interactions

        /* ── Intersection Observer for scroll animations ── */
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    // stagger children
                    e.target.querySelectorAll('.info-card, .faq-item').forEach((el, i) => {
                        setTimeout(() => el.classList.add('visible'), i * 100);
                    });
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.info-strip-inner, .form-card, .map-frame, #faqList').forEach(el => observer.observe(el));
        document.querySelectorAll('.faq-item, .cta-band-item').forEach(el => observer.observe(el));

        /* ── FAQ Accordion ── */
        function toggleFaq(btn) {
            const item = btn.parentElement;
            const isOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
            if (!isOpen) item.classList.add('open');
        }

        /* ── Form Submit ── */
        function submitForm() {
            const fname = document.getElementById('fname').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value.trim();
            const consent = document.getElementById('consent').checked;

            if (!fname || !email || !subject || !message) {
                shakeForm(); return;
            }
            if (!consent) {
                alert('Please agree to the privacy policy to continue.'); return;
            }

            // Animate success
            const formBody = document.getElementById('formBody');
            const successMsg = document.getElementById('successMsg');
            formBody.style.transition = 'opacity .3s, transform .3s';
            formBody.style.opacity = '0';
            formBody.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                formBody.style.display = 'none';
                successMsg.style.display = 'block';
            }, 320);
        }

        function shakeForm() {
            const card = document.getElementById('formCard');
            card.style.animation = 'none';
            card.style.transform = 'translateX(-6px)';
            setTimeout(() => card.style.transform = 'translateX(6px)', 80);
            setTimeout(() => card.style.transform = 'translateX(-4px)', 160);
            setTimeout(() => card.style.transform = 'translateX(4px)', 240);
            setTimeout(() => card.style.transform = 'translateX(0)', 320);
        }

        /* ── Form focus glow on inputs ── */
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('focus', () => {
                input.closest('.form-group') && (input.closest('.form-group').querySelector('label').style.color = 'var(--green-mid)');
            });
            input.addEventListener('blur', () => {
                input.closest('.form-group') && (input.closest('.form-group').querySelector('label').style.color = '');
            });
        });
