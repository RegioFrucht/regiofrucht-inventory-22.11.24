import React from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Apple, Carrot, Salad } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="flex space-x-2">
              <Apple className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              <Carrot className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              <Salad className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Regio Frucht GmbH</h1>
              <p className="text-xs sm:text-sm text-gray-600">Tägliche Bestandszählung</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base sm:text-lg font-semibold text-gray-900">
              {format(new Date(), 'EEEE', { locale: de })}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {format(new Date(), 'd. MMMM yyyy', { locale: de })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;