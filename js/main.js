/* ===========================================
   LMV ENGENHARIA E CONSTRUÇÕES – main.js
   =========================================== */

(function () {
  'use strict';

  /* ---- Utilities ---- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ========================================================
     1. HEADER — shadow on scroll + active nav highlight
  ======================================================== */
  const header    = $('#header');
  const navLinks  = $$('.nav__link');
  const sections  = $$('main section[id]');
  const headerH   = () => header ? header.offsetHeight : 76;

  function onScroll () {
    /* Shadow */
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
    /* Active link */
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - headerH() - 60) {
        current = sec.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === '#' + current
      );
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ========================================================
     2. HAMBURGER MENU
  ======================================================== */
  const hamburgerBtn = $('#hamburgerBtn');
  const mainNav      = $('#mainNav');

  function closeMenu () {
    if (!mainNav || !hamburgerBtn) return;
    mainNav.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn && mainNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    /* Close when a nav link is clicked */
    $$('.nav__link', mainNav).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    /* Close on outside click */
    document.addEventListener('click', e => {
      if (!mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ========================================================
     3. SMOOTH SCROLL (with fixed header offset)
  ======================================================== */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = $(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - headerH() - 8;
      window.scrollTo({ top: offset, behavior: 'smooth' });
      closeMenu();
    });
  });

  /* ========================================================
     4. FAQ ACCORDION
  ======================================================== */
  const faqItems = $$('.faq__item');

  faqItems.forEach(item => {
    const btn    = $('.faq__question', item);
    const answer = $('.faq__answer', item);
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      /* Close all */
      faqItems.forEach(other => {
        const otherBtn    = $('.faq__question', other);
        const otherAnswer = $('.faq__answer', other);
        other.classList.remove('open');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      /* Open clicked (unless it was already open) */
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        /* Scroll into view if below fold */
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.bottom > window.innerHeight) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 420);
      }
    });
  });

  /* ========================================================
     5. CONTACT FORM — validation + simulated submit
  ======================================================== */
  const contactForm = $('#contactForm');
  const formSuccess = $('#formSuccess');

  const REQUIRED_FIELDS = ['nome', 'telefone', 'cidade', 'terreno', 'projeto', 'servico', 'prazo'];

  function validateField (id) {
    const field = $(`#${id}`);
    const error = $(`#${id}-error`);
    if (!field) return true;
    const empty = field.value.trim() === '' || field.value === '';
    if (error) error.textContent = empty ? 'Este campo é obrigatório.' : '';
    field.classList.toggle('error', empty);
    return !empty;
  }

  function validateAll () {
    return REQUIRED_FIELDS.map(id => validateField(id)).every(Boolean);
  }

  if (contactForm) {
    /* Live validation on blur */
    REQUIRED_FIELDS.forEach(id => {
      const field = $(`#${id}`);
      if (field) {
        field.addEventListener('blur', () => validateField(id));
        field.addEventListener('change', () => validateField(id));
        field.addEventListener('input', () => {
          if (field.classList.contains('error')) validateField(id);
        });
      }
    });

    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateAll()) {
        /* Scroll to first error */
        const firstError = contactForm.querySelector('.error');
        if (firstError) {
          const top = firstError.getBoundingClientRect().top + window.scrollY - headerH() - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        return;
      }

      /* Simulate send */
      const submitBtn = contactForm.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Enviando…';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        if (contactForm && formSuccess) {
          contactForm.style.display = 'none';
          formSuccess.style.display = 'block';
        }
      }, 1200);
    });
  }

  /* ========================================================
     6. SCROLL-REVEAL (Intersection Observer)
  ======================================================== */
  if ('IntersectionObserver' in window) {
    const revealTargets = $$(
      '.service__card, .problem__card, .portfolio__card, .testimonial__card, ' +
      '.qualification__col, .process__step, .faq__item, .contact__card, .location__city'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity    = '1';
          entry.target.style.transform  = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((el, i) => {
      el.style.opacity   = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = `opacity .5s ease ${(i % 4) * 0.1}s, transform .5s ease ${(i % 4) * 0.1}s`;
      observer.observe(el);
    });
  }

  /* ========================================================
     7. PHONE MASK (telefone field)
  ======================================================== */
  const telField = $('#telefone');
  if (telField) {
    telField.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/^(\d{0,2})$/, '($1');
      }
      this.value = v;
    });
  }

})();

