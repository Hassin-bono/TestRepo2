const path = require('path');
const fs = require('fs');
const Property = require('../models/Property');

/**
 * @desc    Upload property images
 * @route   POST /api/v1/upload/property/:id
 * @access  Private (Admin/Agent)
 */
exports.uploadPropertyImages = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if property exists
        const property = await Property.findById(id);
        if (!property) {
            // Clean up uploaded files
            if (req.files) {
                req.files.forEach(file => {
                    fs.unlinkSync(file.path);
                });
            }
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please upload at least one image'
            });
        }

        // Process uploaded files
        const images = req.files.map((file, index) => ({
            url: `/uploads/properties/${file.filename}`,
            alt: `${property.title} - Image ${property.images.length + index + 1}`,
            isPrimary: property.images.length === 0 && index === 0,
            order: property.images.length + index
        }));

        // Add images to property
        property.images.push(...images);
        await property.save();

        res.status(200).json({
            success: true,
            message: `${images.length} image(s) uploaded successfully`,
            data: {
                uploaded: images,
                total: property.images.length
            }
        });
    } catch (error) {
        // Clean up uploaded files on error
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        next(error);
    }
};

/**
 * @desc    Upload images for new property (before property creation)
 * @route   POST /api/v1/upload/temp
 * @access  Private (Admin/Agent)
 */
exports.uploadTempImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Please upload at least one image'
            });
        }

        // Return the file paths for later use
        const images = req.files.map((file, index) => ({
            url: `/uploads/properties/${file.filename}`,
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            order: index
        }));

        res.status(200).json({
            success: true,
            message: `${images.length} image(s) uploaded successfully`,
            data: images
        });
    } catch (error) {
        // Clean up on error
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        next(error);
    }
};

/**
 * @desc    Delete a property image
 * @route   DELETE /api/v1/upload/property/:id/image/:imageId
 * @access  Private (Admin/Agent)
 */
exports.deletePropertyImage = async (req, res, next) => {
    try {
        const { id, imageId } = req.params;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Find the image
        const image = property.images.id(imageId);
        if (!image) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../', image.url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from database
        property.images.pull(imageId);
        await property.save();

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Set primary image for property
 * @route   PATCH /api/v1/upload/property/:id/primary/:imageId
 * @access  Private (Admin/Agent)
 */
exports.setPrimaryImage = async (req, res, next) => {
    try {
        const { id, imageId } = req.params;

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Reset all images to non-primary
        property.images.forEach(img => {
            img.isPrimary = img._id.toString() === imageId;
        });

        await property.save();

        res.status(200).json({
            success: true,
            message: 'Primary image updated',
            data: property.images
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reorder property images
 * @route   PATCH /api/v1/upload/property/:id/reorder
 * @access  Private (Admin/Agent)
 */
exports.reorderImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { order } = req.body; // Array of image IDs in new order

        if (!order || !Array.isArray(order)) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an array of image IDs in the desired order'
            });
        }

        const property = await Property.findById(id);
        if (!property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Update order for each image
        order.forEach((imageId, index) => {
            const image = property.images.id(imageId);
            if (image) {
                image.order = index;
            }
        });

        // Sort images by order
        property.images.sort((a, b) => a.order - b.order);

        await property.save();

        res.status(200).json({
            success: true,
            message: 'Images reordered successfully',
            data: property.images
        });
    } catch (error) {
        next(error);
    }
};
