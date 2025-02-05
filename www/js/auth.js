const API_URL = "http://localhost:5150"; // Correct port

// Signup function
async function signUp(username, email, password, role) {
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role }), // Include role
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup successful! Please log in.");
            window.location.href = "index.html"; // Redirect to login page
        } else {
            alert("Signup failed: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert("Signup error: " + error.message);
    }
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Login successful:", data);

            // Store the JWT and role in localStorage
            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            // Redirect based on role
            if (data.role === "admin") {
                window.location.href = "admin.html";
            } else if (data.role === "staff") {
                window.location.href = "staff.html";
            } else {
                alert("Unknown role, cannot redirect.");
            }
        } else {
            alert("Login failed: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login error: " + error.message);
    }
}

// Logout function
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "index.html";
}

// Check authentication before accessing protected pages
function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "index.html"; // Redirect to login
    }
}