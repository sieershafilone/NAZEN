const prisma = require('../config/database');
const config = require('../config');

// Get gym settings
const getSettings = async (req, res, next) => {
    try {
        let settings = await prisma.gymSettings.findFirst();

        if (!settings) {
            // Create default settings
            settings = await prisma.gymSettings.create({
                data: {
                    gymName: config.gym.name,
                    address: config.gym.address,
                    phone: config.gym.phone,
                    gstin: config.gym.gstin,
                },
            });
        }

        res.json({
            success: true,
            data: settings,
        });
    } catch (error) {
        next(error);
    }
};

// Update gym settings (Admin)
const updateSettings = async (req, res, next) => {
    try {
        const {
            gymName,
            tagline,
            address,
            phone,
            email,
            website,
            gstin,
            workingHours,
            socialLinks,
            notificationSettings,
        } = req.body;

        let settings = await prisma.gymSettings.findFirst();

        if (!settings) {
            settings = await prisma.gymSettings.create({
                data: {
                    gymName,
                    tagline,
                    address,
                    phone,
                    email,
                    website,
                    gstin,
                    workingHours,
                    socialLinks,
                    notificationSettings,
                },
            });
        } else {
            settings = await prisma.gymSettings.update({
                where: { id: settings.id },
                data: {
                    gymName,
                    tagline,
                    address,
                    phone,
                    email,
                    website,
                    gstin,
                    workingHours,
                    socialLinks,
                    notificationSettings,
                },
            });
        }

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings,
        });
    } catch (error) {
        const fs = require('fs');
        const path = require('path');
        fs.appendFileSync(path.join(__dirname, '../../debug_error.log'), `[${new Date().toISOString()}] Update Error: ${error.message}\nStack: ${error.stack}\n`);
        next(error);
    }
};

// Update logo (Admin)
const updateLogo = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded',
            });
        }

        const logoUrl = `/uploads/${req.file.filename}`;

        let settings = await prisma.gymSettings.findFirst();

        if (!settings) {
            settings = await prisma.gymSettings.create({
                data: { logo: logoUrl },
            });
        } else {
            settings = await prisma.gymSettings.update({
                where: { id: settings.id },
                data: { logo: logoUrl },
            });
        }

        res.json({
            success: true,
            message: 'Logo updated successfully',
            data: { logo: settings.logo },
        });
    } catch (error) {
        next(error);
    }
};

// Get public settings (for landing page)
const getPublicSettings = async (req, res, next) => {
    try {
        const settings = await prisma.gymSettings.findFirst({
            select: {
                gymName: true,
                tagline: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                logo: true,
                workingHours: true,
                socialLinks: true,
            },
        });

        res.json({
            success: true,
            data: settings || {
                gymName: config.gym.name,
                address: config.gym.address,
                phone: config.gym.phone,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSettings,
    updateSettings,
    updateLogo,
    getPublicSettings,
};
