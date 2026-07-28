const mongoose = require('mongoose');
const slugify = require('slugify');
const { 
    TRANSACTION_TYPES, 
    PROPERTY_CATEGORIES, 
    PROPERTY_TYPES, 
    PROPERTY_STATUS, 
    PROPERTY_TAGS 
} = require('../config/constants');

const PropertySchema = new mongoose.Schema({
    // Basic Information
    title: {
        type: String,
        required: [true, 'Property title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },

    // Pricing
    price: {
        type: Number,
        required: [true, 'Property price is required'],
        min: [0, 'Price cannot be negative']
    },
    pricePerSqft: {
        type: Number
    },

    // Transaction & Category
    transactionType: {
        type: String,
        enum: Object.values(TRANSACTION_TYPES),
        required: [true, 'Transaction type is required'],
        default: TRANSACTION_TYPES.SALE
    },
    category: {
        type: String,
        enum: Object.values(PROPERTY_CATEGORIES),
        required: [true, 'Property category is required'],
        default: PROPERTY_CATEGORIES.RESIDENTIAL
    },
    propertyType: {
        type: String,
        enum: Object.values(PROPERTY_TYPES),
        default: PROPERTY_TYPES.ESTATE
    },

    // Location
    location: {
        address: {
            type: String,
            required: [true, 'Address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: {
            type: String
        },
        zipCode: {
            type: String
        },
        country: {
            type: String,
            default: 'USA'
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },

    // Property Details (matching frontend display)
    details: {
        bedrooms: {
            type: Number,
            min: [0, 'Bedrooms cannot be negative'],
            default: 0
        },
        bathrooms: {
            type: Number,
            min: [0, 'Bathrooms cannot be negative'],
            default: 0
        },
        sqft: {
            type: Number,
            min: [0, 'Square footage cannot be negative'],
            required: [true, 'Square footage is required']
        },
        lotSize: {
            type: Number,
            min: [0, 'Lot size cannot be negative']
        },
        yearBuilt: {
            type: Number
        },
        parking: {
            type: Number,
            default: 0
        },
        floors: {
            type: Number,
            default: 1
        }
    },

    // Media
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: String,
        isPrimary: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            default: 0
        }
    }],

    // Features & Amenities
    features: [{
        type: String,
        trim: true
    }],
    amenities: [{
        type: String,
        trim: true
    }],

    // Status & Tags
    status: {
        type: String,
        enum: Object.values(PROPERTY_STATUS),
        default: PROPERTY_STATUS.ACTIVE
    },
    tags: [{
        type: String,
        enum: Object.values(PROPERTY_TAGS)
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },

    // Metrics (matching admin panel)
    metrics: {
        views: {
            type: Number,
            default: 0
        },
        leads: {
            type: Number,
            default: 0
        },
        inquiries: {
            type: Number,
            default: 0
        }
    },

    // Agent/Owner Reference
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Rental-specific fields
    rentalDetails: {
        monthlyRent: Number,
        securityDeposit: Number,
        leaseTerm: String, // e.g., "12 months"
        availableFrom: Date
    }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for search performance
PropertySchema.index({ 'location.city': 1, transactionType: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ status: 1, isFeatured: -1 });
PropertySchema.index({ slug: 1 });
PropertySchema.index({ 
    title: 'text', 
    description: 'text', 
    'location.city': 'text',
    'location.address': 'text'
});

// Generate slug before saving
PropertySchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { 
            lower: true, 
            strict: true,
            remove: /[*+~.()'"!:@]/g
        }) + '-' + Date.now().toString(36);
    }
    
    // Calculate price per sqft
    if (this.price && this.details?.sqft) {
        this.pricePerSqft = Math.round(this.price / this.details.sqft);
    }
    
    next();
});

// Virtual for formatted price
PropertySchema.virtual('formattedPrice').get(function() {
    if (this.price >= 1000000) {
        return `$${(this.price / 1000000).toFixed(1)}M`;
    }
    return `$${this.price.toLocaleString()}`;
});

// Virtual for display stats (matching frontend format)
PropertySchema.virtual('displayStats').get(function() {
    return {
        beds: `${this.details?.bedrooms || 0} BED`,
        baths: `${this.details?.bathrooms || 0} BATH`,
        sqft: `${(this.details?.sqft || 0).toLocaleString()} SQFT`
    };
});

// Static method to get featured properties
PropertySchema.statics.getFeatured = function(limit = 6) {
    return this.find({ 
        status: PROPERTY_STATUS.ACTIVE,
        isFeatured: true 
    })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search properties
PropertySchema.statics.search = async function(filters) {
    const query = { status: PROPERTY_STATUS.ACTIVE };

    if (filters.location) {
        query['location.city'] = new RegExp(filters.location, 'i');
    }

    if (filters.transactionType) {
        query.transactionType = filters.transactionType;
    }

    if (filters.propertyType) {
        query.propertyType = filters.propertyType;
    }

    if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
    }

    if (filters.bedrooms) {
        query['details.bedrooms'] = { $gte: filters.bedrooms };
    }

    return this.find(query).sort({ isFeatured: -1, createdAt: -1 });
};

// Instance method to increment views
PropertySchema.methods.incrementViews = function() {
    this.metrics.views += 1;
    return this.save();
};

// Instance method to increment leads
PropertySchema.methods.incrementLeads = function() {
    this.metrics.leads += 1;
    return this.save();
};

module.exports = mongoose.model('Property', PropertySchema);
