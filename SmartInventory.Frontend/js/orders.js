const ORDER_URL = `${GATEWAY_URL}/api/order`;

const orderStatusMessage = document.getElementById("order-status-message");
const orderList = document.getElementById("order-list");
const orderLookupBtn = document.getElementById("order-lookup-btn");
const orderLookupCustomer = document.getElementById("order-lookup-customer");

orderLookupBtn.addEventListener("click", () => {
    const customerId = orderLookupCustomer.value.trim();
    if (customerId) loadOrdersForCustomer(customerId);
});

function loadOrdersForCustomer(customerId) {
    orderStatusMessage.textContent = "Loading orders…";
    fetch(`${ORDER_URL}/customer/${customerId}`)
        .then(r => { if (!r.ok) throw new Error("Failed to load orders"); return r.json(); })
        .then(orders => { orderStatusMessage.textContent = ""; renderOrders(orders); })
        .catch(err => { orderStatusMessage.innerHTML = `<div class="error-box">${err.message}</div>`; });
}

function statusLightClass(status) {
    return (status || "pending").toLowerCase();
}

function renderOrders(orders) {
    orderList.innerHTML = "";
    if (!orders || orders.length === 0) {
        orderList.innerHTML = '<div class="empty-box">No orders found.</div>';
        return;
    }
    orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";
        const orderItems = order.items || order.orderItems || [];
        const itemsHtml = orderItems.length > 0
            ? orderItems.map(i => `${i.quantity}× ${i.productName} (₹${i.unitPrice})`).join(" · ")
            : "No items";
        card.innerHTML = `
            <h3><span class="status-light ${statusLightClass(order.status)}"></span> Order ${order.orderId ? order.orderId.slice(-6) : ""} <span class="tag">${order.status}</span></h3>
            <p class="meta">${order.customerId} — total ₹${order.totalAmount} — ${order.shippingAddress}</p>
            <p class="items-line">${itemsHtml}</p>`;
        orderList.appendChild(card);
    });
}