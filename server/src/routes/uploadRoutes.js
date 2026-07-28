const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    uploadPropertyImages,
    uploadTempImages,
    deletePropertyImage,
    setPrimaryImage,
    reorderImages
} = require('../controllers/uploadController');

// Upload images for existing property
router.post('/property/:id', upload.multiple, uploadPropertyImages);

// Upload temporary images (before property creation)
router.post('/temp', upload.multiple, uploadTempImages);

// Delete property image
router.delete('/property/:id/image/:imageId', deletePropertyImage);

// Set primary image
router.patch('/property/:id/primary/:imageId', setPrimaryImage);

// Reorder images
router.patch('/property/:id/reorder', reorderImages);

module.exports = router;
