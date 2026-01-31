document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navContainer = document.querySelector('.nav-container');
    const navCloseBtn = document.querySelector('.nav-close-btn');
    const navLinks = document.querySelectorAll('.nav-links a');

    function toggleMenu() {
        mobileMenuBtn.classList.toggle('active');
        navContainer.classList.toggle('active');
        document.body.style.overflow = navContainer.classList.contains('active') ? 'hidden' : '';
    }

    function closeMenu() {
        mobileMenuBtn.classList.remove('active');
        navContainer.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (mobileMenuBtn && navContainer) {
        mobileMenuBtn.addEventListener('click', toggleMenu);

        if (navCloseBtn) {
            navCloseBtn.addEventListener('click', closeMenu);
        }

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // 2. Typewriter Effect
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const roles = ["Software Developer", "Web Designer", "UI/UX Designer"];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentRole = roles[roleIndex];
            if (isDeleting) {
                typewriterElement.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                isDeleting = true;
                setTimeout(type, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                setTimeout(type, 500);
            } else {
                setTimeout(type, isDeleting ? 50 : 150);
            }
        }
        type();
    }

    // 3. Universal Reveal Observer
    // Target any element with 'reveal' class, plus main sections
    const observerItems = document.querySelectorAll('.reveal, .section, .hero-content, .project-card, .skill-category, .timeline-item, .cert-card');

    // Ensure all items start with reveal class if they don't have it
    observerItems.forEach(item => {
        if (!item.classList.contains('reveal')) item.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: "0px 0px -20px 0px"
    });

    observerItems.forEach(el => revealObserver.observe(el));

    // 5. Cursor Glow
    const cursorGlow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        if (cursorGlow) {
            cursorGlow.style.left = e.clientX + 'px';
            cursorGlow.style.top = e.clientY + 'px';
        }
    });
    // 6. Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = 'Sending...';
            btn.disabled = true;

            const formData = new FormData(contactForm);

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    btn.textContent = 'Message Sent!';
                    btn.style.backgroundColor = 'var(--accent-secondary)';
                    contactForm.reset();
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                        btn.style.backgroundColor = '';
                    }, 5000);
                })
                .catch(error => {
                    console.error('Error:', error);
                    btn.textContent = 'Error! Try again.';
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.disabled = false;
                    }, 3000);
                });
        });
    }
});

/**
 * Global Lightbox Functions
 * Defined outside DOMContentLoaded to ensure availability
 */
window.openLightbox = function (src, cap) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');

    if (lb && img) {
        img.src = src;
        caption.textContent = cap || "";
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log("Lightbox triggered for:", src);
    } else {
        console.error("Lightbox DOM elements missing!");
    }
};

window.closeLightbox = function () {
    const lb = document.getElementById('lightbox');
    if (lb) {
        lb.classList.remove('active');
        document.body.style.overflow = '';
    }
};
