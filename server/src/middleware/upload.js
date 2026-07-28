const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/properties');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: property-{timestamp}-{random}.{ext}
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `property-${uniqueSuffix}${ext}`);
    }
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    // Supported formats from admin panel: RAW, TIFF, JPG
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/tiff',
        'image/gif'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WebP, TIFF, and GIF are allowed.'), false);
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size (matching admin panel spec)
        files: 20 // Max 20 files per upload
    }
});

// Export different upload configurations
module.exports = {
    // Single image upload
    single: upload.single('image'),
    
    // Multiple images upload (for property gallery)
    multiple: upload.array('images', 20),
    
    // Upload with specific fields
    fields: upload.fields([
        { name: 'primary', maxCount: 1 },
        { name: 'gallery', maxCount: 19 }
    ]),
    
    // Memory storage for processing before save
    memoryStorage: multer({
        storage: multer.memoryStorage(),
        fileFilter: fileFilter,
        limits: {
            fileSize: 50 * 1024 * 1024,
            files: 20
        }
    })
};
