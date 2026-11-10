const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const burgerIcon = document.getElementById('burger-icon');
const closeIcon = document.getElementById('close-icon');

document.getElementById('copyright-year').innerText = (new Date().getFullYear());

function toggleMenu() {
    const isClosed = !mobileMenu.classList.contains('open');
    if (isClosed) {
        mobileMenu.classList.add('open');
        burgerIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        mobileMenu.classList.remove('open');
        burgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', toggleMenu);
}

// Close menu on navigation click
document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        burgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    });
});

// Smooth scrolling for navigation links
const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

smoothScrollLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        // Calculate header height for offset
        const headerHeight = document.querySelector('.header').offsetHeight;

        // Smooth scroll to target with header offset
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
});

(function () {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const loader = document.getElementById('lightbox-loader');
    if (!lightbox || !lightboxImg) return;

    let scrollY = 0;
    let lastFocused = null;
    let loadToken = 0;

    function lockScroll() {
        scrollY = window.scrollY || window.pageYOffset;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.top = `-${scrollY}px`;
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }
        document.documentElement.classList.add('lightbox-open');
        document.body.classList.add('lightbox-open');
    }

    function unlockScroll() {
        document.documentElement.classList.remove('lightbox-open');
        document.body.classList.remove('lightbox-open');
        document.body.style.top = '';
        document.body.style.paddingRight = '';
        // Возвращаем позицию без анимации плавного скролла
        const html = document.documentElement;
        const prev = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        window.scrollTo(0, scrollY);
        html.style.scrollBehavior = prev;
    }

    function openLightbox(src, alt) {
        const token = ++loadToken;
        lastFocused = document.activeElement;

        lightboxImg.classList.remove('loaded');
        lightboxImg.alt = alt || '';
        loader.classList.add('active');

        lightbox.hidden = false;
        lockScroll();
        // Следующий кадр, чтобы сработала анимация появления
        requestAnimationFrame(() => lightbox.classList.add('open'));

        const preload = new Image();
        preload.onload = preload.onerror = function () {
            if (token !== loadToken) return; // окно уже закрыли или открыли другое
            lightboxImg.src = src;
            lightboxImg.classList.add('loaded');
            loader.classList.remove('active');
        };
        preload.src = src;

        lightbox.querySelector('.lightbox-close').focus({ preventScroll: true });
    }

    function closeLightbox() {
        if (!lightbox.classList.contains('open')) return;
        loadToken++;
        lightbox.classList.remove('open');
        unlockScroll();
        setTimeout(() => {
            if (!lightbox.classList.contains('open')) {
                lightbox.hidden = true;
                lightboxImg.removeAttribute('src');
                lightboxImg.classList.remove('loaded');
            }
        }, 260);
        if (lastFocused && lastFocused.focus) {
            lastFocused.focus({ preventScroll: true });
        }
    }

    // Открытие по клику на превью (делегирование событий)
    document.addEventListener('click', function (e) {
        const img = e.target.closest('.project-card-img[data-full-image]');
        if (img) {
            openLightbox(img.dataset.fullImage, img.alt);
            return;
        }
        if (e.target.closest('[data-lightbox-close]')) {
            closeLightbox();
        }
    });

    // Закрытие по Esc
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLightbox();
    });

    // Закрытие по клику на свободное место вокруг картинки
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-stage')) {
            closeLightbox();
        }
    });
})();