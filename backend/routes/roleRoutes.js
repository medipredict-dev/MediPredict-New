const express = require('express');
const router = express.Router();
const { getRoles, createRole } = require('../controllers/roleController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, restrictTo('Admin'), getRoles)
    .post(protect, restrictTo('Admin'), createRole);

module.exports = router;
