document.querySelectorAll('[data-media]').forEach(el => { el.src = MEDIA[el.dataset.media]; });

const style = document.createElement('style');
style.textContent = `
.paypal-live{background:linear-gradient(135deg,#1977d1,#0659a7);color:#fff;box-shadow:0 12px 25px #0b65ba38}
.package-card{position:relative;border:2px solid transparent}.package-card.selected{border-color:#ff7658;box-shadow:0 18px 42px #ff76582b;transform:translateY(-3px)}
.popular{position:absolute;right:15px;top:14px;padding:5px 8px;border-radius:99px;background:#fff0e9;color:#d94d36;font-size:10px;font-weight:900;letter-spacing:.06em}
.order-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.order-step{padding:15px;border-radius:17px;background:#f8f6fa}.order-step strong{display:block;margin-bottom:5px}.order-step span{color:var(--muted);font-size:12px;line-height:1.45}
.invoice-active{display:inline-flex;width:max-content;padding:7px 10px;border-radius:99px;background:#e7f9ef;color:#21845a;font-size:12px;font-weight:900}.invoice-note,.privacy-note{margin-top:12px;padding:12px;border-radius:14px;background:#f4f7fb;color:#666078;font-size:12px;line-height:1.5}.privacy-note{background:#fff8ec}.checkout-card{border:2px solid #e5eef9}.checkout-button{margin-top:16px!important;width:100%}.package-card .btn{width:100%}
@media(max-width:900px){.order-steps{grid-template-columns:1fr 1fr}}@media(max-width:620px){.order-steps{grid-template-columns:1fr}}
`;
document.head.appendChild(style);

const plans = {
  Starter: {
    price: 19,
    url: 'https://www.paypal.com/ncp/payment/6AX6N8ANPWWXC',
    description: 'One pet, one playable level, personalized name and ending, plus one revision.'
  },
  Standard: {
    price: 39,
    url: 'https://www.paypal.com/ncp/payment/N6Q9FTU5CBJDL',
    description: 'Gift-ready version, custom ending headline, two revisions and a downloadable backup copy.'
  },
  Premium: {
    price: 69,
    url: 'https://www.paypal.com/ncp/payment/BC5NERWPGKKC2',
    description: 'Two pets or extra themed items, priority delivery and additional visual polish.'
  }
};

let pack = 'Standard';

const heroPayPal = document.querySelector('.hero .paypal, .hero .paypal-live');
if (heroPayPal) {
  heroPayPal.classList.remove('paypal');
  heroPayPal.classList.add('paypal-live');
  heroPayPal.href = '#packages';
  heroPayPal.textContent = 'Choose a package & pay';
}

const packageCards = [...document.querySelectorAll('#packages .reviews > .card')];
packageCards.forEach(card => {
  const button = card.querySelector('.package');
  if (!button) return;
  const name = button.dataset.package;
  card.classList.add('package-card');
  card.dataset.card = name;
  button.textContent = `Select ${name}`;
  if (name === 'Standard' && !card.querySelector('.popular')) {
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
    <h2>Secure checkout with PayPal</h2>
    <p class="sub">Choose your package, complete payment on PayPal's hosted checkout, then email your pet photo and customization details. The Standard plan is selected by default.</p>
    <div class="order-steps">
      <div class="order-step"><strong>1. Choose package</strong><span>Select Starter, Standard or Premium.</span></div>
      <div class="order-step"><strong>2. Pay securely</strong><span>Complete checkout on PayPal's hosted payment page.</span></div>
      <div class="order-step"><strong>3. Send pet details</strong><span>Email the pet photo, name and ending message.</span></div>
      <div class="order-step"><strong>4. We create & deliver</strong><span>Your first version is normally delivered within 3 business days.</span></div>
    </div>
    <div class="pay">
      <div class="card checkout-card">
        <span class="invoice-active">✓ Secure PayPal checkout</span>
        <b id="selectedPackage">Standard package selected · $39</b>
        <p id="selectedDescription">Gift-ready version, custom ending headline, two revisions and a downloadable backup copy.</p>
        <a id="checkoutButton" class="btn paypal-live checkout-button" href="https://www.paypal.com/ncp/payment/N6Q9FTU5CBJDL" target="_blank" rel="noopener noreferrer">Pay $39 with PayPal</a>
        <div class="invoice-note">You will be redirected to a PayPal-hosted checkout page. Available payment methods vary by country.</div>
      </div>
      <div class="card">
        <i>✉️</i>
        <b>Send your customization details</b>
        <p>After payment, attach the pet photo and include the pet name, favorite treat or toy, and optional ending message. Using the same email as your PayPal checkout helps us match the order quickly.</p>
        <a id="email" class="btn green" href="#">Email Standard order details</a>
        <div class="privacy-note">Payments are processed by PayPal. PayPal may collect payment and identifying information under its privacy terms.</div>
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
  b.setAttribute('aria-label', `Show case ${i + 1}`);
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

function emailUrl() {
  const plan = plans[pack];
  const subject = encodeURIComponent(`${pack} Custom Pet Game Order`);
  const body = encodeURIComponent(
`Hi, I have selected the ${pack} package ($${plan.price}) for a custom pet game.

PayPal checkout email:
PayPal transaction ID (if already paid):
Pet name:
Favorite treat or toy:
Ending message:
Other requests:

I will attach the pet photo to this email.`
  );
  return `mailto:ereyaim@gmail.com?subject=${subject}&body=${body}`;
}

function refreshOrder() {
  const plan = plans[pack];
  document.querySelectorAll('.package-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.card === pack);
  });

  const label = document.getElementById('selectedPackage');
  const description = document.getElementById('selectedDescription');
  const checkout = document.getElementById('checkoutButton');
  const email = document.getElementById('email');

  if (label) label.textContent = `${pack} package selected · $${plan.price}`;
  if (description) description.textContent = plan.description;
  if (checkout) {
    checkout.href = plan.url;
    checkout.textContent = `Pay $${plan.price} with PayPal`;
    checkout.setAttribute('aria-label', `Pay for the ${pack} package with PayPal`);
  }
  if (email) {
    email.href = emailUrl();
    email.textContent = `Email ${pack} order details`;
  }
}

document.querySelectorAll('.package').forEach(a => {
  a.addEventListener('click', () => {
    pack = a.dataset.package || 'Standard';
    refreshOrder();
  });
});
refreshOrder();

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

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
