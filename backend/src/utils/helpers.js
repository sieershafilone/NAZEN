const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
    });
};

// Hash password
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Generate member ID (NAZ-001, NAZ-002, etc.)
const generateMemberId = async (prisma) => {
    const lastMember = await prisma.member.findFirst({
        orderBy: { memberId: 'desc' },
    });

    if (!lastMember) {
        return 'NAZ-001';
    }

    const lastNumber = parseInt(lastMember.memberId.split('-')[1]);
    const newNumber = lastNumber + 1;
    return `NAZ-${String(newNumber).padStart(3, '0')}`;
};

// Generate invoice number (INV-2026-0001)
const generateInvoiceNumber = async (prisma) => {
    const year = new Date().getFullYear();
    const lastPayment = await prisma.payment.findFirst({
        where: {
            invoiceNumber: {
                startsWith: `INV-${year}`,
            },
        },
        orderBy: { invoiceNumber: 'desc' },
    });

    if (!lastPayment) {
        return `INV-${year}-0001`;
    }

    const lastNumber = parseInt(lastPayment.invoiceNumber.split('-')[2]);
    const newNumber = lastNumber + 1;
    return `INV-${year}-${String(newNumber).padStart(4, '0')}`;
};

// Format date to DD/MM/YYYY (Indian format)
const formatDateIndian = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// Format currency to INR
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Calculate GST
const calculateGST = (amount, gstPercent = 18) => {
    const gstAmount = (amount * gstPercent) / 100;
    return {
        baseAmount: amount,
        gstPercent,
        gstAmount: parseFloat(gstAmount.toFixed(2)),
        totalAmount: parseFloat((amount + gstAmount).toFixed(2)),
    };
};

// Parse Indian phone number
const parsePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('+91')) {
        return cleaned;
    }
    return `+91${cleaned}`;
};

// Calculate membership end date
const calculateEndDate = (startDate, durationDays) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + durationDays);
    return end;
};

// Check if membership is expired
const isMembershipExpired = (endDate) => {
    return new Date(endDate) < new Date();
};

// Get days remaining in membership
const getDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
};

module.exports = {
    generateToken,
    hashPassword,
    comparePassword,
    generateMemberId,
    generateInvoiceNumber,
    formatDateIndian,
    formatCurrency,
    calculateGST,
    parsePhoneNumber,
    calculateEndDate,
    isMembershipExpired,
    getDaysRemaining,
};
