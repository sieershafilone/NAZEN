const prisma = require('../config/database');
const fs = require('fs');
const path = require('path');

// Get all images
const getAllImages = async (req, res, next) => {
    try {
        const { category, visibility } = req.query;

        const where = {};
        if (category) where.category = category;

        // Non-admin users can only see public images
        if (!req.user || req.user.role !== 'ADMIN') {
            where.visibility = 'PUBLIC';
        } else if (visibility) {
            where.visibility = visibility;
        }

        const images = await prisma.gymImage.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { uploadedAt: 'desc' }],
        });

        res.json({
            success: true,
            data: images,
        });
    } catch (error) {
        next(error);
    }
};

// Get single image
const getImage = async (req, res, next) => {
    try {
        const { id } = req.params;

        const image = await prisma.gymImage.findUnique({
            where: { id },
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
            });
        }

        // Check visibility
        if (image.visibility === 'ADMIN_ONLY' && (!req.user || req.user.role !== 'ADMIN')) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        res.json({
            success: true,
            data: image,
        });
    } catch (error) {
        next(error);
    }
};

// Upload image (Admin)
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const { title, category, visibility, sortOrder } = req.body;

        const imageUrl = `/uploads/${req.file.filename}`;

        const image = await prisma.gymImage.create({
            data: {
                title,
                category: category || 'GALLERY',
                imageUrl,
                visibility: visibility || 'PUBLIC',
                sortOrder: sortOrder ? parseInt(sortOrder) : 0,
            },
        });

        res.status(201).json({
            success: true,
            message: 'Image uploaded successfully',
            data: image,
        });
    } catch (error) {
        next(error);
    }
};

// Update image (Admin)
const updateImage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, category, visibility, sortOrder } = req.body;

        const image = await prisma.gymImage.update({
            where: { id },
            data: {
                title,
                category,
                visibility,
                sortOrder: sortOrder ? parseInt(sortOrder) : undefined,
            },
        });

        res.json({
            success: true,
            message: 'Image updated successfully',
            data: image,
        });
    } catch (error) {
        next(error);
    }
};

// Delete image (Admin)
const deleteImage = async (req, res, next) => {
    try {
        const { id } = req.params;

        const image = await prisma.gymImage.findUnique({
            where: { id },
        });

        if (!image) {
            return res.status(404).json({
                success: false,
                message: 'Image not found',
            });
        }

        // Delete file from filesystem
        const filePath = path.join(process.cwd(), image.imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.gymImage.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Image deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

// Get gallery images (public)
const getGallery = async (req, res, next) => {
    try {
        const { category } = req.query;

        const where = { visibility: 'PUBLIC' };
        if (category && category !== 'ALL') {
            where.category = category;
        }

        const images = await prisma.gymImage.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { uploadedAt: 'desc' }],
        });

        // Group by category
        const grouped = images.reduce((acc, img) => {
            if (!acc[img.category]) acc[img.category] = [];
            acc[img.category].push(img);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                images,
                grouped,
                categories: Object.keys(grouped),
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get slider images (for homepage)
const getSliderImages = async (req, res, next) => {
    try {
        const images = await prisma.gymImage.findMany({
            where: {
                visibility: 'PUBLIC',
                category: { in: ['EXTERIOR', 'INTERIOR', 'EQUIPMENT'] },
            },
            orderBy: { sortOrder: 'asc' },
            take: 5,
        });

        res.json({
            success: true,
            data: images,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllImages,
    getImage,
    uploadImage,
    updateImage,
    deleteImage,
    getGallery,
    getSliderImages,
};
