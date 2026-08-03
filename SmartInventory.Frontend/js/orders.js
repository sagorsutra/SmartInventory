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

function loadAllOrders() {
    orderStatusMessage.textContent = "Loading all orders…";
    fetch(ORDER_URL)
        .then(r => { if (!r.ok) throw new Error("Failed to load orders"); return r.json(); })
        .then(orders => { orderStatusMessage.textContent = ""; renderOrders(orders); })
        .catch(err => { orderStatusMessage.innerHTML = `<div class="error-box">${err.message}</div>`; });
}

function statusLightClass(status) {
    return (status || "pending").toLowerCase();
}

const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

function updateOrderStatus(orderId, newStatus, onDone) {
    fetch(`${ORDER_URL}/${orderId}/status?status=${newStatus}`, {
        method: "PUT",
        headers: authHeaders()
    })
        .then(r => { if (!r.ok) throw new Error("Failed to update status"); onDone(null); })
        .catch(err => onDone(err.message));
}

function renderOrders(orders) {
    orderList.innerHTML = "";
    if (!orders || orders.length === 0) {
        orderList.innerHTML = '<div class="empty-box">No orders found.</div>';
        return;
    }
    const canManageStatus = currentUser && (currentUser.role === "Staff" || currentUser.role === "Admin");
    orders.forEach(order => {
        const card = document.createElement("div");
        card.className = "order-card";
        const orderItems = order.items || order.orderItems || [];
        const itemsHtml = orderItems.length > 0
            ? orderItems.map(i => `${i.quantity}× ${i.productName} (₹${i.unitPrice})`).join(" · ")
            : "No items";

        const statusControlHtml = canManageStatus ? `
            <div class="status-control">
                <select class="status-select">
                    ${ORDER_STATUSES.map(s => `<option value="${s}" ${s === order.status ? "selected" : ""}>${s}</option>`).join("")}
                </select>
                <button class="btn btn-ghost btn-small update-status-btn">Update</button>
                <span class="status-save-msg"></span>
            </div>` : "";

        card.innerHTML = `
            <h3><span class="status-light ${statusLightClass(order.status)}"></span> Order ${order.orderId ? order.orderId.slice(-6) : ""} <span class="tag">${order.status}</span></h3>
            <p class="meta">${order.customerId} — total ₹${order.totalAmount} — ${order.shippingAddress}</p>
            <p class="items-line">${itemsHtml}</p>
            ${statusControlHtml}`;

        if (canManageStatus) {
            const select = card.querySelector(".status-select");
            const btn = card.querySelector(".update-status-btn");
            const msg = card.querySelector(".status-save-msg");
            btn.addEventListener("click", () => {
                btn.disabled = true;
                msg.textContent = "Saving…";
                msg.style.color = "var(--text-muted)";
                updateOrderStatus(order.orderId, select.value, (error) => {
                    btn.disabled = false;
                    if (error) {
                        msg.style.color = "var(--danger)";
                        msg.textContent = error;
                    } else {
                        msg.style.color = "#6FCF97";
                        msg.textContent = "Updated";
                        card.querySelector(".tag").textContent = select.value;
                        card.querySelector(".status-light").className = `status-light ${statusLightClass(select.value)}`;
                    }
                });
            });
        }

        orderList.appendChild(card);
    });
}