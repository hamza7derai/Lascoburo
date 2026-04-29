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

// --- CATEGORY MANAGEMENT ---
window.addCategory = async () => {
    const name = document.getElementById('newCatName').value;
    if(!name) return;
    await addDoc(collection(db, "categories"), { name });
    document.getElementById('newCatName').value = '';
};

onSnapshot(collection(db, "categories"), (snap) => {
    const cats = snap.docs.map(d => ({id: d.id, ...d.data()}));
    
    // Update Dropdown in Product Form
    const select = document.getElementById('pCatSelect');
    select.innerHTML = cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    
    // Update List in Category Tab
    const list = document.getElementById('catListDisplay');
    list.innerHTML = cats.map(c => `
        <div class="cat-item">
            <span>${c.name}</span>
            <button onclick="deleteCat('${c.id}')">🗑️</button>
        </div>
    `).join('');
});

window.deleteCat = async (id) => { if(confirm("Supprimer?")) await deleteDoc(doc(db, "categories", id)); };

// --- PRODUCT MANAGEMENT ---
window.calc = () => {
    const cost = parseFloat(document.getElementById('pCost').value) || 0;
    const sell = parseFloat(document.getElementById('pSell').value) || 0;
    const profit = sell - cost;
    const margin = sell > 0 ? ((profit/sell)*100).toFixed(1) : 0;
    document.getElementById('profitInfo').innerText = `Profit: ${profit.toFixed(2)} DH | Marge: ${margin}%`;
};

window.saveProduct = async () => {
    const data = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCatSelect').value,
        costPrice: parseFloat(document.getElementById('pCost').value),
        sellPrice: parseFloat(document.getElementById('pSell').value),
        stock: parseInt(document.getElementById('pStock').value),
        variants: document.getElementById('pVariants').value.split(',').map(v => v.trim()),
        timestamp: new Date()
    };
    await addDoc(collection(db, "products"), data);
    alert("Produit Ajouté!");
};

// --- SYNC INVENTORY & STATS ---
onSnapshot(collection(db, "products"), (snap) => {
    const prods = snap.docs.map(d => ({id: d.id, ...d.data()}));
    let r = 0; let p = 0; let l = 0;
    
    const table = document.getElementById('inventoryTable');
    table.innerHTML = prods.map(item => {
        const up = item.sellPrice - item.costPrice;
        r += (item.sellPrice * item.stock);
        p += (up * item.stock);
        if(item.stock < 10) l++;

        return `<tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td class="${item.stock < 10 ? 'text-danger' : ''}">${item.stock}</td>
            <td>${item.sellPrice} DH</td>
            <td>+${up.toFixed(2)} DH</td>
            <td><button onclick="delProd('${item.id}')">🗑️</button></td>
        </tr>`;
    }).join('');

    document.getElementById('rev').innerText = `${r.toLocaleString()} DH`;
    document.getElementById('prof').innerText = `${p.toLocaleString()} DH`;
    document.getElementById('low').innerText = l;
});

window.delProd = async (id) => { if(confirm("Supprimer?")) await deleteDoc(doc(db, "products", id)); };

window.switchTab = (id) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    event.currentTarget.classList.add('active');
};
