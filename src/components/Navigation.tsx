import React, { useState } from 'react';
import { Archive, ClipboardList, Settings, BarChart2, Trash2, Menu, X } from 'lucide-react';

interface NavigationProps {
  currentPage: 'inventory' | 'archive' | 'products' | 'analytics' | 'trash';
  onPageChange: (page: 'inventory' | 'archive' | 'products' | 'analytics' | 'trash') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'inventory',
      label: 'Bestandsaufnahme',
      icon: ClipboardList
    },
    {
      id: 'archive',
      label: 'Archiv',
      icon: Archive
    },
    {
      id: 'analytics',
      label: 'Auswertungen',
      icon: BarChart2
    },
    {
      id: 'products',
      label: 'Produkte',
      icon: Settings
    },
    {
      id: 'trash',
      label: 'Papierkorb',
      icon: Trash2
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center justify-between md:hidden h-14">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
          <span className="text-gray-900 font-medium">
            {navItems.find(item => item.id === currentPage)?.label}
          </span>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id as any);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-base font-medium rounded-md ${
                    currentPage === item.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex justify-center space-x-8">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id as any)}
                className={`inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium ${
                  currentPage === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;