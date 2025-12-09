import { Link, Navigate } from 'react-router-dom';
import { Wallet, TrendingUp, PieChart, Shield, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function LandingPage() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
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

      <main>
        {/* Hero with gradient + dashboard snapshot + avatar video */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="hero-snapshot relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700/10 via-white to-purple-100 border border-white/60 shadow-2xl">
            {/* Faded dashboard background */}
            <div className="absolute inset-0">
              <img
                src="/assets/landing-dashboard.png"
                alt="Finora dashboard preview"
                className="w-full h-full object-cover opacity-15 blur-sm"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px]" />
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center p-8 lg:p-12 relative z-10">
              {/* Left: Large autoplay video with audio */}
              <div className="w-full">
                <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5 bg-black/10">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    controls={false}
                    muted={false}
                    loop={false}
                    src="/assets/welcome-avatar.mp4"
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
                </div>
              </div>

              {/* Right: Text + CTA */}
              <div className="space-y-6">
                <p className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600/10 text-blue-700 text-sm font-semibold">
                  Budgeting made clear with Finora
                </p>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  See your finances come to life before you even sign up.
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Track expenses, set budgets, get alerts, and stay on target—all in one
                  streamlined dashboard. Start free and feel in control from day one.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-lg text-base font-semibold shadow-lg transition-colors"
                  >
                    Start Tracking for Free
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white text-gray-800 hover:bg-gray-50 px-6 py-3 rounded-lg text-base font-semibold border border-gray-200 shadow-sm transition-colors"
                  >
                    Log in
                  </Link>
                </div>
                <div className="text-sm text-gray-500">
                  The welcome video plays on load (audio on) and stops when finished. Refreshing will replay it.
                </div>
              </div>
            </div>

            {/* Gradient ornaments */}
            <div className="absolute -top-10 -left-10 w-60 h-60 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-16 -right-12 w-72 h-72 bg-purple-500/10 blur-3xl rounded-full" />
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
