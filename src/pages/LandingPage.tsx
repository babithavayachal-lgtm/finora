import { Link, Navigate } from 'react-router-dom';
import { Wallet, TrendingUp, PieChart, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Finora</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/retroinspired-business-analytics-financial-technical-finance-banner-background-presentations-websites-elevate-your-371718472.webp"
            alt="Financial Analytics Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-white/90 to-blue-50/95"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          {/* Hero Section - Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-center py-12">
            {/* Left Column - Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border-2 border-blue-600/20">
                <span className="text-blue-700 text-sm font-semibold">✨ Budgeting made clear with Finora</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Take Control
                </span>
                <br />
                <span className="text-gray-900">of Your Finances</span>
              </h1>
              <p className="text-lg lg:text-xl text-gray-700 leading-relaxed max-w-xl">
                Track expenses, set budgets, get alerts, and stay on target—all in one
                streamlined dashboard. Start free and feel in control from day one.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  to="/signup"
                  className="group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-lg hover:shadow-2xl hover:scale-105"
                >
                  Start Tracking for Free
                  <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-gray-800 hover:bg-gray-50 px-8 py-4 rounded-xl text-base font-semibold border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Log in
                </Link>
              </div>
            </div>

            {/* Right Column - Illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <img
                  src="/assets/gemini_generated_image_6srngr6srngr6srn.png"
                  alt="Financial tracking illustration"
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-blue-500">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Quickly log your expenses with our intuitive interface. Add transactions in seconds.
              </p>
            </div>

            <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-green-500">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Understand your spending patterns with visual charts and monthly summaries.
              </p>
            </div>

            <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-teal-500">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PieChart className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Budget Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Set monthly budgets by category and get alerts when you're approaching limits.
              </p>
            </div>

            <div className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-t-4 border-orange-500">
              <div className="bg-gradient-to-br from-orange-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">
                Your financial data is encrypted and protected. Only you can access your information.
              </p>
            </div>
          </div>

          {/* Dashboard Showcase */}
          <div className="mt-32 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-pink-500/10 border-2 border-orange-500/20 mb-4">
              <span className="text-orange-700 text-sm font-semibold">🚀 Powerful Dashboard</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Experience Finora
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
              Get a clear view of your finances with our intuitive dashboard. Track expenses, monitor budgets, and gain insights into your spending habits.
            </p>
            <div className="max-w-6xl mx-auto bg-gradient-to-br from-blue-100 via-white to-orange-100 p-3 rounded-2xl shadow-2xl">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border-2 border-gray-100">
                <img
                  src="/assets/landing-dashboard.png"
                  alt="Finora Dashboard"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Finora</span>
          </div>
          <p className="text-center text-gray-400 text-sm">
            © 2024 Finora. Built with security and simplicity in mind.
          </p>
        </div>
      </footer>
    </div>
  );
}
