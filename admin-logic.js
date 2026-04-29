import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// --- 1. IMAGE PREVIEW LOGIC ---
window.updatePreview = () => {
    const imgUrl = document.getElementById('pImg').value;
    const preview = document.getElementById('previewImg');
    // If empty, show placeholder, otherwise show the link
    preview.src = imgUrl ? imgUrl : 'https://placehold.co/400x400/f1f5f9/a4b8c4?text=Aperçu';
};

// --- 2. PROFIT CALCULATOR ---
window.calc = () => {
    const cost = parseFloat(document.getElementById('pCost').value) || 0;
    const sell = parseFloat(document.getElementById('pSell').value) || 0;
    const profit = sell - cost;
    const margin = sell > 0 ? ((profit/sell)*100).toFixed(1) : 0;
    document.getElementById('profitInfo').innerText = `Profit: ${profit.toFixed(2)} DH | Marge: ${margin}%`;
};

// --- 3. CATEGORY MANAGEMENT ---
window.addCategory = async () => {
    const name = document.getElementById('newCatName').value;
    if(!name) return;
    await addDoc(collection(db, "categories"), { name });
    document.getElementById('newCatName').value = '';
};

window.deleteCat = async (id) => { 
    if(confirm("Supprimer cette catégorie ?")) await deleteDoc(doc(db, "categories", id)); 
};

onSnapshot(collection(db, "categories"), (snap) => {
    const cats = snap.docs.map(d => ({id: d.id, ...d.data()}));
    
    // Update Dropdown in Form
    const select = document.getElementById('pCatSelect');
    select.innerHTML = '<option value="">Choisir une catégorie...</option>' + 
                       cats.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    
    // Update List in Category Tab
    const list = document.getElementById('catListDisplay');
    list.innerHTML = cats.map(c => `
        <div class="cat-item">
            <span>${c.name}</span>
            <button class="del-btn" onclick="deleteCat('${c.id}')">Supprimer</button>
        </div>
    `).join('');
});

// --- 4. PRODUCT MANAGEMENT ---
window.saveProduct = async () => {
    const name = document.getElementById('pName').value;
    const category = document.getElementById('pCatSelect').value;
    const sellPrice = parseFloat(document.getElementById('pSell').value);
    
    if(!name || !category || !sellPrice) {
        alert("Veuillez remplir le nom, la catégorie et le prix de vente.");
        return;
    }

    const data = {
        name: name,
        category: category,
        costPrice: parseFloat(document.getElementById('pCost').value) || 0,
        sellPrice: sellPrice,
        stock: parseInt(document.getElementById('pStock').value) || 0,
        imageUrl: document.getElementById('pImg').value,
        variants: document.getElementById('pVariants').value,
        timestamp: new Date()
    };

    try {
        // Change button text to show it's working
        const btn = document.querySelector('.btn-save');
        btn.innerText = "Enregistrement...";
        
        await addDoc(collection(db, "products"), data);
        alert("Produit Ajouté avec succès !");
        
        // Clear form after saving
        document.getElementById('pName').value = '';
        document.getElementById('pCost').value = '';
        document.getElementById('pSell').value = '';
        document.getElementById('pStock').value = '';
        document.getElementById('pVariants').value = '';
        document.getElementById('pImg').value = '';
        
        window.updatePreview(); // Reset image
        window.calc(); // Reset profit
        btn.innerText = "Enregistrer le produit";
        
        // Auto-switch to inventory tab to see the new product
        window.switchTab('inventory');
    } catch(e) {
        console.error(e);
        alert("Erreur lors de l'ajout.");
    }
};

// --- 5. INVENTORY TABLE & STATS ---
window.deleteProd = async (id) => { 
    if(confirm("Supprimer ce produit de l'inventaire ?")) await deleteDoc(doc(db, "products", id)); 
};

onSnapshot(collection(db, "products"), (snap) => {
    const prods = snap.docs.map(d => ({id: d.id, ...d.data()}));
    let rev = 0; let prof = 0; let low = 0;
    
    const table = document.getElementById('inventoryTable');
    table.innerHTML = prods.map(item => {
        const up = item.sellPrice - item.costPrice;
        rev += (item.sellPrice * item.stock);
        prof += (up * item.stock);
        if(item.stock < 10) low++;

        const img = item.imageUrl ? item.imageUrl : 'https://placehold.co/40x40/f1f5f9/a4b8c4';

        return `<tr>
            <td><img src="${img}" class="thumb-img"></td>
            <td><strong>${item.name}</strong><br><small style="color:#94A3B8">+${up.toFixed(2)} DH profit/u</small></td>
            <td>${item.category}</td>
            <td style="color:${item.stock < 10 ? '#EF4444' : 'inherit'}; font-weight:bold;">${item.stock}</td>
            <td>${item.sellPrice} DH</td>
            <td><button class="del-btn" onclick="deleteProd('${item.id}')">Retirer</button></td>
        </tr>`;
    }).join('');

    document.getElementById('rev').innerText = `${rev.toLocaleString()} DH`;
    document.getElementById('prof').innerText = `${prof.toLocaleString()} DH`;
    document.getElementById('low').innerText = low;
});

// --- 6. TAB SWITCHING ---
window.switchTab = (id) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    event.currentTarget.classList.add('active');
};
