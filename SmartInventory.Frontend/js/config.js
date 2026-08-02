const GATEWAY_URL = "https://smartinventory-gateway.onrender.com";

let authToken = null;
let currentUser = null; // { username, role, userId }

function authHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
    return headers;
}