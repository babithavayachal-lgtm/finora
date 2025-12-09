import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Receipt, Tag, Target, BarChart3, LogOut, User, Wallet, Search, Bell, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SettingsModal } from './SettingsModal';
import { AlertsPanel } from './AlertsPanel';
import { ProfileDropdown } from './ProfileDropdown';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [hasAlerts, setHasAlerts] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Categories', href: '/categories', icon: Tag },
    { name: 'Budgets', href: '/budgets', icon: Target },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className={`flex flex-col w-20 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r overflow-x-hidden`}>
            <div className={`flex items-center justify-center h-16 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              {/* Logo removed - now in header */}
            </div>
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all group relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : isDarkMode
                          ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                          : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                    title={item.name}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className={`absolute left-full ml-2 px-2 py-1 ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-900 text-white'} text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className={`p-3 border-t space-y-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={toggleDarkMode}
                className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all group relative ${
                  isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title={isDarkMode ? 'Light mode' : 'Dark mode'}
              >
                {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                <span className={`absolute left-full ml-2 px-2 py-1 ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-900 text-white'} text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                  {isDarkMode ? 'Light mode' : 'Dark mode'}
                </span>
              </button>
              <Link
                to="/analysis"
                className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all group relative ${
                  location.pathname === '/analysis'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title="Analysis"
              >
                <BarChart3 className="h-6 w-6" />
                <span className={`absolute left-full ml-2 px-2 py-1 ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-900 text-white'} text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                  Analysis
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all group relative ${
                  isDarkMode
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                }`}
                title="Log out"
              >
                <LogOut className="h-6 w-6" />
                <span className={`absolute left-full ml-2 px-2 py-1 ${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-900 text-white'} text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                  Log out
                </span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className={`border-b flex items-center justify-between h-16 overflow-x-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {/* Logo and Brand Name - Leftmost position */}
            <div className="flex items-center gap-2 flex-shrink-0 pl-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <span className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ${isDarkMode ? '' : ''}`}>
                Finora
              </span>
            </div>

            {/* Search Bar - Centered */}
            <div className="flex-1 flex justify-center px-4">
              <div className="relative w-full max-w-2xl">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className={`w-full pl-10 pr-4 py-2 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                    isDarkMode
                      ? 'bg-gray-700 text-gray-100 placeholder-gray-400'
                      : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4 flex-shrink-0 pr-4">
              <button
                onClick={() => setIsAlertsOpen(true)}
                className={`relative p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <Bell className="h-5 w-5" />
                {hasAlerts && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              >
                <Settings className="h-5 w-5" />
              </button>
              <div className={`flex items-center gap-3 pl-4 border-l ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <ProfileDropdown
                  profileInitial={profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                />
              </div>
            </div>
          </header>
          <main className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {children}
          </main>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AlertsPanel
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onAlertsLoaded={(count) => setHasAlerts(count > 0)}
      />

      <div className={`md:hidden fixed bottom-0 inset-x-0 border-t z-50 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <nav className="flex justify-around">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-3 px-2 text-xs font-medium ${
                  isActive
                    ? 'text-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600'
                }`}
              >
                <item.icon className="h-6 w-6 mb-1" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
