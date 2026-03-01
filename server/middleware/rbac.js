const User = require('../models/User');

const requireRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            // Find user to get latest role
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }

            if (!roles.includes(user.role)) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            // Attach full user object to request
            req.userObj = user;
            next();
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };
};

module.exports = requireRole;
