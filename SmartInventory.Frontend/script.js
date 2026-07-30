const GATEWAY_URL = "https://smartinventory-gateway.onrender.com/api/product";

const statusMessage = document.getElementById("status-message");
const productList = document.getElementById("product-list");
const itemCount = document.getElementById("item-count");
const searchInput = document.getElementById("search-input");

const form = document.getElementById("product-form");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submit-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");

const editIdInput = document.getElementById("edit-id");
const nameInput = document.getElementById("input-name");
const descriptionInput = document.getElementById("input-description");
const priceInput = document.getElementById("input-price");
const categoryInput = document.getElementById("input-category");

let allProducts = [];

// READ

function loadProducts() {
    statusMessage.textContent = "Loading products...";
    productList.innerHTML = "";
    itemCount.textContent = "";

    fetch(GATEWAY_URL)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Server responded with status " + response.status);
            }
            return response.json();
        })
        .then(function (products) {
            statusMessage.textContent = "";
            allProducts = products;
            renderList(allProducts);
        })
        .catch(function (error) {
            statusMessage.innerHTML = "";
            productList.innerHTML =
                '<div class="error-box">Could not load products: ' + error.message + '</div>';
        });
}

// Search: filters allProducts as you type, no new fetch needed

searchInput.addEventListener("input", function () {
    const term = searchInput.value.trim().toLowerCase();

    if (term === "") {
        renderList(allProducts);
        return;
    }

    const filtered = allProducts.filter(function (product) {
        return (
            product.name.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    });

    renderList(filtered);
});

function renderList(products) {
    productList.innerHTML = "";

    if (products.length === 0) {
        itemCount.textContent = "";
        productList.innerHTML = '<div class="empty-box">No products match. Try a different search, or add one above.</div>';
        return;
    }

    itemCount.textContent = products.length + " item" + (products.length !== 1 ? "s" : "");

    products.forEach(function (product) {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-info">
                <h2>${product.name}<span class="product-category">${product.category}</span></h2>
                <p>${product.description}</p>
            </div>
            <div class="product-footer">
                <div class="product-price">₹${product.price}</div>
                <div class="product-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;

        card.querySelector(".edit-btn").addEventListener("click", function () {
            startEdit(product);
        });

        card.querySelector(".delete-btn").addEventListener("click", function () {
            deleteProduct(product.productId);
        });

        productList.appendChild(card);
    });
}

// CREATE and UPDATE both submit through this one form

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const productData = {
        name: nameInput.value,
        description: descriptionInput.value,
        price: parseFloat(priceInput.value),
        category: categoryInput.value
    };

    const editId = editIdInput.value;

    if (editId) {
        updateProduct(editId, productData);
    } else {
        createProduct(productData);
    }
});

function createProduct(productData) {
    fetch(GATEWAY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
    })
        .then(function (response) {
            if (!response.ok) throw new Error("Failed to create product");
            resetForm();
            loadProducts();
        })
        .catch(function (error) {
            alert(error.message);
        });
}

// UPDATE

function updateProduct(id, productData) {
    fetch(GATEWAY_URL + "/" + id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
    })
        .then(function (response) {
            if (!response.ok) throw new Error("Failed to update product");
            resetForm();
            loadProducts();
        })
        .catch(function (error) {
            alert(error.message);
        });
}

// DELETE

function deleteProduct(id) {
    if (!confirm("Delete this product?")) return;

    fetch(GATEWAY_URL + "/" + id, { method: "DELETE" })
        .then(function (response) {
            if (!response.ok) throw new Error("Failed to delete product");
            loadProducts();
        })
        .catch(function (error) {
            alert(error.message);
        });
}

// Form helpers

function startEdit(product) {
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

function resetForm() {
    form.reset();
    editIdInput.value = "";
    formTitle.textContent = "Add product";
    submitBtn.textContent = "Add product";
    cancelEditBtn.style.display = "none";
}

cancelEditBtn.addEventListener("click", resetForm);

// Initial load

loadProducts();