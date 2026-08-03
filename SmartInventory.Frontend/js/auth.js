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

// Safely parses a response as JSON. If the server (or Render's proxy during
// a cold start) returns HTML/plain text instead of JSON, this throws a
// clear, user-facing error instead of crashing on response.json().
async function safeJson(response) {
    const contentType = response.headers.get("content-type") || "";
    const rawText = await response.text();

    if (!contentType.includes("application/json")) {
        throw new Error(
            response.status === 502 || response.status === 503 || rawText.includes("<!DOCTYPE")
                ? "The server is still waking up (free hosting sleeps when idle). Please wait 30–40 seconds and try again."
                : `Unexpected response from server (status ${response.status}).`
        );
    }

    try {
        return JSON.parse(rawText);
    } catch {
        throw new Error("Received an invalid response from the server. Please try again.");
    }
}

function setAuthLoading(isLoading, label) {
    authSubmitBtn.disabled = isLoading;
    authSubmitBtn.textContent = isLoading ? "Please wait…" : label;
}

async function register() {
    authError.textContent = "";
    authError.style.color = "var(--danger)";
    setAuthLoading(true, "Create account");
    try {
        const response = await fetch(`${GATEWAY_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: authUsername.value.trim(),
                email: authEmail.value.trim(),
                password: authPassword.value,
                role: authRole.value
            })
        });

        if (!response.ok) {
            const data = await safeJson(response).catch(() => null);
            throw new Error((data && data.title) || "Registration failed. Username may already exist.");
        }

        openAuthModal(false);
        authError.style.color = "#6FCF97";
        authError.textContent = "Account created. Sign in to continue.";
    } catch (err) {
        authError.style.color = "var(--danger)";
        authError.textContent = err.message;
    } finally {
        setAuthLoading(false, "Create account");
    }
}

async function login() {
    authError.textContent = "";
    authError.style.color = "var(--danger)";
    setAuthLoading(true, "Sign in");
    try {
        const response = await fetch(`${GATEWAY_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: authUsername.value.trim(), password: authPassword.value })
        });

        const result = await safeJson(response);

        if (!response.ok || !result.success) {
            throw new Error("Invalid username or password.");
        }

        authToken = result.token;
        currentUser = { username: authUsername.value.trim(), role: result.role, userId: result.userId };
        loginModal.style.display = "none";
        enterApp();
    } catch (err) {
        authError.style.color = "var(--danger)";
        authError.textContent = err.message;
    } finally {
        setAuthLoading(false, "Sign in");
    }
}

function doLogout() {
    authToken = null;
    currentUser = null;
    exitApp();
}
document.getElementById("logout-btn").addEventListener("click", doLogout);
document.getElementById("mobile-logout-btn").addEventListener("click", doLogout);