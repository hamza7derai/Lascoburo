let products = [];
let cart = [];

// Initialize
async function init() {
    const res = await fetch('products.json');
    products = await res.json();
    renderProducts(products);
    renderCategories();
}

// Render Grid
function renderProducts(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = items.map(p => `
        <div class="card" onclick="openProduct(${p.id})">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p class="price">${p.price.toFixed(2)} DH</p>
            <button class="add-quick">+</button>
        </div>
    `).join('');
}

// Category Filtering
function renderCategories() {
    const list = document.getElementById('categoryList');
    const cats = ['all', ...new Set(products.map(p => p.category))];
    list.innerHTML = cats.map(c => `
        <button class="cat-pill ${c === 'all' ? 'active' : ''}" onclick="filterByCat('${c}', this)">
            ${c === 'all' ? 'Tout' : c}
        </button>
    `).join('');
}

function filterByCat(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
    renderProducts(filtered);
}

// Cart Logic
function openProduct(id) {
    const p = products.find(x => x.id === id);
    const content = document.getElementById('modalContent');
    content.innerHTML = `
        <div style="display:flex; gap:15px; margin-bottom:20px">
            <img src="${p.image}" style="width:100px; height:100px; border-radius:12px; object-fit:cover">
            <div>
                <h2 style="margin:0; font-size:18px">${p.name}</h2>
                <p style="color:var(--primary); font-weight:700; font-size:20px">${p.price.toFixed(2)} DH</p>
                <p style="font-size:12px; color:var(--gray)">Stock: ${p.stock} unités</p>
            </div>
        </div>
        <div style="margin-bottom:20px">
            <label style="font-weight:600; display:block; margin-bottom:8px">Note (Couleur, détails...)</label>
            <input type="text" id="orderNote" placeholder="Ex: Couleur bleu..." style="width:100%; padding:12px; border-radius:8px; border:1px solid #ddd">
        </div>
        <button class="btn-primary" onclick="addToCart(${p.id})">Ajouter au panier</button>
    `;
    document.getElementById('productModal').classList.add('active');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const note = document.getElementById('orderNote')?.value || "";
    
    cart.push({ ...product, note });
    updateUI();
    closeModal();
}

function updateUI() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const badge = document.getElementById('cartCountBadge');
    const stickyTotal = document.getElementById('cartTotalSticky');
    const bar = document.getElementById('stickyCart');

    badge.innerText = cart.length;
    stickyTotal.innerText = total.toFixed(2) + " DH";
    bar.style.display = cart.length > 0 ? "flex" : "none";
}

function toggleCart(show) {
    const drawer = document.getElementById('cartDrawer');
    if (show) {
        renderCart();
        drawer.classList.add('active');
    } else {
        drawer.classList.remove('active');
    }
}

function renderCart() {
    const list = document.getElementById('cartItemsList');
    const finalTotal = document.getElementById('cartFinalTotal');
    let total = 0;

    list.innerHTML = cart.map((item, index) => {
        total += item.price;
        return `
            <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px">
                <div>
                    <h4 style="margin:0">${item.name}</h4>
                    <small>${item.note ? 'Note: ' + item.note : ''}</small>
                </div>
                <div style="text-align:right">
                    <b>${item.price.toFixed(2)} DH</b><br>
                    <button onclick="removeItem(${index})" style="color:red; border:none; background:none; font-size:12px">Supprimer</button>
                </div>
            </div>
        `;
    }).join('');
    finalTotal.innerText = total.toFixed(2) + " DH";
}

function sendWhatsApp() {
    const phone = "212600000000"; // Replace with your real WhatsApp number
    let total = 0;
    let message = "🚀 *Nouvelle Commande Lascoburo*\n\n";

    cart.forEach(item => {
        message += `• ${item.name} ${item.note ? '('+item.note+')' : ''} - *${item.price.toFixed(2)} DH*\n`;
        total += item.price;
    });

    message += `\n💰 *TOTAL: ${total.toFixed(2)} DH*`;
    message += `\n\n_Commande via catalogue digital_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
}

function closeModal() { document.getElementById('productModal').classList.remove('active'); }
function removeItem(index) { cart.splice(index, 1); renderCart(); updateUI(); }

init();

