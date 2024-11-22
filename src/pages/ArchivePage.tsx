import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Calendar, ChevronDown, Trash2, Search } from 'lucide-react';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { DailyInventory } from '../types/inventory';
import { useProducts } from '../hooks/useFirestore';
import InventoryTable from '../components/InventoryTable';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { getInventoryHistory, deleteDailyInventory } from '../services/firebaseService';
import { convertInventoryEntry } from '../services/unitConversionService';
import { products as defaultProducts } from '../data/products';

const ArchivePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [inventoryHistory, setInventoryHistory] = useState<DailyInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { products } = useProducts();
  const { saveScrollPosition } = useScrollPosition([selectedDate]);
  
  // Suchzustand
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const loadArchiveData = async () => {
      try {
        setLoading(true);
        const history = await getInventoryHistory(dateRange.start, dateRange.end);

        const convertedHistory = history.map(inventory => ({
          ...inventory,
          entries: inventory.entries.map(entry => {
            const currentProduct = products.find(p => p.id === entry.productId);
            const originalProduct = defaultProducts.find(p => p.id === entry.productId);
            
            if (!currentProduct || !originalProduct) return entry;
            return convertInventoryEntry(entry, originalProduct, currentProduct);
          })
        }));

        setInventoryHistory(convertedHistory);
        setError(null);
      } catch (err) {
        console.error('Fehler beim Laden der Archivdaten:', err);
        setError('Fehler beim Laden der Archivdaten');
      } finally {
        setLoading(false);
      }
    };

    loadArchiveData();
  }, [products, dateRange]);

  const handleDateSelect = (date: string) => {
    saveScrollPosition();
    setSelectedDate(selectedDate === date ? null : date);
  };

  const handleDelete = async (date: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Datensatz in den Papierkorb verschieben möchten?')) {
      try {
        await deleteDailyInventory(date, true);
        setInventoryHistory(prev => prev.filter(inv => inv.date !== date));
        setSelectedDate(null);
      } catch (error) {
        console.error('Fehler beim Löschen:', error);
        alert('Fehler beim Verschieben in den Papierkorb');
      }
    }
  };

  // Filterfunktionen
  const filterInventory = (inventory: DailyInventory[]) => {
    return inventory.filter(day => {
      const matchesSearch = searchTerm === '' || 
        format(new Date(day.date), 'EEEE, d. MMMM yyyy', { locale: de })
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesProduct = selectedProduct === '' || 
        day.entries.some(entry => 
          entry.productId === selectedProduct && (entry.quantity > 0 || entry.demand > 0)
        );

      return matchesSearch && matchesProduct;
    });
  };

  const filteredInventory = filterInventory(inventoryHistory);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  // Gruppiere die Einträge nach Monat
  const groupedByMonth = filteredInventory.reduce((acc, day) => {
    const monthKey = format(new Date(day.date), 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(day);
    return acc;
  }, {} as Record<string, DailyInventory[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-800">Bestandsarchiv</h2>
        </div>

        {/* Suchbereich */}
        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Textsuche */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Produktfilter */}
            <div>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle Produkte</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Datumsbereich */}
            <div>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                max={dateRange.end}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                min={dateRange.start}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {filteredInventory.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Keine Einträge gefunden
            </div>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(groupedByMonth).map(([monthKey, days]) => (
            <div key={monthKey} className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-800">
                  {format(new Date(monthKey), 'MMMM yyyy', { locale: de })}
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {days.map((day) => (
                  <div key={day.date} className="px-4 py-3">
                    <div 
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => handleDateSelect(day.date)}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-900">
                          {format(new Date(day.date), 'EEEE, d. MMMM', { locale: de })}
                        </span>
                        <span className="text-sm text-gray-500">
                          {day.entries.length} Einträge
                        </span>
                      </div>
                      <div className="flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(day.date);
                          }}
                          className="p-1 text-red-600 hover:text-red-800 mr-4"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            selectedDate === day.date ? 'transform rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>
                    
                    {selectedDate === day.date && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <InventoryTable
                          currentInventory={day.entries}
                          previousInventory={[]}
                          onUpdateQuantity={() => {}}
                          onUpdateDemand={() => {}}
                          products={products}
                          isEditing={false}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArchivePage;