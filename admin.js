let products = [];
let orders = []; // In a real system, you'd fetch this from your database

// 1. Initial Load
async function loadAdminData() {
    // In production, fetch from your products.json
    // For now, simulating with LocalStorage for live editing
    const savedProducts = localStorage.getItem('lascoburo_products');
    if(savedProducts) {
        products = JSON.parse(savedProducts);
    } else {
        const res = await fetch('products.json');
        products = await res.json();
    }
    updateDashboardStats();
    renderInventory();
}

// 2. Dashboard Logic (Profits & Stock)
function updateDashboardStats() {
    let totalStockValue = 0;
    let potentialProfit = 0;
    let lowStock = 0;

    products.forEach(p => {
        totalStockValue += p.price * p.stock;
        potentialProfit += (p.price - p.cost) * p.stock;
        if(p.stock < 10) lowStock++;
    });

    document.getElementById('totalSales').innerText = `${totalStockValue.toLocaleString()} DH`;
    document.getElementById('totalProfit').innerText = `${potentialProfit.toLocaleString()} DH`;
    document.getElementById('lowStockCount').innerText = lowStock;
    
    const margin = (potentialProfit / totalStockValue) * 100;
    document.getElementById('profitMargin').innerText = `${margin.toFixed(1)}%`;
}

// 3. Profit Calculator (Live in Modal)
function calcProfit() {
    const price = parseFloat(document.getElementById('pPrice').value) || 0;
    const cost = parseFloat(document.getElementById('pCost').value) || 0;
    const profit = price - cost;
    const percent = price > 0 ? (profit / price) * 100 : 0;

    document.getElementById('pProfit').innerText = profit.toFixed(2);
    document.getElementById('pPercent').innerText = percent.toFixed(1);
}

// 4. Render Inventory Table
function renderInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><b>${p.name}</b></td>
            <td>${p.price} DH</td>
            <td>${p.cost} DH</td>
            <td><span class="badge ${p.stock < 10 ? 'red' : ''}">${p.stock}</span></td>
            <td style="color:var(--success)">+${(p.price - p.cost).toFixed(2)} DH</td>
            <td>
                <button onclick="editProduct(${p.id})">✏️</button>
                <button onclick="deleteProduct(${p.id})">🗑️</button>
            </td>
        </tr>
    `).join('');
}

// 5. Section Switching
function showSection(sectionId) {
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    // Logic to highlight active button
}

// Add more CRUD functions (openAddModal, deleteProduct, etc.)
// And save back to localStorage: localStorage.setItem('lascoburo_products', JSON.stringify(products));

loadAdminData();
