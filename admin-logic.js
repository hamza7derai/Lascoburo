import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// FIREBASE CONFIG
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

// --- 1. IMAGE PREVIEW ---
window.updatePreview = () => {
    const imgUrl = document.getElementById('pImg').value;
    const preview = document.getElementById('previewImg');
    preview.src = imgUrl ? imgUrl : 'https://placehold.co/400x400/f8fafc/94a3b8?text=Aperçu';
};

// --- 2. PROFIT CALCULATOR ---
window.calc = () => {
    const cost = parseFloat(document.getElementById('pCost').value) || 0;
    const sell = parseFloat(document.getElementById('pSell').value) || 0;
    const profit = sell - cost;
    const margin = sell > 0 ? ((profit/sell)*100).toFixed(1) : 0;
    document.getElementById('profitInfo').innerText = `Profit: ${profit.toFixed(2)} DH | Marge: ${margin}%`;
};

// --- 3. INLINE CATEGORY BUILDER ---
// This allows you to add categories directly from the form dropdown area
window.promptNewCategory = async () => {
    const catName = prompt("Entrez le nom de la nouvelle catégorie (ex: Géométrie) :");
    
    if (catName && catName.trim() !== "") {
        try {
            await addDoc(collection(db, "categories"), { name: catName.trim() });
            alert(`Catégorie "${catName}" ajoutée avec succès !`);
        } catch(e) {
            console.error(e);
            alert("Erreur lors de l'ajout de la catégorie.");
        }
    }
};

// Auto-populate Category Dropdown
onSnapshot(collection(db, "categories"), (snap) => {
    const cats = snap.docs.map(d => d.data().name).sort();
    const select = document.getElementById('pCatSelect');
    
    // Keep current selection if any
    const currentVal = select.value;
    
    select.innerHTML = '<option value="">Choisir une catégorie...</option>' + 
                       cats.map(c => `<option value="${c}">${c}</option>`).join('');
                       
    if(cats.includes(currentVal)) select.value = currentVal;
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
        const btn = document.querySelector('.btn-primary');
        btn.innerText = "⏳ Enregistrement...";
        
        await addDoc(collection(db, "products"), data);
        
        // Clear form
        document.querySelectorAll('.form-fields input').forEach(i => i.value = '');
        document.getElementById('pCatSelect').value = '';
        document.getElementById('pImg').value = '';
        
        window.updatePreview(); 
        window.calc(); 
        
        btn.innerText = "💾 Enregistrer le produit";
    } catch(e) {
        console.error(e);
        alert("Erreur lors de l'ajout.");
    }
};

// --- 5. INVENTORY TABLE & STATS ---
window.deleteProd = async (id) => { 
    if(confirm("Supprimer ce produit définitivement ?")) await deleteDoc(doc(db, "products", id)); 
};

onSnapshot(collection(db, "products"), (snap) => {
    const prods = snap.docs.map(d => ({id: d.id, ...d.data()}));
    let rev = 0; let prof = 0; let low = 0; let totalStk = 0;
    
    const table = document.getElementById('inventoryTable');
    table.innerHTML = prods.map(item => {
        const up = item.sellPrice - item.costPrice;
        rev += (item.sellPrice * item.stock);
        prof += (up * item.stock);
        totalStk += item.stock;
        if(item.stock < 10) low++;

        const img = item.imageUrl ? item.imageUrl : 'https://placehold.co/80x80/f8fafc/94a3b8';

        return `<tr>
            <td><img src="${img}" class="thumb-img"></td>
            <td><strong>${item.name}</strong><br><small style="color:#10B981">+${up.toFixed(2)} DH profit/u</small></td>
            <td><span style="background:#F1F5F9; padding:4px 8px; border-radius:6px; font-size:12px;">${item.category}</span></td>
            <td><strong style="color:${item.stock < 10 ? '#EF4444' : 'inherit'}">${item.stock}</strong></td>
            <td>${item.costPrice} DH</td>
            <td><strong>${item.sellPrice} DH</strong></td>
            <td><strong style="color:#10B981">${up.toFixed(2)} DH</strong></td>
            <td style="text-align:right;"><button class="action-btn" onclick="deleteProd('${item.id}')">🗑️</button></td>
        </tr>`;
    }).join('');

    // Update Top Stat Cards
    document.getElementById('rev').innerText = `${rev.toLocaleString()} DH`;
    document.getElementById('prof').innerText = `${prof.toLocaleString()} DH`;
    document.getElementById('totalStock').innerText = totalStk.toLocaleString();
    document.getElementById('low').innerText = low;
});
