const mongoose = require('mongoose');
const { LEAD_STATUS } = require('../config/constants');

/**
 * Lead Schema
 * Captures potential client inquiries from the lead capture form
 * Fields match the frontend form: Full Name, Email, Interested Location
 */
const LeadSchema = new mongoose.Schema({
    // Contact Information (matching frontend form)
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },
    phone: {
        type: String,
        trim: true
    },

    // Interest Details
    interestedLocation: {
        type: String,
        required: [true, 'Interested location is required'],
        trim: true
    },
    interestedPropertyType: {
        type: String,
        trim: true
    },
    priceRange: {
        min: Number,
        max: Number
    },
    transactionInterest: {
        type: String,
        enum: ['buy', 'rent', 'sell', 'both'],
        default: 'buy'
    },

    // Property Reference (if lead came from a specific property)
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    },

    // Lead Management
    status: {
        type: String,
        enum: Object.values(LEAD_STATUS),
        default: LEAD_STATUS.NEW
    },
    source: {
        type: String,
        enum: ['website', 'referral', 'social', 'direct', 'other'],
        default: 'website'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

    // Notes & Communication
    notes: [{
        content: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Assignment
    assignedAgent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Marketing consent
    marketingConsent: {
        type: Boolean,
        default: false
    },

    // Tracking
    lastContactedAt: Date,
    convertedAt: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
LeadSchema.index({ email: 1 });
LeadSchema.index({ status: 1, createdAt: -1 });
LeadSchema.index({ assignedAgent: 1, status: 1 });
LeadSchema.index({ interestedLocation: 'text', fullName: 'text' });

// Virtual for days since created
LeadSchema.virtual('daysSinceCreated').get(function() {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now - created);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for display status
LeadSchema.virtual('displayStatus').get(function() {
    const statusMap = {
        new: { label: 'New', color: '#FF4D00' },
        contacted: { label: 'Contacted', color: '#3B82F6' },
        qualified: { label: 'Qualified', color: '#10B981' },
        converted: { label: 'Converted', color: '#8B5CF6' },
        closed: { label: 'Closed', color: '#6B7280' }
    };
    return statusMap[this.status] || statusMap.new;
});

// Pre-save middleware to calculate priority based on location
LeadSchema.pre('save', function(next) {
    if (this.isNew) {
        // High-value locations get higher priority
        const highValueLocations = ['manhattan', 'beverly hills', 'greenwich', 'hudson'];
        const location = this.interestedLocation?.toLowerCase() || '';
        
        if (highValueLocations.some(loc => location.includes(loc))) {
            this.priority = 'high';
        }
    }
    next();
});

// Static method to get leads by status
LeadSchema.statics.getByStatus = function(status) {
    return this.find({ status })
        .sort({ priority: -1, createdAt: -1 })
        .populate('property', 'title slug price')
        .populate('assignedAgent', 'name email');
};

// Static method to get lead statistics
LeadSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const totalLeads = await this.countDocuments();
    const todayLeads = await this.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    return {
        total: totalLeads,
        today: todayLeads,
        byStatus: stats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {})
    };
};

// Instance method to add a note
LeadSchema.methods.addNote = function(content, userId) {
    this.notes.push({
        content,
        createdBy: userId
    });
    return this.save();
};

// Instance method to update status
LeadSchema.methods.updateStatus = function(newStatus) {
    this.status = newStatus;
    
    if (newStatus === LEAD_STATUS.CONTACTED) {
        this.lastContactedAt = new Date();
    }
    
    if (newStatus === LEAD_STATUS.CONVERTED) {
        this.convertedAt = new Date();
    }
    
    return this.save();
};

module.exports = mongoose.model('Lead', LeadSchema);
