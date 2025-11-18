const now = new Date();
const currentYear = now.getFullYear();
let christmasDate = new Date(`Dec 25, ${currentYear} 00:00:00`);

// Se já passou do Natal este ano, aponta para o ano que vem
if (now > christmasDate) {
  christmasDate = new Date(`Dec 25, ${currentYear + 1} 00:00:00`);
}

function updateCountdown() {
  const currentTime = new Date().getTime();
  const distance = christmasDate - currentTime;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const elDays = document.getElementById('days');
  if (elDays) {
    elDays.textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  }

  // Se chegou o Natal!
  if (distance < 0) {
    document.querySelector('.countdown-container').innerHTML = "<h2>🎄 FELIZ NATAL! 🎄</h2>";
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
}
resizeCanvas();

const particles = [];
const particleCount = 100; // Quantidade de flocos de neve

class Snowflake {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    // vx = vento lateral leve / vy = velocidade de queda
    this.vx = (Math.random() - 0.5) * 0.5; 
    this.vy = Math.random() * 1 + 1; // Caindo para baixo (positivo)
    this.radius = Math.random() * 3 + 1; // Tamanho do floco
    this.alpha = Math.random() * 0.8 + 0.2; // Transparência para brilho
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.y > canvas.height) {
      this.y = -10;
      this.x = Math.random() * canvas.width;
    }
    if (this.x > canvas.width) this.x = 0;
    if (this.x < 0) this.x = canvas.width;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < particleCount; i++) {
  particles.push(new Snowflake());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', resizeCanvas);
const resizeObserver = new ResizeObserver(resizeCanvas);
resizeObserver.observe(document.body);


function formatBRL(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;
  // Toast vermelho/verde natalino
  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #c0392b; 
    color: white;
    padding: 15px 25px;
    border-radius: 50px;
    font-weight: bold;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
    border: 2px solid #27ae60;
  `;
  document.body.appendChild(messageDiv);
  setTimeout(() => {
    messageDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => messageDiv.remove(), 300);
  }, 3000);
}

function attachBuyButtonHandlers() {
  document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', function() {
      const productName = this.closest('.product-card').querySelector('.product-name').textContent;
      showToast(`🎁 ${productName} embrulhado para presente! Feliz Natal!`);
    });
  });
}

function renderProducts(products) {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;

  grid.innerHTML = '';
  // Pega os 5 primeiros itens
  const items = products.slice(0, 5); 

  items.forEach(p => {
    // Cálculo de desconto
    const discountCalc = (p && p.old_price && p.new_price)
      ? Math.max(0, Math.round(100 - (Number(p.new_price) / Number(p.old_price)) * 100))
      : (p && typeof p.discount === 'number' ? p.discount : 0);

    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <span>${escapeHtml(p?.emoji || '🎁')}</span>
        <div class="discount-badge">-${discountCalc}%</div>
      </div>
      <div class="product-info">
        <h3 class="product-name">${escapeHtml(p?.name || 'Presente Misterioso')}</h3>
        <div class="price-container">
          <span class="old-price">${formatBRL(p?.old_price)}</span>
          <span class="new-price">${formatBRL(p?.new_price)}</span>
        </div>
        <button class="buy-button">Presentear Agora</button>
      </div>
    `;
    grid.appendChild(card);
  });

  attachBuyButtonHandlers();
}

async function loadProducts() {

  const mockProductsNatal = [
    { name: 'Panetone Trufado', old_price: 69.90, new_price: 49.90, emoji: '🍞' },
    { name: 'Luzes de Natal (Pisca-Pisca) LED', old_price: 45.00, new_price: 29.90, emoji: '💡' },
    { name: 'Árvore de Natal (1.80m)', old_price: 399.00, new_price: 249.90, emoji: '🎄' },
    { name: 'Kit Decoração Bolas Natalinas', old_price: 59.90, new_price: 35.00, emoji: '✨' },
    { name: 'Presente Surpresa', old_price: 99.90, new_price: 69.90, emoji: '🎁' },
    { name: 'Gorro do Papai Noel', old_price: 29.90, new_price: 15.90, emoji: '🎅' }
  ];

  const theme = 'natal';  
  const mockProductsBlackFriday = [
    { name: 'Produto Black Friday 1', old_price: 100.00, new_price: 70.00, emoji: '🛒' },
  
  ];
  const selectedMock = theme === 'natal' ? mockProductsNatal : mockProductsBlackFriday;

  try {
    const { createClient } = window.supabase || {};
    const cfg = window.__SUPABASE || {};
    
    if (typeof createClient === 'function' && cfg.url && cfg.anonKey) {
      const client = createClient(cfg.url, cfg.anonKey);
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && Array.isArray(data) && data.length > 0) {
        renderProducts(data);
        return;
      }
    }
  } catch (err) {
    console.log('Usando modo offline (Mock Natalino)');
  }

  renderProducts(selectedMock);
  
  // Mensagem inicial
  setTimeout(() => showToast('🎄 Bem-vindo à Fábrica do Noel! Produtos natalinos carregados.'), 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

// Estilos para o Toast (animação de entrada e saída)
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(toastStyle);