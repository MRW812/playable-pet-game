document.querySelectorAll('[data-media]').forEach(el => { el.src = MEDIA[el.dataset.media]; });

const plans = {
  Starter: { price: 19, url: 'https://www.paypal.com/ncp/payment/6AX6N8ANPWWXC', description: 'One pet, one playable level, personalized name and ending, plus one revision.' },
  Standard: { price: 39, url: 'https://www.paypal.com/ncp/payment/N6Q9FTU5CBJDL', description: 'Gift-ready version, custom ending headline, two revisions and a downloadable backup copy.' },
  Premium: { price: 69, url: 'https://www.paypal.com/ncp/payment/BC5NERWPGKKC2', description: 'Two pets or extra themed items, priority delivery and additional visual polish.' }
};
let pack = 'Standard';
try { const saved = localStorage.getItem('petGamePlan'); if (saved && plans[saved]) pack = saved; } catch (_) {}

function emailUrl() {
  const p = plans[pack];
  const subject = encodeURIComponent(`${pack} Custom Pet Game Order`);
  const body = encodeURIComponent(`Hi, I have selected the ${pack} package ($${p.price}) for a custom pet game.\n\nPayPal checkout email:\nPayPal transaction ID (if already paid):\nPet name:\nFavorite treat or toy:\nEnding message:\nOther requests:\n\nI will attach the pet photo to this email.`);
  return `mailto:ereyaim@gmail.com?subject=${subject}&body=${body}`;
}
function refreshOrder(scrollToPayment = false) {
  const p = plans[pack];
  document.querySelectorAll('.package-card').forEach(card => card.classList.toggle('selected', card.dataset.card === pack));
  const label = document.getElementById('selectedPackage');
  const desc = document.getElementById('selectedDescription');
  const checkout = document.getElementById('checkoutButton');
  const email = document.getElementById('email');
  if (label) label.textContent = `${pack} package selected · $${p.price}`;
  if (desc) desc.textContent = p.description;
  if (checkout) { checkout.href = p.url; checkout.textContent = `Pay $${p.price} with PayPal`; checkout.setAttribute('aria-label', `Pay for the ${pack} package with PayPal`); }
  if (email) { email.href = emailUrl(); email.textContent = `Email ${pack} order details`; }
  try { localStorage.setItem('petGamePlan', pack); } catch (_) {}
  if (scrollToPayment) document.getElementById('payment')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('.package').forEach(button => button.addEventListener('click', () => { pack = button.dataset.package || 'Standard'; refreshOrder(true); }));
refreshOrder();

const slides = [...document.querySelectorAll('.slide')], dots = document.getElementById('dots'), slider = document.getElementById('slider');
let si = 0, timer, touchX = null;
slides.forEach((slide, i) => { const b = document.createElement('button'); b.className = 'dot'; b.type = 'button'; b.setAttribute('aria-label', `Show ${slide.querySelector('b')?.textContent || `case ${i + 1}`}`); b.onclick = () => go(i); dots.appendChild(b); });
function go(i, restart = true) { si = (i + slides.length) % slides.length; slides.forEach((s,j) => s.classList.toggle('active',j === si)); [...dots.children].forEach((d,j) => d.classList.toggle('active',j === si)); if (restart) startAuto(); }
function startAuto(){ clearInterval(timer); timer = setInterval(() => go(si + 1, false), 4800); }
document.querySelector('.sliderArrow.prev')?.addEventListener('click', () => go(si - 1));
document.querySelector('.sliderArrow.next')?.addEventListener('click', () => go(si + 1));
slider?.addEventListener('mouseenter', () => clearInterval(timer)); slider?.addEventListener('mouseleave', startAuto);
slider?.addEventListener('touchstart', e => { touchX = e.touches[0]?.clientX ?? null; }, { passive:true });
slider?.addEventListener('touchend', e => { if (touchX === null) return; const dx = (e.changedTouches[0]?.clientX ?? touchX) - touchX; if (Math.abs(dx) > 45) go(si + (dx < 0 ? 1 : -1)); touchX = null; }, { passive:true });
go(0);

const track = document.getElementById('caseTrack');
const scrollCases = n => track?.scrollBy({ left: n * Math.max(280, track.clientWidth * .8), behavior:'smooth' });
document.querySelector('.casePrev')?.addEventListener('click', () => scrollCases(-1));
document.querySelector('.caseNext')?.addEventListener('click', () => scrollCases(1));

const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('show'); }), {threshold:.1}) : null;
document.querySelectorAll('.reveal').forEach(e => io ? io.observe(e) : e.classList.add('show'));

const screens = {
  start:[MEDIA.start,'Personalized opening','Pet portrait, game title, sound control and clear instructions.'],
  game:[MEDIA.game,'Collect, avoid and score','A correctly cropped pet portrait stays clear while falling items and warning-marked obstacles remain easy to understand.'],
  result:[MEDIA.result,'Gift-ready ending','A personalized score screen makes the experience feel complete and shareable.']
};
document.querySelectorAll('.tab').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === button)); const d = screens[button.dataset.i]; screenImg.src = d[0]; screenTitle.textContent = d[1]; screenText.textContent = d[2]; }));

const navSections = ['examples','packages','payment','faq'];
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => entries.forEach(e => { if (!e.isIntersecting) return; document.querySelectorAll('.navlinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`)); }), {rootMargin:'-35% 0px -55%'});
  navSections.map(id => document.getElementById(id)).filter(Boolean).forEach(s => navObserver.observe(s));
}
document.getElementById('year').textContent = new Date().getFullYear();
