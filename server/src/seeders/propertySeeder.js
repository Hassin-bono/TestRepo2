/**
 * Property Seeder
 * Seeds the database with sample properties matching the frontend design
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../models/Property');
const { TRANSACTION_TYPES, PROPERTY_CATEGORIES, PROPERTY_TYPES, PROPERTY_STATUS, PROPERTY_TAGS } = require('../config/constants');

// Sample properties based on the frontend HTML
const sampleProperties = [
    {
        title: 'The Obsidian Pavilion',
        description: 'A masterpiece of modern architecture featuring floor-to-ceiling glass walls, Italian marble throughout, and an infinity pool overlooking pristine landscapes. This premium estate represents the pinnacle of luxury living.',
        price: 12450000,
        transactionType: TRANSACTION_TYPES.SALE,
        category: PROPERTY_CATEGORIES.RESIDENTIAL,
        propertyType: PROPERTY_TYPES.ESTATE,
        location: {
            address: '1200 Obsidian Drive',
            city: 'Greenwich',
            state: 'CT',
            zipCode: '06830',
            country: 'USA',
            coordinates: {
                latitude: 41.0262,
                longitude: -73.6282
            }
        },
        details: {
            bedrooms: 4,
            bathrooms: 5.5,
            sqft: 6200,
            lotSize: 25000,
            yearBuilt: 2022,
            parking: 4,
            floors: 2
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1600607687940-47a0f9259017?auto=format&fit=crop&q=80&w=1000',
                alt: 'The Obsidian Pavilion - Exterior',
                isPrimary: true,
                order: 0
            }
        ],
        features: ['Smart Home System', 'Wine Cellar', 'Home Theater', 'Chef\'s Kitchen', 'Private Spa'],
        amenities: ['Infinity Pool', 'Tennis Court', 'Guest House', 'Security System', 'EV Charging'],
        status: PROPERTY_STATUS.ACTIVE,
        tags: [PROPERTY_TAGS.PREMIUM],
        isFeatured: true,
        metrics: {
            views: 1250,
            leads: 12,
            inquiries: 8
        }
    },
    {
        title: 'Linear Concrete Villa',
        description: 'Minimalist design meets maximum luxury in this stunning concrete villa. Clean lines and open spaces define this architectural gem, perfectly positioned to capture natural light from dawn to dusk.',
        price: 8900000,
        transactionType: TRANSACTION_TYPES.SALE,
        category: PROPERTY_CATEGORIES.RESIDENTIAL,
        propertyType: PROPERTY_TYPES.VILLA,
        location: {
            address: '450 Hudson River Road',
            city: 'Hudson',
            state: 'NY',
            zipCode: '12534',
            country: 'USA',
            coordinates: {
                latitude: 42.2529,
                longitude: -73.7910
            }
        },
        details: {
            bedrooms: 3,
            bathrooms: 4,
            sqft: 4800,
            lotSize: 18000,
            yearBuilt: 2021,
            parking: 3,
            floors: 2
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=1000',
                alt: 'Linear Concrete Villa - Exterior',
                isPrimary: true,
                order: 0
            }
        ],
        features: ['Heated Floors', 'Outdoor Kitchen', 'Art Gallery Space', 'Meditation Room'],
        amenities: ['Heated Pool', 'Japanese Garden', 'Private Dock', 'Greenhouse'],
        status: PROPERTY_STATUS.ACTIVE,
        tags: [],
        isFeatured: true,
        metrics: {
            views: 890,
            leads: 6,
            inquiries: 4
        }
    },
    {
        title: 'Glass Monolith',
        description: 'An extraordinary architectural statement rising above Beverly Hills. This glass monolith offers 360-degree views of the city and mountains, with interiors that blur the line between indoor and outdoor living.',
        price: 24000000,
        transactionType: TRANSACTION_TYPES.SALE,
        category: PROPERTY_CATEGORIES.RESIDENTIAL,
        propertyType: PROPERTY_TYPES.MANSION,
        location: {
            address: '9500 Summit View',
            city: 'Beverly Hills',
            state: 'CA',
            zipCode: '90210',
            country: 'USA',
            coordinates: {
                latitude: 34.0901,
                longitude: -118.4065
            }
        },
        details: {
            bedrooms: 6,
            bathrooms: 8,
            sqft: 12500,
            lotSize: 45000,
            yearBuilt: 2023,
            parking: 8,
            floors: 3
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1600585154526-990dcea464f9?auto=format&fit=crop&q=80&w=1000',
                alt: 'Glass Monolith - Exterior',
                isPrimary: true,
                order: 0
            }
        ],
        features: ['Elevator', 'Staff Quarters', 'Recording Studio', 'Rooftop Helipad', 'Safe Room'],
        amenities: ['Olympic Pool', 'Full Gym', 'Spa', 'Movie Theater', 'Wine Vault'],
        status: PROPERTY_STATUS.ACTIVE,
        tags: [PROPERTY_TAGS.NEW_LISTING],
        isFeatured: true,
        metrics: {
            views: 2100,
            leads: 15,
            inquiries: 12
        }
    },
    {
        title: 'Manhattan Skyline Penthouse',
        description: 'Crown jewel of Midtown Manhattan, this penthouse offers unobstructed views of Central Park and the iconic skyline. Triple-height ceilings and museum-quality finishes throughout.',
        price: 18500000,
        transactionType: TRANSACTION_TYPES.SALE,
        category: PROPERTY_CATEGORIES.RESIDENTIAL,
        propertyType: PROPERTY_TYPES.PENTHOUSE,
        location: {
            address: '432 Park Avenue',
            city: 'Manhattan',
            state: 'NY',
            zipCode: '10022',
            country: 'USA',
            coordinates: {
                latitude: 40.7614,
                longitude: -73.9718
            }
        },
        details: {
            bedrooms: 5,
            bathrooms: 6,
            sqft: 8200,
            yearBuilt: 2020,
            parking: 2,
            floors: 2
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
                alt: 'Manhattan Skyline Penthouse',
                isPrimary: true,
                order: 0
            }
        ],
        features: ['Private Terrace', 'Library', 'Fireplace', 'Smart Glass Windows'],
        amenities: ['Concierge', 'Private Elevator', 'Rooftop Access', 'Fitness Center'],
        status: PROPERTY_STATUS.ACTIVE,
        tags: [PROPERTY_TAGS.EXCLUSIVE],
        isFeatured: true,
        metrics: {
            views: 1800,
            leads: 9,
            inquiries: 7
        }
    },
    {
        title: 'Coastal Retreat Estate',
        description: 'Where the ocean meets architectural excellence. This seaside estate offers private beach access, panoramic ocean views, and world-class amenities designed for ultimate relaxation.',
        price: 15750000,
        transactionType: TRANSACTION_TYPES.SALE,
        category: PROPERTY_CATEGORIES.RESIDENTIAL,
        propertyType: PROPERTY_TYPES.ESTATE,
        location: {
            address: '1001 Ocean Boulevard',
            city: 'Malibu',
            state: 'CA',
            zipCode: '90265',
            country: 'USA',
            coordinates: {
                latitude: 34.0259,
                longitude: -118.7798
            }
        },
        details: {
            bedrooms: 5,
            bathrooms: 6,
            sqft: 7800,
            lotSize: 32000,
            yearBuilt: 2019,
            parking: 6,
            floors: 2
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1000',
                alt: 'Coastal Retreat Estate',
                isPrimary: true,
                order: 0
            }
        ],
        features: ['Beach Access', 'Outdoor Living', 'Ocean View Master', 'Surf Storage'],
        amenities: ['Infinity Edge Pool', 'Fire Pit', 'Cabana', 'Outdoor Shower'],
        status: PROPERTY_STATUS.ACTIVE,
        tags: [PROPERTY_TAGS.PREMIUM],
        isFeatured: false,
        metrics: {
            views: 1450,
            leads: 8,
            inquiries: 5
        }
    },
    {
        title: 'Urban Loft Collection',
        description: 'Industrial chic meets luxury living in this converted warehouse loft. Soaring ceilings, exposed brick, and contemporary design create an inspiring urban sanctuary.',
        price: 4200000,
        transactionType: TRANSACTION_TYPES.RENT,
        category: PROPERTY_CATEGORIES.RESIDENTIAL,
        propertyType: PROPERTY_TYPES.APARTMENT,
        rentalDetails: {
            monthlyRent: 28000,
            securityDeposit: 56000,
            leaseTerm: '12 months',
            availableFrom: new Date('2025-02-01')
        },
        location: {
            address: '250 West Street',
            city: 'Manhattan',
            state: 'NY',
            zipCode: '10013',
            country: 'USA',
            coordinates: {
                latitude: 40.7218,
                longitude: -74.0091
            }
        },
        details: {
            bedrooms: 3,
            bathrooms: 2.5,
            sqft: 3200,
            yearBuilt: 2018,
            parking: 1,
            floors: 1
        },
        images: [
            {
                url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=2000',
                alt: 'Urban Loft Collection',
                isPrimary: true,
                order: 0
            }
        ],
        features: ['Exposed Brick', 'Chef\'s Kitchen', 'Home Office', 'Original Details'],
        amenities: ['Doorman', 'Rooftop Deck', 'Pet Friendly', 'Storage'],
        status: PROPERTY_STATUS.ACTIVE,
        tags: [PROPERTY_TAGS.FEATURED],
        isFeatured: true,
        metrics: {
            views: 680,
            leads: 4,
            inquiries: 3
        }
    }
];

// Seeder function
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/basalt_realestate');
        console.log('MongoDB connected for seeding...');

        // Clear existing properties
        await Property.deleteMany({});
        console.log('Cleared existing properties');

        // Insert sample properties
        const createdProperties = await Property.insertMany(sampleProperties);
        console.log(`Successfully seeded ${createdProperties.length} properties`);

        // Display summary
        console.log('\nSeeded Properties:');
        createdProperties.forEach((prop, index) => {
            console.log(`  ${index + 1}. ${prop.title} - ${prop.formattedPrice} (${prop.location.city})`);
        });

        console.log('\n✅ Database seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
