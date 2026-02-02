const Role = require('../models/Role');

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private (Admin)
const getRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a role
// @route   POST /api/roles
// @access  Private (Admin)
const createRole = async (req, res) => {
    try {
        const { name, permissions, description } = req.body;

        const roleExists = await Role.findOne({ name });
        if (roleExists) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        const role = await Role.create({
            name,
            permissions,
            description
        });

        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoles,
    createRole
};
