const express = require('express');
const router = express.Router();
const {
    getLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    addLeadNote,
    assignLead,
    getLeadStats,
    getLeadsByLocation
} = require('../controllers/leadController');

// Statistics routes (must be before :id routes)
router.get('/stats', getLeadStats);
router.get('/by-location', getLeadsByLocation);

// Base routes
router
    .route('/')
    .get(getLeads)
    .post(createLead);

// Single lead routes
router
    .route('/:id')
    .get(getLead)
    .put(updateLead)
    .delete(deleteLead);

// Lead status update
router.patch('/:id/status', updateLeadStatus);

// Add note to lead
router.post('/:id/notes', addLeadNote);

// Assign lead to agent
router.patch('/:id/assign', assignLead);

module.exports = router;
