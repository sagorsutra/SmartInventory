let isRegisterMode = false;

const loginModal = document.getElementById("login-modal");
const authModalHeading = document.getElementById("auth-modal-heading");
const authModalTitle = document.getElementById("auth-modal-title");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authEmail = document.getElementById("auth-email");
const authRole = document.getElementById("auth-role");
const authSubmitBtn = document.getElementById("auth-submit-btn");
const authCancelBtn = document.getElementById("auth-cancel-btn");
const authError = document.getElementById("auth-error");

document.getElementById("welcome-login-btn").addEventListener("click", () => openAuthModal(false));
document.getElementById("welcome-register-btn").addEventListener("click", () => openAuthModal(true));
authCancelBtn.addEventListener("click", () => loginModal.style.display = "none");

function openAuthModal(registerMode) {
    isRegisterMode = registerMode;
    authError.textContent = "";
    authUsername.value = "";
    authPassword.value = "";
    authEmail.value = "";

    authModalTitle.textContent = registerMode ? "Create account" : "Sign in";
    authModalHeading.textContent = registerMode ? "Join SmartInventory" : "Welcome back";
    authSubmitBtn.textContent = registerMode ? "Create account" : "Sign in";
    authEmail.style.display = registerMode ? "block" : "none";
    authRole.style.display = registerMode ? "block" : "none";

    document.getElementById("auth-switch").innerHTML = registerMode
        ? 'Already have an account? <a href="#" id="auth-switch-link">Sign in</a>'
        : 'No account? <a href="#" id="auth-switch-link">Register</a>';
    document.getElementById("auth-switch-link").addEventListener("click", (e) => {
        e.preventDefault();
        openAuthModal(!isRegisterMode);
    });

    loginModal.style.display = "flex";
}

authSubmitBtn.addEventListener("click", () => {
    if (isRegisterMode) register(); else login();
});

function register() {
    authError.textContent = "";
    fetch(`${GATEWAY_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: authUsername.value,
            email: authEmail.value,
            password: authPassword.value,
            role: authRole.value
        })
    })
        .then(r => { if (!r.ok) throw new Error("Registration failed. Username may already exist."); return r.json(); })
        .then(() => {
            openAuthModal(false);
            authError.style.color = "#6FCF97";
            authError.textContent = "Account created. Sign in to continue.";
        })
        .catch(err => { authError.style.color = "var(--danger)"; authError.textContent = err.message; });
}

function login() {
    authError.textContent = "";
    fetch(`${GATEWAY_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: authUsername.value, password: authPassword.value })
    })
        .then(r => r.json())
        .then(result => {
            if (!result.success) throw new Error("Invalid username or password.");
            authToken = result.token;
            currentUser = { username: authUsername.value, role: result.role, userId: result.userId };
            loginModal.style.display = "none";
            enterApp();
        })
        .catch(err => { authError.style.color = "var(--danger)"; authError.textContent = err.message; });
}

function doLogout() {
    authToken = null;
    currentUser = null;
    exitApp();
}
document.getElementById("logout-btn").addEventListener("click", doLogout);
document.getElementById("mobile-logout-btn").addEventListener("click", doLogout);