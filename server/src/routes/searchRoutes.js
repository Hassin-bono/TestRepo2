const express = require('express');
const router = express.Router();
const {
    searchProperties,
    textSearch,
    getSearchSuggestions,
    getFilterOptions,
    getSimilarProperties
} = require('../controllers/searchController');

// Main search route (matching frontend search bar)
router.get('/', searchProperties);

// Full-text search
router.get('/text', textSearch);

// Search suggestions (autocomplete)
router.get('/suggestions', getSearchSuggestions);

// Get available filter options
router.get('/filters', getFilterOptions);

// Get similar properties
router.get('/similar/:id', getSimilarProperties);

module.exports = router;
