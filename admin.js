import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Function to add a product with Cost Price tracking
async function addNewProduct() {
    const name = document.getElementById('pName').value;
    const sell = parseFloat(document.getElementById('pSell').value);
    const cost = parseFloat(document.getElementById('pCost').value);
    const stock = parseInt(document.getElementById('pStock').value);
    
    // Automatic Profit Calculation for your Dashboard
    const profit = sell - cost;
    const margin = ((profit / sell) * 100).toFixed(1);

    try {
        await addDoc(collection(db, "products"), {
            name,
            category: document.getElementById('pCat').value,
            sellPrice: sell,
            costPrice: cost,
            stock: stock,
            profitPerUnit: profit,
            marginPercent: margin,
            createdAt: new Date()
        });
        alert("Produit ajouté à l'inventaire !");
    } catch (err) {
        console.error("Error: ", err);
    }
}
