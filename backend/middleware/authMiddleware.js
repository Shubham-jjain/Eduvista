import jwt from "jsonwebtoken";

// Verifies JWT from cookie and attaches userId and role to req.user
export const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { userId: decoded.userId, role: decoded.role };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Soft auth: attaches req.user if token exists, but does not block unauthenticated requests
export const optionalAuthMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = { userId: decoded.userId, role: decoded.role };
        } catch {
            // Invalid token — proceed without user
        }
    }
    next();
};
