/* =============================================
   ShopNow – Shared JavaScript
   DCIT 209 Mini-Project
   ============================================= */

/* ---- Cart State ---- */
let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');

function saveCart() {
  sessionStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = total);
}

function addToCart(id, name, price, img) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  showToast(`✅ "${name}" added to cart!`);
}

/* ---- Toast ---- */
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ---- Mobile Nav ---- */
function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
  });
  // Active link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === current) a.classList.add('active');
  });
}

/* ---- On-Page Text Search ---- */
function initPageSearch() {
  const input  = document.getElementById('page-search-input');
  const btn    = document.getElementById('page-search-btn');
  const clear  = document.getElementById('page-search-clear');
  const count  = document.getElementById('search-result-count');
  const main   = document.getElementById('main-content');
  if (!input || !main) return;

  let lastMarks = [];

  function clearHighlights() {
    lastMarks.forEach(m => {
      const parent = m.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent), m);
        parent.normalize();
      }
    });
    lastMarks = [];
    if (count) count.textContent = '';
  }

  function doSearch() {
    clearHighlights();
    const term = input.value.trim();
    if (!term) return;

    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (['SCRIPT','STYLE','MARK'].includes(node.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);

    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
    let matchCount = 0;
    let firstMark = null;

    nodes.forEach(textNode => {
      const val = textNode.nodeValue;
      if (!regex.test(val)) return;
      regex.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = regex.exec(val)) !== null) {
        frag.appendChild(document.createTextNode(val.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.className = 'highlight';
        mark.textContent = m[0];
        frag.appendChild(mark);
        lastMarks.push(mark);
        if (!firstMark) firstMark = mark;
        last = m.index + m[0].length;
        matchCount++;
      }
      frag.appendChild(document.createTextNode(val.slice(last)));
      textNode.parentNode.replaceChild(frag, textNode);
    });

    if (count) count.textContent = matchCount > 0 ? `${matchCount} match${matchCount !== 1 ? 'es' : ''} found` : 'No matches found';
    if (firstMark) firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  btn.addEventListener('click', doSearch);
  if (clear) clear.addEventListener('click', () => { input.value = ''; clearHighlights(); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

/* ---- Carousel ---- */
function initCarousel() {
  const track  = document.querySelector('.carousel-slides');
  const prev   = document.querySelector('.carousel-prev');
  const next   = document.querySelector('.carousel-next');
  if (!track) return;

  let idx = 0;
  const slides = track.children.length;

  function go(n) {
    idx = (n + slides) % slides;
    track.style.transform = `translateX(-${idx * 100}%)`;
  }

  if (prev) prev.addEventListener('click', () => go(idx - 1));
  if (next) next.addEventListener('click', () => go(idx + 1));
  setInterval(() => go(idx + 1), 5000);
}

/* ---- Accessibility Toolbar ---- */
function initA11y() {
  const hcBtn = document.getElementById('a11y-hc');
  const f1    = document.getElementById('a11y-f1');
  const f2    = document.getElementById('a11y-f2');
  const fr    = document.getElementById('a11y-fr');

  if (hcBtn) {
    hcBtn.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');
      hcBtn.classList.toggle('active');
    });
  }
  if (f1) f1.addEventListener('click', () => { document.body.classList.remove('font-large','font-xlarge'); document.body.classList.add('font-large'); });
  if (f2) f2.addEventListener('click', () => { document.body.classList.remove('font-large','font-xlarge'); document.body.classList.add('font-xlarge'); });
  if (fr) fr.addEventListener('click', () => { document.body.classList.remove('font-large','font-xlarge','high-contrast'); if(hcBtn) hcBtn.classList.remove('active'); });
}

/* ---- Scroll to Top ---- */
function initScrollTop() {
  const btn = document.querySelector('.footer-top');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  initNav();
  initPageSearch();
  initCarousel();
  initA11y();
  initScrollTop();
});
