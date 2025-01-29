import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBcxpkGJq1w7_FOz4KPJF4QLecSzP83QaM",
    authDomain: "doubledhaulingapp.firebaseapp.com",
    projectId: "doubledhaulingapp",
    storageBucket: "doubledhaulingapp.firebasestorage.app",
    messagingSenderId: "54664234955",
    appId: "1:54664234955:web:fda99d516275fbcc37984e",
    measurementId: "G-MQEL2GV67W",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Handle Login
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const userEmail = userCredential.user.email;
            console.log("Login successful:", userEmail);

            // Redirect based on email
            if (userEmail === "admin@example.com") {
                window.location.href = "admin.html"; // Redirect admin
            } else {
                window.location.href = "homepage.html"; // Redirect regular user
            }
        })
        .catch((error) => {
            console.error("Error logging in:", error.message);
            alert("Login failed: " + error.message);
        });
});

// Handle Forgot Password
document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
    e.preventDefault();
    const email = prompt("Enter your email to reset your password:");
    if (email) {
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert("Password reset email sent!");
            })
            .catch((error) => {
                console.error("Error sending password reset email:", error.message);
                alert("Error: " + error.message);
            });
    }
});