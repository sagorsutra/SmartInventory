const welcomeScreen = document.getElementById("welcome-screen");
const appShell = document.getElementById("app-shell");
const userName = document.getElementById("user-name");
const userRole = document.getElementById("user-role");
const mobileUser = document.getElementById("mobile-user");

function enterApp() {
    welcomeScreen.style.display = "none";
    appShell.style.display = "flex";

    userName.textContent = currentUser.username;
    userRole.textContent = currentUser.role;
    mobileUser.textContent = `${currentUser.username} · ${currentUser.role}`;

    const visibleTabs = getVisibleTabsForRole(currentUser.role);
    applyTabVisibility(visibleTabs);
    applyRoleFormRules(currentUser.role);

    switchTab(visibleTabs[0]);
    loadProducts();
    if (currentUser.role === "Customer") {
        loadOrdersForCustomer(currentUser.username);
    } else {
        loadAllOrders();
    }
}

function exitApp() {
    appShell.style.display = "none";
    welcomeScreen.style.display = "flex";
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
}

function getVisibleTabsForRole(role) {
    if (role === "Customer") return ["products", "orders"];
    if (role === "Staff") return ["orders", "inventory"];
    return ["products", "orders", "inventory"]; // Admin
}

function applyTabVisibility(visibleTabs) {
    ["products", "orders", "inventory"].forEach(tab => {
        const show = visibleTabs.includes(tab);
        const desktopBtn = document.getElementById("nav-" + tab);
        const mobileBtn = document.getElementById("mnav-" + tab);
        if (desktopBtn) desktopBtn.style.display = show ? "flex" : "none";
        if (mobileBtn) mobileBtn.style.display = show ? "flex" : "none";
    });
}

function applyRoleFormRules(role) {
    const productForm = document.getElementById("product-form");
    const orderLookupCustomer = document.getElementById("order-lookup-customer");
    const orderLookupBtn = document.getElementById("order-lookup-btn");
    const cartBtn = document.getElementById("cart-btn");
    const mobileCartBtn = document.getElementById("mobile-cart-btn");

    const canOrder = role === "Customer" || role === "Admin";
    cartBtn.style.display = canOrder ? "flex" : "none";
    mobileCartBtn.style.display = canOrder ? "flex" : "none";

    if (role === "Customer") {
        productForm.style.display = "none";
        orderLookupCustomer.style.display = "none";
        orderLookupBtn.style.display = "none";
    } else {
        productForm.style.display = role === "Admin" ? "flex" : "none";
        orderLookupCustomer.style.display = "block";
        orderLookupBtn.style.display = "inline-block";
    }
}

function switchTab(tabName) {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    const desktopBtn = document.getElementById("nav-" + tabName);
    const mobileBtn = document.getElementById("mnav-" + tabName);
    if (desktopBtn) desktopBtn.classList.add("active");
    if (mobileBtn) mobileBtn.classList.add("active");
    document.getElementById("tab-" + tabName).classList.add("active");
}

document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

// Gated start
exitApp();