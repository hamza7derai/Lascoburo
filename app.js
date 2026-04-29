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

// --- Real-time Sync ---
const productsRef = collection(db, "products");

onSnapshot(productsRef, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts(products);
    updateCategories(products);
});

function renderProducts(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = items.map(p => `
        <div class="product-card" onclick="openProductModal('${p.id}')">
            <div class="product-img">
                <img src="${p.imageUrl || 'https://placehold.co/400'}" alt="${p.name}">
            </div>
            <div class="product-info">
                <h3>${p.name}</h3>
                <p class="price">${p.sellPrice} DH</p>
                <span class="stock-status ${p.stock < 5 ? 'low' : ''}">
                    ${p.stock < 5 ? 'Presque épuisé' : 'Disponible'}
                </span>
            </div>
            <button class="add-btn">+</button>
        </div>
    `).join('');
}
