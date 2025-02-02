const API_URL = "http://localhost:3000"; // Your Express server

// Function to log in
async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            credentials: "include", // Ensure cookies are handled properly
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            sessionStorage.setItem("userRole", data.user.role);

            if (data.user.role === "admin") {
                window.location.href = "adminPage.html";
            } else {
                alert("You are logged in, but you do not have admin privileges.");
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Error logging in. Please try again.");
    }
}

// Function to register a new user
async function registerUser(username, password, role) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, role }),
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            fetchUsers();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert("Error registering user. Please try again.");
    }
}

// Function to fetch registered users (admin only)
async function fetchUsers() {
    try {
        const response = await fetch(`${API_URL}/users`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
        });

        if (response.status === 403) {
            alert("You are not authorized to view users.");
            return;
        }

        const data = await response.json();
        const userList = document.getElementById("userList");

        if (userList) {
            userList.innerHTML = "";

            data.forEach((user) => {
                const li = document.createElement("li");
                li.textContent = `${user.username} - Role: ${user.role}`;

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.style.marginLeft = "10px";
                deleteButton.addEventListener("click", function () {
                    deleteUser(user.username);
                });

                li.appendChild(deleteButton);
                userList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Function to delete a user (admin only)
async function deleteUser(username) {
    if (!confirm(`Are you sure you want to delete ${username}?`)) return;

    try {
        const response = await fetch(`${API_URL}/deleteUser`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("User deleted successfully!");
            fetchUsers(); // Refresh list
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// Function to log out
async function logout() {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            alert("You have been logged out.");
            sessionStorage.clear();
            window.location.href = "index.html";
        } else {
            alert("Logout failed. Please try again.");
        }
    } catch (error) {
        console.error("Logout error:", error);
    }
}

// Hook up forms and buttons
document.addEventListener("DOMContentLoaded", function () {
    // Login Form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            login(username, password);
        });
    }

    // Registration Form
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const username = document.getElementById("regUsername").value;
            const password = document.getElementById("regPassword").value;
            const role = document.getElementById("regRole").value;
            registerUser(username, password, role);
        });
    }

    // Logout Button
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
        logoutButton.addEventListener("click", logout);
    }

    // Fetch users on admin page load
    fetchUsers();
});