(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  const revealItems = [...document.querySelectorAll('.reveal')];
  revealItems.forEach((el) => {
    const delay = Number(el.dataset.delay || 0);
    el.style.setProperty('--delay', `${delay}ms`);
  });

  if (!reduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add('in-view'));
  }

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  const stage = document.getElementById('portraitStage');
  const cyber = document.getElementById('portraitCyber');
  const line = document.getElementById('revealLine');
  if (stage && cyber && line && !reduced) {
    const setReveal = (clientX) => {
      const rect = stage.getBoundingClientRect();
      const x = Math.max(22, Math.min(78, ((clientX - rect.left) / rect.width) * 100));
      cyber.style.setProperty('--cut', `${x}%`);
      line.style.left = `${x}%`;
    };
    stage.addEventListener('pointermove', (event) => setReveal(event.clientX));
    stage.addEventListener('pointerleave', () => {
      cyber.style.setProperty('--cut', '51%');
      line.style.left = '51%';
    });
  }

  if (finePointer && !reduced) {
    document.querySelectorAll('.project-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${py * -2.5}deg) rotateY(${px * 3}deg) translateY(-2px)`;
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  const cursor = document.querySelector('.cursor-dot');
  if (cursor && finePointer && !reduced) {
    window.addEventListener('pointermove', (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.add('visible');
    }, { passive: true });
    document.querySelectorAll('a, button, .project-card, .portrait-stage').forEach((el) => {
      el.addEventListener('pointerenter', () => cursor.classList.add('hovering'));
      el.addEventListener('pointerleave', () => cursor.classList.remove('hovering'));
    });
  }

  const sections = ['about', 'work', 'experience', 'contact']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  const links = [...document.querySelectorAll('.nav a')];
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach((section) => navObserver.observe(section));
  }
})();
