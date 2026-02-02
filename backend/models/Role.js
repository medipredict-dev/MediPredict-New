const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a role name'],
        unique: true,
        trim: true
    },
    permissions: [{
        type: String,
        required: true
    }],
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);
