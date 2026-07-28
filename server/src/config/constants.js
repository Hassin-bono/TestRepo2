module.exports = {
    // Transaction types matching frontend options
    TRANSACTION_TYPES: {
        SALE: 'for_sale',
        RENT: 'for_rent'
    },

    // Property categories matching admin panel
    PROPERTY_CATEGORIES: {
        RESIDENTIAL: 'residential',
        COMMERCIAL: 'commercial'
    },

    // Property types matching search filter
    PROPERTY_TYPES: {
        PENTHOUSE: 'penthouse',
        ESTATE: 'estate',
        VILLA: 'villa',
        APARTMENT: 'apartment',
        CONDO: 'condo',
        MANSION: 'mansion'
    },

    // Price ranges matching search filter
    PRICE_RANGES: {
        RANGE_2M_5M: { min: 2000000, max: 5000000, label: '$2M - $5M' },
        RANGE_5M_10M: { min: 5000000, max: 10000000, label: '$5M - $10M' },
        RANGE_10M_PLUS: { min: 10000000, max: Infinity, label: '$10M+' }
    },

    // Property status
    PROPERTY_STATUS: {
        ACTIVE: 'active',
        PENDING: 'pending',
        SOLD: 'sold',
        RENTED: 'rented',
        ARCHIVED: 'archived'
    },

    // Property tags
    PROPERTY_TAGS: {
        PREMIUM: 'premium',
        NEW_LISTING: 'new_listing',
        FEATURED: 'featured',
        EXCLUSIVE: 'exclusive'
    },

    // Lead status
    LEAD_STATUS: {
        NEW: 'new',
        CONTACTED: 'contacted',
        QUALIFIED: 'qualified',
        CONVERTED: 'converted',
        CLOSED: 'closed'
    },

    // Pagination defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    }
};
