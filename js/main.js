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
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }
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
  onScroll();

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

    $$('.nav__link', mainNav).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', e => {
      if (!mainNav.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ========================================================
     3. SMOOTH SCROLL
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

      faqItems.forEach(other => {
        const otherBtn    = $('.faq__question', other);
        const otherAnswer = $('.faq__answer', other);
        other.classList.remove('open');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
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
     5. CONTACT FORM
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
        const firstError = contactForm.querySelector('.error');
        if (firstError) {
          const top = firstError.getBoundingClientRect().top + window.scrollY - headerH() - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        return;
      }

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
     6. SCROLL-REVEAL
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
     7. PHONE MASK
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

/* ================================================================
   PORTFOLIO CARROSSEL PRINCIPAL - VERSÃO SIMPLIFICADA E FUNCIONAL
   ================================================================ */

(function () {
  const carouselContainer = document.getElementById('portfolioCarousel');
  const items = carouselContainer ? [...carouselContainer.querySelectorAll('.portfolio__carousel-item')] : [];
  const prevBtn = document.getElementById('mainPrev');
  const nextBtn = document.getElementById('mainNext');
  const indicators = [...document.querySelectorAll('#carouselIndicators .indicator')];

  if (!items.length) {
    console.warn('Nenhum item encontrado no carrossel');
    return;
  }

  let currentIndex = 0;
  let autoPlayInterval = null;
  let isPaused = false;
  const AUTO_PLAY_DELAY = 9500;

  // Função para atualizar a posição do carrossel
  function updateCarousel() {
    const itemWidth = items[0].offsetWidth;
    const gap = 24;
    const slideWidth = itemWidth + gap;
    const translateX = -currentIndex * slideWidth;
    
    carouselContainer.style.transform = `translateX(${translateX}px)`;
    carouselContainer.style.transition = 'transform 0.5s ease-in-out';
    
    // Atualiza indicadores
    indicators.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  // Vai para o próximo slide
  function nextSlide() {
    if (currentIndex < items.length - 1) {
      currentIndex++;
    } else {
      currentIndex = 0; // Volta ao primeiro
    }
    updateCarousel();
    resetAutoPlay();
  }

  // Vai para o slide anterior
  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = items.length - 1; // Vai ao último
    }
    updateCarousel();
    resetAutoPlay();
  }

  // Vai para um slide específico
  function goToSlide(index) {
    if (index >= 0 && index < items.length) {
      currentIndex = index;
      updateCarousel();
      resetAutoPlay();
    }
  }

  // Inicia autoplay
  function startAutoPlay() {
    if (autoPlayInterval) clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, AUTO_PLAY_DELAY);
  }

  // Reinicia autoplay
  function resetAutoPlay() {
    if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      startAutoPlay();
    }
  }

  // Pausa autoplay ao hover
  function pauseAutoPlay() {
    isPaused = true;
  }

  function resumeAutoPlay() {
    isPaused = false;
  }

  // Eventos dos botões
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
    });
  }

  // Eventos dos indicadores
  indicators.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      goToSlide(index);
    });
  });

  // Pausa ao hover no container
  const container = document.getElementById('portfolioContainer');
  if (container) {
    container.addEventListener('mouseenter', pauseAutoPlay);
    container.addEventListener('mouseleave', resumeAutoPlay);
    container.addEventListener('touchstart', pauseAutoPlay, { passive: true });
    container.addEventListener('touchend', () => {
      setTimeout(resumeAutoPlay, 2000);
    });
  }

  // Atualiza ao redimensionar a tela
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      carouselContainer.style.transition = 'none';
      updateCarousel();
      setTimeout(() => {
        carouselContainer.style.transition = 'transform 0.5s ease-in-out';
      }, 50);
    }, 150);
  });

  // Inicializa o carrossel
  function init() {
    // Configura o container
    carouselContainer.style.display = 'flex';
    carouselContainer.style.flexWrap = 'nowrap';
    carouselContainer.style.willChange = 'transform';
    
    // Configura cada item
    items.forEach(item => {
      item.style.flex = '0 0 auto';
      item.style.width = '100%'; // No mobile sempre ocupa 100% do container
    });
    
    // Ajusta largura baseada na tela
    function adjustItemsWidth() {
      const containerWidth = carouselContainer.parentElement.clientWidth;
      let itemsPerView = 1;
      
      if (window.innerWidth > 1024) {
        itemsPerView = 3;
      } else if (window.innerWidth > 768) {
        itemsPerView = 2;
      } else {
        itemsPerView = 1;
      }
      
      const gap = 24;
      const itemWidth = (containerWidth - (gap * (itemsPerView - 1))) / itemsPerView;
      
      items.forEach(item => {
        item.style.width = `${itemWidth}px`;
      });
    }
    
    adjustItemsWidth();
    updateCarousel();
    startAutoPlay();
    
    window.addEventListener('resize', () => {
      adjustItemsWidth();
      updateCarousel();
    });
  }

  init();

  /* ================================================================
     Carrossel INTERNO de fotos por projeto
  ================================================================ */
  
  const INNER_DELAY = 6500;

  function initInnerCarousel(wrapper) {
    const track  = wrapper.querySelector('.portfolio__inner-track');
    const imgs   = track ? [...track.querySelectorAll('img')] : [];
    if (!imgs.length) return;

    const dots     = [...wrapper.querySelectorAll('.portfolio__inner-dots .dot')];
    const prevBtn  = wrapper.querySelector('.carousel__prev');
    const nextBtn  = wrapper.querySelector('.carousel__next');
    const fill     = wrapper.querySelector('.portfolio__progress-bar-fill');
    
    let currentIdx = 0;
    let paused = false;
    let timer = null;
    let autoPlayEnabled = true;

    function goTo(index) {
      currentIdx = (index + imgs.length) % imgs.length;
      track.style.transform = `translateX(-${currentIdx * 100}%)`;
      track.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
      
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIdx);
      });
      
      if (autoPlayEnabled && !paused) {
        resetProgressBar();
      }
    }

    function next() { 
      goTo(currentIdx + 1); 
      if (autoPlayEnabled && !paused) resetProgressBar();
    }
    
    function prev() { 
      goTo(currentIdx - 1);
      if (autoPlayEnabled && !paused) resetProgressBar();
    }

    function resetProgressBar() {
      if (!fill) return;
      fill.style.transition = 'none';
      fill.style.width = '0%';
      void fill.offsetWidth;
      fill.style.transition = `width ${INNER_DELAY}ms linear`;
      fill.style.width = '100%';
    }

    function startAutoplay() {
      if (timer) clearInterval(timer);
      if (!autoPlayEnabled || paused) return;
      
      resetProgressBar();
      timer = setInterval(() => {
        if (!paused && autoPlayEnabled) {
          next();
        }
      }, INNER_DELAY);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        prev();
        stopAutoplay();
        startAutoplay();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        next();
        stopAutoplay();
        startAutoplay();
      });
    }
    
    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(i);
        stopAutoplay();
        startAutoplay();
      });
    });

    const card = wrapper.closest('.portfolio__card');
    if (card) {
      card.addEventListener('mouseenter', () => {
        paused = true;
        stopAutoplay();
      });
      
      card.addEventListener('mouseleave', () => {
        paused = false;
        startAutoplay();
      });
    }

    let touchStartX = 0;
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      paused = true;
      stopAutoplay();
    }, { passive: true });
    
    wrapper.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        if (deltaX < 0) {
          next();
        } else {
          prev();
        }
      }
      setTimeout(() => {
        paused = false;
        startAutoplay();
      }, 1500);
    });

    goTo(0);
    if (autoPlayEnabled) {
      startAutoplay();
    }
  }

  document.querySelectorAll('.portfolio__carousel-images').forEach(wrapper => {
    initInnerCarousel(wrapper);
  });

})();
