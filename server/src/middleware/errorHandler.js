/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application
 */

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value entered for: ${field}`;
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        error = { message: messages.join(', '), statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error = { message: 'Invalid token', statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        error = { message: 'Token expired', statusCode: 401 };
    }

    // Multer errors
    if (err.name === 'MulterError') {
        let message = 'File upload error';
        
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File size exceeds the 50MB limit';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Too many files. Maximum is 20 files';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Unexpected field name for file upload';
        }
        
        error = { message, statusCode: 400 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;
