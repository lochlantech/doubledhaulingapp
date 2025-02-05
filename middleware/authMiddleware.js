const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and attach user data to the request object.
 */
function verifyToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach decoded token data to request
        next();
    } catch (error) {
        return res.status(403).json({ message: "Access Denied: Invalid token" });
    }
}

/**
 * Middleware to check if the user has the "admin" role.
 */
function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access Denied: Admins only" });
    }
    next();
}

/**
 * Middleware to check if the user has the "staff" role.
 */
function isStaff(req, res, next) {
    if (!req.user || req.user.role !== "staff") {
        return res.status(403).json({ message: "Access Denied: Staff only" });
    }
    next();
}

module.exports = { verifyToken, isAdmin, isStaff };