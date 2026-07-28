const Lead = require('../models/Lead');
const Property = require('../models/Property');
const { PAGINATION, LEAD_STATUS } = require('../config/constants');

/**
 * @desc    Get all leads with pagination and filtering
 * @route   GET /api/v1/leads
 * @access  Private (Admin/Agent)
 */
exports.getLeads = async (req, res, next) => {
    try {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            status,
            priority,
            sort = '-createdAt'
        } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (priority) query.priority = priority;

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const leads = await Lead.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('property', 'title slug price')
            .populate('assignedAgent', 'name email')
            .select('-__v');

        // Get total count
        const total = await Lead.countDocuments(query);

        res.status(200).json({
            success: true,
            count: leads.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            data: leads
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single lead
 * @route   GET /api/v1/leads/:id
 * @access  Private (Admin/Agent)
 */
exports.getLead = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('property', 'title slug price images')
            .populate('assignedAgent', 'name email')
            .populate('notes.createdBy', 'name');

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new lead (from website form)
 * @route   POST /api/v1/leads
 * @access  Public
 */
exports.createLead = async (req, res, next) => {
    try {
        const { fullName, email, interestedLocation, propertyId, phone, marketingConsent } = req.body;

        // Build lead data
        const leadData = {
            fullName,
            email,
            interestedLocation,
            phone,
            marketingConsent
        };

        // If lead came from a specific property page
        if (propertyId) {
            const property = await Property.findById(propertyId);
            if (property) {
                leadData.property = propertyId;
                // Increment leads count on property
                await property.incrementLeads();
            }
        }

        const lead = await Lead.create(leadData);

        res.status(201).json({
            success: true,
            message: 'Thank you for your interest! We will contact you shortly.',
            data: {
                id: lead._id,
                fullName: lead.fullName,
                email: lead.email
            }
        });
    } catch (error) {
        // Handle duplicate email gracefully
        if (error.code === 11000) {
            return res.status(200).json({
                success: true,
                message: 'Thank you! Your inquiry has been received.'
            });
        }
        next(error);
    }
};

/**
 * @desc    Update lead
 * @route   PUT /api/v1/leads/:id
 * @access  Private (Admin/Agent)
 */
exports.updateLead = async (req, res, next) => {
    try {
        let lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        lead = await Lead.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Lead updated successfully',
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete lead
 * @route   DELETE /api/v1/leads/:id
 * @access  Private (Admin)
 */
exports.deleteLead = async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        await lead.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Lead deleted successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update lead status
 * @route   PATCH /api/v1/leads/:id/status
 * @access  Private (Admin/Agent)
 */
exports.updateLeadStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!Object.values(LEAD_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        await lead.updateStatus(status);

        res.status(200).json({
            success: true,
            message: `Lead status updated to ${status}`,
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add note to lead
 * @route   POST /api/v1/leads/:id/notes
 * @access  Private (Admin/Agent)
 */
exports.addLeadNote = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Note content is required'
            });
        }

        const lead = await Lead.findById(req.params.id);

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        // In a real app, userId would come from auth middleware
        const userId = req.body.userId || null;
        await lead.addNote(content, userId);

        res.status(200).json({
            success: true,
            message: 'Note added successfully',
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Assign lead to agent
 * @route   PATCH /api/v1/leads/:id/assign
 * @access  Private (Admin)
 */
exports.assignLead = async (req, res, next) => {
    try {
        const { agentId } = req.body;

        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            { assignedAgent: agentId },
            { new: true }
        ).populate('assignedAgent', 'name email');

        if (!lead) {
            return res.status(404).json({
                success: false,
                error: 'Lead not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lead assigned successfully',
            data: lead
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get lead statistics
 * @route   GET /api/v1/leads/stats
 * @access  Private (Admin)
 */
exports.getLeadStats = async (req, res, next) => {
    try {
        const stats = await Lead.getStats();

        // Get leads from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentLeads = await Lead.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        // Get conversion rate
        const convertedLeads = await Lead.countDocuments({
            status: LEAD_STATUS.CONVERTED
        });
        const conversionRate = stats.total > 0 
            ? ((convertedLeads / stats.total) * 100).toFixed(1) 
            : 0;

        res.status(200).json({
            success: true,
            data: {
                ...stats,
                recentLeads,
                conversionRate: `${conversionRate}%`
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get leads by location (for market analysis)
 * @route   GET /api/v1/leads/by-location
 * @access  Private (Admin)
 */
exports.getLeadsByLocation = async (req, res, next) => {
    try {
        const locationStats = await Lead.aggregate([
            {
                $group: {
                    _id: '$interestedLocation',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: locationStats
        });
    } catch (error) {
        next(error);
    }
};
