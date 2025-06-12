// Main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
  // Portfolio data

  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }

  // Smooth scrolling for navigation links
  const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');

  smoothScrollLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();

      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (!targetElement) return;

      // Close mobile menu if open
      if (navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuToggle.classList.remove('active');
      }

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

  // Header scroll effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Add fade-in animations to sections
  const sections = document.querySelectorAll('.section');
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  const modal = document.querySelector('#portfolioImageModal');
  const fullImage = document.querySelector('#portfolioFullImage');
  const closeBtn = document.querySelector('.portfolio-modal-close');
  const portfolioLinks = document.querySelectorAll('.show-full-image');

  // Открытие модального окна при клике на кнопку "Смотреть кейс"
  portfolioLinks.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const id = button.getAttribute('data-id');
      const card = document.querySelector(`.portfolio-card[data-id="${id}"]`);
      const img = card.querySelector('.portfolio-img');
      const fullSrc = img.getAttribute('data-full-image');
      if (fullSrc) {
        fullImage.src = fullSrc;
        fullImage.alt = img.alt;
        modal.style.display = 'flex';
        modal.setAttribute('tabindex', '-1');
        modal.focus();
        document.body.style.overflow = 'hidden'; // Скрываем скролл body
      } else {
        console.error(`Атрибут data-full-image не найден для изображения в карточке с data-id="${id}"`);
      }
    });
  });

  // Обработка ошибок загрузки изображения
  fullImage.addEventListener('error', () => {
    fullImage.alt = 'Изображение не найдено';
    fullImage.src = '/src/img/image-not-available.jpg'; // Укажите путь к запасному изображению
  });

  // Закрытие модального окна по клику на крестик
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Восстанавливаем скролл body
  });

  // Закрытие по клику вне изображения
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.style.overflow = ''; // Восстанавливаем скролл body
    }
  });

  // Закрытие по клавише Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      modal.style.display = 'none';
      document.body.style.overflow = ''; // Восстанавливаем скролл body
    }
  });

  const form = document.getElementById('contact-form');
  const loader = document.getElementById('loader');
  const submitBtn = form.querySelector('.submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageDiv = document.getElementById('form-message');
    messageDiv.style.display = 'none';
    messageDiv.classList.remove('success', 'error');

    const recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      messageDiv.textContent = 'Zəhmət olmasa, reCAPTCHA yoxlamasından keçin';
      messageDiv.classList.add('error');
      messageDiv.style.display = 'block';
      return;
    }

    // Показать индикатор загрузки и отключить форму
    loader.style.display = 'flex';
    form.classList.add('form-disabled');
    submitBtn.disabled = true;

    const data = new FormData(form);
    data.append('g-recaptcha-response', recaptchaResponse);

    try {
      const response = await fetch('/send.php', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      grecaptcha.reset();
      messageDiv.textContent = result.message;
      messageDiv.classList.add(response.ok && result.success ? 'success' : 'error');
      messageDiv.style.display = 'block';

      if (response.ok && result.success) {
        form.reset();
        gtag_report_conversion();
        fbq('track', 'Contact');
      }
    } catch (error) {
      messageDiv.textContent = 'Xəta baş verdi: ' + error.message;
      messageDiv.classList.add('error');
      messageDiv.style.display = 'block';
    } finally {
      // Скрыть индикатор загрузки и включить форму
      loader.style.display = 'none';
      form.classList.remove('form-disabled');
      submitBtn.disabled = false;
    }
  });
});