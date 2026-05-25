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

/* ================================================================
   PORTFOLIO CARROSSEL ANINHADO — versão corrigida
   Carrossel principal (projetos) + carrossel interno (fotos por projeto)
   ================================================================ */

(function () {

  /* ---------- Carrossel PRINCIPAL (projetos) ---------- */
  const container    = document.getElementById('portfolioContainer');
  const carousel     = document.getElementById('portfolioCarousel');
  const items        = carousel ? [...carousel.querySelectorAll('.portfolio__carousel-item')] : [];
  const indicators   = [...document.querySelectorAll('#carouselIndicators .indicator')];
  const btnPrev      = document.getElementById('mainPrev');
  const btnNext      = document.getElementById('mainNext');

  if (!carousel || !items.length) {
    console.warn('Carrossel não encontrado ou sem itens');
    return;
  }

  console.log(`Carrossel inicializado com ${items.length} projetos`);

  let mainIndex     = 0;
  let mainPaused    = false;
  let mainTimer     = null;
  const MAIN_DELAY  = 6000; // ms entre projetos

  /* Quantos slides visíveis de uma vez - corrigido */
  function getVisibleCount () {
    if (window.innerWidth <= 768)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  /* Obtém a largura real de um item + gap */
  function getItemWidth() {
    if (!items.length) return 300;
    const item = items[0];
    const width = item.offsetWidth;
    const gap = 24; // gap do CSS
    return width + gap;
  }

  function getMaxIndex () {
    const visible = getVisibleCount();
    const max = Math.max(0, items.length - visible);
    console.log(`Visible: ${visible}, Max index: ${max}, Total items: ${items.length}`);
    return max;
  }

  function goToMain (idx) {
    const maxIdx = getMaxIndex();
    mainIndex = Math.max(0, Math.min(idx, maxIdx));
    
    const offset = mainIndex * getItemWidth();
    console.log(`Go to index: ${mainIndex}, Offset: ${offset}px`);
    
    carousel.style.transform = `translateX(-${offset}px)`;
    carousel.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';

    /* Atualiza indicadores */
    indicators.forEach((dot, i) => {
      dot.classList.toggle('active', i === mainIndex);
    });
  }

  function nextMain () {
    const maxIdx = getMaxIndex();
    if (mainIndex >= maxIdx) {
      goToMain(0);
    } else {
      goToMain(mainIndex + 1);
    }
    resetMainAutoplay();
  }
  
  function prevMain () {
    if (mainIndex <= 0) {
      goToMain(getMaxIndex());
    } else {
      goToMain(mainIndex - 1);
    }
    resetMainAutoplay();
  }

  function resetMainAutoplay () {
    clearInterval(mainTimer);
    if (!mainPaused) {
      mainTimer = setInterval(() => { 
        if (!mainPaused) nextMain(); 
      }, MAIN_DELAY);
    }
  }

  function startMainAutoplay () {
    clearInterval(mainTimer);
    mainTimer = setInterval(() => { 
      if (!mainPaused) nextMain(); 
    }, MAIN_DELAY);
  }

  if (btnNext) btnNext.addEventListener('click', nextMain);
  if (btnPrev) btnPrev.addEventListener('click', prevMain);

  indicators.forEach((dot, i) => {
    dot.addEventListener('click', () => { 
      goToMain(i); 
      resetMainAutoplay(); 
    });
  });

  /* Pausa ao hover */
  if (container) {
    container.addEventListener('mouseenter', () => { mainPaused = true; });
    container.addEventListener('mouseleave', () => { mainPaused = false; resetMainAutoplay(); });
    container.addEventListener('touchstart', () => { mainPaused = true; }, { passive: true });
    container.addEventListener('touchend', () => {
      setTimeout(() => { mainPaused = false; resetMainAutoplay(); }, 2000);
    });
  }

  /* Redimensionamento */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      carousel.style.transition = 'none';
      goToMain(Math.min(mainIndex, getMaxIndex()));
      // Restaura transição após redimensionamento
      setTimeout(() => {
        carousel.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
      }, 50);
    }, 150);
  });

  /* Inicializa o carrossel */
  carousel.style.display = 'flex';
  carousel.style.flexWrap = 'nowrap';
  
  // Força um reflow para garantir que os estilos sejam aplicados
  setTimeout(() => {
    goToMain(0);
    startMainAutoplay();
  }, 100);

  /* ================================================================
     Carrossel INTERNO de fotos por projeto (melhorado)
     Cada projeto tem seu próprio carrossel independente
  ================================================================ */
  
  const INNER_DELAY = 4000; // ms entre fotos internas

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
      
      /* Atualiza dots */
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIdx);
      });
      
      /* Reinicia a barra de progresso se autoplay estiver ativo */
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
      // Força reflow
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

    /* Eventos dos botões */
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
    
    /* Eventos dos dots */
    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        goTo(i);
        stopAutoplay();
        startAutoplay();
      });
    });

    /* Pausa ao hover do card pai */
    const card = wrapper.closest('.portfolio__card');
    if (card) {
      card.addEventListener('mouseenter', () => {
        paused = true;
        stopAutoplay();
        if (fill) fill.style.animationPlayState = 'paused';
      });
      
      card.addEventListener('mouseleave', () => {
        paused = false;
        startAutoplay();
      });
    }

    /* Touch swipe */
    let touchStartX = 0;
    let touchStartY = 0;
    
    wrapper.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      paused = true;
      stopAutoplay();
    }, { passive: true });
    
    wrapper.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStartY;
      
      // Só faz swipe se for mais horizontal que vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
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

    /* Inicializa */
    goTo(0);
    
    // Se o wrapper estiver visível, inicia autoplay
    if (autoPlayEnabled) {
      startAutoplay();
    }
  }

  /* Inicializa todos os carrosséis internos */
  document.querySelectorAll('.portfolio__carousel-images').forEach(wrapper => {
    initInnerCarousel(wrapper);
  });

})();
