const INVENTORY_URL = `${GATEWAY_URL}/api/inventory`;

const inventoryForm = document.getElementById("inventory-form");
const inventoryStatusMessage = document.getElementById("inventory-status-message");
const inventoryList = document.getElementById("inventory-list");
const invAlertsBtn = document.getElementById("inv-alerts-btn");
const invLookupBtn = document.getElementById("inv-lookup-btn");
const invLookupId = document.getElementById("inv-lookup-id");

inventoryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
        productId: document.getElementById("inv-product-id").value,
        stockQuantity: parseInt(document.getElementById("inv-quantity").value),
        reorderThreshold: parseInt(document.getElementById("inv-threshold").value)
    };
    fetch(INVENTORY_URL, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) })
        .then(r => { if (!r.ok) throw new Error("Failed to save stock record"); return r.json(); })
        .then(inv => { inventoryStatusMessage.textContent = ""; inventoryForm.reset(); renderInventoryRecords([inv]); })
        .catch(err => { inventoryStatusMessage.innerHTML = `<div class="error-box">${err.message}</div>`; });
});

invLookupBtn.addEventListener("click", () => {
    const productId = invLookupId.value.trim();
    if (!productId) return;
    inventoryStatusMessage.textContent = "Checking…";
    fetch(`${INVENTORY_URL}/${productId}`)
        .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
        .then(stock => {
            inventoryStatusMessage.textContent = "";
            renderInventoryRecords([{ productId, stockQuantity: stock, reorderThreshold: "—" }]);
        })
        .catch(err => { inventoryStatusMessage.innerHTML = `<div class="error-box">${err.message}</div>`; });
});

invAlertsBtn.addEventListener("click", () => {
    inventoryStatusMessage.textContent = "Loading alerts…";
    fetch(`${INVENTORY_URL}/alerts`)
        .then(r => { if (!r.ok) throw new Error("Failed to load alerts"); return r.json(); })
        .then(alerts => {
            inventoryStatusMessage.textContent = "";
            if (alerts.length === 0) { inventoryList.innerHTML = '<div class="empty-box">No low-stock alerts. All good.</div>'; return; }
            inventoryList.innerHTML = "";
            alerts.forEach(a => {
                const card = document.createElement("div");
                card.className = "inventory-card low";
                card.innerHTML = `
                    <div><strong>${a.productName}</strong><br><span class="mono-id">${a.productId}</span></div>
                    <div>Stock ${a.currentStock} / Threshold ${a.reorderThreshold}</div>`;
                inventoryList.appendChild(card);
            });
        })
        .catch(err => { inventoryStatusMessage.innerHTML = `<div class="error-box">${err.message}</div>`; });
});

function renderInventoryRecords(records) {
    inventoryList.innerHTML = "";
    records.forEach(r => {
        const card = document.createElement("div");
        card.className = "inventory-card";
        card.innerHTML = `<div><strong>${r.productId}</strong></div><div>Stock ${r.stockQuantity} · Threshold ${r.reorderThreshold}</div>`;
        inventoryList.appendChild(card);
    });
}