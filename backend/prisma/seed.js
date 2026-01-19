require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.notification.deleteMany();
    await prisma.progressRecord.deleteMany();
    await prisma.memberWorkout.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.member.deleteMany();
    await prisma.user.deleteMany();
    await prisma.membershipPlan.deleteMany();
    await prisma.workoutPlan.deleteMany();
    await prisma.gymImage.deleteMany();
    await prisma.gymSettings.deleteMany();

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const memberPassword = await bcrypt.hash('member123', 10);

    // Create Admin User
    console.log('👤 Creating admin user...');
    const admin = await prisma.user.create({
        data: {
            fullName: 'Nazen Admin',
            email: 'admin@nazen.gym',
            mobile: '+919876543210',
            password: hashedPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    console.log(`   ✅ Admin created: ${admin.fullName} (${admin.mobile})`);

    // Create Gym Settings
    console.log('⚙️  Creating gym settings...');
    await prisma.gymSettings.create({
        data: {
            gymName: 'Nazen – Powered by Being Strong',
            tagline: 'Transform Your Body, Transform Your Life',
            address: '97XQ+CW3, Handwara, Jammu and Kashmir – 193221, India',
            phone: '+91 1234567890',
            email: 'info@nazen.gym',
            website: 'https://nazen.gym',
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            workingHours: {
                monday: { open: '06:00', close: '22:00' },
                tuesday: { open: '06:00', close: '22:00' },
                wednesday: { open: '06:00', close: '22:00' },
                thursday: { open: '06:00', close: '22:00' },
                friday: { open: '06:00', close: '22:00' },
                saturday: { open: '07:00', close: '20:00' },
                sunday: { open: '08:00', close: '14:00' },
            },
            socialLinks: {
                instagram: 'https://instagram.com/nazengym',
                facebook: 'https://facebook.com/nazengym',
                youtube: 'https://youtube.com/nazengym',
            },
        },
    });
    console.log('   ✅ Gym settings created');

    // Create Membership Plans
    console.log('📋 Creating membership plans...');
    const plans = await Promise.all([
        prisma.membershipPlan.create({
            data: {
                name: 'Monthly Membership',
                durationDays: 30,
                basePrice: 1500,
                gstPercent: 18,
                finalPrice: 1770,
                description: 'Access to all gym facilities for 1 month',
                features: ['Full gym access', 'Locker room', 'Free WiFi', 'Water dispenser'],
                isActive: true,
            },
        }),
        prisma.membershipPlan.create({
            data: {
                name: 'Quarterly Membership',
                durationDays: 90,
                basePrice: 4000,
                gstPercent: 18,
                finalPrice: 4720,
                description: 'Access to all gym facilities for 3 months',
                features: ['Full gym access', 'Locker room', 'Free WiFi', 'Water dispenser', '1 Free PT session'],
                isActive: true,
            },
        }),
        prisma.membershipPlan.create({
            data: {
                name: 'Half-Yearly Membership',
                durationDays: 180,
                basePrice: 7000,
                gstPercent: 18,
                finalPrice: 8260,
                description: 'Access to all gym facilities for 6 months',
                features: ['Full gym access', 'Locker room', 'Free WiFi', 'Water dispenser', '3 Free PT sessions', 'Diet consultation'],
                isActive: true,
            },
        }),
        prisma.membershipPlan.create({
            data: {
                name: 'Annual Membership',
                durationDays: 365,
                basePrice: 12000,
                gstPercent: 18,
                finalPrice: 14160,
                description: 'Best value! Full year access to all facilities',
                features: ['Full gym access', 'Locker room', 'Free WiFi', 'Water dispenser', '6 Free PT sessions', 'Diet consultation', 'Body composition analysis', 'Gym merchandise'],
                isActive: true,
            },
        }),
        prisma.membershipPlan.create({
            data: {
                name: 'Personal Training (Monthly)',
                durationDays: 30,
                basePrice: 5000,
                gstPercent: 18,
                finalPrice: 5900,
                description: 'One-on-one personal training sessions',
                features: ['Full gym access', 'Personal trainer', 'Custom workout plan', 'Diet plan', 'Weekly progress tracking'],
                isActive: true,
            },
        }),
    ]);
    console.log(`   ✅ ${plans.length} membership plans created`);

    // Create Workout Plans
    console.log('🏋️ Creating workout plans...');
    const workouts = await Promise.all([
        prisma.workoutPlan.create({
            data: {
                name: 'Beginner Full Body',
                type: 'FULL_BODY',
                description: 'Perfect for beginners - 3 days per week full body workout',
                daysPerWeek: 3,
                exercises: [
                    {
                        day: 'Monday', exercises: [
                            { name: 'Squats', sets: 3, reps: '12-15', muscle: 'Legs' },
                            { name: 'Bench Press', sets: 3, reps: '10-12', muscle: 'Chest' },
                            { name: 'Lat Pulldown', sets: 3, reps: '10-12', muscle: 'Back' },
                            { name: 'Shoulder Press', sets: 3, reps: '10-12', muscle: 'Shoulders' },
                            { name: 'Bicep Curls', sets: 2, reps: '12-15', muscle: 'Biceps' },
                            { name: 'Tricep Pushdown', sets: 2, reps: '12-15', muscle: 'Triceps' },
                            { name: 'Plank', sets: 3, reps: '30-60s', muscle: 'Core' },
                        ]
                    },
                    {
                        day: 'Wednesday', exercises: [
                            { name: 'Leg Press', sets: 3, reps: '12-15', muscle: 'Legs' },
                            { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', muscle: 'Chest' },
                            { name: 'Seated Row', sets: 3, reps: '10-12', muscle: 'Back' },
                            { name: 'Lateral Raises', sets: 3, reps: '12-15', muscle: 'Shoulders' },
                            { name: 'Hammer Curls', sets: 2, reps: '12-15', muscle: 'Biceps' },
                            { name: 'Skull Crushers', sets: 2, reps: '12-15', muscle: 'Triceps' },
                            { name: 'Russian Twists', sets: 3, reps: '20', muscle: 'Core' },
                        ]
                    },
                    {
                        day: 'Friday', exercises: [
                            { name: 'Romanian Deadlift', sets: 3, reps: '10-12', muscle: 'Legs/Back' },
                            { name: 'Dumbbell Fly', sets: 3, reps: '12-15', muscle: 'Chest' },
                            { name: 'T-Bar Row', sets: 3, reps: '10-12', muscle: 'Back' },
                            { name: 'Face Pulls', sets: 3, reps: '15-20', muscle: 'Rear Delts' },
                            { name: 'Preacher Curls', sets: 2, reps: '12-15', muscle: 'Biceps' },
                            { name: 'Overhead Extension', sets: 2, reps: '12-15', muscle: 'Triceps' },
                            { name: 'Leg Raises', sets: 3, reps: '15', muscle: 'Core' },
                        ]
                    },
                ],
                isActive: true,
            },
        }),
        prisma.workoutPlan.create({
            data: {
                name: 'Push Pull Legs',
                type: 'PUSH_PULL_LEGS',
                description: 'Classic PPL split - 6 days per week for intermediate lifters',
                daysPerWeek: 6,
                exercises: [
                    {
                        day: 'Push Day', exercises: [
                            { name: 'Bench Press', sets: 4, reps: '8-10', muscle: 'Chest' },
                            { name: 'Overhead Press', sets: 4, reps: '8-10', muscle: 'Shoulders' },
                            { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', muscle: 'Upper Chest' },
                            { name: 'Lateral Raises', sets: 4, reps: '12-15', muscle: 'Side Delts' },
                            { name: 'Tricep Dips', sets: 3, reps: '10-12', muscle: 'Triceps' },
                            { name: 'Cable Fly', sets: 3, reps: '12-15', muscle: 'Chest' },
                        ]
                    },
                    {
                        day: 'Pull Day', exercises: [
                            { name: 'Deadlift', sets: 4, reps: '5-8', muscle: 'Back' },
                            { name: 'Pull-ups', sets: 4, reps: '8-12', muscle: 'Lats' },
                            { name: 'Barbell Row', sets: 4, reps: '8-10', muscle: 'Back' },
                            { name: 'Face Pulls', sets: 4, reps: '15-20', muscle: 'Rear Delts' },
                            { name: 'Barbell Curls', sets: 3, reps: '10-12', muscle: 'Biceps' },
                            { name: 'Hammer Curls', sets: 3, reps: '10-12', muscle: 'Biceps' },
                        ]
                    },
                    {
                        day: 'Leg Day', exercises: [
                            { name: 'Squats', sets: 4, reps: '8-10', muscle: 'Quads' },
                            { name: 'Romanian Deadlift', sets: 4, reps: '10-12', muscle: 'Hamstrings' },
                            { name: 'Leg Press', sets: 3, reps: '12-15', muscle: 'Legs' },
                            { name: 'Leg Curls', sets: 3, reps: '12-15', muscle: 'Hamstrings' },
                            { name: 'Calf Raises', sets: 4, reps: '15-20', muscle: 'Calves' },
                            { name: 'Walking Lunges', sets: 3, reps: '12 each', muscle: 'Legs' },
                        ]
                    },
                ],
                isActive: true,
            },
        }),
        prisma.workoutPlan.create({
            data: {
                name: 'Bro Split',
                type: 'BRO_SPLIT',
                description: 'Classic 5-day bodybuilding split',
                daysPerWeek: 5,
                exercises: [
                    {
                        day: 'Monday - Chest', exercises: [
                            { name: 'Bench Press', sets: 4, reps: '8-10', muscle: 'Chest' },
                            { name: 'Incline Dumbbell Press', sets: 4, reps: '10-12', muscle: 'Upper Chest' },
                            { name: 'Dumbbell Fly', sets: 3, reps: '12-15', muscle: 'Chest' },
                            { name: 'Cable Crossover', sets: 3, reps: '12-15', muscle: 'Chest' },
                            { name: 'Push-ups', sets: 3, reps: 'To failure', muscle: 'Chest' },
                        ]
                    },
                    {
                        day: 'Tuesday - Back', exercises: [
                            { name: 'Deadlift', sets: 4, reps: '5-8', muscle: 'Back' },
                            { name: 'Lat Pulldown', sets: 4, reps: '10-12', muscle: 'Lats' },
                            { name: 'Barbell Row', sets: 4, reps: '8-10', muscle: 'Back' },
                            { name: 'Seated Cable Row', sets: 3, reps: '10-12', muscle: 'Back' },
                            { name: 'Straight Arm Pulldown', sets: 3, reps: '12-15', muscle: 'Lats' },
                        ]
                    },
                    {
                        day: 'Wednesday - Shoulders', exercises: [
                            { name: 'Overhead Press', sets: 4, reps: '8-10', muscle: 'Shoulders' },
                            { name: 'Lateral Raises', sets: 4, reps: '12-15', muscle: 'Side Delts' },
                            { name: 'Front Raises', sets: 3, reps: '12-15', muscle: 'Front Delts' },
                            { name: 'Rear Delt Fly', sets: 4, reps: '12-15', muscle: 'Rear Delts' },
                            { name: 'Shrugs', sets: 4, reps: '12-15', muscle: 'Traps' },
                        ]
                    },
                    {
                        day: 'Thursday - Arms', exercises: [
                            { name: 'Barbell Curls', sets: 4, reps: '10-12', muscle: 'Biceps' },
                            { name: 'Close Grip Bench', sets: 4, reps: '10-12', muscle: 'Triceps' },
                            { name: 'Hammer Curls', sets: 3, reps: '12-15', muscle: 'Biceps' },
                            { name: 'Tricep Pushdown', sets: 3, reps: '12-15', muscle: 'Triceps' },
                            { name: 'Preacher Curls', sets: 3, reps: '10-12', muscle: 'Biceps' },
                            { name: 'Overhead Extension', sets: 3, reps: '12-15', muscle: 'Triceps' },
                        ]
                    },
                    {
                        day: 'Friday - Legs', exercises: [
                            { name: 'Squats', sets: 4, reps: '8-10', muscle: 'Quads' },
                            { name: 'Leg Press', sets: 4, reps: '12-15', muscle: 'Legs' },
                            { name: 'Romanian Deadlift', sets: 4, reps: '10-12', muscle: 'Hamstrings' },
                            { name: 'Leg Extension', sets: 3, reps: '12-15', muscle: 'Quads' },
                            { name: 'Leg Curls', sets: 3, reps: '12-15', muscle: 'Hamstrings' },
                            { name: 'Calf Raises', sets: 4, reps: '15-20', muscle: 'Calves' },
                        ]
                    },
                ],
                isActive: true,
            },
        }),
    ]);
    console.log(`   ✅ ${workouts.length} workout plans created`);

    // Create Sample Members
    console.log('👥 Creating sample members...');
    const members = [];

    const sampleMembers = [
        { name: 'Rashid Khan', mobile: '+919876543211', gender: 'MALE', dob: '1995-03-15', height: 175, weight: 72, goal: 'Build muscle and increase strength' },
        { name: 'Aisha Bhat', mobile: '+919876543212', gender: 'FEMALE', dob: '1998-07-22', height: 162, weight: 58, goal: 'Weight loss and toning' },
        { name: 'Imran Lone', mobile: '+919876543213', gender: 'MALE', dob: '1992-11-08', height: 180, weight: 85, goal: 'Compete in bodybuilding' },
        { name: 'Sana Malik', mobile: '+919876543214', gender: 'FEMALE', dob: '2000-01-30', height: 165, weight: 55, goal: 'General fitness and flexibility' },
        { name: 'Faisal Dar', mobile: '+919876543215', gender: 'MALE', dob: '1988-09-12', height: 172, weight: 78, goal: 'Weight management and cardio' },
    ];

    for (let i = 0; i < sampleMembers.length; i++) {
        const m = sampleMembers[i];
        const user = await prisma.user.create({
            data: {
                fullName: m.name,
                mobile: m.mobile,
                password: memberPassword,
                role: 'MEMBER',
                status: 'ACTIVE',
            },
        });

        const member = await prisma.member.create({
            data: {
                memberId: `NAZ-${String(i + 1).padStart(3, '0')}`,
                userId: user.id,
                gender: m.gender,
                dateOfBirth: new Date(m.dob),
                height: m.height,
                weight: m.weight,
                fitnessGoal: m.goal,
                emergencyContact: '+919876543200',
            },
        });

        // Create membership
        const planIndex = i % plans.length;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plans[planIndex].durationDays);

        const membership = await prisma.membership.create({
            data: {
                memberId: member.id,
                planId: plans[planIndex].id,
                startDate,
                endDate,
                status: endDate > new Date() ? 'ACTIVE' : 'EXPIRED',
            },
        });

        // Create payment
        await prisma.payment.create({
            data: {
                invoiceNumber: `INV-2026-${String(i + 1).padStart(4, '0')}`,
                memberId: member.id,
                membershipId: membership.id,
                amount: plans[planIndex].finalPrice,
                gstAmount: plans[planIndex].finalPrice - plans[planIndex].basePrice,
                paymentMethod: ['RAZORPAY', 'UPI', 'CASH'][Math.floor(Math.random() * 3)],
                status: 'COMPLETED',
                paidAt: startDate,
            },
        });

        // Create some attendance records
        for (let j = 0; j < 10; j++) {
            const checkInDate = new Date();
            checkInDate.setDate(checkInDate.getDate() - j);
            checkInDate.setHours(6 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0, 0);

            const checkOutDate = new Date(checkInDate);
            checkOutDate.setHours(checkInDate.getHours() + 1 + Math.floor(Math.random() * 2));

            if (Math.random() > 0.3) { // 70% attendance rate
                await prisma.attendance.create({
                    data: {
                        memberId: member.id,
                        checkInTime: checkInDate,
                        checkOutTime: checkOutDate,
                        method: Math.random() > 0.5 ? 'QR' : 'MANUAL',
                    },
                });
            }
        }

        // Create progress records
        for (let k = 0; k < 5; k++) {
            const recordDate = new Date();
            recordDate.setDate(recordDate.getDate() - k * 7);

            await prisma.progressRecord.create({
                data: {
                    memberId: member.id,
                    weight: m.weight - k * 0.5 + Math.random() * 0.5,
                    bodyFat: 20 - k * 0.3 + Math.random() * 0.3,
                    recordedAt: recordDate,
                },
            });
        }

        // Assign workout
        if (i < workouts.length) {
            await prisma.memberWorkout.create({
                data: {
                    memberId: member.id,
                    workoutPlanId: workouts[i % workouts.length].id,
                    isActive: true,
                },
            });
        }

        members.push(member);
        console.log(`   ✅ Member created: ${m.name} (${member.memberId})`);
    }

    console.log('\n✨ Database seeding completed!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔐 ADMIN:');
    console.log('   Phone: +919876543210');
    console.log('   Password: admin123');
    console.log('');
    console.log('👤 SAMPLE MEMBER:');
    console.log('   Phone: +919876543211');
    console.log('   Password: member123');
    console.log('═══════════════════════════════════════════════════════════\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
