const API_URL = "https://ddheavyhauling.xyz"

// Signup function
async function signUp(username, email, password, role) {
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup successful! Please log in.");
            window.location.href = "index.html";
        } else {
            alert("Signup failed: " + (data.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Signup error:", error);
        alert("Signup error: " + error.message);
    }
}

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

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user)); // Store full user object

            if (data.user && data.user.role) {
                localStorage.setItem("role", data.user.role); // Ensure the role is stored

                switch (data.user.role) {
                    case "admin":
                        window.location.href = "admin.html";
                        break;
                    case "staff":
                        window.location.href = "staff.html";
                        break;
                    default:
                        alert("Unknown role, cannot redirect.");
                        window.location.href = "index.html";
                        break;
                }
            } else {
                alert("Login successful, but user role is missing.");
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
        window.location.href = "index.html";
    }
}

// Check if the current user is an admin
function checkAdmin() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
        alert("Access denied. Please log in.");
        window.location.href = "index.html";
        return;
    }

    if (role !== "admin") {
        alert("Access denied. Admins only.");
        window.location.href = "staff.html";
    }
}