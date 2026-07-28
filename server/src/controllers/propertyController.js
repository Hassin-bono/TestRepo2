const Property = require('../models/Property');
const { PAGINATION, PROPERTY_STATUS } = require('../config/constants');

/**
 * @desc    Get all properties with pagination and filtering
 * @route   GET /api/v1/properties
 * @access  Public
 */
exports.getProperties = async (req, res, next) => {
    try {
        const {
            page = PAGINATION.DEFAULT_PAGE,
            limit = PAGINATION.DEFAULT_LIMIT,
            status = PROPERTY_STATUS.ACTIVE,
            transactionType,
            category,
            sort = '-createdAt'
        } = req.query;

        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (transactionType) query.transactionType = transactionType;
        if (category) query.category = category;

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), PAGINATION.MAX_LIMIT);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const properties = await Property.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .select('-__v');

        // Get total count for pagination
        const total = await Property.countDocuments(query);

        res.status(200).json({
            success: true,
            count: properties.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            data: properties
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get featured properties (for homepage)
 * @route   GET /api/v1/properties/featured
 * @access  Public
 */
exports.getFeaturedProperties = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 6;
        
        const properties = await Property.getFeatured(limit);

        res.status(200).json({
            success: true,
            count: properties.length,
            data: properties
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single property by ID or slug
 * @route   GET /api/v1/properties/:identifier
 * @access  Public
 */
exports.getProperty = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        
        // Try to find by ID first, then by slug
        let property;
        
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            property = await Property.findById(identifier);
        } else {
            property = await Property.findOne({ slug: identifier });
        }

        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Increment view count
        await property.incrementViews();

        res.status(200).json({
            success: true,
            data: property
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new property
 * @route   POST /api/v1/properties
 * @access  Private (Admin/Agent)
 */
exports.createProperty = async (req, res, next) => {
    try {
        const property = await Property.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Property created successfully',
            data: property
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update property
 * @route   PUT /api/v1/properties/:id
 * @access  Private (Admin/Agent)
 */
exports.updateProperty = async (req, res, next) => {
    try {
        let property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        property = await Property.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: property
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete property
 * @route   DELETE /api/v1/properties/:id
 * @access  Private (Admin)
 */
exports.deleteProperty = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        await property.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully',
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get properties by transaction type (for_sale / for_rent)
 * @route   GET /api/v1/properties/type/:transactionType
 * @access  Public
 */
exports.getPropertiesByType = async (req, res, next) => {
    try {
        const { transactionType } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const properties = await Property.find({
            transactionType,
            status: PROPERTY_STATUS.ACTIVE
        })
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit, 10));

        const total = await Property.countDocuments({
            transactionType,
            status: PROPERTY_STATUS.ACTIVE
        });

        res.status(200).json({
            success: true,
            count: properties.length,
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total,
                pages: Math.ceil(total / limit)
            },
            data: properties
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update property status
 * @route   PATCH /api/v1/properties/:id/status
 * @access  Private (Admin/Agent)
 */
exports.updatePropertyStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        
        if (!Object.values(PROPERTY_STATUS).includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status value'
            });
        }

        const property = await Property.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Property status updated to ${status}`,
            data: property
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add images to property
 * @route   POST /api/v1/properties/:id/images
 * @access  Private (Admin/Agent)
 */
exports.addPropertyImages = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        const { images } = req.body;

        if (!images || !Array.isArray(images)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of images'
            });
        }

        property.images.push(...images);
        await property.save();

        res.status(200).json({
            success: true,
            message: 'Images added successfully',
            data: property
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get property statistics (for admin dashboard)
 * @route   GET /api/v1/properties/stats
 * @access  Private (Admin)
 */
exports.getPropertyStats = async (req, res, next) => {
    try {
        const stats = await Property.aggregate([
            {
                $facet: {
                    byStatus: [
                        { $group: { _id: '$status', count: { $sum: 1 } } }
                    ],
                    byTransactionType: [
                        { $group: { _id: '$transactionType', count: { $sum: 1 } } }
                    ],
                    byCategory: [
                        { $group: { _id: '$category', count: { $sum: 1 } } }
                    ],
                    totalMetrics: [
                        {
                            $group: {
                                _id: null,
                                totalViews: { $sum: '$metrics.views' },
                                totalLeads: { $sum: '$metrics.leads' },
                                avgPrice: { $avg: '$price' },
                                totalValue: { $sum: '$price' }
                            }
                        }
                    ]
                }
            }
        ]);

        const totalProperties = await Property.countDocuments();
        const activeProperties = await Property.countDocuments({ status: PROPERTY_STATUS.ACTIVE });
        const featuredProperties = await Property.countDocuments({ isFeatured: true });

        res.status(200).json({
            success: true,
            data: {
                total: totalProperties,
                active: activeProperties,
                featured: featuredProperties,
                ...stats[0]
            }
        });
    } catch (error) {
        next(error);
    }
};
