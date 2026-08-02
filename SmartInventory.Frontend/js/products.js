const PRODUCT_URL = `${GATEWAY_URL}/api/product`;

const statusMessage = document.getElementById("status-message");
const productList = document.getElementById("product-list");
const itemCount = document.getElementById("item-count");
const searchInput = document.getElementById("search-input");
const productForm = document.getElementById("product-form");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const editIdInput = document.getElementById("edit-id");
const nameInput = document.getElementById("input-name");
const descriptionInput = document.getElementById("input-description");
const priceInput = document.getElementById("input-price");
const categoryInput = document.getElementById("input-category");

let allProducts = [];

function loadProducts() {
    statusMessage.textContent = "Loading products…";
    productList.innerHTML = "";
    itemCount.textContent = "";
    fetch(PRODUCT_URL)
        .then(r => { if (!r.ok) throw new Error("Server responded " + r.status); return r.json(); })
        .then(products => { statusMessage.textContent = ""; allProducts = products; renderProductList(allProducts); })
        .catch(err => { productList.innerHTML = `<div class="error-box">Could not load products: ${err.message}</div>`; });
}

searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    if (term === "") { renderProductList(allProducts); return; }
    renderProductList(allProducts.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)));
});

function renderProductList(products) {
    productList.innerHTML = "";
    if (products.length === 0) {
        itemCount.textContent = "";
        productList.innerHTML = '<div class="empty-box">No products found.</div>';
        return;
    }
    const canManage = currentUser && currentUser.role === "Admin";
    itemCount.textContent = products.length + " item" + (products.length !== 1 ? "s" : "");
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        const canOrder = currentUser && (currentUser.role === "Customer" || currentUser.role === "Admin");
        card.innerHTML = `
            <div class="product-info">
                <h3>${product.name}<span class="tag">${product.category}</span></h3>
                <p>${product.description}</p>
                <p class="mono-id">${product.productId}</p>
            </div>
            <div class="product-footer">
                <div class="price">₹${product.price}</div>
                <div class="card-actions">
                    ${canOrder ? `<button class="add-to-cart-btn">+ Cart</button>` : ""}
                    ${canManage ? `<button class="edit-btn">Edit</button><button class="delete-btn">Delete</button>` : ""}
                </div>
            </div>`;
        if (canManage) {
            card.querySelector(".edit-btn").addEventListener("click", () => startEditProduct(product));
            card.querySelector(".delete-btn").addEventListener("click", () => deleteProduct(product.productId));
        }
        if (canOrder) {
            card.querySelector(".add-to-cart-btn").addEventListener("click", () => addToCart(product));
        }
        productList.appendChild(card);
    });
}

productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = { name: nameInput.value, description: descriptionInput.value, price: parseFloat(priceInput.value), category: categoryInput.value };
    const editId = editIdInput.value;
    if (editId) updateProduct(editId, data); else createProduct(data);
});

function createProduct(data) {
    fetch(PRODUCT_URL, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) })
        .then(r => { if (!r.ok) throw new Error("Failed to create product"); resetProductForm(); loadProducts(); })
        .catch(err => alert(err.message));
}
function updateProduct(id, data) {
    fetch(`${PRODUCT_URL}/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) })
        .then(r => { if (!r.ok) throw new Error("Failed to update product"); resetProductForm(); loadProducts(); })
        .catch(err => alert(err.message));
}
function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;
    fetch(`${PRODUCT_URL}/${id}`, { method: "DELETE", headers: authHeaders() })
        .then(r => { if (!r.ok) throw new Error("Failed to delete product"); loadProducts(); })
        .catch(err => alert(err.message));
}
function startEditProduct(product) {
    editIdInput.value = product.productId;
    nameInput.value = product.name;
    descriptionInput.value = product.description;
    priceInput.value = product.price;
    categoryInput.value = product.category;
    formTitle.textContent = "Edit product";
    submitBtn.textContent = "Save changes";
    cancelEditBtn.style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}
function resetProductForm() {
    productForm.reset();
    editIdInput.value = "";
    formTitle.textContent = "Add product";
    submitBtn.textContent = "Add product";
    cancelEditBtn.style.display = "none";
}
cancelEditBtn.addEventListener("click", resetProductForm);