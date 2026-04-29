import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const productsRef = collection(db, "products");

// --- 1. Live Margin Calculator ---
window.updateMargin = () => {
    const cost = parseFloat(document.getElementById('pCost').value) || 0;
    const sell = parseFloat(document.getElementById('pSell').value) || 0;
    const profit = sell - cost;
    const margin = sell > 0 ? ((profit / sell) * 100).toFixed(1) : 0;
    
    document.getElementById('marginPreview').innerText = `Profit: ${profit.toFixed(2)} DH | Marge: ${margin}%`;
};

// --- 2. Save Product ---
window.saveProduct = async () => {
    const data = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCat').value,
        costPrice: parseFloat(document.getElementById('pCost').value),
        sellPrice: parseFloat(document.getElementById('pSell').value),
        stock: parseInt(document.getElementById('pStock').value),
        imageUrl: document.getElementById('pImg').value,
        timestamp: new Date()
    };

    try {
        await addDoc(productsRef, data);
        alert("Produit ajouté avec succès !");
        document.querySelectorAll('input').forEach(i => i.value = '');
    } catch (e) { console.error(e); }
};

// --- 3. Sync & Render Dashboard ---
onSnapshot(productsRef, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    let totalRev = 0; let totalProf = 0; let lowStock = 0;

    const tableBody = document.getElementById('inventoryBody');
    tableBody.innerHTML = products.map(p => {
        const unitProfit = p.sellPrice - p.costPrice;
        totalRev += (p.sellPrice * p.stock);
        totalProf += (unitProfit * p.stock);
        if(p.stock < 5) lowStock++;

        return `
            <tr>
                <td><b>${p.name}</b></td>
                <td><span class="stock-badge ${p.stock < 5 ? 'danger' : ''}">${p.stock}</span></td>
                <td>${p.sellPrice} DH</td>
                <td class="profit-text">+${unitProfit.toFixed(2)} DH</td>
                <td>
                    <button class="del-btn" onclick="deleteItem('${p.id}')">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('totalRevenue').innerText = `${totalRev.toLocaleString()} DH`;
    document.getElementById('totalProfit').innerText = `${totalProf.toLocaleString()} DH`;
    document.getElementById('lowStockCount').innerText = lowStock;
});

window.deleteItem = async (id) => {
    if(confirm("Supprimer ce produit ?")) await deleteDoc(doc(db, "products", id));
};

// Tab Switching Logic
window.switchTab = (tab) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
    event.currentTarget.classList.add('active');
};
