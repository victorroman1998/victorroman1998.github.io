(() => {
  const progress = document.getElementById('scroll-progress-fill');
  let scheduled = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? Math.min(100, window.scrollY / max * 100) : 0}%`;
    scheduled = false;
  }
  function scheduleProgress() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateProgress);
    }
  }
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress);
  updateProgress();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.intro-grid > *, .results-head, .result-slide, .lepto-intro, .lepto-figure, .section-head, .area-label, .work-card, .advising-grid > div, .profile-grid > div, .demo-intro > div, .demo-intro > p, .cox-figure, .cox-layout > .study-panel, .contact-options > article');
    targets.forEach(el => el.setAttribute('data-reveal', ''));
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(el => observer.observe(el));
  }

  const panel = document.querySelector('[data-study-panel]');
  if (!panel) return;
  const english = document.documentElement.lang === 'en';
  const values = english ? [
    { value: '51', label: 'patients included', detail: 'Retrospective cohort of pediatric transplant recipients.', width: 100 },
    { value: '19 / 51', label: 'had HHV-6 detected', detail: 'Detection during the first 30 days after transplantation (37.3%).', width: 37.3 },
    { value: 'Days 12–25', label: 'most detection events', detail: 'Most HHV-6 detections were concentrated in this period.', width: 60 }
  ] : [
    { value: '51', label: 'pacientes incluidos', detail: 'Cohorte retrospectiva de pacientes pediátricos trasplantados.', width: 100 },
    { value: '19 / 51', label: 'con HHV-6 detectado', detail: 'Detección durante los primeros 30 días tras el trasplante (37,3 %).', width: 37.3 },
    { value: 'Días 12–25', label: 'concentración de eventos', detail: 'La mayoría de detecciones de HHV-6 ocurrió durante este periodo.', width: 60 }
  ];
  const tabs = [...panel.querySelectorAll('[role="tab"]')];
  const tabPanel = document.getElementById('study-panel');
  function select(index) {
    const item = values[index];
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    tabPanel.setAttribute('aria-labelledby', tabs[index].id);
    document.getElementById('study-value').textContent = item.value;
    document.getElementById('study-label').textContent = item.label;
    document.getElementById('study-detail').textContent = item.detail;
    document.getElementById('study-fill').style.width = `${item.width}%`;
    panel.querySelector('.study-top span:last-child').textContent = `0${index + 1} / 03`;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(next);
        tabs[next].focus();
      }
    });
  });
})();

(() => {
  const toggle = document.querySelector('[data-theme-toggle]');
  const label = toggle?.querySelector('[data-theme-text]');
  const english = document.documentElement.lang === 'en';
  const setLabel = () => {
    if (label) label.textContent = document.documentElement.dataset.theme === 'dark'
      ? (english ? 'Light' : 'Claro') : (english ? 'Dark' : 'Oscuro');
  };
  setLabel();
  toggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('site-theme', next); } catch {}
    setLabel();
  });

  const track = document.querySelector('[data-result-track]');
  if (!track) return;
  const slides = [...track.querySelectorAll('.result-slide')];
  const count = document.querySelector('[data-carousel-count]');
  const prev = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  let active = 0;
  const show = index => {
    active = Math.max(0, Math.min(slides.length - 1, index));
    const left = slides[active].getBoundingClientRect().left - track.getBoundingClientRect().left + track.scrollLeft;
    track.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    update();
  };
  const update = () => {
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    let best = Infinity;
    slides.forEach((slide, index) => {
      const rect = slide.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      if (distance < best) { best = distance; active = index; }
    });
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    prev.disabled = active === 0;
    next.disabled = active === slides.length - 1;
  };
  prev?.addEventListener('click', () => show(active - 1));
  next?.addEventListener('click', () => show(active + 1));
  track.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      show(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  window.addEventListener('resize', update);
  update();
})();
