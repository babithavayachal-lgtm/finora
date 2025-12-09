import { Link, Navigate } from 'react-router-dom';
import { Wallet, TrendingUp, PieChart, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Wallet className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Finora</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative min-h-[calc(100vh-4rem)]">
        {/* Background image with overlay */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="/assets/background-image.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          {/* Hero Section - Centered */}
          <div className="text-center max-w-4xl mx-auto space-y-6 py-12">
            <p className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 text-sm font-semibold">
              Budgeting made clear with Finora
            </p>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              Take Control of Your Finances
            </h1>
            <p className="text-lg lg:text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Track expenses, set budgets, get alerts, and stay on target—all in one
              streamlined dashboard. Start free and feel in control from day one.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Link
                to="/signup"
                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-base font-semibold transition-colors shadow-lg"
              >
                Start Tracking for Free
              </Link>
              <Link
                to="/login"
                className="bg-white text-gray-800 hover:bg-gray-50 px-8 py-4 rounded-lg text-base font-semibold border border-gray-200 shadow-lg transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Gradient ornaments - constrained to viewport */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            <div className="absolute top-0 left-0 w-60 h-60 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full translate-x-1/4 translate-y-1/4" />
          </div>

          {/* Feature cards */}
          <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Tracking</h3>
              <p className="text-gray-600">
                Quickly log your expenses with our intuitive interface. Add transactions in seconds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Insights</h3>
              <p className="text-gray-600">
                Understand your spending patterns with visual charts and monthly summaries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Management</h3>
              <p className="text-gray-600">
                Set monthly budgets by category and get alerts when you're approaching limits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your financial data is encrypted and protected. Only you can access your information.
              </p>
            </div>
          </div>

          {/* Dashboard Showcase */}
          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Experience the Finora Dashboard</h2>
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
              <img
                src="/assets/landing-dashboard.png"
                alt="Finora Dashboard"
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            <p className="mt-6 text-gray-600 max-w-3xl mx-auto">
              Get a clear view of your finances with our intuitive dashboard. Track expenses, monitor budgets, and gain insights into your spending habits.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Finora. Built with security and simplicity in mind.
          </p>
        </div>
      </footer>
    </div>
  );
}
