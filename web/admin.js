import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcxpkGJq1w7_FOz4KPJF4QLecSzP83QaM",
  authDomain: "doubledhaulingapp.firebaseapp.com",
  projectId: "doubledhaulingapp",
  storageBucket: "doubledhaulingapp.firebasestorage.app",
  messagingSenderId: "54664234955",
  appId: "1:54664234955:web:fda99d516275fbcc37984e",
  measurementId: "G-MQEL2GV67W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Create User
document.getElementById("createUserForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("newUserEmail").value;
  const password = document.getElementById("newUserPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert(`User ${userCredential.user.email} created successfully!`);
      document.getElementById("createUserForm").reset();
    })
    .catch((error) => {
      console.error("Error creating user:", error.message);
      alert("Error creating user: " + error.message);
    });
});

// Simulated Delete User
document.getElementById("deleteUserForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("deleteUserEmail").value;
  alert(`Pretend deleting user with email: ${email}`);
});

// Handle Logout
document.getElementById("logoutButton").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      alert("You have been logged out.");
      window.location.href = "index.html"; // Redirect to login page
    })
    .catch((error) => {
      console.error("Error logging out:", error.message);
      alert("Error logging out: " + error.message);
    });
});