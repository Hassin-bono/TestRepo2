const Property = require('../models/Property');
const { PRICE_RANGES, PROPERTY_STATUS } = require('../config/constants');

/**
 * @desc    Search properties with filters (main search bar functionality)
 * @route   GET /api/v1/search
 * @access  Public
 * 
 * Query Parameters (matching frontend search bar):
 * - location: City/area name (e.g., "Manhattan, NY")
 * - transactionType: "for_sale" or "for_rent"
 * - priceRange: "2m-5m", "5m-10m", "10m+"
 * - propertyType: "penthouse", "estate", "villa", etc.
 * - minBeds: Minimum bedrooms
 * - minBaths: Minimum bathrooms
 * - minSqft: Minimum square footage
 * - maxSqft: Maximum square footage
 */
exports.searchProperties = async (req, res, next) => {
    try {
        const {
            location,
            transactionType,
            priceRange,
            propertyType,
            minBeds,
            minBaths,
            minSqft,
            maxSqft,
            minPrice,
            maxPrice,
            page = 1,
            limit = 12,
            sort = '-isFeatured,-createdAt'
        } = req.query;

        // Build search query
        const query = { status: PROPERTY_STATUS.ACTIVE };

        // Location search (city, state, or address)
        if (location) {
            const locationRegex = new RegExp(location.split(',')[0].trim(), 'i');
            query.$or = [
                { 'location.city': locationRegex },
                { 'location.state': locationRegex },
                { 'location.address': locationRegex }
            ];
        }

        // Transaction type filter
        if (transactionType) {
            query.transactionType = transactionType;
        }

        // Price range filter (supports both predefined ranges and custom)
        if (priceRange) {
            const ranges = {
                '2m-5m': { $gte: 2000000, $lte: 5000000 },
                '5m-10m': { $gte: 5000000, $lte: 10000000 },
                '10m+': { $gte: 10000000 }
            };
            if (ranges[priceRange]) {
                query.price = ranges[priceRange];
            }
        } else if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseInt(minPrice, 10);
            if (maxPrice) query.price.$lte = parseInt(maxPrice, 10);
        }

        // Property type filter
        if (propertyType) {
            query.propertyType = propertyType;
        }

        // Bedroom filter
        if (minBeds) {
            query['details.bedrooms'] = { $gte: parseInt(minBeds, 10) };
        }

        // Bathroom filter
        if (minBaths) {
            query['details.bathrooms'] = { $gte: parseInt(minBaths, 10) };
        }

        // Square footage filter
        if (minSqft || maxSqft) {
            query['details.sqft'] = {};
            if (minSqft) query['details.sqft'].$gte = parseInt(minSqft, 10);
            if (maxSqft) query['details.sqft'].$lte = parseInt(maxSqft, 10);
        }

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Sort parsing
        const sortOptions = sort.split(',').reduce((acc, field) => {
            if (field.startsWith('-')) {
                acc[field.substring(1)] = -1;
            } else {
                acc[field] = 1;
            }
            return acc;
        }, {});

        // Execute search
        const properties = await Property.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum)
            .select('title slug price transactionType location details images tags isFeatured formattedPrice');

        // Get total count
        const total = await Property.countDocuments(query);

        res.status(200).json({
            success: true,
            count: properties.length,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
                hasMore: pageNum * limitNum < total
            },
            filters: {
                location: location || null,
                transactionType: transactionType || null,
                priceRange: priceRange || null,
                propertyType: propertyType || null
            },
            data: properties
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Full-text search across properties
 * @route   GET /api/v1/search/text
 * @access  Public
 */
exports.textSearch = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 12 } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query is required'
            });
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        const properties = await Property.find(
            { 
                $text: { $search: q },
                status: PROPERTY_STATUS.ACTIVE
            },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

        const total = await Property.countDocuments({
            $text: { $search: q },
            status: PROPERTY_STATUS.ACTIVE
        });

        res.status(200).json({
            success: true,
            count: properties.length,
            query: q,
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
 * @desc    Get search suggestions (autocomplete)
 * @route   GET /api/v1/search/suggestions
 * @access  Public
 */
exports.getSearchSuggestions = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(200).json({
                success: true,
                data: {
                    locations: [],
                    properties: []
                }
            });
        }

        const regex = new RegExp(q, 'i');

        // Get unique locations
        const locations = await Property.aggregate([
            { $match: { status: PROPERTY_STATUS.ACTIVE } },
            {
                $group: {
                    _id: {
                        city: '$location.city',
                        state: '$location.state'
                    }
                }
            },
            {
                $match: {
                    $or: [
                        { '_id.city': regex },
                        { '_id.state': regex }
                    ]
                }
            },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    location: {
                        $concat: ['$_id.city', ', ', { $ifNull: ['$_id.state', ''] }]
                    }
                }
            }
        ]);

        // Get matching property titles
        const properties = await Property.find({
            title: regex,
            status: PROPERTY_STATUS.ACTIVE
        })
            .select('title slug price location.city')
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                locations: locations.map(l => l.location),
                properties: properties.map(p => ({
                    title: p.title,
                    slug: p.slug,
                    price: p.price,
                    city: p.location?.city
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get available filter options (for dynamic dropdowns)
 * @route   GET /api/v1/search/filters
 * @access  Public
 */
exports.getFilterOptions = async (req, res, next) => {
    try {
        // Get unique locations
        const locations = await Property.aggregate([
            { $match: { status: PROPERTY_STATUS.ACTIVE } },
            {
                $group: {
                    _id: '$location.city',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        // Get property type counts
        const propertyTypes = await Property.aggregate([
            { $match: { status: PROPERTY_STATUS.ACTIVE } },
            {
                $group: {
                    _id: '$propertyType',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get price statistics
        const priceStats = await Property.aggregate([
            { $match: { status: PROPERTY_STATUS.ACTIVE } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                    avgPrice: { $avg: '$price' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                locations: locations.map(l => ({
                    name: l._id,
                    count: l.count
                })),
                propertyTypes: propertyTypes.map(pt => ({
                    type: pt._id,
                    count: pt.count
                })),
                priceRanges: Object.entries(PRICE_RANGES).map(([key, value]) => ({
                    key: key.toLowerCase().replace('range_', '').replace('_', '-'),
                    label: value.label,
                    min: value.min,
                    max: value.max === Infinity ? null : value.max
                })),
                priceStats: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get similar properties
 * @route   GET /api/v1/search/similar/:id
 * @access  Public
 */
exports.getSimilarProperties = async (req, res, next) => {
    try {
        const property = await Property.findById(req.params.id);

        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Find similar properties based on location, price range, and type
        const priceRange = {
            $gte: property.price * 0.7,
            $lte: property.price * 1.3
        };

        const similarProperties = await Property.find({
            _id: { $ne: property._id },
            status: PROPERTY_STATUS.ACTIVE,
            $or: [
                { 'location.city': property.location.city },
                { propertyType: property.propertyType },
                { price: priceRange }
            ]
        })
            .sort({ isFeatured: -1 })
            .limit(4)
            .select('title slug price location details images tags');

        res.status(200).json({
            success: true,
            count: similarProperties.length,
            data: similarProperties
        });
    } catch (error) {
        next(error);
    }
};
