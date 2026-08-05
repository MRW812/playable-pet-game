document.querySelectorAll('[data-media]').forEach(el => { el.src = MEDIA[el.dataset.media]; });

// Upgrade the existing static payment UI without exposing one-time invoice links.
const style = document.createElement('style');
style.textContent = `
.paypal-live{background:linear-gradient(135deg,#1977d1,#0659a7);color:#fff;box-shadow:0 12px 25px #0b65ba38}
.package-card{position:relative;border:2px solid transparent}.package-card.selected{border-color:#ff7658;box-shadow:0 18px 42px #ff76582b}
.popular{position:absolute;right:15px;top:14px;padding:5px 8px;border-radius:99px;background:#fff0e9;color:#d94d36;font-size:10px;font-weight:900;letter-spacing:.06em}
.order-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.order-step{padding:15px;border-radius:17px;background:#f8f6fa}.order-step strong{display:block;margin-bottom:5px}.order-step span{color:var(--muted);font-size:12px;line-height:1.45}
.invoice-active{display:inline-flex;width:max-content;padding:7px 10px;border-radius:99px;background:#e7f9ef;color:#21845a;font-size:12px;font-weight:900}.invoice-note{margin-top:auto;padding:12px;border-radius:14px;background:#f4f7fb;color:#666078;font-size:12px;line-height:1.5}
@media(max-width:900px){.order-steps{grid-template-columns:1fr 1fr}}@media(max-width:620px){.order-steps{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

const heroPayPal = document.querySelector('.hero .paypal');
if (heroPayPal) {
  heroPayPal.classList.remove('paypal');
  heroPayPal.classList.add('paypal-live');
  heroPayPal.href = '#payment';
  heroPayPal.textContent = 'Pay securely by PayPal invoice';
}

const packageCards = [...document.querySelectorAll('#packages .reviews > .card')];
packageCards.forEach(card => {
  const button = card.querySelector('.package');
  if (!button) return;
  const name = button.dataset.package;
  card.classList.add('package-card');
  card.dataset.card = name;
  button.textContent = `Request ${name} invoice`;
  if (name === 'Standard') {
    card.classList.add('selected');
    const badge = document.createElement('span');
    badge.className = 'popular';
    badge.textContent = 'MOST POPULAR';
    card.prepend(badge);
  }
});

const payment = document.getElementById('payment');
if (payment) {
  payment.innerHTML = `
    <span class="kicker">ORDER & PAYMENT</span>
    <h2>Pay securely with a PayPal invoice</h2>
    <p class="sub">PayPal invoicing is active. Each customer receives a new invoice created specifically for their order after the pet photo and customization details are confirmed.</p>
    <div class="order-steps">
      <div class="order-step"><strong>1. Choose package</strong><span>Select Starter, Standard or Premium.</span></div>
      <div class="order-step"><strong>2. Email details</strong><span>Attach your pet photo and personalization request.</span></div>
      <div class="order-step"><strong>3. Receive invoice</strong><span>We send your private PayPal invoice by email.</span></div>
      <div class="order-step"><strong>4. Pay & create</strong><span>Production begins after payment and details are confirmed.</span></div>
    </div>
    <div class="pay">
      <div class="card">
        <i>✉️</i>
        <b id="selectedPackage">Standard package selected · $39</b>
        <p>Attach the pet photo and include the pet name, favorite treat or toy, and optional ending message.</p>
        <a id="email" class="btn green" href="#">Email order details for Standard</a>
      </div>
      <div class="card">
        <span class="invoice-active">✓ PayPal invoicing available</span>
        <b>Private invoice for every order</b>
        <p>For security and accurate order records, invoice links are created separately for each customer and are not posted publicly or reused.</p>
        <div class="invoice-note">PayPal may offer PayPal balance, eligible cards and other payment methods depending on the buyer's country.</div>
      </div>
    </div>`;
}

const slides = [...document.querySelectorAll('.slide')];
const dots = document.getElementById('dots');
let si = 0;
let timer;
slides.forEach((_, i) => {
  const b = document.createElement('button');
  b.className = 'dot';
  b.onclick = () => go(i);
  dots.appendChild(b);
});
function go(i) {
  si = (i + slides.length) % slides.length;
  slides.forEach((s, j) => s.classList.toggle('active', j === si));
  [...dots.children].forEach((d, j) => d.classList.toggle('active', j === si));
  clearInterval(timer);
  timer = setInterval(() => go(si + 1), 4500);
}
go(0);

const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('show');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(e => io.observe(e));

const prices = { Starter: 19, Standard: 39, Premium: 69 };
let pack = 'Standard';
function emailUrl() {
  const subject = encodeURIComponent(`${pack} Custom Pet Game Order`);
  const body = encodeURIComponent(
`Hi, I would like to order a custom pet game.

Package: ${pack} ($${prices[pack]})
Pet name:
Favorite treat or toy:
Ending message:
Other requests:

I will attach the pet photo. Please confirm the details and send me a secure PayPal invoice.`
  );
  return `mailto:ereyaim@gmail.com?subject=${subject}&body=${body}`;
}
function refreshOrder() {
  document.querySelectorAll('.package-card').forEach(card => card.classList.toggle('selected', card.dataset.card === pack));
  const label = document.getElementById('selectedPackage');
  const email = document.getElementById('email');
  if (label) label.textContent = `${pack} package selected · $${prices[pack]}`;
  if (email) {
    email.href = emailUrl();
    email.textContent = `Email order details for ${pack}`;
  }
}
document.querySelectorAll('.package').forEach(a => {
  a.onclick = () => {
    pack = a.dataset.package || 'Standard';
    refreshOrder();
  };
});
refreshOrder();

document.getElementById('year').textContent = new Date().getFullYear();
const screens = {
  start: [MEDIA.start, 'Personalized opening', 'Pet portrait, game title, sound control and clear instructions.'],
  game: [MEDIA.game, 'Collect, avoid and score', 'Bright items, danger markers and responsive movement make the rules easy to understand.'],
  result: [MEDIA.result, 'Gift-ready ending', 'A personalized score screen makes the experience feel complete and shareable.']
};
document.querySelectorAll('.tab').forEach(button => button.onclick = () => {
  document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === button));
  const data = screens[button.dataset.i];
  screenImg.src = data[0];
  screenTitle.textContent = data[1];
  screenText.textContent = data[2];
});
