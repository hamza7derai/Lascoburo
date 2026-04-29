import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// YOUR EXACT FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyCKY59mqLqD4GqQpkDEFqNybKIkwLvgId0",
    authDomain: "lascoburo.firebaseapp.com",
    projectId: "lascoburo",
    storageBucket: "lascoburo.firebasestorage.app",
    messagingSenderId: "918363477454",
    appId: "1:918363477454:web:ef0a991d24de1ea992879f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- APP STATE ---
let allProducts = [];
let allCategories = [];
let currentCategory = 'Tous';
let searchQuery = '';
let cart = [];

// --- CATEGORY ICONS DICTIONARY ---
// Maps category names to the beautiful SVG icons from your design
const categoryIcons = {
    'Cahiers': '<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>',
    'Stylos': '<svg viewBox="0 0 24 24"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>',
    'Sacs': '<svg viewBox="0 0 24 24"><path d="M4 10h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10z"></path><path d="M8 10V6a4 4 0 0 1 8 0v4"></path></svg>',
    'Papeterie': '<svg viewBox="0 0 24 24"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>',
    'default': '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
};

// --- 1. SMART LOAD: PRODUCTS & CATEGORIES ---
onSnapshot(collection(db, "products"), (snap) => {
    allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Extract unique categories directly from your products
    const rawCategories = [...new Set(allProducts.map(p => p.category))];
    allCategories = rawCategories.filter(cat => cat && cat.trim() !== '').sort();
    
    renderCategories();
    filterAndRenderProducts();
});


// --- 2. RENDER CATEGORY TABS WITH ICONS & SNAPPING ---
function renderCategories() {
    const catBar = document.getElementById('catBar');
    const tousIcon = '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>';
    
    let html = `<div id="cat-Tous" class="cat-chip ${currentCategory === 'Tous' ? 'active' : ''}" onclick="window.setCategory('Tous', 'cat-Tous')">
                    ${tousIcon} Tous
                </div>`;
    
    allCategories.forEach((cat, index) => {
        // Find icon, or use default if it's a new unknown category
        const icon = categoryIcons[cat] || categoryIcons['default'];
        const elId = `cat-${index}`;
        
        html += `<div id="${elId}" class="cat-chip ${currentCategory === cat ? 'active' : ''}" onclick="window.setCategory('${cat}', '${elId}')">
                    ${icon} ${cat}
                 </div>`;
    });
    
    catBar.innerHTML = html;
}

window.setCategory = (catName, elementId) => {
    currentCategory = catName;
    renderCategories(); 
    filterAndRenderProducts();

    // Smooth scroll physics so it snaps nicely to the center on mobile
    setTimeout(() => {
        const el = document.getElementById(elementId);
        if(el) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, 50);
};


// --- 3. SEARCH & FILTER LOGIC ---
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    filterAndRenderProducts();
});

function filterAndRenderProducts() {
    let filtered = allProducts;
    if (currentCategory !== 'Tous') { filtered = filtered.filter(p => p.category === currentCategory); }
    if (searchQuery !== '') { filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery)); }
    renderProductsUI(filtered);
}


// --- 4. RENDER PRODUCT UI (With Dynamic Stock Check) ---
function renderProductsUI(products) {
    const grid = document.getElementById('customerGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state">Aucun produit trouvé.</div>`;
        return;
    }

    grid.innerHTML = products.map(p => {
        // Image logic
        let imageContent = p.imageUrl && p.imageUrl.trim() !== '' 
            ? `<img src="${p.imageUrl}" alt="${p.name}">` 
            : `<span class="placeholder-text">${p.name.split(' ')[0]}</span>`;

        // Live Dashboard Stock Logic
        let stockHTML = p.stock > 0 
            ? `<div class="stock-indicator"><div class="stock-dot"></div> En stock</div>`
            : `<div class="stock-indicator" style="color: var(--danger);"><div class="stock-dot" style="background: var(--danger);"></div> Rupture</div>`;

        return `
            <div class="product-card">
                <div class="product-img-box">
                    <button class="btn-heart" onclick="this.style.color='#EF4444'"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>
                    ${imageContent}
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p>${p.category}</p>
                </div>
                <div class="product-footer">
                    <div class="price-stock">
                        <span class="price">${p.sellPrice} DH</span>
                        ${stockHTML}
                    </div>
                    <button class="btn-add" 
                            style="${p.stock <= 0 ? 'opacity:0.5; background:var(--text-muted); cursor:not-allowed;' : ''}" 
                            onclick="${p.stock > 0 ? `window.addToCart('${p.id}')` : ''}">
                        +
                    </button>
                </div>
            </div>
        `;
    }).join('');
}


// --- 5. CART & WHATSAPP CHECKOUT ---
window.addToCart = (id) => {
    const item = allProducts.find(p => p.id === id);
    cart.push(item);
    updateCartUI();
};

function updateCartUI() {
    const bar = document.getElementById('orderBar');
    const total = cart.reduce((sum, i) => sum + parseFloat(i.sellPrice), 0);
    
    // Update all the badges in the UI (top bar, bottom bar, bottom nav)
    document.getElementById('bottomCartCount').innerText = cart.length;
    document.getElementById('cartCountText').innerText = cart.length + (cart.length > 1 ? " articles" : " article");
    document.getElementById('cartPrice').innerText = `${total.toFixed(2)} DH`;
    
    document.querySelectorAll('.top-cart-badge').forEach(badge => {
        badge.innerText = cart.length;
    });
    
    // Slide up the sticky cart if there are items
    if(cart.length > 0) {
        bar.classList.remove('hidden');
    } else {
        bar.classList.add('hidden');
    }
}

window.openWhatsApp = () => {
    if(cart.length === 0) return;

    const phone = "212600000000"; // ⚠️ REPLACE WITH YOUR REAL WHATSAPP NUMBER
    let message = "📦 *Nouvelle commande Lascoburo*\n\n";
    
    const summary = cart.reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + 1;
        return acc;
    }, {});

    for (const [name, qty] of Object.entries(summary)) {
        message += `• ${name} (x${qty})\n`;
    }

    const total = cart.reduce((sum, i) => sum + parseFloat(i.sellPrice), 0);
    message += `\n💰 *Total à payer : ${total.toFixed(2)} DH*`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
};
