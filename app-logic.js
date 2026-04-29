import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ YOUR EXACT FIREBASE CONFIGURATION ⚠️
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

// --- 1. SMART LOAD: PRODUCTS & CATEGORIES ---
// This listens to your products and automatically creates the Category Tabs!
onSnapshot(collection(db, "products"), (snap) => {
    allProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Extract unique categories directly from your products
    const rawCategories = [...new Set(allProducts.map(p => p.category))];
    
    // Clean up empty ones and sort them alphabetically
    allCategories = rawCategories.filter(cat => cat && cat.trim() !== '').sort();
    
    renderCategories();
    filterAndRenderProducts();
});


// --- 2. RENDER CATEGORY TABS ---
function renderCategories() {
    const catBar = document.getElementById('catBar');
    
    // Always start with "Tous" (All)
    let html = `<button class="cat-pill ${currentCategory === 'Tous' ? 'active' : ''}" onclick="window.setCategory('Tous')">Tous</button>`;
    
    // Build tabs for every category that currently has a product
    allCategories.forEach(cat => {
        html += `<button class="cat-pill ${currentCategory === cat ? 'active' : ''}" onclick="window.setCategory('${cat}')">${cat}</button>`;
    });
    
    catBar.innerHTML = html;
}

// Function called when a customer clicks a category tab
window.setCategory = (catName) => {
    currentCategory = catName;
    renderCategories(); // Re-render to move the blue color to the active tab
    filterAndRenderProducts();
};


// --- 3. SEARCH & FILTER LOGIC ---
document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    filterAndRenderProducts();
});

function filterAndRenderProducts() {
    let filtered = allProducts;

    // Filter by Tab
    if (currentCategory !== 'Tous') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Filter by Search Bar
    if (searchQuery !== '') {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery));
    }

    renderProductsUI(filtered);
}


// --- 4. RENDER PRODUCT UI ---
function renderProductsUI(products) {
    const grid = document.getElementById('customerGrid');
    
    if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column: span 2; text-align: center; padding: 40px; color: #64748B;">Aucun produit trouvé.</div>`;
        return;
    }

    grid.innerHTML = products.map(p => {
        // High-end image fallback logic
        let imageContent = '';
        if (p.imageUrl && p.imageUrl.trim() !== '') {
            imageContent = `<img src="${p.imageUrl}" alt="${p.name}">`;
        } else {
            // Extracts the first word to create a nice text graphic if no image is uploaded
            imageContent = `<span class="placeholder-text">${p.name.split(' ')[0]}</span>`;
        }

        return `
            <div class="item-card">
                <div class="img-container">
                    ${imageContent}
                </div>
                <div class="item-details">
                    <h3>${p.name}</h3>
                    <div class="item-footer">
                        <span class="price">${p.sellPrice} DH</span>
                        <button class="add-to-cart" onclick="window.addToCart('${p.id}')">+</button>
                    </div>
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
    
    document.getElementById('cartCount').innerText = cart.length;
    document.getElementById('cartPrice').innerText = `${total.toFixed(2)} DH`;
    
    if(cart.length > 0) {
        bar.classList.remove('hidden');
    } else {
        bar.classList.add('hidden');
    }
}

window.openWhatsApp = () => {
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
