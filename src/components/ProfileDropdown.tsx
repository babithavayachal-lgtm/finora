import { useState, useRef, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  profileInitial: string;
}

export function ProfileDropdown({ profileInitial }: ProfileDropdownProps) {
  const { signOut } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold hover:ring-2 hover:ring-blue-300 transition-all"
      >
        {profileInitial}
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}
          style={{ overflow: 'visible' }}
        >
          <div className="py-1">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                isDarkMode
                  ? 'text-red-400 hover:bg-gray-700'
                  : 'text-red-600 hover:bg-gray-100'
              }`}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

