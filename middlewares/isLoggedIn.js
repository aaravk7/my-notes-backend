const jwt = require('jsonwebtoken');

// Secret for JWT Token
const jwtSecret = "Thisismynotesapp";

const isLoggedIn = (req, res, next) => {
    const token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({ error: "Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, jwtSecret);
        req.user = data.id;
        next();
    } catch (error) {
        res.status(401).json({ error: "Please authenticate using a valid token" });
    }

}


module.exports = isLoggedIn;