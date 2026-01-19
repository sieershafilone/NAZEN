const prisma = require('../config/database');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config');
const { generateInvoiceNumber, calculateGST, formatCurrency, calculateEndDate } = require('../utils/helpers');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
});

// Get all payments
const getAllPayments = async (req, res, next) => {
    try {
        const { memberId, status, startDate, endDate, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};

        if (memberId) where.memberId = memberId;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    member: {
                        include: {
                            user: {
                                select: { fullName: true, mobile: true },
                            },
                        },
                    },
                    membership: {
                        include: { plan: true },
                    },
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.payment.count({ where }),
        ]);

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get single payment
const getPayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                member: {
                    include: {
                        user: true,
                    },
                },
                membership: {
                    include: { plan: true },
                },
            },
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        res.json({
            success: true,
            data: payment,
        });
    } catch (error) {
        next(error);
    }
};

// Create Razorpay order
const createRazorpayOrder = async (req, res, next) => {
    try {
        const { memberId, planId } = req.body;

        const plan = await prisma.membershipPlan.findUnique({
            where: { id: planId },
        });

        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found',
            });
        }

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { user: true },
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Member not found',
            });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: Math.round(plan.finalPrice * 100), // Amount in paise
            currency: 'INR',
            receipt: `NAZ_${Date.now()}`,
            notes: {
                memberId: member.id,
                planId: plan.id,
                memberName: member.user.fullName,
            },
        });

        res.json({
            success: true,
            data: {
                orderId: order.id,
                amount: plan.finalPrice,
                currency: 'INR',
                keyId: config.razorpay.keyId,
                memberName: member.user.fullName,
                memberEmail: member.user.email,
                memberPhone: member.user.mobile,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Verify Razorpay payment and create payment record
const verifyRazorpayPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            memberId,
            planId,
        } = req.body;

        // Verify signature
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', config.razorpay.keySecret)
            .update(sign)
            .digest('hex');

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature',
            });
        }

        // Get plan and member
        const [plan, member] = await Promise.all([
            prisma.membershipPlan.findUnique({ where: { id: planId } }),
            prisma.member.findUnique({ where: { id: memberId } }),
        ]);

        // Create membership and payment in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create membership
            const startDate = new Date();
            const endDate = calculateEndDate(startDate, plan.durationDays);

            const membership = await tx.membership.create({
                data: {
                    memberId,
                    planId,
                    startDate,
                    endDate,
                    status: 'ACTIVE',
                },
            });

            // Generate invoice number
            const invoiceNumber = await generateInvoiceNumber(tx);

            // Create payment
            const payment = await tx.payment.create({
                data: {
                    invoiceNumber,
                    memberId,
                    membershipId: membership.id,
                    amount: plan.finalPrice,
                    gstAmount: parseFloat((plan.finalPrice - plan.basePrice).toFixed(2)),
                    paymentMethod: 'RAZORPAY',
                    razorpayId: razorpay_payment_id,
                    razorpayOrderId: razorpay_order_id,
                    status: 'COMPLETED',
                    paidAt: new Date(),
                },
            });

            return { membership, payment };
        });

        res.json({
            success: true,
            message: 'Payment successful',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Create manual payment (Cash/Bank/UPI)
const createManualPayment = async (req, res, next) => {
    try {
        const {
            memberId,
            planId,
            paymentMethod,
            notes,
        } = req.body;

        const [plan, member] = await Promise.all([
            prisma.membershipPlan.findUnique({ where: { id: planId } }),
            prisma.member.findUnique({ where: { id: memberId } }),
        ]);

        if (!plan || !member) {
            return res.status(404).json({
                success: false,
                message: 'Plan or Member not found',
            });
        }

        // Create membership and payment in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create membership
            const startDate = new Date();
            const endDate = calculateEndDate(startDate, plan.durationDays);

            const membership = await tx.membership.create({
                data: {
                    memberId,
                    planId,
                    startDate,
                    endDate,
                    status: 'ACTIVE',
                },
            });

            // Generate invoice number
            const invoiceNumber = await generateInvoiceNumber(tx);

            // Create payment
            const payment = await tx.payment.create({
                data: {
                    invoiceNumber,
                    memberId,
                    membershipId: membership.id,
                    amount: plan.finalPrice,
                    gstAmount: parseFloat((plan.finalPrice - plan.basePrice).toFixed(2)),
                    paymentMethod: paymentMethod || 'CASH',
                    status: 'COMPLETED',
                    paidAt: new Date(),
                    notes,
                },
            });

            return { membership, payment };
        });

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// Download invoice PDF
const downloadInvoice = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                member: {
                    include: { user: true },
                },
                membership: {
                    include: { plan: true },
                },
            },
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        // Get gym settings
        const settings = await prisma.gymSettings.findFirst();

        const invoiceData = {
            invoiceNumber: payment.invoiceNumber,
            invoiceDate: payment.paidAt || payment.createdAt,
            gymName: settings?.gymName || config.gym.name,
            gymAddress: settings?.address || config.gym.address,
            gymPhone: settings?.phone || config.gym.phone,
            gymGstin: settings?.gstin || config.gym.gstin,
            memberName: payment.member.user.fullName,
            memberPhone: payment.member.user.mobile,
            memberId: payment.member.memberId,
            planName: payment.membership.plan.name,
            planDuration: payment.membership.plan.durationDays,
            baseAmount: parseFloat(payment.membership.plan.basePrice),
            gstPercent: parseFloat(payment.membership.plan.gstPercent),
            gstAmount: parseFloat(payment.gstAmount),
            totalAmount: parseFloat(payment.amount),
            paymentMethod: payment.paymentMethod,
            paymentDate: payment.paidAt || payment.createdAt,
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${payment.invoiceNumber}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};

// Get member payments
const getMemberPayments = async (req, res, next) => {
    try {
        const memberId = req.user.member?.id;

        if (!memberId) {
            return res.status(404).json({
                success: false,
                message: 'Member profile not found',
            });
        }

        const payments = await prisma.payment.findMany({
            where: { memberId },
            include: {
                membership: {
                    include: { plan: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: payments,
        });
    } catch (error) {
        next(error);
    }
};

// Delete payment
const deletePayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id },
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found',
            });
        }

        await prisma.payment.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: 'Payment deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllPayments,
    getPayment,
    createRazorpayOrder,
    verifyRazorpayPayment,
    createManualPayment,
    deletePayment,
    downloadInvoice,
    getMemberPayments,
};
