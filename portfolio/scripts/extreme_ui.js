/**
 * Extreme UI Enhancements
 * - Custom Magnetic Cursor
 * - Spotlight Border Effects for Cards
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Custom Magnetic Cursor ---
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');

    // Create cursor elements if they don't exist
    if (!cursor) {
        const c = document.createElement('div');
        c.id = 'cursor';
        document.body.appendChild(c);
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Instant text cursor updates for basic dot
        const c = document.getElementById('cursor');
        if (c) {
            c.style.left = mouseX + 'px';
            c.style.top = mouseY + 'px';
        }
    });

    // Smooth follower effect
    function animateCursor() {
        // Linear Interpolation (Lerp) for smoothness
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        cursorX += dx * 0.1;
        cursorY += dy * 0.1;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover Effects
    const linkElements = document.querySelectorAll('a, button, .cert-card, .project-card');
    linkElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            const c = document.getElementById('cursor');
            if (c) c.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
            const c = document.getElementById('cursor');
            if (c) c.classList.remove('hovered');
        });
    });


    // --- 2. Spotlight Card Effect ---
    // Adds a glowing border that follows the mouse on cards
    const cards = document.querySelectorAll('.cert-card, .project-card, .education-card, .skill-category');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Set CSS variables for the spotlight position
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
