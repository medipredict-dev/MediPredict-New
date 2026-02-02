const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role'); // Ensure Role is loaded

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token and populate roles
            req.user = await User.findById(decoded.id)
                .select('-password')
                .populate('roles');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        // req.user.roles is an array of objects populated from DB
        const userRoleNames = req.user.roles.map(role => role.name);

        // Check if user has ANY of the allowed roles
        const hasRole = userRoleNames.some(roleName => allowedRoles.includes(roleName));

        if (!hasRole) {
            return res.status(403).json({
                message: `User role(s) [${userRoleNames.join(', ')}] not authorized to access this route. Required: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo };
