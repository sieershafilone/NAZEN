const cron = require('node-cron');
const prisma = require('../config/database');
const NotificationService = require('../services/notificationService');

const initScheduler = () => {
    console.log('⏰ Scheduler initialized');

    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('running daily notification check');
        await checkExpiringMemberships();
    });
};

const checkExpiringMemberships = async () => {
    try {
        // 1. Check if SMS alerts are enabled in settings
        const settings = await prisma.gymSettings.findFirst();

        if (!settings?.notificationSettings?.smsAlerts) {
            console.log('🔕 SMS alerts are disabled. Skipping check.');
            return;
        }

        console.log('🔔 Checking for expiring memberships...');

        // 2. Find memberships expiring in exactly 3 days
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
        const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

        const expiringMemberships = await prisma.membership.findMany({
            where: {
                endDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: 'ACTIVE',
            },
            include: {
                member: {
                    include: {
                        user: true,
                    },
                },
                plan: true,
            },
        });

        console.log(`Found ${expiringMemberships.length} memberships expiring in 3 days.`);

        // 3. Send notifications
        for (const membership of expiringMemberships) {
            // Skip if already notified recently (e.g., today)
            // Implementation note: Ideally checks lastNotificationDate

            const memberName = membership.member.user.fullName;
            const planName = membership.plan.name;
            const endDate = new Date(membership.endDate).toLocaleDateString('en-IN');
            const mobile = membership.member.user.mobile;

            const message = `Hi ${memberName}, your ${planName} at Nazen Gym expires on ${endDate}. Please renew to continue your fitness journey!`;

            await NotificationService.sendSMS(mobile, message);

            // Update last notification date
            await prisma.membership.update({
                where: { id: membership.id },
                data: { lastNotificationDate: new Date() }
            });
        }

    } catch (error) {
        console.error('Error in scheduler:', error);
    }
};

module.exports = initScheduler;