// ==================== PORTFOLIO CARROSSEL ====================
let currentSlide = 0;
const carousel = document.getElementById('portfolioCarousel');
const indicators = document.querySelectorAll('.indicator');
const slides = document.querySelectorAll('.portfolio__carousel-item');

// Configuração dos arrays de imagens para cada projeto
const projectImages = {
  1: ['portfolio1.png', 'portfolio11.png', 'portfolio111.png'],
  2: ['portfolio2.png', 'portfolio22.png', 'portfolio222.png'],
  3: ['portfolio3.png', 'portfolio33.png', 'portfolio333.png'],
  4: ['portfolio4.png', 'portfolio44.png', 'portfolio444.png'],
  5: ['portfolio5.png', 'portfolio55.png', 'portfolio555.png']
};

// Estado atual de cada projeto
let currentImageIndex = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0
};

// Função para mudar a imagem de um projeto específico
function changeImage(projectId, direction) {
  const images = projectImages[projectId];
  if (!images) return;
  
  let newIndex = currentImageIndex[projectId] + direction;
  if (newIndex < 0) newIndex = images.length - 1;
  if (newIndex >= images.length) newIndex = 0;
  
  currentImageIndex[projectId] = newIndex;
  
  // Atualiza a imagem principal
  const mainImg = document.getElementById(`mainImg${projectId}`);
  if (mainImg) {
    mainImg.src = `imagens/${images[newIndex]}`;
  }
  
  // Atualiza as miniaturas ativas
  const thumbnails = document.getElementById(`thumbnails${projectId}`);
  if (thumbnails) {
    const thumbs = thumbnails.querySelectorAll('.thumb');
    thumbs.forEach((thumb, idx) => {
      if (idx === newIndex) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }
}

// Função para definir a imagem atual diretamente
function setCurrentImage(projectId, index) {
  currentImageIndex[projectId] = index;
  const images = projectImages[projectId];
  if (!images) return;
  
  const mainImg = document.getElementById(`mainImg${projectId}`);
  if (mainImg) {
    mainImg.src = `imagens/${images[index]}`;
  }
  
  const thumbnails = document.getElementById(`thumbnails${projectId}`);
  if (thumbnails) {
    const thumbs = thumbnails.querySelectorAll('.thumb');
    thumbs.forEach((thumb, idx) => {
      if (idx === index) {
        thumb.classList.add('active');
      } else {
        thumb.classList.remove('active');
      }
    });
  }
}

// Função para rolar o carrossel principal
function scrollCarousel(direction) {
  if (!carousel) return;
  
  const slideWidth = slides[0]?.offsetWidth || 0;
  const gap = 24;
  const scrollAmount = (slideWidth + gap) * direction;
  
  carousel.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
  
  // Atualiza os indicadores após o scroll
  setTimeout(updateIndicators, 300);
}

// Função para ir para um slide específico
function goToSlide(index) {
  if (!carousel || !slides[index]) return;
  
  const slideWidth = slides[0].offsetWidth;
  const gap = 24;
  const scrollPosition = (slideWidth + gap) * index;
  
  carousel.scrollTo({
    left: scrollPosition,
    behavior: 'smooth'
  });
  
  currentSlide = index;
  updateIndicators();
}

// Função para atualizar os indicadores baseado no scroll
function updateIndicators() {
  if (!carousel || !slides.length) return;
  
  const scrollPosition = carousel.scrollLeft;
  const slideWidth = slides[0].offsetWidth;
  const gap = 24;
  const slideTotalWidth = slideWidth + gap;
  
  let activeIndex = Math.round(scrollPosition / slideTotalWidth);
  activeIndex = Math.min(activeIndex, slides.length - 1);
  activeIndex = Math.max(activeIndex, 0);
  
  indicators.forEach((indicator, idx) => {
    if (idx === activeIndex) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
  
  currentSlide = activeIndex;
}

// Event listener para atualizar indicadores ao rolar
if (carousel) {
  carousel.addEventListener('scroll', updateIndicators);
  window.addEventListener('resize', () => {
    setTimeout(updateIndicators, 100);
  });
}

// Inicializar o carrossel
document.addEventListener('DOMContentLoaded', function() {
  updateIndicators();
  
  // Pré-carregar imagens para melhor experiência
  Object.values(projectImages).forEach(images => {
    images.forEach(img => {
      const preloadImg = new Image();
      preloadImg.src = `imagens/${img}`;
    });
  });
});
