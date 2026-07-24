const GATEWAY_URL = "https://smartinventory-gateway.onrender.com/api/product";

const statusMessage = document.getElementById("status-message");
const productList = document.getElementById("product-list");

function loadProducts() {
    statusMessage.textContent = "Loading products...";
    productList.innerHTML = "";

    fetch(GATEWAY_URL)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Server responded with status " + response.status);
            }
            return response.json();
        })
        .then(function (products) {
            statusMessage.textContent = "";
            displayProducts(products);
        })
        .catch(function (error) {
            statusMessage.innerHTML = "";
            productList.innerHTML =
                '<div class="error-box">Could not load products: ' + error.message + '</div>';
        });
}

function displayProducts(products) {
    if (products.length === 0) {
        statusMessage.textContent = "No products in stock.";
        return;
    }

    
    products.forEach(function (product) {

    
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <div class="product-info">
                <h2>${product.name}<span class="product-category">${product.category}</span></h2>
                <p>${product.description}</p>
            </div>
            <div class="product-price">₹${product.price}</div>
        `;

        productList.appendChild(card);
    });
}

loadProducts();

