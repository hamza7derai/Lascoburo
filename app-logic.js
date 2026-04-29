import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
let cart = [];
let allProducts = [];

// --- 1. Live Sync from Firebase ---
onSnapshot(collection(db, "products"), (snapshot) => {
    allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts(allProducts);
});

// --- 2. Render beautiful App-like Cards ---
function renderProducts(products) {
    const grid = document.getElementById('customerGrid');
    grid.innerHTML = products.map(p => `
        <div class="item-card">
            <div class="img-container">
                <img src="${p.imageUrl || 'https://placehold.co/400x400/f3f4f6/1e3a8a?text=' + p.name}" alt="${p.name}">
            </div>
            <div class="item-details">
                <h3>${p.name}</h3>
                <div class="item-footer">
                    <span class="price">${p.sellPrice} DH</span>
                    <button class="add-to-cart" onclick="addToCart('${p.id}')">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- 3. Cart Management ---
window.addToCart = (id) => {
    const item = allProducts.find(p => p.id === id);
    cart.push(item);
    updateUI();
};

function updateUI() {
    const bar = document.getElementById('orderBar');
    const total = cart.reduce((sum, i) => sum + i.sellPrice, 0);
    
    document.getElementById('cartCount').innerText = cart.length;
    document.getElementById('cartPrice').innerText = `${total} DH`;
    
    if(cart.length > 0) bar.classList.remove('hidden');
}

// --- 4. WhatsApp Auto-Message ---
window.openWhatsApp = () => {
    const phone = "212600000000"; // Replace with your phone
    let message = "Bonjour Lascoburo! Je souhaite commander:\n\n";
    
    const summary = cart.reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + 1;
        return acc;
    }, {});

    for (const [name, qty] of Object.entries(summary)) {
        message += `• ${name} x${qty}\n`;
    }

    const total = cart.reduce((sum, i) => sum + i.sellPrice, 0);
    message += `\n💰 Total: *${total} DH*`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
};
