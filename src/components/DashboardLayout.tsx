import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Receipt, Tag, Target, BarChart3, LogOut, User, Wallet, Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-20 bg-white border-r border-gray-200">
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all group relative ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                    title={item.name}
                  >
                    <item.icon className="h-6 w-6" />
                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-gray-200 space-y-2">
              <Link
                to="#"
                className="flex items-center justify-center w-14 h-14 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all group relative"
                title="Settings"
              >
                <BarChart3 className="h-6 w-6" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Settings
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center w-14 h-14 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all group relative"
                title="Log out"
              >
                <LogOut className="h-6 w-6" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Log out
                </span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 ml-6">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50">
        <nav className="flex justify-around">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center py-3 px-2 text-xs font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
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
