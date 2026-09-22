document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 30);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  menuToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    header.classList.remove('menu-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));

  const cursorGlow = document.querySelector('.cursor-glow');
  if (!reducedMotion && cursorGlow) {
    window.addEventListener('pointermove', (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  const canvas = document.querySelector('.particle-canvas');
  if (canvas && !reducedMotion) {
    const context = canvas.getContext('2d');
    let particles = [];
    const resizeCanvas = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * scale;
      canvas.height = canvas.offsetHeight * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      particles = Array.from({ length: Math.min(55, Math.floor(window.innerWidth / 22)) }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        radius: Math.random() * 1.4 + .3,
        speed: Math.random() * .18 + .04,
        alpha: Math.random() * .35 + .12
      }));
    };
    const drawParticles = () => {
      context.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      particles.forEach((particle) => {
        particle.y -= particle.speed;
        if (particle.y < -5) particle.y = canvas.offsetHeight + 5;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(216, 239, 97, ${particle.alpha})`;
        context.fill();
      });
      requestAnimationFrame(drawParticles);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    drawParticles();
  }

  document.querySelectorAll('[data-count]').forEach((counter) => {
    const target = Number(counter.dataset.count);
    const counterObserver = new IntersectionObserver((entries, observer) => {
      if (!entries[0].isIntersecting) return;
      if (reducedMotion) {
        counter.textContent = `${target}+`;
        observer.disconnect();
        return;
      }
      const start = performance.now();
      const animate = (time) => {
        const progress = Math.min((time - start) / 1000, 1);
        counter.textContent = `${Math.floor(progress * target)}+`;
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      observer.disconnect();
    }, { threshold: .6 });
    counterObserver.observe(counter);
  });

  const filterButtons = document.querySelectorAll('.filter-button');
  const projectCards = document.querySelectorAll('.project-card');
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projectCards.forEach((card) => card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter));
  }));

  const modal = document.querySelector('.modal');
  const modalArt = document.querySelector('#modal-art');
  const modalTitle = document.querySelector('#modal-title');
  const modalCategory = document.querySelector('#modal-category');
  const modalDescription = document.querySelector('#modal-description');
  let lastFocusedElement;
  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
    if (lastFocusedElement) lastFocusedElement.focus();
  };
  const openModal = (card, trigger) => {
    lastFocusedElement = trigger;
    modalTitle.textContent = card.dataset.title;
    modalCategory.textContent = card.dataset.categoryLabel;
    modalDescription.textContent = card.dataset.description;
    modalArt.className = `modal-art ${card.querySelector('.project-visual').className.replace('project-visual', '').trim()}`;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    modal.querySelector('.modal-close').focus();
  };
  projectCards.forEach((card) => card.querySelector('.project-link').addEventListener('click', (event) => openModal(card, event.currentTarget)));
  modal.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  const contactForm = document.querySelector('.contact-form');
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = contactForm.querySelector('.form-status');
    status.textContent = 'Thanks — your message is ready to start something good.';
    contactForm.reset();
  });
});
