import { ARCHIVE } from '../data/voices';

function daysBetween(from: Date, to: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.floor((end - start) / ms) + 1);
}

export function updateArchiveIndex(el: HTMLElement) {
  const established = new Date(ARCHIVE.established);
  const day = daysBetween(established, new Date());
  el.textContent = `Archive No. ${ARCHIVE.number} · Day ${day.toLocaleString('en-US')} · ${ARCHIVE.establishedLabel}`;
}

export function initReveals() {
  const targets = document.querySelectorAll<HTMLElement>(
    '.chapter, .voices-grid, .section-head, .colophon-inner',
  );
  targets.forEach((el) => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  targets.forEach((el) => io.observe(el));
}

export function initParallax() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chapters = document.querySelectorAll<HTMLImageElement>('[data-parallax] .chapter-media img');
  if (reduced || !chapters.length) return;

  let ticking = false;

  const update = () => {
    const vh = window.innerHeight;
    chapters.forEach((img) => {
      const rect = img.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= vh) return;
      const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
      img.style.translate = `0 ${(progress * -14).toFixed(2)}px`;
    });
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );

  update();
}

export function initHeaderState() {
  const header = document.querySelector<HTMLElement>('.site-header');
  const hero = document.querySelector('.hero');
  if (!header || !hero || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(
    ([entry]) => {
      header.dataset.solid = entry.isIntersecting ? 'false' : 'true';
    },
    { threshold: 0.15 },
  );
  io.observe(hero);
}

export function initArchiveUI() {
  const index = document.getElementById('archive-index');
  if (index) updateArchiveIndex(index);
  initReveals();
  initParallax();
  initHeaderState();
}
