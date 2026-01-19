'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Dumbbell,
  Users,
  Calendar,
  CreditCard,
  ChartBar,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Check
} from 'lucide-react';
import { Button, Card, Spinner, BrandLogo } from '@/components/ui';
import { plansAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { MembershipPlan } from '@/types';

const features = [
  {
    icon: Users,
    title: 'Member Management',
    description: 'Complete member profiles with health data, membership tracking, and attendance.',
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Razorpay integration with UPI, cards, and GST-compliant invoices.',
  },
  {
    icon: Calendar,
    title: 'QR Attendance',
    description: 'Quick check-in with QR codes. Track attendance history and patterns.',
  },
  {
    icon: ChartBar,
    title: 'Progress Tracking',
    description: 'Monitor weight, measurements, and strength gains with visual charts.',
  },
  {
    icon: Dumbbell,
    title: 'Workout Plans',
    description: 'Pre-built workout templates including PPL, Bro Split, and Full Body.',
  },
  {
    icon: Shield,
    title: 'Secure & Fast',
    description: 'Enterprise-grade security with blazing fast performance.',
  },
];

export default function HomePage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await plansAPI.getAll({ active: true });
        // Handle potentially different response structures
        const data = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        setPlans(data);
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/">
                <BrandLogo variant="default" />
              </Link>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-zinc-400 hover:text-white transition-colors">Features</a>
              <a href="#gallery" className="text-zinc-400 hover:text-white transition-colors">Gallery</a>
              <a href="#plans" className="text-zinc-400 hover:text-white transition-colors">Plans</a>
              <a href="#contact" className="text-zinc-400 hover:text-white transition-colors">Contact</a>
            </div>
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </div>
      </nav >

      {/* Hero Section */}
      < section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden" >
        {/* Background */}
        < div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/30 via-black to-black" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-400">Handwara&apos;s Premium Fitness Centre</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Body</span>,
              <br />
              Transform Your
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Life</span>
            </h1>

            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
              Join Nazen – the most advanced gym in Handwara with state-of-the-art equipment,
              and a supportive community to help you achieve your fitness goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="min-w-[180px]">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#plans">
                <Button size="lg" variant="outline" className="min-w-[180px]">
                  View Plans
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-16">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-zinc-500 text-sm">Active Members</p>
              </div>
              <div className="w-px h-12 bg-zinc-800" />
              <div className="text-center">
                <p className="text-3xl font-bold text-white">50+</p>
                <p className="text-zinc-500 text-sm">Equipment</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-zinc-700 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-orange-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section >

      {/* Gallery Section */}
      < section id="gallery" className="py-24 bg-zinc-900/30 overflow-hidden" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Inside
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Nazen</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Experience our world-class facilities designed to help you crush your limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: num * 0.1 }}
                viewport={{ once: true }}
                className="relative group aspect-[3/4] overflow-hidden rounded-2xl"
              >
                <Image
                  src={`/images/gym-${num}.webp`}
                  alt={`Gym Photo ${num}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white font-medium">View Area</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Features Section */}
      < section id="features" className="py-24 relative" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Succeed</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Our comprehensive gym management system provides all the tools you need
              for a seamless fitness journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover glow className="h-full">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-500">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section >

      {/* Plans Section */}
      < section id="plans" className="py-24 bg-zinc-900/50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple, Transparent
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Pricing</span>
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Choose the plan that fits your goals. All prices include GST.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-zinc-500 text-lg">No active plans available at the moment.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <Card
                    className={`relative h-full flex flex-col ${false // Placeholder for future 'popular' flag if backend adds it
                      ? 'border-orange-500 shadow-lg shadow-orange-500/20'
                      : ''
                      }`}
                  >
                    {/* {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Popular
                        </div>
                      </div>
                    )} */}
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-black text-white glow-text-orange">
                          {formatCurrency(plan.finalPrice || plan.basePrice)}
                        </span>
                      </div>
                      <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mt-2">
                        {plan.durationDays} Days Access
                      </p>
                    </div>

                    <div className="space-y-4 mb-8 flex-1 px-4">
                      {plan.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                          <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <Link href="/login">
                        <Button
                          variant={false ? 'primary' : 'outline'}
                          className="w-full"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section >

      {/* Contact Section */}
      < section id="contact" className="py-24" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Visit Our
                <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent"> Gym</span>
              </h2>
              <p className="text-zinc-400 mb-8">
                Located in the heart of Handwara, our gym is equipped with the latest
                fitness equipment to help you
                achieve your goals.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Address</h4>
                    <p className="text-zinc-500">97XQ+CW3, Handwara, Jammu and Kashmir – 193221, India</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Phone</h4>
                    <p className="text-zinc-500">+91 1234567890</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">Working Hours</h4>
                    <p className="text-zinc-500">Mon-Fri: 6:00 AM - 10:00 PM</p>
                    <p className="text-zinc-500">Sat: 7:00 AM - 8:00 PM</p>
                    <p className="text-zinc-500">Sun: 8:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-[400px] w-full rounded-2xl overflow-hidden border border-zinc-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d10500!2d74.2898507!3d34.3985659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38e11d001124d89d%3A0xe0ed0b9e05a75016!2s97XQ%2BCW3%2C%20Handwara%2C%20Jammu%20and%20Kashmir%20193221!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="filter grayscale contrast-125 invert opacity-80 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </section >

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/">
                <BrandLogo
                  variant="default"
                  className="grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  withGlow={false}
                />
              </Link>
            </div>
            <p className="text-zinc-500 text-sm">
              © 2026 Nazen Gym. All rights reserved.
            </p>
            <p className="text-zinc-500 text-sm">
              Developed and Maintained by Sieer <br />
              Contact: 6005314228 <br />
              Email: sieershafilone@gmail.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
