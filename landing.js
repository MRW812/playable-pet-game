(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fixStyle = document.createElement('style');
  fixStyle.textContent = `
    .package-card{cursor:pointer;position:relative;outline:none}
    .package-card:focus-visible{box-shadow:0 0 0 4px #ff765838,0 18px 42px #ff76582b}
    .package-card .popular{position:static!important;float:right;margin:-5px 0 10px 12px;white-space:nowrap}
    .package-card .priceRow{clear:both}
    .package-card.selected{transform:translateY(-3px)}
    @media(max-width:620px){.package-card .popular{float:none;margin:0 0 10px 0}.package-card .priceRow{clear:none}}
  `;
  document.head.appendChild(fixStyle);

  const mediaElements = [...document.querySelectorAll('[data-media]')];
  mediaElements.forEach(el => {
    el.decoding = 'async';
    if (!el.closest('.slide:first-child')) el.loading = 'lazy';
  });
  const assignMedia = el => {
    const src = window.MEDIA?.[el.dataset.media];
    if (src && !el.src) el.src = src;
  };
  const firstHero = document.querySelector('.slide:first-child [data-media]');
  if (firstHero) assignMedia(firstHero);
  const assignRemaining = () => mediaElements.forEach(assignMedia);
  if ('requestIdleCallback' in window) requestIdleCallback(assignRemaining, { timeout: 1200 });
  else setTimeout(assignRemaining, 80);

  const plans = {
    Starter: { price: 19, url: 'https://www.paypal.com/ncp/payment/6AX6N8ANPWWXC', description: 'One pet, one playable level, personalized name and ending, plus one revision.' },
    Standard: { price: 39, url: 'https://www.paypal.com/ncp/payment/N6Q9FTU5CBJDL', description: 'Gift-ready version, custom ending headline, two revisions and a downloadable backup copy.' },
    Premium: { price: 69, url: 'https://www.paypal.com/ncp/payment/BC5NERWPGKKC2', description: 'Two pets or extra themed items, priority delivery and additional visual polish.' }
  };

  let pack = 'Standard';
  try {
    const saved = localStorage.getItem('petGamePlan');
    if (saved && plans[saved]) pack = saved;
  } catch (_) {}

  function emailUrl() {
    const p = plans[pack];
    const subject = encodeURIComponent(`${pack} Custom Pet Game Order`);
    const body = encodeURIComponent(`Hi, I have selected the ${pack} package ($${p.price}) for a custom pet game.\n\nPayPal checkout email:\nPayPal transaction ID (if already paid):\nPet name:\nFavorite treat or toy:\nEnding message:\nOther requests:\n\nI will attach the pet photo to this email.`);
    return `mailto:ereyaim@gmail.com?subject=${subject}&body=${body}`;
  }

  function refreshOrder(scrollToPayment = false) {
    const p = plans[pack];
    document.querySelectorAll('.package-card').forEach(card => {
      const selected = card.dataset.card === pack;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-selected', selected ? 'true' : 'false');
      const button = card.querySelector('.package');
      if (button) {
        button.classList.toggle('green', selected);
        button.classList.toggle('white', !selected);
        button.textContent = selected ? `${pack} selected` : `Select ${card.dataset.card}`;
        button.setAttribute('aria-pressed', selected ? 'true' : 'false');
      }
    });

    const label = document.getElementById('selectedPackage');
    const desc = document.getElementById('selectedDescription');
    const checkout = document.getElementById('checkoutButton');
    const email = document.getElementById('email');
    if (label) label.textContent = `${pack} package selected · $${p.price}`;
    if (desc) desc.textContent = p.description;
    if (checkout) {
      checkout.href = p.url;
      checkout.textContent = `Pay $${p.price} with PayPal`;
      checkout.setAttribute('aria-label', `Pay for the ${pack} package with PayPal`);
    }
    if (email) {
      email.href = emailUrl();
      email.textContent = `Email ${pack} order details`;
    }
    try { localStorage.setItem('petGamePlan', pack); } catch (_) {}
    if (scrollToPayment) document.getElementById('payment')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function selectPackage(name, scroll = true) {
    if (!plans[name]) return;
    pack = name;
    refreshOrder(scroll);
  }

  document.querySelectorAll('.package-card').forEach(card => {
    const name = card.dataset.card;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Select ${name} package`);
    card.addEventListener('click', event => {
      if (event.target.closest('.package')) return;
      selectPackage(name, true);
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectPackage(name, true);
      }
    });
  });
  document.querySelectorAll('.package').forEach(button => {
    button.addEventListener('click', event => {
      event.stopPropagation();
      selectPackage(button.dataset.package || 'Standard', true);
    });
  });
  refreshOrder();

  const slides = [...document.querySelectorAll('.slide')];
  const dots = document.getElementById('dots');
  const slider = document.getElementById('slider');
  let slideIndex = 0;
  let timer;
  let touchX = null;

  slides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.className = 'dot';
    button.type = 'button';
    button.setAttribute('aria-label', `Show ${slide.querySelector('b')?.textContent || `case ${index + 1}`}`);
    button.addEventListener('click', () => go(index));
    dots?.appendChild(button);
  });

  function startAuto() {
    clearInterval(timer);
    if (slides.length > 1 && !reducedMotion) timer = setInterval(() => go(slideIndex + 1, false), 4800);
  }
  function go(index, restart = true) {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    const activeImage = slides[slideIndex].querySelector('[data-media]');
    if (activeImage) assignMedia(activeImage);
    slides.forEach((slide, i) => slide.classList.toggle('active', i === slideIndex));
    if (dots) [...dots.children].forEach((dot, i) => dot.classList.toggle('active', i === slideIndex));
    if (restart) startAuto();
  }
  document.querySelector('.sliderArrow.prev')?.addEventListener('click', () => go(slideIndex - 1));
  document.querySelector('.sliderArrow.next')?.addEventListener('click', () => go(slideIndex + 1));
  slider?.addEventListener('mouseenter', () => clearInterval(timer));
  slider?.addEventListener('mouseleave', startAuto);
  slider?.addEventListener('touchstart', event => { touchX = event.touches[0]?.clientX ?? null; }, { passive: true });
  slider?.addEventListener('touchend', event => {
    if (touchX === null) return;
    const dx = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
    if (Math.abs(dx) > 45) go(slideIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });
  go(0);

  const track = document.getElementById('caseTrack');
  const scrollCases = direction => track?.scrollBy({ left: direction * Math.max(280, track.clientWidth * .8), behavior: reducedMotion ? 'auto' : 'smooth' });
  document.querySelector('.casePrev')?.addEventListener('click', () => scrollCases(-1));
  document.querySelector('.caseNext')?.addEventListener('click', () => scrollCases(1));

  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('show'); }), { threshold: .1 }) : null;
  document.querySelectorAll('.reveal').forEach(element => revealObserver ? revealObserver.observe(element) : element.classList.add('show'));

  const screens = {
    start: [window.MEDIA?.start, 'Personalized opening', 'Pet portrait, game title, sound control and clear instructions.'],
    game: [window.MEDIA?.game, 'Collect, avoid and score', 'A correctly cropped pet portrait stays clear while falling items and warning-marked obstacles remain easy to understand.'],
    result: [window.MEDIA?.result, 'Gift-ready ending', 'A personalized score screen makes the experience feel complete and shareable.']
  };
  const screenImage = document.getElementById('screenImg');
  const screenTitle = document.getElementById('screenTitle');
  const screenText = document.getElementById('screenText');
  document.querySelectorAll('.tab').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(tab => tab.classList.toggle('active', tab === button));
      const data = screens[button.dataset.i];
      if (!data) return;
      if (screenImage && data[0]) screenImage.src = data[0];
      if (screenTitle) screenTitle.textContent = data[1];
      if (screenText) screenText.textContent = data[2];
    });
  });

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.navlinks a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }), { rootMargin: '-35% 0px -55%' });
    ['examples', 'packages', 'payment', 'faq'].map(id => document.getElementById(id)).filter(Boolean).forEach(section => navObserver.observe(section));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
