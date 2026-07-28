const express = require('express');
const router = express.Router();
const {
    getProperties,
    getFeaturedProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertiesByType,
    updatePropertyStatus,
    addPropertyImages,
    getPropertyStats
} = require('../controllers/propertyController');

// Property statistics route (must be before :identifier route)
router.get('/stats', getPropertyStats);

// Featured properties route
router.get('/featured', getFeaturedProperties);

// Properties by transaction type
router.get('/type/:transactionType', getPropertiesByType);

// Base routes
router
    .route('/')
    .get(getProperties)
    .post(createProperty);

// Single property routes
router
    .route('/:identifier')
    .get(getProperty);

router
    .route('/:id')
    .put(updateProperty)
    .delete(deleteProperty);

// Property status update
router.patch('/:id/status', updatePropertyStatus);

// Property images
router.post('/:id/images', addPropertyImages);

module.exports = router;
