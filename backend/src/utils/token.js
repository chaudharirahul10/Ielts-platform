const crypto = require("crypto");

/**
 * Generate a random secure token
 * @returns {string}
 */
const generateToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash a token before saving it to MongoDB
 * @param {string} token
 * @returns {string}
 */
const hashToken = (token) => {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
};

module.exports = {
    generateToken,
    hashToken,
};