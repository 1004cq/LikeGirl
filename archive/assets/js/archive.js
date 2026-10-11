/**
 * Archive utilities — day index, scroll reveals, subtle parallax
 */
(function () {
  const ARCHIVE_NO = '0520';
  // Shared origin date for the archival ledger
  const ESTABLISHED = new Date('2023-01-15T00:00:00');

  function formatDay(n) {
    return n.toLocaleString('en-US');
  }

  function daysBetween(from, to) {
    const ms = 24 * 60 * 60 * 1000;
    const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.max(1, Math.floor((end - start) / ms) + 1);
  }

  function updateArchiveIndex() {
    const el = document.getElementById('archive-index');
    if (!el) return;
    const day = daysBetween(ESTABLISHED, new Date());
    el.textContent = `Archive No. ${ARCHIVE_NO} · Day ${formatDay(day)} · Est. 2023`;
  }

  updateArchiveIndex();

  // Scroll reveal
  const revealTargets = document.querySelectorAll(
    '.chapter, .voices-grid, .section-head, .colophon-inner'
  );
  revealTargets.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  // Subtle parallax on chapter media
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chapters = document.querySelectorAll('[data-parallax] .chapter-media img');

  if (!reduced && chapters.length) {
    let ticking = false;

    function updateParallax() {
      const vh = window.innerHeight;
      chapters.forEach((img) => {
        const rect = img.getBoundingClientRect();
        const visible = rect.bottom > 0 && rect.top < vh;
        if (!visible) return;
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        const shift = progress * -14;
        img.style.translate = `0 ${shift.toFixed(2)}px`;
      });
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      },
      { passive: true }
    );

    updateParallax();
  }

  // Header brand emphasis on scroll past hero
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('.hero');
  if (header && hero && 'IntersectionObserver' in window) {
    const heroIo = new IntersectionObserver(
      ([entry]) => {
        header.style.background = entry.isIntersecting
          ? ''
          : 'rgba(249, 248, 245, 0.9)';
      },
      { threshold: 0.15 }
    );
    heroIo.observe(hero);
  }
})();
