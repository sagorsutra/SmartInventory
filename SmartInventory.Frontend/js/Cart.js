let cart = []; // [{ productId, name, price, quantity }]

const cartOverlay = document.getElementById("cart-overlay");
const cartItemsEl = document.getElementById("cart-items");
const cartEmptyEl = document.getElementById("cart-empty");
const cartTotalAmountEl = document.getElementById("cart-total-amount");
const cartAddressInput = document.getElementById("cart-address");
const cartErrorEl = document.getElementById("cart-error");
const cartBadge = document.getElementById("cart-badge");
const mobileCartBadge = document.getElementById("mobile-cart-badge");

function addToCart(product) {
    const cleanId = product.productId.trim();
    const existing = cart.find(item => item.productId === cleanId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ productId: cleanId, name: product.name, price: product.price, quantity: 1 });
    }
    updateCartBadge();
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = count;
    mobileCartBadge.textContent = count;
}

function openCart() {
    renderCart();
    cartOverlay.style.display = "flex";
}
function closeCart() {
    cartOverlay.style.display = "none";
}

document.getElementById("cart-btn").addEventListener("click", openCart);
document.getElementById("mobile-cart-btn").addEventListener("click", openCart);
document.getElementById("cart-close-btn").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", (e) => { if (e.target === cartOverlay) closeCart(); });

function renderCart() {
    cartErrorEl.textContent = "";
    cartItemsEl.innerHTML = "";
    if (cart.length === 0) {
        cartEmptyEl.style.display = "block";
        cartItemsEl.style.display = "none";
    } else {
        cartEmptyEl.style.display = "none";
        cartItemsEl.style.display = "flex";
        cart.forEach(item => {
            const row = document.createElement("div");
            row.className = "cart-item";
            row.innerHTML = `
                <div class="info">
                    <strong>${item.name}</strong>
                    ₹${item.price} each
                </div>
                <div class="qty-controls">
                    <button class="qty-minus">−</button>
                    <span>${item.quantity}</span>
                    <button class="qty-plus">+</button>
                    <button class="remove-cart-item">✕</button>
                </div>`;
            row.querySelector(".qty-minus").addEventListener("click", () => changeQty(item.productId, -1));
            row.querySelector(".qty-plus").addEventListener("click", () => changeQty(item.productId, 1));
            row.querySelector(".remove-cart-item").addEventListener("click", () => removeFromCart(item.productId));
            cartItemsEl.appendChild(row);
        });
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotalAmountEl.textContent = "₹" + total;
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) cart = cart.filter(i => i.productId !== productId);
    updateCartBadge();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.productId !== productId);
    updateCartBadge();
    renderCart();
}

document.getElementById("checkout-btn").addEventListener("click", () => {
    cartErrorEl.textContent = "";
    if (cart.length === 0) { cartErrorEl.textContent = "Your cart is empty."; return; }
    if (!cartAddressInput.value.trim()) { cartErrorEl.textContent = "Enter a shipping address."; return; }

    const orderData = {
        customerId: currentUser.username,
        shippingAddress: cartAddressInput.value.trim(),
        items: cart.map(item => ({ productId: item.productId.trim(), quantity: item.quantity }))
    };

    fetch(ORDER_URL, { method: "POST", headers: authHeaders(), body: JSON.stringify(orderData) })
        .then(r => { if (!r.ok) throw new Error("Failed to place order. Please try again."); return r.json(); })
        .then(order => {
            cart = [];
            updateCartBadge();
            cartAddressInput.value = "";
            closeCart();
            switchTab("orders");
            renderOrders([order]);
        })
        .catch(err => { cartErrorEl.textContent = err.message; });
});