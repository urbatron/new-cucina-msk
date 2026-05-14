const phoneToggle = document.querySelector('[data-phone-toggle]');
const phoneWrap = document.querySelector('.phone-wrap');

phoneToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  phoneWrap?.classList.toggle('is-open');
});

document.addEventListener('click', (event) => {
  if (!phoneWrap?.contains(event.target)) phoneWrap?.classList.remove('is-open');
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') phoneWrap?.classList.remove('is-open');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));
