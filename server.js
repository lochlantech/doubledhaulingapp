const express = require("express");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const nano = require("nano")("http://admin:lochlan@127.0.0.1:5984");
const usersDb = nano.db.use("users");

const app = express();
const PORT = 3000;

// ✅ Middleware
const allowedOrigins = ["http://localhost:49391", "http://127.0.0.1:8080"];
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true, // Allow cookies
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: "a_secure_random_string_for_dev",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport Authentication with CouchDB
passport.use(
    new LocalStrategy(async (username, password, done) => {
        console.log(`Authenticating user: ${username}`);
        try {
            const userDoc = await usersDb.get(`user:${username}`).catch(() => null);
            if (!userDoc) {
                console.log("User not found");
                return done(null, false, { message: "User not found" });
            }

            const isMatch = await bcrypt.compare(password, userDoc.password);
            if (!isMatch) {
                console.log("Password mismatch");
                return done(null, false, { message: "Incorrect password" });
            }

            console.log("Authentication successful");
            return done(null, userDoc);
        } catch (error) {
            console.error("Error during authentication:", error);
            return done(error);
        }
    })
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await usersDb.get(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// ✅ Route to Create a Test User in CouchDB
app.post("/createTestUser", async (req, res) => {
    try {
        const user = {
            _id: "user:testuser",
            username: "testuser",
            password: await bcrypt.hash("testpassword", 10),
            role: "admin",
        };
        const response = await usersDb.insert(user);
        console.log("Response from CouchDB:", response);
        res.status(201).send({ message: "Test user created successfully" });
    } catch (error) {
        console.error("Error creating test user:", error);
        res.status(500).send({ message: "Error creating test user" });
    }
});

// ✅ Register New User in CouchDB
app.post("/register", async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const existingUser = await usersDb.get(`user:${username}`).catch(() => null);
        if (existingUser) {
            return res.status(400).send({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await usersDb.insert({
            _id: `user:${username}`,
            username,
            password: hashedPassword,
            role,
        });

        res.send({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send({ message: "Error registering user" });
    }
});

// ✅ Login Route
app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return res.status(500).send({ message: "Internal server error" });
        }
        if (!user) {
            return res.status(401).send({ message: info.message || "Unauthorized" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).send({ message: "Failed to log in" });
            }
            return res.send({ message: "Login successful", user });
        });
    })(req, res, next);
});

// ✅ Logout Route
app.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).send({ message: "Logout failed" });
        res.send({ message: "Logged out successfully" });
    });
});

// ✅ Fetch All Users (Admin Only)
app.get("/users", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(403).send({ message: "Not authorized" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).send({ message: "Only admin can access this resource" });
    }

    try {
        const usersList = await usersDb.list({ include_docs: true });
        const users = usersList.rows.map((row) => ({
            username: row.doc.username,
            role: row.doc.role,
        }));

        res.send(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send({ message: "Error fetching users" });
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));